import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { apiFetch, apiPost, getAuthHeaders } from '../components/api';
import Footer from '../pages/Footer';

export default function TestOptionsPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Data states
  const [testData, setTestData] = useState({
    years: [],
    topics: [],
    courses: {},
    question_count: 0
  });
  
  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  
  const API_URL = process.env.NODE_ENV === 'development' 
    ? "http://localhost:8000/api" 
    : "/api";

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchTestOptions();
  }, []);

  const fetchTestOptions = async (course = '') => {
    setLoading(true);
    try {
      const url = course 
        ? `/assessments/test-options/filter/?course=${encodeURIComponent(course)}`
        : `/assessments/test-options/`;
      
      const response = await apiFetch(url);
      const result = await response.json();
      
      if (result.status === 'success') {
        setTestData(result.data);
        if (course) {
          setSelectedCourse(course);
        }
      }
    } catch (error) {
      console.error('Error fetching test options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (course) => {
    setSelectedCourse(course);
    if (course) {
      await fetchTestOptions(course);
    } else {
      await fetchTestOptions();
    }
  };

  const handleFilterTest = async () => {
    let filteredData = { ...testData };
    
    // Filter by year if selected
    if (selectedYear !== 'all') {
      // You might need an API endpoint for year filtering
      try {
        const response = await fetch(
          `${API_URL}/test-options/filter/?year=${selectedYear}&course=${selectedCourse}`
        );
        const result = await response.json();
        if (result.status === 'success') {
          filteredData = result.data;
        }
      } catch (error) {
        console.error('Error filtering by year:', error);
      }
    }
    
    // Filter by topic if selected
    if (selectedTopic !== 'all') {
      // You might need an API endpoint for topic filtering
      try {
        const response = await fetch(
          `${API_URL}/test-options/filter/?topic=${selectedTopic}&course=${selectedCourse}`
        );
        const result = await response.json();
        if (result.status === 'success') {
          filteredData = result.data;
        }
      } catch (error) {
        console.error('Error filtering by topic:', error);
      }
    }
    
    setTestData(filteredData);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCourse('');
    setSelectedYear('all');
    setSelectedTopic('all');
    setSelectedLevel('all');
    fetchTestOptions();
  };

  const getCourseDisplayName = (courseKey) => {
    return testData.courses[courseKey] || courseKey;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      position: 'relative'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: isMobile ? '200px' : '400px',
            height: isMobile ? '200px' : '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }}
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: isMobile ? '150px' : '300px',
            height: isMobile ? '150px' : '300px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
            borderRadius: '50%'
          }}
        />
      </div>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        color: 'white',
        padding: isMobile ? '40px 0 20px' : '40px 0 20px'
      }}>
        {/* Floating Particles */}
        {[...Array(isMobile ? 10 : 20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: 'white',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.6
            }}
          />
        ))}

        <div style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ textAlign: 'center' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                backdropFilter: 'blur(12px)',
                padding: isMobile ? '8px 16px' : '12px 24px',
                borderRadius: isMobile ? '12px' : '20px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600,
                marginBottom: isMobile ? '20px' : '32px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <SparklesIcon style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px' }} />
              {isMobile ? 'Practice Tests' : 'Test Your Knowledge'}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              style={{
                fontSize: isMobile ? 'clamp(32px, 8vw, 48px)' : 'clamp(48px, 5vw, 72px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                marginBottom: isMobile ? '16px' : '24px',
                lineHeight: '1.1',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                padding: isMobile ? '0 8px' : '0'
              }}
            >
              {isMobile ? (
                <>
                  Practice
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 50%, #EC4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>& Perfect</span>
                </>
              ) : (
                <>
                  Practice Makes
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 50%, #EC4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Perfect</span>
                </>
              )}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                fontSize: isMobile ? '16px' : '20px',
                color: '#CBD5E1',
                maxWidth: '768px',
                margin: `0 auto ${isMobile ? '32px' : '48px'}`,
                lineHeight: '1.6',
                fontWeight: 400,
                padding: isMobile ? '0 8px' : '0'
              }}
            >
              {isMobile 
                ? 'Comprehensive practice tests with detailed explanations.' 
                : 'Access thousands of practice questions across multiple subjects. Track your progress and master each topic.'
              }
            </motion.p>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(3, 1fr)`,
                gap: isMobile ? '8px' : '24px',
                maxWidth: isMobile ? '100%' : '600px',
                margin: `0 auto ${isMobile ? '32px' : '48px'}`
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: isMobile ? '12px 8px' : '16px',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 700, color: 'white' }}>
                  {testData.question_count}+
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#94A3B8' }}>Questions</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: isMobile ? '12px 8px' : '16px',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 700, color: 'white' }}>
                  {testData.years?.length || 0}
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#94A3B8' }}>Past Years</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: isMobile ? '12px 8px' : '16px',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 700, color: 'white' }}>
                  {testData.topics?.length || 0}
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#94A3B8' }}>Topics</div>
              </div>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              style={{
                maxWidth: isMobile ? '100%' : '800px',
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: isMobile ? '16px' : '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Course Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '12px' : '16px',
                gap: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <AcademicCapIcon style={{
                  width: isMobile ? '20px' : '24px',
                  height: isMobile ? '20px' : '24px',
                  color: '#94A3B8',
                  flexShrink: 0
                }} />
                
                <select
                  value={selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: isMobile ? '14px' : '16px',
                    outline: 'none',
                    padding: isMobile ? '8px 0' : '12px 0',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#1E293B', color: 'white' }}>
                    All Courses
                  </option>
                  {Object.entries(testData.courses).map(([key, value]) => (
                    <option key={key} value={key} style={{ background: '#1E293B', color: 'white' }}>
                      {value}
                    </option>
                  ))}
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '4px' : '8px',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    background: showFilters ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: isMobile ? '10px' : '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: isMobile ? '12px' : '14px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <AdjustmentsHorizontalIcon style={{ width: isMobile ? '16px' : '18px' }} />
                  {!isMobile && 'Filters'}
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDownIcon style={{ width: isMobile ? '14px' : '16px' }} />
                  </motion.div>
                </motion.button>
              </div>

              {/* Filters Dropdown */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{
                      padding: isMobile ? '16px' : '20px',
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                      gap: isMobile ? '12px' : '16px',
                      background: 'rgba(0, 0, 0, 0.2)'
                    }}>
                      {/* Year Filter */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: isMobile ? '12px' : '13px',
                          color: '#94A3B8',
                          marginBottom: '6px',
                          fontWeight: 500
                        }}>
                          Year
                        </label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '10px',
                            padding: isMobile ? '8px 10px' : '10px 12px',
                            color: 'white',
                            fontSize: isMobile ? '13px' : '14px',
                            outline: 'none'
                          }}
                        >
                          <option value="all" style={{ background: '#1E293B' }}>All Years</option>
                          {testData.years?.map(year => (
                            <option key={year} value={year} style={{ background: '#1E293B' }}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Topic Filter */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: isMobile ? '12px' : '13px',
                          color: '#94A3B8',
                          marginBottom: '6px',
                          fontWeight: 500
                        }}>
                          Topic
                        </label>
                        <select
                          value={selectedTopic}
                          onChange={(e) => setSelectedTopic(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '10px',
                            padding: isMobile ? '8px 10px' : '10px 12px',
                            color: 'white',
                            fontSize: isMobile ? '13px' : '14px',
                            outline: 'none'
                          }}
                        >
                          <option value="all" style={{ background: '#1E293B' }}>All Topics</option>
                          {testData.topics?.map(topic => (
                            <option key={topic} value={topic} style={{ background: '#1E293B' }}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Level Filter */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: isMobile ? '12px' : '13px',
                          color: '#94A3B8',
                          marginBottom: '6px',
                          fontWeight: 500
                        }}>
                          Difficulty
                        </label>
                        <select
                          value={selectedLevel}
                          onChange={(e) => setSelectedLevel(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '10px',
                            padding: isMobile ? '8px 10px' : '10px 12px',
                            color: 'white',
                            fontSize: isMobile ? '13px' : '14px',
                            outline: 'none'
                          }}
                        >
                          <option value="all" style={{ background: '#1E293B' }}>All Levels</option>
                          <option value="beginner" style={{ background: '#1E293B' }}>Beginner</option>
                          <option value="intermediate" style={{ background: '#1E293B' }}>Intermediate</option>
                          <option value="advanced" style={{ background: '#1E293B' }}>Advanced</option>
                        </select>
                      </div>

                      {/* Apply Filters Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFilterTest}
                        style={{
                          gridColumn: isMobile ? '1' : '-1',
                          padding: isMobile ? '10px' : '12px',
                          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: isMobile ? '14px' : '15px',
                          border: 'none',
                          cursor: 'pointer',
                          marginTop: isMobile ? '8px' : '0'
                        }}
                      >
                        Apply Filters
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: isScrolled ? 1 : 0,
          y: isScrolled ? 0 : -20 
        }}
        style={{
          position: 'sticky',
          top: isMobile ? '60px' : '80px',
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
          padding: isMobile ? '12px 0' : '16px 0',
          marginBottom: isMobile ? '24px' : '32px'
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '8px' : '0'
          }}>
            <p style={{
              color: '#374151',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 500
            }}>
              <span style={{ color: '#111827', fontWeight: 600 }}>
                {testData.question_count}
              </span> questions available
              {selectedCourse && (
                <span style={{ display: isMobile ? 'block' : 'inline', fontSize: isMobile ? '12px' : 'inherit' }}>
                  {' '}for {getCourseDisplayName(selectedCourse)}
                </span>
              )}
            </p>
            
            {(selectedCourse || selectedYear !== 'all' || selectedTopic !== 'all') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  background: '#F3F4F6',
                  color: '#374151',
                  borderRadius: isMobile ? '8px' : '12px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <XMarkIcon style={{ width: isMobile ? '14px' : '16px' }} />
                Clear all
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '0 16px 60px' : '0 24px 80px'
      }}>
        {loading ? (
          <LoadingSkeleton isMobile={isMobile} />
        ) : (
          <>
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
                {/* Test by Year Cards */}
                {testData.years?.length > 0 && testData.years.map((year, index) => (
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
                      questionCount={Math.floor(testData.question_count / testData.years.length)}
                      icon={<ClockIcon style={{ width: 24, height: 24, color: '#6366F1' }} />}
                      gradient="linear-gradient(135deg, #6366F1 0%, #A855F7 100%)"
                    />
                  </motion.div>
                ))}

                {/* Test by Topic Cards */}
                {testData.topics?.length > 0 && testData.topics.map((topic, index) => (
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
                      questionCount={Math.floor(testData.question_count / testData.topics.length)}
                      icon={<ChartBarIcon style={{ width: 24, height: 24, color: '#EC4899' }} />}
                      gradient="linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)"
                    />
                  </motion.div>
                ))}

                {/* Full Practice Test Card */}
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
                    questionCount={testData.question_count}
                    icon={<AcademicCapIcon style={{ width: 24, height: 24, color: '#10B981' }} />}
                    gradient="linear-gradient(135deg, #10B981 0%, #3B82F6 100%)"
                    featured
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {testData.question_count === 0 && (
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
                  Try selecting a different course or clearing your filters
                </p>
              </motion.div>
            )}
          </>
        )}
      </main>

      <Footer />

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @media (max-width: 768px) {
          select, input {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

// Test Card Component
function TestCard({ title, type, value, course, questionCount, icon, gradient, featured = false }) {
 

  const handleStartTestold = () => {
    // Navigate to test page with filters
    const params = new URLSearchParams();
    if (course) params.append('course', course);
    if (type === 'year') params.append('year', value);
    if (type === 'topic') params.append('topic', value);
    
    window.location.href = `/test/${type}?${params.toString()}`;
  };
const handleStartTest = () => {
  // Navigate to test page with filters
  const params = new URLSearchParams();
  if (course) params.append('course', course);
  console.log('course in test options', course);
  if (type === 'year') {
    // Remove parentheses and replace slash with hyphen
    console.log('value', value)
    const cleanYear = value.replace(/[()]/g, '').replace('/', '-');
    params.append('year', value);
    localStorage.setItem('year', value);
    console.log('year in test options', cleanYear);
  }
  if (type === 'topic') params.append('topic', value);
  
  console.log('topic in test options', type);
  window.location.href = `/timed-test?${params.toString()}`;
};

  return (
    <motion.div
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
        transition: 'all 0.3s ease'
      }}
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
          {icon}
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
              <div style={{
                width: '50%',
                height: '100%',
                background: gradient,
                borderRadius: '2px'
              }} />
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartTest}
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