// CoursePageView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AITutor from './AITutor'; 
import { apiFetch, apiPost, getAuthHeaders } from '../components/api';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import EnhancedAITutor from './EnhancedAITutor';
import ExerciseEnvironment from './ExerciseEnvironment';
import HackingLab from './HackingLab';

import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  HomeIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  SparklesIcon,
  ShareIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  LightBulbIcon,
  Bars3Icon,
  XMarkIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';


interface Exercise {
    id: number;
    exercise_type: string;
    question: string;
    instructions: string;
    code_template: string;
    expected_output: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty: string;
    points: number;
}

interface CoursePage {
  id: number;
  page_number: number;
  title: string;
  content: string;
  exercises: Exercise[]; 
}

interface Course {
  id: number;
  course_name: string;
  short_description: string;
  pages: CoursePage[];
  level: string;
  category: {
    name: string;
  };
}

const CoursePageView: React.FC = () => {
  const { slug, pageNumber } = useParams<{ slug: string; pageNumber: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTutorOpen, setIsTutorOpen] = useState(false); // Add this state
  const [course, setCourse] = useState<Course | null>(null);
  const [currentPage, setCurrentPage] = useState<CoursePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [readingTime, setReadingTime] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHackingLab, setShowHackingLab] = useState(false);
  const API_URL = process.env.NODE_ENV === 'development'  ? "http://localhost:8000/api" : "/api";
  
 
  //console.log('API Key:', apiKey); // Debugging line

  // Calculate reading time
  useEffect(() => {
    if (currentPage?.content) {
      const wordCount = currentPage.content.split(/\s+/).length;
      const readingTimeMinutes = Math.ceil(wordCount / 200);
      setReadingTime(readingTimeMinutes);
    }
  }, [currentPage]);

  // Progress calculation
  useEffect(() => {
    if (course && pageNumber) {
      const current = parseInt(pageNumber);
      const total = course.pages.length;
      setProgress((current / total) * 100);
    }
  }, [pageNumber, course]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/v1/courses/${slug}/`); 
        if (!response.ok) throw new Error('Course not found');
        
        const courseData: Course = await response.json();
        setCourse(courseData);
        
        const pageNum = parseInt(pageNumber || '1');
        const page = courseData.pages.find(p => p.page_number === pageNum);
        setCurrentPage(page || null);
        
        setLoading(false);
      } catch (err) {
        
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [slug, pageNumber]);

  const toggleBookmark = (pageNumber: number) => {
    setBookmarkedPages(prev => 
      prev.includes(pageNumber) 
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const speakContent = () => {
    if (!currentPage) return;
    
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(
        currentPage.content.replace(/<[^>]*>/g, '')
      );
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const sharePage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentPage?.title} - ${course?.course_name}`,
          text: `Check out this lesson from ${course?.course_name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl font-light">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (error || !course || !currentPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md text-white"
            >
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <AcademicCapIcon className="w-12 h-12 text-yellow-300" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Course Not Found</h2>
              <p className="text-gray-300 mb-8 text-lg">
                The course you're looking for doesn't exist or may have been moved.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/courses')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-medium text-lg shadow-lg"
              >
                Explore All Courses
              </motion.button>
            </motion.div>
          </div>
    );
  }

  const currentPageNum = parseInt(pageNumber || '1');
  const totalPages = course.pages.length;
  const nextPage = currentPageNum < totalPages ? currentPageNum + 1 : null;
  const prevPage = currentPageNum > 1 ? currentPageNum - 1 : null;
  const isBookmarked = bookmarkedPages.includes(currentPageNum);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200"
        >
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
          >
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Course Content</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    {course.pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          navigate(`/course-content/${slug}/page/${page.page_number}`);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                          page.page_number === currentPageNum
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {page.page_number}. {page.title}
                          </span>
                          {bookmarkedPages.includes(page.page_number) && (
                            <BookmarkIcon className="w-4 h-4 fill-current" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <ClockIcon className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <div className="font-semibold text-gray-900">{readingTime}m</div>
                      <div className="text-gray-600">Read time</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <div className="font-semibold text-gray-900">{currentPageNum}/{totalPages}</div>
                      <div className="text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Course Info */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/courses"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="hidden sm:block">Courses</span>
              </Link>
              <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
              <div className="max-w-xs">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {course.course_name}
                </h1>
                <p className="text-sm text-gray-500 truncate">{course.category?.name}</p>
              </div>
            </div>

            {/* Center: Progress - Hidden on mobile */}
            <div className="flex-1 max-w-md mx-8 hidden lg:block">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full shadow-lg"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
  {/* Existing buttons... */}
  

{showHackingLab && (
  <div className="fixed inset-0 z-50">
    <HackingLab />
    <button
      onClick={() => setShowHackingLab(false)}
      className="fixed top-4 right-4 p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 z-50"
    >
      <XMarkIcon className="w-6 h-6" />
    </button>
  </div>
)}
  {/* Enhanced AI Tutor button */}
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setIsTutorOpen(true)}
    className="relative p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 group"
  >
    <ChatBubbleLeftRightIcon className="w-5 h-5" />
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></span>
    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      AI Tutor (95% accurate)
    </div>
  </motion.button>
</div>

{/* Add floating button for mobile 
<div className="lg:hidden fixed bottom-6 right-6 z-40">
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => setIsTutorOpen(true)}
    className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl flex items-center justify-center"
  >
    <div className="relative">
      <ChatBubbleLeftRightIcon className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
    </div>
  </motion.button>
</div>
*/}
              <button
                onClick={speakContent}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isPlayingAudio 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isPlayingAudio ? (
                  <PauseCircleIcon className="w-5 h-5" />
                ) : (
                  <PlayCircleIcon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => toggleBookmark(currentPageNum)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isBookmarked 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isBookmarked ? (
                  <BookmarkIcon className="w-5 h-5 fill-current" />
                ) : (
                  <BookmarkSlashIcon className="w-5 h-5" />
                )}
              </button>


                <button onClick={() => setShowHackingLab(true)}
                    className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 hover:from-purple-200 hover:to-blue-200 transition-all duration-300 relative"
                  >
                    <FireIcon className="w-6 h-6" />
                    
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></span>
                  </button>

                {/* Floating AI Tutor Button for Mobile
<div className="lg:hidden fixed bottom-6 right-6 z-40">
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => setIsTutorOpen(true)}
    className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center"
  >
    <ChatBubbleLeftRightIcon className="w-6 h-6" />
  </motion.button>
</div> */}
              <button
                onClick={sharePage}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors hidden sm:block"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
   {/* Main Content Area */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
    {/* Sidebar - Table of Contents - Hidden on mobile, shows on desktop */}
  {/* Sidebar - Table of Contents - Visible on desktop, hidden on mobile */}
<motion.div 
  initial={{ x: -50, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ delay: 0.2 }}
  className="hidden lg:block w-80 flex-shrink-0" // Always hidden on mobile, fixed width
>
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sticky top-24 h-[calc(100vh-8rem)] flex flex-col">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <DocumentTextIcon className="w-5 h-5 text-blue-600" />
      Course Content
    </h3>
    <div className="flex-1 overflow-y-auto space-y-2">
      {course.pages.map((page) => (
        <button
          key={page.id}
          onClick={() => navigate(`/course-content/${slug}/page/${page.page_number}`)}
          className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
            page.page_number === currentPageNum
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              {page.page_number}. {page.title}
            </span>
            {bookmarkedPages.includes(page.page_number) && (
              <BookmarkIcon className="w-4 h-4 fill-current" />
            )}
          </div>
        </button>
      ))}
    </div>

    {/* Quick Stats */}
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <ClockIcon className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <div className="font-semibold text-gray-900">{readingTime}m</div>
          <div className="text-gray-600">Read time</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <CheckCircleIcon className="w-4 h-4 text-green-600 mx-auto mb-1" />
          <div className="font-semibold text-gray-900">{currentPageNum}/{totalPages}</div>
          <div className="text-gray-600">Completed</div>
        </div>
      </div>
    </div>
  </div>
</motion.div>

    {/* Main Content - Takes remaining space */}
<motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex-1 min-w-0" // flex-1 makes it take remaining space, min-w-0 prevents overflow
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden min-h-[80vh] flex flex-col">
        {/* Content Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6 lg:p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <span className="text-blue-200 text-sm font-medium">
                  Chapter {currentPageNum}
                </span>
                <h1 className="text-2xl lg:text-3xl font-bold mt-1">
                  {currentPage.title}
                </h1>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden lg:block"
            >
              <SparklesIcon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-300" />
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2 text-blue-200">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm lg:text-base">{readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-200">
              <CodeBracketIcon className="w-4 h-4" />
              <span className="text-sm lg:text-base">{course.level}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div 
          ref={contentRef}
          className="flex-1 p-6 lg:p-8 overflow-y-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-none"
            >
              <div 
                className="course-content prose prose-sm lg:prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: currentPage.content }}
              />
              
              {/* Interactive Elements */}
              <div className="mt-8 p-4 lg:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                <div className="flex items-start space-x-3">
                  <LightBulbIcon className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-2 text-sm lg:text-base">Key Takeaway</h4>
                    <p className="text-amber-800 text-sm lg:text-base">
                      This chapter introduces fundamental concepts that will be essential for 
                      understanding advanced topics in upcoming lessons.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-gray-200 p-4 lg:p-6 bg-gray-50/50">
          <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
            {/* Previous Button */}
            {prevPage ? (
              <motion.div whileHover={{ x: -5 }} className="w-full sm:w-auto">
                <Link 
                  to={`/course-content/${slug}/page/${prevPage}`}
                  className="flex items-center space-x-3 bg-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 w-full sm:w-auto justify-center sm:justify-start"
                  onClick={scrollToTop}
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="text-sm text-gray-500">Previous</div>
                    <div className="font-semibold text-gray-900 text-sm lg:text-base">
                      {course.pages.find(p => p.page_number === prevPage)?.title}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <div className="w-full sm:w-auto"></div>
            )}

            {/* Next Button */}
            {nextPage ? (
              <motion.div whileHover={{ x: 5 }} className="w-full sm:w-auto">
                <Link 
                  to={`/course-content/${slug}/page/${nextPage}`}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto justify-center sm:justify-end"
                  onClick={scrollToTop}
                >
                  <div className="text-right">
                    <div className="text-sm text-blue-100">Next</div>
                    <div className="font-semibold text-sm lg:text-base">
                      {course.pages.find(p => p.page_number === nextPage)?.title}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5" />
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} className="w-full sm:w-auto">
                <Link 
                  to={`/course-preview/${slug}`}
                  className="flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 lg:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-semibold text-sm lg:text-base">Complete Course</span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
</motion.div>

  </div>
  {/* AI Tutor Component */}

<EnhancedAITutor
  courseTitle={course?.course_name || ''}
  currentPageTitle={currentPage?.title || ''}
  currentContent={currentPage?.content || ''}
  difficulty={course?.level || 'Intermediate'}
  pageNumber={parseInt(pageNumber || '1')}
  isOpen={isTutorOpen}
  onClose={() => setIsTutorOpen(false)}
/>
</div>
      
      {/* Exercises Section */}
      {currentPage?.exercises && currentPage.exercises.length > 0 && (
            <div className="mt-8">
                <ExerciseEnvironment 
                    exercises={currentPage.exercises}
                    currentPage={currentPageNum}
                />
            </div>
        )}

      {/* Custom Styles for Content */}
      <style data-jsx="true">{`
        .course-content {
          line-height: 1.7;
        }
        .course-content h2 {
          color: #1f2937;
          font-weight: 700;
          font-size: 1.5rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .course-content h3 {
          color: #374151;
          font-weight: 600;
          font-size: 1.25rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .course-content pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          border-left: 4px solid #3b82f6;
          font-size: 0.875rem;
        }
        .course-content code {
          background: #f3f4f6;
          color: #dc2626;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .course-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          font-size: 0.875rem;
        }
        .course-content ul, .course-content ol {
          margin: 1rem 0;
          padding-left: 1.25rem;
        }
        .course-content li {
          margin: 0.375rem 0;
        }
        .course-content blockquote {
          border-left: 4px solid #3b82f6;
          background: #eff6ff;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        @media (min-width: 1024px) {
          .course-content h2 {
            font-size: 1.75rem;
          }
          .course-content h3 {
            font-size: 1.5rem;
          }
          .course-content pre {
            padding: 1.5rem;
            font-size: 1rem;
          }
          .course-content pre code {
            font-size: 1rem;
          }
        }
      `}</style>
      <style jsx>{`
  /* Your existing styles... */
  
  /* AI Tutor specific styles */
  .prose-sm {
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .prose-sm strong {
    font-weight: 600;
    color: inherit;
  }
  .prose-sm code {
    background: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.75rem;
  }
  .prose-sm pre {
    background: #1f2937;
    color: #f3f4f6;
    padding: 0.75rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin: 0.5rem 0;
  }
  .prose-sm pre code {
    background: transparent;
    padding: 0;
  }
`}</style>
    </div>
  );
};

export default CoursePageView;