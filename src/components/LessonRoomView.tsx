import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayCircle, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  Clock,
  BookOpen,
  Check,
  ListOrdered,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Gauge,
  Tv,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Bot,
  Brain
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { MediaStore } from '../services/mediaStore';
import { Course, Lesson, Student, QuizExam, Assignment, AssignmentSubmission } from '../types';
import { AIPhysicsAssistant } from './AIPhysicsAssistant';
import { PdfViewerModal } from './PdfViewerModal';
import { AssignmentSolverModal } from './AssignmentSolverModal';

interface LessonRoomViewProps {
  courseId: string;
  lessonId: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenPdfModal?: (pdfUrl: string, title: string) => void;
  onOpenActivationModal?: () => void;
}

export const LessonRoomView: React.FC<LessonRoomViewProps> = ({
  courseId,
  lessonId,
  onNavigate,
  onOpenPdfModal,
  onOpenActivationModal
}) => {
  const [course, setCourse] = useState<Course | undefined>(StorageService.getCourseById(courseId));
  const [student, setStudent] = useState<Student | null>(StorageService.getCurrentStudent());
  const [currentLesson, setCurrentLesson] = useState<Lesson | undefined>();
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [exams, setExams] = useState<QuizExam[]>(StorageService.getExams());
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>('');
  const [videoQuality, setVideoQuality] = useState<'1080p' | '720p' | '480p' | 'auto'>('1080p');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playerSize, setPlayerSize] = useState<'compact' | 'normal' | 'theater'>('compact');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Assignment Modal States
  const [assignments, setAssignments] = useState<Assignment[]>(StorageService.getAssignmentsByCourse(courseId));
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(
    student ? StorageService.getStudentAssignmentSubmissions(student.id) : []
  );
  const [selectedAssignmentModal, setSelectedAssignmentModal] = useState<Assignment | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState<boolean>(false);
  
  // Security Anti-Screenshot & Anti-Recording DRM States
  const [isCaptureBlocked, setIsCaptureBlocked] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  // Access Control verification
  const isEnrolled = student ? StorageService.isStudentEnrolled(student.id, courseId) : false;
  const isFreePreview = Boolean(currentLesson?.isFreePreview);
  const hasAccess = isEnrolled || isFreePreview;

  // Keyboard Shortcuts Interceptor & Anti-Screenshot Detection
  useEffect(() => {
    const triggerCaptureBlock = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("محتوى منصة مداح الرياضيات محمي ضد الالتقاط والتسجيل").catch(() => {});
      }
      setIsCaptureBlocked(true);
      setTimeout(() => {
        setIsCaptureBlocked(false);
      }, 3500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      
      const isScreenshotOrSave =
        isPrintScreen ||
        (isCmdOrCtrl && (e.key === 'p' || e.key === 's' || e.key === 'u' || e.key === 'P' || e.key === 'S' || e.key === 'U')) ||
        (isCmdOrCtrl && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C')) ||
        (e.metaKey && e.shiftKey && ['3', '4', '5', 's', 'S'].includes(e.key));

      if (isScreenshotOrSave) {
        e.preventDefault();
        e.stopPropagation();
        triggerCaptureBlock();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        triggerCaptureBlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const c = StorageService.getCourseById(courseId);
      const s = StorageService.getCurrentStudent();
      setCourse(c);
      setStudent(s);
      setExams(StorageService.getExams());
      setAssignments(StorageService.getAssignmentsByCourse(courseId));
      if (s) {
        setSubmissions(StorageService.getStudentAssignmentSubmissions(s.id));
      }

      if (c) {
        const flatLessons: Lesson[] = [];
        c.units?.forEach(u => u.lessons?.forEach(l => flatLessons.push(l)));
        setAllLessons(flatLessons);

        const targetLesson = flatLessons.find(l => l.id === lessonId) || flatLessons[0];
        setCurrentLesson(prev => (prev?.id === targetLesson?.id ? prev : targetLesson));

        if (s && targetLesson) {
          const prog = StorageService.getLessonProgress(s.id, targetLesson.id);
          setIsCompleted(!!prog?.isCompleted);
        }
      }
    };
    update();
    return subscribeToStorage(update);
  }, [courseId, lessonId]);

  useEffect(() => {
    if (student?.id && course?.id && currentLesson?.id) {
      StorageService.setLastViewedLesson(student.id, course.id, currentLesson.id);
    }
  }, [student?.id, course?.id, currentLesson?.id]);

  // Resolve local-media IndexedDB blob or remote URL
  useEffect(() => {
    let active = true;
    const resolveUrl = async () => {
      if (!currentLesson?.videoUrl) {
        setResolvedVideoUrl('');
        return;
      }

      if (currentLesson.videoUrl.startsWith('local-media:')) {
        const blobUrl = await MediaStore.getMediaUrl(currentLesson.videoUrl);
        if (active) {
          setResolvedVideoUrl(blobUrl || currentLesson.videoUrl);
        }
      } else {
        if (active) {
          setResolvedVideoUrl(currentLesson.videoUrl);
        }
      }
    };

    resolveUrl();
    return () => {
      active = false;
    };
  }, [currentLesson?.videoUrl]);

  if (!course || !currentLesson) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-[#0D1B3E]">
        <h2 className="text-xl font-bold">لم يتم العثور على الدرس</h2>
        <button
          onClick={() => onNavigate('my-courses')}
          className="mt-4 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-bold text-[#0D1B3E] hover:bg-[#F97316]"
        >
          العودة لكورساتي
        </button>
      </div>
    );
  }

  // Find previous and next lessons
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Toggle completion
  const handleToggleComplete = () => {
    if (!student) return;
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    StorageService.markLessonComplete(student.id, course.id, currentLesson.id, newStatus);
  };

  // Associated Lesson Quiz
  const lessonQuiz = exams.find(e => e.id === currentLesson.quizId || (e.lessonId === currentLesson.id && e.type === 'quiz'));

  // Video embed & direct playback helper
  const isDirectVideo = (url: string, type?: string) => {
    if (!url) return false;
    if (
      type === 'uploaded' || 
      url.startsWith('/uploads/') || 
      url.startsWith('blob:') || 
      url.startsWith('data:video') || 
      url.startsWith('local-media:')
    ) {
      return true;
    }
    return /\.(mp4|webm|ogg|mov|mkv|m4v)(\?.*)?$/i.test(url);
  };

  const getEmbedUrl = (url: string, _type?: string, quality = '1080p') => {
    if (!url) return '';
    
    // YouTube with HD 1080p parameters & high resolution flags
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : '';
      if (videoId) {
        const qualityParam = quality === '1080p' ? 'hd1080' : quality === '720p' ? 'hd720' : 'medium';
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1&vq=${qualityParam}&playsinline=1`;
      }
    }

    // Google Drive
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                         url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                         url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      }
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?quality=1080p`;
      }
    }

    return url;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSkipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleToggleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => console.warn(err));
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn(err));
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className={`w-full mx-auto ${
        playerSize === 'compact' 
          ? 'max-w-4xl px-2.5 sm:px-4 lg:px-6' 
          : playerSize === 'normal' 
            ? 'max-w-5xl px-2.5 sm:px-4 lg:px-6' 
            : 'max-w-6xl px-2 sm:px-4'
      } py-2.5 sm:py-5 space-y-3 sm:space-y-4 animate-in fade-in duration-300 transition-all protected-page select-none overflow-x-hidden`}
    >
      
      {/* Navigation Breadcrumbs & Size Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-[#6B7280] min-w-0 flex-1 truncate">
          <button 
            onClick={() => onNavigate('course-details', { courseId: course.id })}
            className="flex items-center gap-1 hover:text-[#FDBA74] font-bold transition-colors shrink-0 text-slate-600 dark:text-slate-300 hover:text-amber-500"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="truncate max-w-[110px] sm:max-w-[200px]">{course.title}</span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-[#0D1B3E] dark:text-slate-200 font-bold truncate">{currentLesson.title}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Player Size Switcher on Desktop/Tablet */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-[#4B5563]">
            <button
              onClick={() => setPlayerSize('compact')}
              className={`px-2 py-0.5 rounded transition-all ${
                playerSize === 'compact' ? 'bg-white dark:bg-slate-700 text-[#F97316] shadow-xs font-black' : 'hover:text-[#0D1B3E] dark:text-slate-400'
              }`}
              title="حجم مريح ومتوازن"
            >
              مريح
            </button>
            <button
              onClick={() => setPlayerSize('normal')}
              className={`px-2 py-0.5 rounded transition-all ${
                playerSize === 'normal' ? 'bg-white dark:bg-slate-700 text-[#F97316] shadow-xs font-black' : 'hover:text-[#0D1B3E] dark:text-slate-400'
              }`}
              title="حجم متوسط"
            >
              متوسط
            </button>
            <button
              onClick={() => setPlayerSize('theater')}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                playerSize === 'theater' ? 'bg-white dark:bg-slate-700 text-[#F97316] shadow-xs font-black' : 'hover:text-[#0D1B3E] dark:text-slate-400'
              }`}
              title="وضع المسرح"
            >
              <Tv className="h-3 w-3" />
              <span>مسرح</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('course-details', { courseId: course.id })}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-amber-500 shrink-0 font-bold text-[11px]"
          >
            فهرس المنهج
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${playerSize === 'theater' ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-3 sm:gap-5 items-start`}>
        
        {/* Main Content: Video Player & Lesson Details */}
        <div className={`${playerSize === 'theater' ? 'w-full' : 'lg:col-span-8'} space-y-3 sm:space-y-4 min-w-0`}>
          
          {!hasAccess ? (
            /* Secure Access Control Lock Screen */
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-950 shadow-md flex flex-col items-center justify-center p-4 sm:p-6 text-center">
              {course.thumbnail && (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-15 filter blur-xs"
                />
              )}
              <div className="relative z-10 max-w-md space-y-2 sm:space-y-3">
                <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-[#F97316] shadow-md">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-[#F97316]">
                    محتوى محمي - للمشتركين فقط
                  </span>
                  <h3 className="mt-1.5 text-sm sm:text-base font-black text-white">
                    {currentLesson.title}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                    عفواً، يتطلب مشاهدة هذا الدرس الاشتراك في كورس «{course.title}» أو تفعيل كود الحصة.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {onOpenActivationModal && (
                    <button
                      onClick={onOpenActivationModal}
                      className="rounded-xl bg-[#F97316] px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-[#0D1B3E] hover:bg-[#F97316] transition-all shadow-sm cursor-pointer"
                    >
                      تفعيل كود الحصة / الكورس
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('course-details', { courseId: course.id })}
                    className="rounded-xl bg-[#FDBA74] px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white hover:bg-[#163cb5] transition-all shadow-sm cursor-pointer"
                  >
                    شراء والاشتراك ({course.price} ج.م)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Responsive Video Container with 100% Guaranteed 16:9 Aspect Ratio */
            <div 
              ref={videoContainerRef}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-md select-none group ${
                isCaptureBlocked ? 'filter blur-2xl transition-all duration-300' : ''
              }`}
              style={{
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
            >
              {isDirectVideo(currentLesson.videoUrl, currentLesson.videoType) ? (
                <video
                  ref={videoRef}
                  src={resolvedVideoUrl || currentLesson.videoUrl}
                  controls
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full object-contain bg-black"
                  poster={course.thumbnail}
                >
                  متصفحك لا يدعم تشغيل الفيديو المباشر.
                </video>
              ) : (
                <iframe
                  src={getEmbedUrl(currentLesson.videoUrl, currentLesson.videoType, videoQuality)}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}

              {/* Quality Badge */}
              <div className="absolute top-2.5 left-2.5 pointer-events-none rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700/60 px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#F97316] flex items-center gap-1 shadow-md z-10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>HD 1080p</span>
              </div>

              {/* Quick Fullscreen Floating Button (top right) */}
              <button
                onClick={handleToggleFullscreen}
                className="absolute top-2.5 right-2.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700/60 p-1.5 text-slate-200 hover:text-amber-400 hover:bg-slate-900 transition-all opacity-80 hover:opacity-100 shadow-md z-10"
                title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة ملء الشاشة'}
              >
                {isFullscreen ? <Minimize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              </button>

              {/* Screen Capture Attempt Blocked Overlay */}
              {isCaptureBlocked && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 p-4 sm:p-6 text-center animate-fadeIn font-sans">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-red-500/20 border border-red-500/40 text-red-400 mb-2 animate-bounce">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white">تصوير الشاشة غير مسموح به!</h3>
                  <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
                    محتوى المنصة محمي ضد الالتقاط والتصوير لحفظ حقوق النشر والتأليف.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video Playback & Quality Controls Bar (Only when accessed) */}
          {hasAccess && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
              
              {/* Speed & Seek Controls */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <span className="text-[#6B7280] text-[11px] font-bold flex items-center gap-0.5">
                  <Gauge className="h-3 w-3 text-[#F97316]" />
                  <span>السرعة:</span>
                </span>
                {[1, 1.25, 1.5, 1.75, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`rounded-md px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold transition-all ${
                      playbackSpeed === spd
                        ? 'bg-[#F97316] text-[#0D1B3E] font-black shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}

                {isDirectVideo(currentLesson.videoUrl, currentLesson.videoType) && (
                  <div className="flex items-center gap-1 mr-1 border-r border-slate-200 pr-1">
                    <button
                      onClick={() => handleSkipTime(-10)}
                      className="rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-slate-600 hover:text-amber-500"
                      title="إرجاع 10 ثواني"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleSkipTime(10)}
                      className="rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-slate-600 hover:text-amber-500"
                      title="تقديم 10 ثواني"
                    >
                      <RotateCw className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quality and Fullscreen Button */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-[#6B7280] text-[11px] font-bold">الجودة:</span>
                {(['1080p', '720p', '480p'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setVideoQuality(q)}
                    className={`rounded-md px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-bold transition-all ${
                      videoQuality === q
                        ? 'bg-emerald-600 text-white font-black shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}

                {/* Dedicated Fullscreen Toggle Button */}
                <button
                  onClick={handleToggleFullscreen}
                  className="inline-flex items-center gap-1 rounded-md bg-[#F97316] hover:bg-[#F97316] text-[#0D1B3E] px-2 py-0.5 text-[11px] font-black transition-all shadow-xs"
                  title="تكبير الشاشة بالكامل"
                >
                  {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  <span>{isFullscreen ? 'تصغير' : 'تكبير'}</span>
                </button>
              </div>

            </div>
          )}

          {/* Action Bar (Complete Lesson, AI Assistant & Previous / Next Buttons) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2.5 sm:p-3 space-y-2 shadow-xs">
            
            <div className="grid grid-cols-2 gap-2">
              {/* Mark as Complete Toggle */}
              <button
                onClick={handleToggleComplete}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] sm:text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border border-slate-200 dark:border-slate-700 bg-[#F5F7FA] dark:bg-slate-800 text-[#0D1B3E] dark:text-slate-200 hover:border-amber-400'
                }`}
              >
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="truncate">{isCompleted ? 'تم إكمال الدرس' : 'تحديد كمكتمل'}</span>
              </button>

              {/* Ask AI Assistant About This Lesson */}
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] sm:text-xs font-bold transition-all ${
                  showAIAssistant
                    ? 'border-[#F97316] bg-[#F97316] text-[#0D1B3E] shadow-xs'
                    : 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-[#FDBA74] dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                <Bot className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">المساعد الذكي للدرس</span>
              </button>
            </div>

            {/* Next / Previous Controls */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && onNavigate('lesson-player', { courseId: course.id, lessonId: prevLesson.id })}
                className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] sm:text-xs font-bold transition-colors ${
                  prevLesson 
                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50' 
                    : 'border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span>الدرس السابق</span>
              </button>

              <button
                disabled={!nextLesson}
                onClick={() => nextLesson && onNavigate('lesson-player', { courseId: course.id, lessonId: nextLesson.id })}
                className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] sm:text-xs font-bold transition-colors ${
                  nextLesson 
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-[#F97316] hover:text-[#0D1B3E]' 
                    : 'border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                }`}
              >
                <span>الدرس التالي</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

          {/* Lesson Info & Description */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 sm:p-5 space-y-2.5 shadow-xs">
            <div className="space-y-1">
              <span className="text-[11px] sm:text-xs text-amber-500 font-bold">{course.instructorName} • {course.grade}</span>
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-[#0D1B3E] dark:text-white leading-snug">{currentLesson.title}</h1>
            </div>

            {currentLesson.description && (
              <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                {currentLesson.description}
              </p>
            )}

            {currentLesson.homeworkNotes && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1">
                <span className="text-xs font-bold text-[#0D1B3E] dark:text-amber-200 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#F97316]" />
                  تنبيهات وملاحظات الواجب:
                </span>
                <p className="text-xs text-[#4B5563] dark:text-slate-300 leading-relaxed">{currentLesson.homeworkNotes}</p>
              </div>
            )}
          </div>

          {/* Attachments & PDF Materials */}
          {currentLesson.pdfUrl && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-2.5 text-[#F97316]">
                  <FileText className="h-6 w-6 text-[#0D1B3E]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0D1B3E]">{currentLesson.pdfTitle || 'مذكرة شرح وتمارين الدرس.pdf'}</h4>
                  <p className="text-xs text-[#6B7280]">ملف PDF مرفق متضمن الملاحظات والمسائل المحلولة</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-4 py-2.5 text-xs font-bold text-[#0D1B3E] hover:bg-[#F97316] shadow-xs transition-all self-end sm:self-auto"
              >
                <FileText className="h-4 w-4" />
                <span>معاينة وقراءة المذكرة</span>
              </button>
            </div>
          )}

          {/* Assignments associated with this course / lesson */}
          {assignments.length > 0 && (
            <div className="space-y-3">
              {assignments.map(asgn => {
                const sub = submissions.find(s => s.assignmentId === asgn.id);
                return (
                  <div key={asgn.id} className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-[#16224D] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="rounded-xl bg-[#F97316]/20 p-3 text-[#0D1B3E] dark:text-white shrink-0">
                        <FileText className="h-6 w-6 text-[#FDBA74] dark:text-[#4C7CFF]" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-[#FDBA74] text-white px-2 py-0.5 rounded-md">
                            واجب تطبيقات الـ PDF
                          </span>
                          {sub && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              sub.status === 'graded' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}>
                              {sub.status === 'graded' ? `تم التصحيح: ${sub.grade}/${sub.maxGrade || 20}` : 'تم التسليم - قيد المراجعة'}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-[#0D1B3E] dark:text-white">{asgn.title}</h4>
                        <p className="text-xs text-[#6B7280] dark:text-slate-400">
                          الدرجة الكلية: {asgn.maxGrade || 20} درجة
                          {asgn.deadline && ` • آخر موعد: ${new Date(asgn.deadline).toLocaleDateString('ar-EG')}`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssignmentModal(asgn);
                        setAssignmentModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FDBA74] dark:bg-[#4C7CFF] px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 shadow-xs transition-all self-end sm:self-auto"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{sub ? 'عرض ورقة الحل والتصحيح' : 'فتح وتأدية الواجب الآن'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lesson Quiz Card if present */}
          {lessonQuiz && (
            <div className="rounded-3xl border border-blue-200 bg-blue-50/50 dark:bg-[#16224D] dark:border-blue-900/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-blue-100 dark:bg-blue-950/80 p-3 text-[#FDBA74] dark:text-[#60A5FA]">
                  <HelpCircle className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#FDBA74] dark:text-[#60A5FA] uppercase tracking-wider">كويز تقييم الفهم</span>
                    {(() => {
                      const quizAtt = student ? StorageService.getStudentAttempts(student.id).find(a => a.examId === lessonQuiz.id) : undefined;
                      if (!quizAtt) return null;
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          quizAtt.passed 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          تم الأداء ({quizAtt.score}/{quizAtt.maxScore})
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="font-bold text-base text-[#0D1B3E] dark:text-white">{lessonQuiz.title}</h3>
                  <p className="text-xs text-[#4B5563] dark:text-slate-400">
                    المدة: {lessonQuiz.durationMinutes} دقيقة • {lessonQuiz.questions?.length || 0} أسئلة اختيار من متعدد
                  </p>
                </div>
              </div>

              {(() => {
                const quizAtt = student ? StorageService.getStudentAttempts(student.id).find(a => a.examId === lessonQuiz.id) : undefined;
                if (quizAtt) {
                  return (
                    <button
                      onClick={() => onNavigate('exam-result', { attemptId: quizAtt.id })}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-6 py-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>عرض نتيجة الكويز والتقرير</span>
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => onNavigate('exam-runner', { examId: lessonQuiz.id, courseId: course.id, lessonId: currentLesson.id })}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDBA74] dark:bg-[#3B82F6] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>بدء الكويز الآن</span>
                  </button>
                );
              })()}
            </div>
          )}

        </div>

        {/* Sidebar: Course Curriculum Playlist */}
        <div className={`${playerSize === 'theater' ? 'w-full' : 'lg:col-span-4'} space-y-4 min-w-0`}>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 space-y-3 sticky top-20 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-[#F97316]" />
                <h3 className="font-bold text-[#0D1B3E] dark:text-white text-xs sm:text-sm">دروس الكورس</h3>
              </div>
              <span className="text-[11px] text-[#6B7280] dark:text-slate-400 font-bold">{allLessons.length} درس</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-0.5">
              {course.units?.map((unit, uIdx) => (
                <div key={unit.id} className="space-y-1.5">
                  <p className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 rounded-md">
                    {unit.title}
                  </p>
                  
                  <div className="space-y-1">
                    {unit.lessons?.map((l) => {
                      const isCurrent = l.id === currentLesson.id;
                      const completed = student ? StorageService.getLessonProgress(student.id, l.id)?.isCompleted : false;
                      const lHasAccess = isEnrolled || Boolean(l.isFreePreview);

                      return (
                        <button
                          key={l.id}
                          onClick={() => onNavigate('lesson-player', { courseId: course.id, lessonId: l.id })}
                          className={`w-full text-right flex items-start justify-between gap-2 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-500/10 border border-amber-500/30 text-[#0D1B3E] dark:text-amber-300 font-bold'
                              : 'text-[#4B5563] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#0D1B3E]'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="mt-0.5 shrink-0">
                              {completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              ) : isCurrent ? (
                                <PlayCircle className="h-3.5 w-3.5 text-[#F97316] animate-pulse" />
                              ) : !lHasAccess ? (
                                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600">
                                  <Lock className="h-2 w-2" />
                                </span>
                              ) : (
                                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] text-[#6B7280]">
                                  {l.order}
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <p className="line-clamp-2 leading-snug text-[11px] sm:text-xs">{l.title}</p>
                              <span className="text-[9px] sm:text-[10px] text-[#6B7280] dark:text-slate-400">{l.durationMinutes || 45} دقيقة</span>
                            </div>
                          </div>
                          {!lHasAccess && (
                            <span className="shrink-0 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-1 py-0.5 text-[8px] font-bold text-amber-700 dark:text-amber-300">
                              مغلق
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Floating AI Physics Assistant Modal / Widget */}
      {showAIAssistant && (
        <AIPhysicsAssistant
          isFloating={true}
          currentLessonId={currentLesson.id}
          currentCourseId={course.id}
          lessonTitle={currentLesson.title}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {/* Lesson PDF Viewer Modal */}
      {showPdfModal && currentLesson.pdfUrl && (
        <PdfViewerModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={currentLesson.pdfTitle || currentLesson.title || 'مذكرة الدرس'}
          pdfUrl={currentLesson.pdfUrl}
          category="مذكرة الدرس"
          grade={course.grade}
        />
      )}

      {/* Assignment Solver / Viewer Modal */}
      {assignmentModalOpen && selectedAssignmentModal && (
        <AssignmentSolverModal
          isOpen={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          assignment={selectedAssignmentModal}
          student={student}
          submission={submissions.find(s => s.assignmentId === selectedAssignmentModal.id)}
          mode={submissions.find(s => s.assignmentId === selectedAssignmentModal.id) ? 'view' : 'solve'}
          onSuccess={() => {
            if (student) {
              setSubmissions(StorageService.getStudentAssignmentSubmissions(student.id));
            }
          }}
        />
      )}

    </div>
  );
};
