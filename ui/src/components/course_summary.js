import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CourseSummary({ course, designation }) {
  const [isHovered, setIsHovered] = useState(false);
  const API_URL = process.env.NODE_ENV === 'development'  ? "http://localhost:8000/api" : "/api";
   const pictureImg =
    course.course_image && course.course_image !== ''
      ? `${course.course_image}`
      : `${API_URL}/media/images/defaulf_img.PNG`

  // Check if course is locked (based on payment status)
  // You'll need to fetch user's enrollment/payment status
  const isLocked = !course.is_enrolled && course.price > 0;
  
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '24px',
        boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        minHeight: '450px',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Lock Overlay */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          borderRadius: '24px'
        }}>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotateY: [0, 360, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              marginBottom: '24px'
            }}
          >
            <LockClosedIcon style={{
              width: '64px',
              height: '64px',
              color: '#6366F1'
            }} />
          </motion.div>
          
          <h3 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Course Locked
          </h3>
          
          <p style={{
            color: '#CBD5E1',
            textAlign: 'center',
            marginBottom: '8px',
            lineHeight: '1.6'
          }}>
            Complete payment to unlock this course
          </p>
          
          <p style={{
            color: '#FBBF24',
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '24px'
          }}>
            ${course.price}
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Navigate to payment page
              window.location.href = `/checkout/${course.id}`;
            }}
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
            Unlock Course
          </motion.button>
        </div>
      )}
      
      {/* Original course content */}
      <div 
      className="h-48 w-full bg-cover bg-center"
      style={{
        
        backgroundImage: `url(${pictureImg})`
      }}>
        {/* Course category badge */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          
        }}>
          {course.category?.name || 'General'}
        </div>
        
        {/* Enrollment status badge */}
        {course.is_enrolled && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(34, 197, 94, 0.2)',
            backdropFilter: 'blur(12px)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#22C55E',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CheckCircleIcon style={{ width: '14px', height: '14px' }} />
            Enrolled
          </div>
        )}
      </div>
      
      {/* Course info */}
      <div style={{ padding: '28px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            lineHeight: '1.3'
          }}>
            {course.course_name}
          </h3>
          
          <p style={{
            color: '#6B7280',
            fontSize: '14px',
            lineHeight: '1.5',
            height: '42px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {course.short_description}
          </p>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '8px'
          }}>
            {course.tags?.slice(0, 3).map(tag => (
              <span
                key={tag}
                style={{
                  padding: '4px 10px',
                  background: '#F3F4F6',
                  color: '#374151',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #E5E7EB',
            marginTop: '8px'
          }}>
            <div>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                marginBottom: '4px'
              }}>
                Level
              </p>
              <p style={{
                fontWeight: 600,
                color: '#374151'
              }}>
                {course.level?.charAt(0).toUpperCase() + course.level?.slice(1) || 'Beginner'}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isLocked) {
                  window.location.href = `/checkout/${course.id}`;
                } else {
                  window.location.href = `/course-preview/${course.slug}`;
                }
              }}
              style={{
                padding: '10px 24px',
                background: isLocked 
                  ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                  : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: 'white',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isLocked 
                  ? '0 8px 20px -5px rgba(99, 102, 241, 0.3)'
                  : '0 8px 20px -5px rgba(15, 23, 42, 0.2)'
              }}
            >
              {isLocked ? 'Unlock' : 'View Course'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}