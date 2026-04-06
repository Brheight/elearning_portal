import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TrashIcon,
  EyeIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { apiFetch, apiPost } from '../components/api';
export default function AllResultsPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
    fetchAllResults();
  }, []);

  const fetchAllResults = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/assessments/test-results/');
      const data = await response.json();
      
      if (data.status === 'success') {
        // Sort by date (newest first)
        const sortedResults = data.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setResults(sortedResults);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (resultId) => {
    navigate(`/assessment/results/${resultId}`);
  };

  const handleDelete = async (resultId) => {
    try {
      const response = await apiFetch(`/assessments/test-results/${resultId}/`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from list
        setResults(results.filter(r => r.id !== resultId));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <p style={{ color: '#6B7280' }}>Loading your test history...</p>
        </div>
      </div>
    );
  }

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
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '8px'
          }}>
            Test History
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280'
          }}>
            View all your past test results and performance
          </p>
        </motion.div>

        {/* Results List */}
        {results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <DocumentTextIcon style={{
              width: '80px',
              height: '80px',
              color: '#9CA3AF',
              margin: '0 auto 20px'
            }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px'
            }}>
              No Test Results Yet
            </h3>
            <p style={{
              color: '#6B7280',
              marginBottom: '24px'
            }}>
              Take your first test to see your results here.
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
              Take a Test
            </button>
          </motion.div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E5E7EB',
                  position: 'relative'
                }}
              >
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm === result.id && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    padding: '20px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '16px'
                      }}>
                        Delete this test result?
                      </p>
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center'
                      }}>
                        <button
                          onClick={() => handleDelete(result.id)}
                          style={{
                            padding: '8px 16px',
                            background: '#EF4444',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          style={{
                            padding: '8px 16px',
                            background: '#E5E7EB',
                            color: '#374151',
                            borderRadius: '8px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '16px',
                  alignItems: isMobile ? 'stretch' : 'center'
                }}>
                  {/* Score Circle */}
                  <div style={{
                    width: isMobile ? '100%' : '80px',
                    height: isMobile ? 'auto' : '80px',
                    background: `linear-gradient(135deg, ${getScoreColor(result.score)}20, ${getScoreColor(result.score)}05)`,
                    borderRadius: isMobile ? '12px' : '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '12px' : '0'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: isMobile ? '24px' : '28px',
                        fontWeight: 700,
                        color: getScoreColor(result.score)
                      }}>
                        {Math.round(result.score)}%
                      </div>
                      {isMobile && (
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Score</div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#111827',
                      marginBottom: '8px'
                    }}>
                      {result.course || 'Course not specified'}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        color: '#6B7280'
                      }}>
                        <CalendarIcon style={{ width: '14px' }} />
                        {formatDate(result.created_at)}
                      </span>
                      
                      {result.topics && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: '#6B7280'
                        }}>
                          <AcademicCapIcon style={{ width: '14px' }} />
                          {result.topics.split(',').length} topic(s)
                        </span>
                      )}
                      
                      {result.years && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: '#6B7280'
                        }}>
                          <ClockIcon style={{ width: '14px' }} />
                          {result.years}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      marginTop: '8px'
                    }}>
                      {result.ai_graded_count > 0 && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          background: '#EEF2FF',
                          color: '#6366F1',
                          padding: '4px 8px',
                          borderRadius: '20px'
                        }}>
                          <SparklesIcon style={{ width: '14px' }} />
                          {result.ai_graded_count} AI-graded
                        </span>
                      )}
                      
                      {result.total_questions && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          background: '#F3F4F6',
                          color: '#374151',
                          padding: '4px 8px',
                          borderRadius: '20px'
                        }}>
                          <DocumentTextIcon style={{ width: '14px' }} />
                          {result.total_questions} questions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(result.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '10px 16px',
                        background: '#6366F1',
                        color: 'white',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '14px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <EyeIcon style={{ width: '16px' }} />
                      {!isMobile && 'View Details'}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteConfirm(result.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        background: '#FEE2E2',
                        color: '#EF4444',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <TrashIcon style={{ width: '18px' }} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/test-options')}
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#374151',
              borderRadius: '12px',
              fontWeight: 600,
              border: '2px solid #E5E7EB',
              cursor: 'pointer'
            }}
          >
            Back to Test Options
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}