import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch, apiPost, getAuthHeaders } from '../components/api';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  Bars3Icon,
  MapIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

import Footer from './Footer'
import CourseSummary from '../components/course_summary'
//import RoadmapPopup from './RoadmapPopup' // New popup component
//import AILearningPathChat from './RoadmapPopup';
import AILearningPathChat from './AILearningPathChat';

// Define LoadingSkeleton as a separate component
const LoadingSkeleton = ({ isMobile }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '280px' : '320px'}, 1fr))`,
    gap: isMobile ? '20px' : '32px'
  }}>
    {[...Array(6)].map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: isMobile ? '16px' : '24px',
          boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div style={{ 
          animation: 'pulse 2s infinite',
          position: 'relative'
        }}>
          {/* Shimmer Effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: 'shimmer 2s infinite'
          }}></div>
          
          <div style={{
            height: isMobile ? '160px' : '200px',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            borderRadius: isMobile ? '16px 16px 0 0' : '24px 24px 0 0'
          }}></div>
          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                height: isMobile ? '16px' : '20px',
                background: '#e2e8f0',
                borderRadius: '6px',
                width: '75%'
              }}></div>
              <div style={{
                height: isMobile ? '12px' : '14px',
                background: '#e2e8f0',
                borderRadius: '4px',
                width: '50%'
              }}></div>
              <div style={{
                height: isMobile ? '12px' : '14px',
                background: '#e2e8f0',
                borderRadius: '4px',
                width: '100%'
              }}></div>
              <div style={{
                height: isMobile ? '12px' : '14px',
                background: '#e2e8f0',
                borderRadius: '4px',
                width: '66%'
              }}></div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px'
              }}>
                <div style={{
                  height: isMobile ? '24px' : '28px',
                  background: '#e2e8f0',
                  borderRadius: '6px',
                  width: '80px'
                }}></div>
                <div style={{
                  height: isMobile ? '32px' : '40px',
                  background: '#e2e8f0',
                  borderRadius: '8px',
                  width: isMobile ? '80px' : '100px'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
)

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [userEnrollments, setUserEnrollments] = useState([])
  const [showRoadmapPopup, setShowRoadmapPopup] = useState(false)
  
  const API_URL = process.env.NODE_ENV === 'development' ? "http://localhost:8000/api" : "/api";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user's enrolled courses
        const enrollmentsResponse = await apiFetch(`/v1/user/enrollments/`)
        
        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          setUserEnrollments(enrollmentsData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiFetch(`/v1/courses/`)
        const data = await response.json()
        
        // Add enrollment status to each course
        const coursesWithEnrollment = (data.results || data).map(course => ({
          ...course,
          is_enrolled: userEnrollments.some(enrollment => enrollment.course_id === course.id)
        }))
        
        setCourses(coursesWithEnrollment)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching courses:", err)
        setLoading(false)
      }
    }

    // Only fetch courses if we have enrollment data (or if we're not logged in)
    if (userEnrollments || !loading) {
      fetchCourses()
    }
  }, [userEnrollments])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filter courses - show free courses unlocked, paid courses locked unless enrolled
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(search.toLowerCase()) ||
                         course.short_description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category?.name === selectedCategory
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  // Extract unique categories and levels
  const categories = ["all", ...new Set(courses.map(course => course.category?.name).filter(Boolean))]
  const levels = ["all", ...new Set(courses.map(course => course.level).filter(Boolean))]

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

      {/* Enhanced Hero Section */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        color: 'white',
        padding: isMobile ? '40px 0 20px' : '40px 0 20px'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
        }}></div>
        
        {/* Floating Particles - Reduced on mobile */}
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
              {isMobile ? 'Start Learning' : 'Transform Your Career Journey'}
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
                  Master
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 50%, #EC4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>New Skills</span>
                </>
              ) : (
                <>
                  Master Your
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 50%, #EC4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Future Skills</span>
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
                ? 'Expert-led courses with hands-on projects and real-world applications.' 
                : 'Discover cutting-edge courses designed by industry experts. Gain practical skills with hands-on projects and real-world applications.'
              }
            </motion.p>

            {/* Enhanced Search & Filters Container */}
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
              {/* Search Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '6px 6px 6px 16px' : '8px 8px 8px 24px',
                gap: '8px'
              }}>
                <MagnifyingGlassIcon style={{
                  width: isMobile ? '20px' : '24px',
                  height: isMobile ? '20px' : '24px',
                  color: '#94A3B8',
                  flexShrink: 0
                }} />
                
                <input
                  type="text"
                  placeholder={isMobile ? "Search courses..." : "Search courses, technologies, or skills..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: isMobile ? '16px' : '18px',
                    outline: 'none',
                    padding: isMobile ? '12px 0' : '16px 0',
                    fontWeight: 400,
                    minWidth: 0 // Prevents overflow
                  }}
                  className="placeholder-gray-400"
                />

                {/* Filter Toggle Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '4px' : '8px',
                    padding: isMobile ? '8px 12px' : '12px 20px',
                    background: showFilters ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: isMobile ? '12px' : '16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: isMobile ? '12px' : '14px',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isMobile ? (
                    <AdjustmentsHorizontalIcon style={{ width: '16px', height: '16px' }} />
                  ) : (
                    <>
                      <AdjustmentsHorizontalIcon style={{ width: '18px', height: '18px' }} />
                      Filters
                    </>
                  )}
                  {!isMobile && (
                    <motion.div
                      animate={{ rotate: showFilters ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDownIcon style={{ width: '16px', height: '16px' }} />
                    </motion.div>
                  )}
                </motion.button>

                {search && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSearch("")}
                    style={{
                      color: '#94A3B8',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <XMarkIcon style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px' }} />
                  </motion.button>
                )}
              </div>

              {/* Filters Dropdown */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      padding: isMobile ? '16px' : '24px',
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '16px' : '24px',
                      alignItems: isMobile ? 'stretch' : 'center'
                    }}>
                      {/* Category Filter */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        flex: isMobile ? 'none' : '1 1 200px'
                      }}>
                        <label style={{
                          fontSize: isMobile ? '13px' : '14px',
                          color: '#CBD5E1',
                          fontWeight: 500
                        }}>
                          Category
                        </label>
                        <select 
                          value={selectedCategory}
                          onChange={e => setSelectedCategory(e.target.value)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: isMobile ? '8px' : '12px',
                            padding: isMobile ? '10px 12px' : '12px 16px',
                            color: 'white',
                            fontSize: isMobile ? '14px' : '14px',
                            outline: 'none',
                            backdropFilter: 'blur(10px)',
                            width: '100%'
                          }}
                        >
                          {categories.map(category => (
                            <option key={category} value={category} style={{ background: '#1E293B', color: 'white' }}>
                              {category === "all" ? "All Categories" : category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Level Filter */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        flex: isMobile ? 'none' : '1 1 200px'
                      }}>
                        <label style={{
                          fontSize: isMobile ? '13px' : '14px',
                          color: '#CBD5E1',
                          fontWeight: 500
                        }}>
                          Level
                        </label>
                        <select 
                          value={selectedLevel}
                          onChange={e => setSelectedLevel(e.target.value)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: isMobile ? '8px' : '12px',
                            padding: isMobile ? '10px 12px' : '12px 16px',
                            color: 'white',
                            fontSize: isMobile ? '14px' : '14px',
                            outline: 'none',
                            backdropFilter: 'blur(10px)',
                            width: '100%'
                          }}
                        >
                          {levels.map(level => (
                            <option key={level} value={level} style={{ background: '#1E293B', color: 'white' }}>
                              {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Clear Filters */}
                      {(selectedCategory !== "all" || selectedLevel !== "all") && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedCategory("all")
                            setSelectedLevel("all")
                          }}
                          style={{
                            alignSelf: isMobile ? 'stretch' : 'flex-end',
                            padding: isMobile ? '10px 16px' : '12px 20px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            borderRadius: isMobile ? '8px' : '12px',
                            fontSize: isMobile ? '13px' : '14px',
                            fontWeight: 500,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            marginBottom: isMobile ? '0' : '8px',
                            marginTop: isMobile ? '8px' : '0'
                          }}
                        >
                          Clear Filters
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* New: AI Roadmap Call-to-Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              style={{
                marginTop: isMobile ? '32px' : '48px',
                textAlign: 'center'
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRoadmapPopup(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: isMobile ? '8px' : '12px',
                  padding: isMobile ? '12px 24px' : '16px 32px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  color: 'white',
                  borderRadius: isMobile ? '12px' : '16px',
                  fontWeight: 600,
                  fontSize: isMobile ? '14px' : '16px',
                  boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <RocketLaunchIcon style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px' }} />
                Create Your Personalized Learning Roadmap
                <SparklesIcon style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px' }} />
              </motion.button>
              <p style={{
                fontSize: isMobile ? '12px' : '14px',
                color: '#94A3B8',
                marginTop: '12px'
              }}>
                Get AI-powered guidance tailored to your goals and experience level
              </p>
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
              fontWeight: 500,
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <span style={{ color: '#111827', fontWeight: 600 }}>{filteredCourses.length}</span> courses found
              {search && (
                <span style={{ display: isMobile ? 'block' : 'inline', fontSize: isMobile ? '12px' : 'inherit' }}>
                  {isMobile ? ' for:' : ' for '}"{search}"
                </span>
              )}
            </p>
            
            {(search || selectedCategory !== "all" || selectedLevel !== "all") && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearch("")
                  setSelectedCategory("all")
                  setSelectedLevel("all")
                }}
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
                <XMarkIcon style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px' }} />
                Clear all
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <main style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '0 16px 60px' : '0 24px 80px'
      }}>
        {/* Loading State */}
        {loading && <LoadingSkeleton isMobile={isMobile} />}

        {/* Empty Search Results */}
        {!loading && filteredCourses.length === 0 && search && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: isMobile ? '60px 20px' : '80px 0',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: isMobile ? '16px' : '24px',
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              marginTop: isMobile ? '20px' : '32px'
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: isMobile ? '60px' : '80px',
                marginBottom: isMobile ? '16px' : '24px'
              }}
            >
              🔍
            </motion.div>
            <h3 style={{
              fontSize: isMobile ? '22px' : '28px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: isMobile ? '8px' : '12px'
            }}>
              No matches found
            </h3>
            <p style={{
              color: '#6B7280',
              fontSize: isMobile ? '14px' : '18px',
              marginBottom: isMobile ? '24px' : '32px',
              maxWidth: isMobile ? '280px' : '400px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              We couldn't find any courses matching "<span style={{ fontWeight: 600, color: '#374151' }}>{search}</span>"
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearch("")}
              style={{
                padding: isMobile ? '12px 20px' : '14px 28px',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: 'white',
                borderRadius: isMobile ? '10px' : '14px',
                fontWeight: 600,
                fontSize: isMobile ? '14px' : '16px',
                boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Show All Courses
            </motion.button>
          </motion.div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '280px' : '320px'}, 1fr))`,
              gap: isMobile ? '20px' : '32px'
            }}
          >
            <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: isMobile ? -4 : -8,
                    scale: isMobile ? 1.01 : 1.02,
                    transition: { duration: 0.3 }
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <CourseSummary course={course} designation="courses" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* AI Roadmap Call-to-Action Banner at bottom */}
        {!loading && filteredCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              marginTop: isMobile ? '48px' : '64px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              borderRadius: isMobile ? '20px' : '24px',
              padding: isMobile ? '24px' : '32px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => setShowRoadmapPopup(true)}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: isMobile ? '150px' : '200px',
              height: isMobile ? '150px' : '200px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)'
            }} />
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: isMobile ? '16px' : '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '16px' : '24px',
                flex: 1
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  padding: isMobile ? '12px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AcademicCapIcon style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: isMobile ? '20px' : '24px',
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    Need a Personalized Learning Path?
                  </h3>
                  <p style={{
                    fontSize: isMobile ? '14px' : '16px',
                    color: 'rgba(255,255,255,0.9)',
                    maxWidth: '500px'
                  }}>
                    Let our AI create a custom roadmap based on your goals and experience level
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'white',
                  color: '#6366F1',
                  padding: isMobile ? '10px 20px' : '12px 28px',
                  borderRadius: isMobile ? '10px' : '12px',
                  fontWeight: 600,
                  fontSize: isMobile ? '14px' : '16px',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Create Roadmap →
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />

      {/* AI Roadmap Popup */}
      <AILearningPathChat
        isOpen={showRoadmapPopup}
        onClose={() => setShowRoadmapPopup(false)}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        /* Mobile-specific improvements */
        @media (max-width: 768px) {
          select {
            font-size: 16px; /* Prevents zoom on iOS */
          }
          
          input {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  )
}