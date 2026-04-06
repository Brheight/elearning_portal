import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  BookOpenIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { apiFetch, apiPost } from '../components/api';
export default function ResultPage() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [expandedModels, setExpandedModels] = useState({});

  const API_URL = process.env.NODE_ENV === 'development' 
    ? "http://localhost:8000/api" 
    : "/api";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (resultId) {
      fetchResult(resultId);
    }
  }, [resultId]);

  const fetchResult = async (id) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/assessments/test-results/${id}/`);
      const data = await response.json();
      if (data.status === 'success') {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModelExpand = (index) => {
    setExpandedModels(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#6366F1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#6B7280' }}>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <XCircleIcon style={{ width: '60px', height: '60px', color: '#EF4444', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            Result Not Found
          </h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            The test result you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/test-options')}
            style={{
              padding: '12px 24px',
              background: '#6366F1',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const { score, course, topics, years, mapped_data, ai_graded_answers, total_questions, correct_count, ai_graded_count } = result;

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
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: isMobile ? '24px' : '32px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px',
            textAlign: 'center'
          }}
        >
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '16px'
          }}>
            Your Score: <span style={{ color: getScoreColor(score) }}>{score}%</span>
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            marginBottom: '8px'
          }}>
            Test Result for {course}
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{total_questions}</div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Total Questions</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>{correct_count}</div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Correct</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#6366F1' }}>{ai_graded_count}</div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>AI-Graded</div>
            </div>
          </div>
        </motion.div>

        {/* Regular Questions (Multiple Choice) */}
        {mapped_data && mapped_data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '20px'
            }}>
              Multiple Choice Questions
            </h2>
            
            {mapped_data.map((quest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  marginBottom: '20px',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '16px',
                  borderLeft: `5px solid ${quest.question_pass ? '#10B981' : '#EF4444'}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    flex: 1
                  }}>
                    {index + 1}. {quest.question_text}
                  </h4>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: quest.question_pass ? '#D1FAE5' : '#FEE2E2',
                    color: quest.question_pass ? '#065F46' : '#991B1B'
                  }}>
                    {quest.question_pass ? 'Passed' : 'Failed'}
                  </span>
                </div>

                {Object.entries(quest.options).map(([option, value]) => (
                  <div
                    key={option}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      marginBottom: '4px',
                      background: value === 'selected' && !quest.question_pass ? '#FEE2E2' : 'transparent',
                      borderRadius: '8px'
                    }}
                  >
                    <input
                      type="radio"
                      checked={
                        (quest.question_pass && value === 'correct') ||
                        (!quest.question_pass && value === 'selected')
                      }
                      readOnly
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: value === 'correct' ? '#10B981' : '#EF4444'
                      }}
                    />
                    <span style={{
                      flex: 1,
                      color: '#4B5563'
                    }}>
                      {option}
                    </span>
                    {value === 'correct' && quest.question_pass && (
                      <span style={{
                        color: '#10B981',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircleIcon style={{ width: '16px' }} />
                        ✓ You chose correctly
                      </span>
                    )}
                    {value === 'correct' && !quest.question_pass && (
                      <span style={{
                        color: '#10B981',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircleIcon style={{ width: '16px' }} />
                        ✓ Correct answer
                      </span>
                    )}
                    {value === 'selected' && !quest.question_pass && (
                      <span style={{
                        color: '#EF4444',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <XCircleIcon style={{ width: '16px' }} />
                        ✗ Your choice (incorrect)
                      </span>
                    )}
                  </div>
                ))}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* AI-Graded Questions */}
        {ai_graded_answers && ai_graded_answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ marginTop: '40px' }}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <SparklesIcon style={{ width: '24px', height: '24px', color: '#6366F1' }} />
              AI-Graded Questions
            </h2>

            {ai_graded_answers.map((ai, index) => {
              const passed = ai.marks_awarded >= ai.total_marks / 2;
              
              return (
                <motion.div
                  key={ai.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    marginBottom: '24px',
                    padding: '24px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '16px'
                  }}>
                    {index + 1}. {ai.question_text}
                  </h4>

                  {/* Student's Answer */}
                  <div style={{
                    background: '#F3F4F6',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>
                      Your answer:
                    </strong>
                    <div style={{
                      padding: '12px',
                      background: 'white',
                      borderRadius: '8px',
                      borderLeft: '3px solid #6366F1',
                      fontStyle: 'italic',
                      color: '#4B5563'
                    }}>
                      "{ai.student_answer_text}"
                    </div>
                  </div>

                  {/* Score and Feedback */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    {/* Score Card */}
                    <div style={{
                      background: passed ? '#10B981' : '#F59E0B',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <h5 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>Score</h5>
                      <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>
                        {ai.marks_awarded}/{ai.total_marks}
                      </h2>
                      <p style={{ fontSize: '14px', opacity: 0.9 }}>
                        Confidence: {ai.confidence_score}%
                      </p>
                    </div>

                    {/* AI Feedback */}
                    <div style={{
                      background: '#F3F4F6',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <h5 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ChatBubbleLeftRightIcon style={{ width: '18px' }} />
                        AI Feedback
                      </h5>
                      <p style={{ color: '#4B5563', lineHeight: '1.6' }}>{ai.feedback}</p>
                      
                      {ai.strengths && ai.strengths.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <strong style={{ color: '#10B981' }}>Strengths:</strong>
                          <ul style={{ marginTop: '4px', marginLeft: '20px' }}>
                            {ai.strengths.map((strength, i) => (
                              <li key={i} style={{ color: '#059669' }}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {ai.areas_for_improvement && ai.areas_for_improvement.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <strong style={{ color: '#F59E0B' }}>Areas to improve:</strong>
                          <ul style={{ marginTop: '4px', marginLeft: '20px' }}>
                            {ai.areas_for_improvement.map((area, i) => (
                              <li key={i} style={{ color: '#B45309' }}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model Answer */}
                  
                  {ai.model_answer && (
                    <div style={{
                      marginBottom: '16px',
                      border: '1px solid #6366F1',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#6366F1',
                        padding: '12px 16px',
                        color: 'white',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <BookOpenIcon style={{ width: '20px' }} />
                        Model Answer
                      </div>
                      <div style={{ padding: '16px', background: '#F3F4F6' }}>
                        <div style={{
                          maxHeight: expandedModels[index] ? 'none' : '100px',
                          overflow: 'hidden',
                          position: 'relative',
                          lineHeight: '1.6'
                        }}>
                          {ai.model_answer.split('\n').map((line, i) => (
                            <p key={i} style={{ marginBottom: '8px' }}>{line}</p>
                          ))}
                          {!expandedModels[index] && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: '40px',
                              background: 'linear-gradient(transparent, #F3F4F6)'
                            }} />
                          )}
                        </div>
                        <button
                          onClick={() => toggleModelExpand(index)}
                          style={{
                            marginTop: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#6366F1',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          {expandedModels[index] ? 'Show less' : 'Read more'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pass/Fail Status */}
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: passed ? '#D1FAE5' : '#FEE2E2',
                    color: passed ? '#065F46' : '#991B1B',
                    fontWeight: 500
                  }}>
                    {passed ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleIcon style={{ width: '20px' }} />
                        ✓ Passed - You scored above 50% on this question.
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <XCircleIcon style={{ width: '20px' }} />
                        ✗ Needs Improvement - You scored below 50% on this question.
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Study Recommendations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '40px' }}
        >
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <LightBulbIcon style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
            Study Recommendations
          </h2>

          {/* Regular Question Recommendations */}
          {mapped_data && mapped_data.filter(q => !q.question_pass).map((quest, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                background: '#F3F4F6',
                borderRadius: '12px',
                marginBottom: '16px',
                borderLeft: '3px solid #F59E0B'
              }}
            >
              <p style={{ marginBottom: '12px' }}>
                Study <strong>{quest.topic}</strong> again, focusing on <strong>{quest.sub_topic}</strong>. You seem to be weak in this area.
              </p>
              <p style={{ marginBottom: '8px' }}><strong>Review this question:</strong></p>
              <p style={{ marginBottom: '12px', fontStyle: 'italic' }}>{quest.question_text}</p>
              
              {Object.entries(quest.options).map(([option, value]) => {
                if (value === 'correct') {
                  return (
                    <p key={option} style={{ marginBottom: '4px' }}>
                      <strong>Correct Answer:</strong> {option}
                    </p>
                  );
                }
                if (value === 'selected') {
                  return (
                    <p key={option} style={{ marginBottom: '4px' }}>
                      <strong>Your Choice:</strong> {option} (incorrect)
                    </p>
                  );
                }
                return null;
              })}
              
              <p style={{ marginTop: '12px', color: '#6B7280', fontSize: '14px' }}>
                If you think the answer to the question is incorrect, please notify us to review.
              </p>
            </div>
          ))}

          {/* AI Question Recommendations */}
          {ai_graded_answers && ai_graded_answers.filter(ai => ai.marks_awarded < ai.total_marks / 2).map((ai, index) => (
            <div
              key={ai.id}
              style={{
                padding: '20px',
                background: '#FEF3C7',
                borderRadius: '12px',
                marginBottom: '16px',
                borderLeft: '3px solid #F59E0B'
              }}
            >
              <h5 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Question on {ai.question_topic || ai.question?.topic}
              </h5>
              <p style={{ marginBottom: '8px' }}>Your answer needs improvement. Review the topic:</p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>{ai.question_topic || ai.question?.topic}</p>
              <p style={{ marginBottom: '12px' }}>AI Feedback: {ai.feedback}</p>
              
              {ai.model_answer && (
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={() => toggleModelExpand(`rec_${index}`)}
                    style={{
                      background: 'white',
                      border: '1px solid #6366F1',
                      color: '#6366F1',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {expandedModels[`rec_${index}`] ? 'Hide Model Answer' : 'View Model Answer'}
                  </button>
                  
                  {expandedModels[`rec_${index}`] && (
                    <div style={{
                      marginTop: '12px',
                      padding: '16px',
                      background: 'white',
                      borderRadius: '8px'
                    }}>
                      <strong>Model Answer:</strong>
                      <div style={{ marginTop: '8px', lineHeight: '1.6' }}>
                        {ai.model_answer.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Test Metadata */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: '40px',
            padding: '20px',
            background: '#F3F4F6',
            borderRadius: '12px'
          }}
        >
          <strong style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>
            Test Details:
          </strong>
          <p style={{ marginBottom: '4px', color: '#4B5563' }}>Course: {course}</p>
          <p style={{ marginBottom: '4px', color: '#4B5563' }}>Topic(s): {topics}</p>
          <p style={{ marginBottom: '4px', color: '#4B5563' }}>Year(s): {years}</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '40px',
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => navigate('/timed-test')}
            style={{
              padding: '14px 28px',
              background: '#6366F1',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.3)'
            }}
          >
            Take Another Test
          </button>
          
          <button
            onClick={() => navigate('/test-options')}
            style={{
              padding: '14px 28px',
              background: 'white',
              color: '#374151',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '16px',
              border: '2px solid #E5E7EB',
              cursor: 'pointer'
            }}
          >
            Change Test Options
          </button>
        </motion.div>

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}