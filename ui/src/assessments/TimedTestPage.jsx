// TimedTestPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FlagIcon,
  PauseIcon,
  PlayIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import LoadingSkeleton from '../components/LoadingSkeleton';
import DOMPurify from 'dompurify';
import { apiFetch, apiPost } from '../components/api';

export default function TimedTestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const timerRef = useRef(null);
  const textareaRefs = useRef({});
  
  const API_URL = process.env.NODE_ENV === 'development' 
    ? "http://localhost:8000/api" 
    : "/api";

  // Get URL parameters
  const course = searchParams.get('course') || searchParams.get('selected_course');
  const year = localStorage.getItem('year'); //searchParams.get('year');
  console.log('year', year)
  console.log('course', course)
  //console.log('new year', year)
  const topic = searchParams.get('topic');
  const german = 'easy';
    //console.log('course', course);
    //console.log('year', year);
    //console.log('topic', topic);
  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Disable right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Fetch test data
  useEffect(() => {
    if (!course) {
      //navigate('/assessments');
      return;
    }
    fetchTest();
  }, [course, year, topic, german]);

  const fetchTest = async () => {
    setLoading(true);
    try {
        
      const params = new URLSearchParams({
        course,
        ...(year && { year }),
        ...(topic && { topic }),
        german: german.toString()
      });
      
      const response = await apiFetch(`/assessments/timed-test/start/?${params}`);
      console.log('response', response);

      const result = await response.json();
      console.log('result', result)
      if (result.status === 'success') {
        setTestData(result.data);
        setTimeRemaining(result.data.metadata.duration_minutes * 60); // Convert to seconds
      } else {
        console.error('Error fetching test:', result.message);
        navigate('/test-options');
      }
    } catch (error) {
      console.error('Error fetching test:', error);
      navigate('/test-options');
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  const handleBeforeUnload = (e) => {
    // Only show if test is active and not completed
    if (testData && !testCompleted && !paused) {
      // Standard way to show confirmation dialog
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
      return ''; // Required for some browsers
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [testData, testCompleted, paused]);
  // Timer logic
  useEffect(() => {
    if (testCompleted || paused || !testData) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, [testCompleted, paused, testData]);

  const handleAutoSubmit = () => {
    clearInterval(timerRef.current);
    submitTest();
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleTextAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Auto-expand textarea
    if (textareaRefs.current[questionId]) {
      textareaRefs.current[questionId].style.height = 'auto';
      textareaRefs.current[questionId].style.height = 
        textareaRefs.current[questionId].scrollHeight + 'px';
    }
  };

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const submitTestold = async () => {
    setLoading(true);
    try {
      const response = await apiPost('/assessments/timed-test/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          questions: testData.questions,
          time_taken: testData.metadata.duration_minutes * 60 - timeRemaining
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setResults(result.data);
        setTestCompleted(true);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setLoading(false);
    }
  };
   

    
  const submitTest = async () => {
  setLoading(true);
  try {
     const response = await apiPost('/assessments/timed-test/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          questions: testData.questions,
          time_taken: testData.metadata.duration_minutes * 60 - timeRemaining
        })
      });
   
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Navigate to results page with the test result ID
      navigate(`/assessment/results/${result.data.test_result_id}`);
    }
  } catch (error) {
    console.error('Error submitting test:', error);
  } finally {
    setLoading(false);
  }
};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m : ${secs.toString().padStart(2, '0')}s`;
  };

  const getProgress = () => {
    const answered = Object.keys(answers).length;
    const total = testData?.questions.length || 0;
    return (answered / total) * 100;
  };

  const extractImageFromText = (text) => {
    if (!text) return null;
    const match = text.match(/img_([^\s]+)/);
    if (match) {
      return {
        image: `${API_URL}/media/images/online_test/${match[0]}.png`,
        text: text.replace(/img_[^\s]+/, '').trim()
      };
    }
    return { text, image: null };
  };

  const formatQuestionText = (text) => {
    if (!text) return '';
    
    // Handle img_ tags
    const imgMatch = text.match(/img_([^\s]+)/);
    if (imgMatch) {
      const cleanText = text.replace(/img_[^\s]+/, '').trim();
      return { text: cleanText, hasImage: true, imageName: imgMatch[0] };
    }
    
    // Format with line breaks and indentation
    let formatted = text
      .split('\n')
      .map(line => {
        if (line.trim().match(/^[a-z]\./)) {
          return `<span class="option-line">${line}</span>`;
        } else if (line.trim().match(/^(i|ii|iii|iv|v)/)) {
          return `<span class="indent-line">&nbsp;&nbsp;${line}</span>`;
        }
        return line;
      })
      .join('<br/>');
    
    return { text: formatted, hasImage: false, html: true };
  };

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '20px' : '40px' }}>
        <LoadingSkeleton isMobile={isMobile} />
      </div>
    );
  }

  if (showResults && results) {
    return (
      <TestResults 
        results={results} 
        testData={testData}
        isMobile={isMobile}
        onRetry={() => {
          setTestCompleted(false);
          setShowResults(false);
          setAnswers({});
          setMarkedForReview(new Set());
          setCurrentQuestionIndex(0);
          fetchTest();
        }}
        onBack={() => navigate('/test-options')}
      />
    );
  }

  const currentQuestion = testData?.questions[currentQuestionIndex];
  const questionAnswers = testData?.answers?.[currentQuestion?.id] || [];
  const isTheoryQuestion = questionAnswers.length < 3 && questionAnswers.length > 0;
  const isHardMode = german?.includes('hard');
  const isAdvancedMode = german?.includes('advanced');
  const isTextInput = isHardMode || isAdvancedMode || isTheoryQuestion;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      position: 'relative',
      userSelect: 'none'
    }} className="no-select">
      
      {/* Floating Timer Circle */}
      <motion.div
        id="timer"
        animate={{
          scale: timeRemaining < 60 ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: timeRemaining < 60 ? Infinity : 0
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: isMobile ? '80px' : '100px',
          height: isMobile ? '80px' : '100px',
          backgroundColor: timeRemaining < 60 ? '#dc3545' : '#28a745',
          borderRadius: '50%',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: 'bold',
          color: 'white',
          zIndex: 1000,
          cursor: 'pointer',
          animation: timeRemaining < 60 ? 'pulse 2s infinite' : 'none'
        }}
        onClick={() => setPaused(!paused)}
      >
        {formatTime(timeRemaining)}
      </motion.div>

      {/* Test Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        padding: isMobile ? '12px 16px' : '16px 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '12px' : '0'
        }}>
          {/* Test Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '16px',
            flex: 1
          }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  navigate('/test-options');
                }
              }}
              style={{
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '8px',
                padding: isMobile ? '6px' : '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowLeftIcon style={{ width: isMobile ? '18px' : '20px', color: '#374151' }} />
            </motion.button>
            
            <div>
              <h2 style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '2px'
              }}>
                {testData?.metadata.course}
              </h2>
              <p style={{
                fontSize: isMobile ? '11px' : '13px',
                color: '#6B7280'
              }}>
                {testData?.metadata.year !== 'all' && `${testData.metadata.year} • `}
                {testData?.metadata.topic !== 'all' && testData.metadata.topic}
                {german && ` • ${german} mode`}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '12px',
            maxWidth: isMobile ? '100%' : '400px'
          }}>
            <div style={{
              flex: 1,
              height: '8px',
              background: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgress()}%` }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                  borderRadius: '4px'
                }}
              />
            </div>
            <span style={{
              fontSize: isMobile ? '12px' : '14px',
              color: '#6B7280',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}>
              {Object.keys(answers).length}/{testData?.questions.length}
            </span>
          </div>

          {/* Pause/Resume Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPaused(!paused)}
            style={{
              background: paused ? '#10B981' : '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              padding: isMobile ? '6px 10px' : '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: paused ? 'white' : '#374151',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 500
            }}
          >
            {paused ? (
              <>
                <PlayIcon style={{ width: isMobile ? '16px' : '18px' }} />
                {!isMobile && 'Resume'}
              </>
            ) : (
              <>
                <PauseIcon style={{ width: isMobile ? '16px' : '18px' }} />
                {!isMobile && 'Pause'}
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Paused Overlay */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: isMobile ? '32px 20px' : '40px',
                textAlign: 'center',
                maxWidth: '400px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                ⏸️
              </div>
              <h2 style={{
                fontSize: isMobile ? '24px' : '28px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '8px'
              }}>
                Test Paused
              </h2>
              <p style={{
                color: '#6B7280',
                marginBottom: '24px',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                Take a break! The timer has been paused.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPaused(false)}
                style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.3)'
                }}
              >
                Resume Test
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Test Area */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '20px 16px 100px' : '40px 24px 100px'
      }}>
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: isMobile ? '24px' : '32px',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)'
          }}
        >
{/* Question Header */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '12px'
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  }}>
    <span style={{
      background: '#EEF2FF',
      color: '#6366F1',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: 600
    }}>
      Question {currentQuestionIndex + 1} of {testData?.questions.length}
    </span>
    
    {currentQuestion?.answers?.length < 3 && (
      <span style={{
        background: '#E0F2FE',
        color: '#0369A1',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: isMobile ? '12px' : '13px',
        fontWeight: 600
      }}>
        Theory Question
      </span>
    )}
    
    {isHardMode && (
      <span style={{
        background: '#FEF3C7',
        color: '#92400E',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: isMobile ? '12px' : '13px',
        fontWeight: 600
      }}>
        Hard Mode - Type Answer
      </span>
    )}
    
    {isAdvancedMode && (
      <span style={{
        background: '#DBEAFE',
        color: '#1E40AF',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: isMobile ? '12px' : '13px',
        fontWeight: 600
      }}>
        Advanced - Fill in Blank
      </span>
    )}
  </div>
  
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => toggleMarkForReview(currentQuestion.id)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: markedForReview.has(currentQuestion.id) ? '#FEF3C7' : '#F3F4F6',
      color: markedForReview.has(currentQuestion.id) ? '#92400E' : '#374151',
      borderRadius: '20px',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer'
    }}
  >
    <FlagIcon style={{ width: '16px' }} />
    {markedForReview.has(currentQuestion.id) ? 'Marked for Review' : 'Mark for Review'}
  </motion.button>
</div>

{/* Question Text */}
<div style={{ marginBottom: '32px' }}>
  <p style={{
    fontSize: isMobile ? '16px' : '18px',
    color: '#111827',
    lineHeight: '1.6',
    fontWeight: 500,
    whiteSpace: 'pre-wrap'
  }}>
    {currentQuestionIndex + 1}. {currentQuestion?.text}
  </p>
</div>

{/* Answer Input Section */}
<div style={{
  borderTop: '1px solid #E5E7EB',
  paddingTop: '24px'
}}>
  {currentQuestion?.answers?.length < 3 ? (
    /* Theory Question - Text Input (no options displayed) */
    <div>
      <div style={{
        background: '#F3F4F6',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '16px',
        color: '#4B5563',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <BookOpenIcon style={{ width: '20px', color: '#6366F1' }} />
        <span>This is a theory question. Type your answer in the box below.</span>
      </div>
      <textarea
        ref={el => textareaRefs.current[currentQuestion.id] = el}
        value={answers[currentQuestion.id] || ''}
        onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
        placeholder="Type your answer here..."
        style={{
          width: '100%',
          padding: '16px',
          fontSize: isMobile ? '16px' : '18px',
          border: '2px solid #E5E7EB',
          borderRadius: '12px',
          outline: 'none',
          resize: 'vertical',
          minHeight: '150px',
          fontFamily: 'inherit',
          transition: 'border-color 0.3s ease'
        }}
        onFocus={(e) => e.target.style.borderColor = '#6366F1'}
        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
      />
      <p style={{
        fontSize: '13px',
        color: '#6B7280',
        marginTop: '8px',
        fontStyle: 'italic'
      }}>
        Your answer will be graded by AI based on correctness and completeness.
      </p>
    </div>
  ) : (
    /* Multiple Choice - Radio buttons */
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {currentQuestion?.answers?.map((answer, index) => {
        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
        const isSelected = answers[currentQuestion.id] === answer.id;
        
        return (
          <motion.label
            key={answer.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: isSelected ? '#EEF2FF' : '#F9FAFB',
              border: isSelected ? '2px solid #6366F1' : '2px solid #E5E7EB',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <input
              type="radio"
              name={`question_${currentQuestion.id}`}
              value={answer.id}
              checked={isSelected}
              onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
              style={{
                width: '20px',
                height: '20px',
                marginTop: '2px',
                cursor: 'pointer',
                accentColor: '#6366F1'
              }}
            />
            <div style={{ flex: 1 }}>
              <span style={{
                fontWeight: 600,
                marginRight: '8px',
                color: isSelected ? '#6366F1' : '#374151'
              }}>
                {optionLetter}.
              </span>
              <span style={{ color: isSelected ? '#111827' : '#4B5563' }}>
                {answer.text}
              </span>
            </div>
          </motion.label>
        );
      })}
    </div>
  )}
</div>

{/* Question Navigation */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #E5E7EB'
}}>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
    disabled={currentQuestionIndex === 0}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: isMobile ? '12px 20px' : '14px 28px',
      background: currentQuestionIndex === 0 ? '#F3F4F6' : 'white',
      color: currentQuestionIndex === 0 ? '#9CA3AF' : '#374151',
      borderRadius: '12px',
      fontWeight: 600,
      fontSize: isMobile ? '14px' : '15px',
      border: currentQuestionIndex === 0 ? 'none' : '2px solid #E5E7EB',
      cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
    }}
  >
    <ArrowLeftIcon style={{ width: '18px' }} />
    Previous
  </motion.button>
  
  {currentQuestionIndex === testData?.questions.length - 1 ? (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={submitTest}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isMobile ? '12px 24px' : '14px 32px',
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: isMobile ? '14px' : '15px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 20px -5px rgba(16, 185, 129, 0.3)'
      }}
    >
      Submit Test
      <CheckCircleIcon style={{ width: '18px' }} />
    </motion.button>
  ) : (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isMobile ? '12px 24px' : '14px 32px',
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: isMobile ? '14px' : '15px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.3)'
      }}
    >
      Next
      <ArrowRightIcon style={{ width: '18px' }} />
    </motion.button>
  )}
</div>
        </motion.div>

        {/* Question Palette for Mobile */}
        {isMobile && (
          <div style={{
            marginTop: '20px',
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '12px'
            }}>
              Question Palette
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px'
            }}>
              {testData?.questions.map((q, idx) => {
                const isAnswered = answers[q.id];
                const isMarked = markedForReview.has(q.id);
                const isCurrent = idx === currentQuestionIndex;
                
                let bgColor = '#F3F4F6';
                if (isCurrent) bgColor = '#6366F1';
                else if (isAnswered && isMarked) bgColor = '#FBBF24';
                else if (isAnswered) bgColor = '#10B981';
                else if (isMarked) bgColor = '#F59E0B';
                
                return (
                  <motion.button
                    key={q.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    style={{
                      aspectRatio: '1',
                      background: bgColor,
                      border: isCurrent ? '2px solid #4F46E5' : 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      color: (isCurrent || isAnswered || isMarked) ? 'white' : '#111827',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {idx + 1}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
        
      </main>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .no-select {
          user-select: none;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
        }
        
        @media (max-width: 768px) {
          input, textarea, select {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Test Results Component
function TestResults({ results, testData, isMobile, onRetry, onBack }) {
  const [showDetails, setShowDetails] = useState(false);
  const { summary, detailed_results } = results;
  
  const API_URL = process.env.NODE_ENV === 'development' 
    ? "http://localhost:8000/api" 
    : "/api";

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: isMobile ? '20px' : '40px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: summary.passed ? [0, 10, -10, 0] : 0
            }}
            transition={{ duration: 1 }}
            style={{
              fontSize: '64px',
              marginBottom: '16px'
            }}
          >
            {summary.passed ? '🎉' : '📚'}
          </motion.div>
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '8px'
          }}>
            {summary.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: '#6B7280'
          }}>
            {summary.passed 
              ? "You've successfully passed the test!" 
              : "Don't give up! Review your answers and try again."}
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: isMobile ? '24px' : '32px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: isMobile ? '24px' : '48px'
          }}>
            {/* Score Circle */}
            <div style={{
              position: 'relative',
              width: isMobile ? '150px' : '180px',
              height: isMobile ? '150px' : '180px'
            }}>
              <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle
                  cx={isMobile ? '75' : '90'}
                  cy={isMobile ? '75' : '90'}
                  r={isMobile ? '65' : '80'}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="10"
                />
                <circle
                  cx={isMobile ? '75' : '90'}
                  cy={isMobile ? '75' : '90'}
                  r={isMobile ? '65' : '80'}
                  fill="none"
                  stroke={summary.passed ? '#10B981' : '#6366F1'}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * (isMobile ? 65 : 80)}`}
                  strokeDashoffset={`${2 * Math.PI * (isMobile ? 65 : 80) * (1 - summary.score_percentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <span style={{
                  fontSize: isMobile ? '32px' : '40px',
                  fontWeight: 700,
                  color: '#111827'
                }}>
                  {Math.round(summary.score_percentage)}%
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              width: '100%'
            }}>
              <div style={{
                background: '#F3F4F6',
                padding: '16px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <CheckCircleIcon style={{ width: '24px', height: '24px', color: '#10B981', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                  {summary.correct_answers}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>Correct</div>
              </div>
              
              <div style={{
                background: '#F3F4F6',
                padding: '16px',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <XCircleIcon style={{ width: '24px', height: '24px', color: '#EF4444', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                  {summary.wrong_answers}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>Wrong</div>
              </div>
              
              <div style={{
                background: '#F3F4F6',
                padding: '16px',
                borderRadius: '16px',
                textAlign: 'center',
                gridColumn: isMobile ? 'span 2' : 'auto'
              }}>
                <ClockIcon style={{ width: '24px', height: '24px', color: '#6366F1', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                  {formatTime(summary.time_taken)}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>Time Taken</div>
              </div>
              
              <div style={{
                background: '#F3F4F6',
                padding: '16px',
                borderRadius: '16px',
                textAlign: 'center',
                gridColumn: isMobile ? 'span 2' : 'auto'
              }}>
                <BookOpenIcon style={{ width: '24px', height: '24px', color: '#8B5CF6', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                  {summary.total_questions}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>Total Questions</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '32px'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            style={{
              padding: isMobile ? '12px 24px' : '14px 32px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: isMobile ? '14px' : '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.3)'
            }}
          >
            Try Again
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: isMobile ? '12px 24px' : '14px 32px',
              background: 'white',
              color: '#374151',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: isMobile ? '14px' : '16px',
              border: '2px solid #E5E7EB',
              cursor: 'pointer'
            }}
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            style={{
              padding: isMobile ? '12px 24px' : '14px 32px',
              background: 'white',
              color: '#374151',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: isMobile ? '14px' : '16px',
              border: '2px solid #E5E7EB',
              cursor: 'pointer'
            }}
          >
            Back to Tests
          </motion.button>
        </motion.div>

        {/* Detailed Results */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: isMobile ? '20px' : '24px',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '16px'
                }}>
                  Question Review
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {detailed_results.map((result, idx) => (
                    <motion.div
                      key={result.question_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        padding: '16px',
                        background: result.is_correct ? '#F0FDF4' : '#FEF2F2',
                        borderRadius: '12px',
                        border: `1px solid ${result.is_correct ? '#86EFAC' : '#FECACA'}`
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '12px',
                          background: result.is_correct ? '#22C55E' : '#EF4444',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 600
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{
                          fontWeight: 600,
                          color: result.is_correct ? '#166534' : '#991B1B'
                        }}>
                          {result.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <p style={{
                        fontSize: '14px',
                        color: '#374151',
                        marginBottom: '12px'
                      }}>
                        {result.question_text}
                      </p>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '8px 12px',
                        fontSize: '13px'
                      }}>
                        <span style={{ color: '#6B7280' }}>Your answer:</span>
                        <span style={{ 
                          color: result.is_correct ? '#16A34A' : '#DC2626',
                          fontWeight: 500
                        }}>
                          {result.user_answer || 'No answer'}
                        </span>
                        
                        {!result.is_correct && (
                          <>
                            <span style={{ color: '#6B7280' }}>Correct answer:</span>
                            <span style={{ color: '#16A34A', fontWeight: 500 }}>
                              {result.correct_answer}
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}