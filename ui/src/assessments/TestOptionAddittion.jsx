import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function TestOptionsPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [view, setView] = useState('courses'); // 'courses' or 'tests'

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

  // Fetch all courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/test-options/courses/`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setCourses(result.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseData = async (courseKey) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/test-options/filter/?course=${encodeURIComponent(courseKey)}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setCourseData(result.data);
        setSelectedCourse(courseKey);
        setView('tests');
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCourses = () => {
    setView('courses');
    setSelectedCourse(null);
    setCourseData(null);
  };

  const handleStartTest = (type, value) => {
    const params = new URLSearchParams();
    params.append('course', selectedCourse);
    
    if (type === 'year') {
      // Clean year format if needed
      const cleanYear = value.replace(/[()]/g, '').replace('/', '-');
      params.append('year', cleanYear);
    } else if (type === 'topic') {
      params.append('topic', value);
    } else if (type === 'full') {
      // Full test - no additional params needed
    }
    
    navigate(`/timed-test?${params.toString()}`);
  };

  const getCourseDisplayName = (courseKey) => {
    return courses[courseKey] || courseKey;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative'
    }}>
      {/* Your existing animated background elements here */}

      <main style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '20px 16px 60px' : '40px 24px 80px'
      }}>
        {/* Header with back button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {view === 'tests' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToCourses}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'white',
                color: '#374151',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                border: '2px solid #E5E7EB',
                cursor: 'pointer'
              }}
            >
              <ArrowLeftIcon style={{ width: '16px' }} />
              Back to Courses
            </motion.button>
          )}
          
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 700,
            color: '#111827'
          }}>
            {view === 'courses' 
              ? 'Select a Course' 
              : `${getCourseDisplayName(selectedCourse)} - Test Options`
            }
          </h2>
        </div>

        {loading ? (
          <LoadingSkeleton isMobile={isMobile} />
        ) : (
          <>
            {view === 'courses' ? (
              /* Courses Grid */
              <motion.div
                layout
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '280px' : '300px'}, 1fr))`,
                  gap: isMobile ? '20px' : '24px'
                }}
              >
                <AnimatePresence>
                  {Object.entries(courses).map(([key, displayName], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <CourseCard
                        title={displayName}
                        courseKey={key}
                        onClick={() => fetchCourseData(key)}
                        icon={<AcademicCapIcon style={{ width: 32, height: 32 }} />}
                        gradient="linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Test Options Grid for Selected Course */
              courseData && (
                <>
                  {/* Course Info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '32px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                          Total Questions Available
                        </p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                          {courseData.question_count}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '16px'
                      }}>
                        <div>
                          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                            Years
                          </p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                            {courseData.years?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                            Topics
                          </p>
                          <p style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                            {courseData.topics?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Test Options Grid */}
                  <motion.div
                    layout
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '280px' : '300px'}, 1fr))`,
                      gap: isMobile ? '20px' : '24px'
                    }}
                  >
                    <AnimatePresence>
                      {/* Full Practice Test Card - Always show first */}
                      <motion.div
                        key="full-test"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -4 }}
                      >
                        <TestCard
                          title="Full Practice Test"
                          type="full"
                          value="full"
                          course={selectedCourse}
                          questionCount={courseData.question_count}
                          icon={<AcademicCapIcon style={{ width: 24, height: 24 }} />}
                          gradient="linear-gradient(135deg, #10B981 0%, #3B82F6 100%)"
                          onClick={handleStartTest}
                          featured
                        />
                      </motion.div>

                      {/* Test by Year Cards */}
                      {courseData.years?.length > 0 && courseData.years.map((year, index) => (
                        <motion.div
                          key={`year-${year}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4 }}
                        >
                          <TestCard
                            title={`${year} Practice Test`}
                            type="year"
                            value={year}
                            course={selectedCourse}
                            questionCount={Math.floor(courseData.question_count / courseData.years.length)}
                            icon={<ClockIcon style={{ width: 24, height: 24 }} />}
                            gradient="linear-gradient(135deg, #6366F1 0%, #A855F7 100%)"
                            onClick={handleStartTest}
                          />
                        </motion.div>
                      ))}

                      {/* Test by Topic Cards */}
                      {courseData.topics?.length > 0 && courseData.topics.map((topic, index) => (
                        <motion.div
                          key={`topic-${topic}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4 }}
                        >
                          <TestCard
                            title={topic}
                            type="topic"
                            value={topic}
                            course={selectedCourse}
                            questionCount={Math.floor(courseData.question_count / courseData.topics.length)}
                            icon={<ChartBarIcon style={{ width: 24, height: 24 }} />}
                            gradient="linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)"
                            onClick={handleStartTest}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Empty State */}
                  {courseData.question_count === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        textAlign: 'center',
                        padding: isMobile ? '60px 20px' : '80px 0',
                        background: 'white',
                        borderRadius: isMobile ? '16px' : '24px',
                        boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)',
                        marginTop: isMobile ? '20px' : '32px'
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          fontSize: isMobile ? '60px' : '80px',
                          marginBottom: isMobile ? '16px' : '24px'
                        }}
                      >
                        📚
                      </motion.div>
                      <h3 style={{
                        fontSize: isMobile ? '22px' : '28px',
                        fontWeight: 700,
                        color: '#111827',
                        marginBottom: '8px'
                      }}>
                        No tests available
                      </h3>
                      <p style={{
                        color: '#6B7280',
                        fontSize: isMobile ? '14px' : '18px',
                        maxWidth: '400px',
                        margin: '0 auto'
                      }}>
                        Try selecting a different course
                      </p>
                    </motion.div>
                  )}
                </>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Course Card Component
function CourseCard({ title, courseKey, onClick, icon, gradient }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Gradient Header */}
      <div style={{
        background: gradient,
        padding: '24px',
        color: 'white',
        textAlign: 'center'
      }}>
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </motion.div>
        
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '4px',
          lineHeight: '1.3'
        }}>
          {title}
        </h3>
      </div>

      {/* Card Footer */}
      <div style={{
        padding: '20px',
        textAlign: 'center'
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '100%',
            padding: '12px',
            background: gradient,
            color: 'white',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Select Course
        </motion.button>
      </div>
    </motion.div>
  );
}

// Test Card Component
function TestCard({ title, type, value, course, questionCount, icon, gradient, onClick, featured = false }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick(type, value);
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        background: featured 
          ? 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)'
          : 'white',
        borderRadius: '20px',
        boxShadow: featured 
          ? '0 20px 40px -10px rgba(16, 185, 129, 0.2)'
          : '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        border: featured 
          ? '2px solid rgba(16, 185, 129, 0.2)'
          : '1px solid rgba(255, 255, 255, 0.8)',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={handleClick}
    >
      {/* Featured Badge */}
      {featured && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          zIndex: 1
        }}>
          Recommended
        </div>
      )}

      {/* Gradient Header */}
      <div style={{
        background: gradient,
        padding: '24px',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
          <span style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            backdropFilter: 'blur(4px)'
          }}>
            {type === 'year' ? 'Yearly' : type === 'topic' ? 'Topic' : 'Full Test'}
          </span>
        </div>
        
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '4px',
          lineHeight: '1.3'
        }}>
          {title}
        </h3>
        
        <p style={{
          fontSize: '14px',
          opacity: 0.9
        }}>
          {questionCount} Questions
        </p>
      </div>

      {/* Card Body */}
      <div style={{
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{
                fontSize: '13px',
                color: '#6B7280',
                marginBottom: '4px'
              }}>
                Time Allotted
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827'
              }}>
                {Math.ceil(questionCount * 1.5)} mins
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '13px',
                color: '#6B7280',
                marginBottom: '4px'
              }}>
                Passing Score
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827'
              }}>
                70%
              </p>
            </div>
          </div>

          {/* Difficulty Bar */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#6B7280',
              marginBottom: '4px'
            }}>
              <span>Difficulty</span>
              <span>Mixed</span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              background: '#E5E7EB',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <motion.div
                animate={{ width: isHovered ? '70%' : '50%' }}
                transition={{ duration: 0.3 }}
                style={{
                  height: '100%',
                  background: gradient,
                  borderRadius: '2px'
                }}
              />
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '14px',
              background: featured ? gradient : '#F3F4F6',
              color: featured ? 'white' : '#374151',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px',
              boxShadow: featured ? '0 8px 20px -5px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            Start Test
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}