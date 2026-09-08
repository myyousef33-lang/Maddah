import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  PlayCircle, 
  Award, 
  Key, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ArrowLeft, 
  Zap, 
  Star,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Atom,
  Clock,
  Phone,
  Play,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { PresenceService } from '../services/presence';
import { Course, PdfMaterial, Student } from '../types';
import { CourseRatingBadge } from './CourseRatingBadge';
import { ExamCountdownBanner } from './ExamCountdownBanner';
import { ScrollReveal } from './ScrollReveal';
const teacherCutout = '/teacher.png';

interface HomeLandingViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenActivationModal: () => void;
  onOpenAuthModal: () => void;
}

interface HomeCourseCardProps {
  course: Course;
  instructorFallback: string;
  onNavigate: (view: string, params?: any) => void;
  isCarouselItem?: boolean;
}

const HomeCourseCard: React.FC<HomeCourseCardProps> = React.memo(({
  course,
  instructorFallback,
  onNavigate,
  isCarouselItem = false
}) => {
  const totalLessons = course.units?.reduce((acc, u) => acc + (u.lessons?.length || 0), 0) || 0;
  const unitCount = course.units?.length || 0;

  return (
    <div
      className={`glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group border border-[#C7D9FE] hover:border-[#FDBA74] transition-all shadow-xs h-full ${
        isCarouselItem ? 'w-[290px] sm:w-[340px] lg:w-[380px] shrink-0 snap-start' : ''
      }`}
    >
      <div>
        {/* Video/Course Thumbnail Container */}
        <div 
          className="relative aspect-video w-full overflow-hidden bg-slate-100"
          style={{ aspectRatio: '16 / 9' }}
        >
          <img
            src={course.thumbnail}
            alt={course.title}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px] pointer-events-none">
            <div className="h-13 w-13 rounded-full bg-[#F97316] text-[#0D1B3E] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6 fill-[#0D1B3E] mr-0.5" />
            </div>
          </div>

          {/* Corner Grade Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="rounded-xl bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#FDBA74] border border-blue-200 shadow-sm">
              {course.grade}
            </span>
          </div>

          {/* Rating Badge on Corner/Side of Screen Image */}
          <CourseRatingBadge 
            rating={course.rating} 
            ratingCount={course.ratingCount} 
            position="top-left" 
          />

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 rounded-xl bg-[#F97316] px-3 py-1 text-xs font-bold text-[#0D1B3E] shadow-sm z-10">
            {course.price > 0 ? `${course.price} ج.م` : 'مجاني'}
          </div>

          {/* Bottom Badge: Lesson Count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white z-10">
            <PlayCircle className="h-3.5 w-3.5 text-[#F97316]" />
            <span>{totalLessons} درس • {unitCount} فصول</span>
          </div>
        </div>

        {/* Course Title & Description */}
        <div className="p-5 lg:p-6 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-[#FDBA74] text-[10px] font-black border border-blue-200 shrink-0">
              أكـ
            </div>
            <span className="text-xs font-bold text-[#6B7280] truncate">
              {course.instructorName || instructorFallback}
            </span>
          </div>

          <h3 className="font-bold text-[#0D1B3E] text-base leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-[#FDBA74] transition-colors">
            {course.title}
          </h3>
          
          <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>
      </div>

      <div className="p-5 lg:p-6 pt-0">
        <button
          onClick={() => onNavigate('course-details', { courseId: course.id })}
          className="w-full rounded-2xl bg-[#FDBA74] hover:bg-blue-700 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>استعراض المنهج والدروس</span>
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({
  onNavigate,
  onOpenActivationModal,
  onOpenAuthModal
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pdfs, setPdfs] = useState<PdfMaterial[]>([]);
  const [student, setStudent] = useState<Student | null>(StorageService.getCurrentStudent());
  const [activeCount, setActiveCount] = useState<number>(PresenceService.getActiveCount());
  const [courseDisplayMode, setCourseDisplayMode] = useState<'carousel' | 'grid'>('carousel');
  const coursesScrollRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState(StorageService.getSettings());

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  useEffect(() => {
    const update = () => {
      setCourses(StorageService.getCourses());
      setPdfs(StorageService.getPdfs());
      setStudent(StorageService.getCurrentStudent());
      setSettings(StorageService.getSettings());
    };
    update();

    // Subscribe to presence active users count
    const unsubscribePresence = PresenceService.subscribeActiveCount(setActiveCount);

    const unsubscribeStorage = subscribeToStorage(update);
    return () => {
      unsubscribeStorage();
      unsubscribePresence();
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!coursesScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - coursesScrollRef.current.offsetLeft);
    setScrollLeftPos(coursesScrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !coursesScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - coursesScrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    coursesScrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const scrollCourses = (direction: 'left' | 'right') => {
    if (coursesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      coursesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getEmbedVideoUrl = (rawUrl?: string): string | null => {
    if (!rawUrl || !rawUrl.trim()) return null;
    const url = rawUrl.trim();
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else {
        const match = url.match(/v=([a-zA-Z0-9_-]+)/);
        if (match) videoId = match[1];
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.split('/d/')[1]?.split('/')[0];
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  };

  const renderIntroVideo = () => {
    const videoUrl = settings.homeIntroVideoUrl;
    const embedUrl = getEmbedVideoUrl(videoUrl);
    if (!embedUrl) return null;

    return (
      <section className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="rounded-3xl border border-[#C7D9FE] bg-[#EBF1FE] p-5 sm:p-8 lg:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#C7D9FE]/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#F97316]/20 text-[#0D1B3E] border border-[#F97316]/40">
                <PlayCircle className="h-6 w-6 text-[#FDBA74]" />
              </div>
              <div>
                <h3 className="font-black text-[#0D1B3E] text-base sm:text-xl lg:text-2xl">الفيديو التعريفي بالمنصة وشرح طريقة الاستخدام</h3>
                <p className="text-xs sm:text-sm text-[#6B7280]">شاهد جولة سريعة داخل المنصة لمعرفة كيفية تفعيل الاشتراكات ومشاهدة الدروس</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-xs font-bold text-[#FDBA74] bg-white px-4 py-1.5 rounded-full border border-[#B4CFFE] shadow-xs">
              فيديو توضيحي رسمي
            </span>
          </div>
          <div className="relative aspect-video w-full rounded-2xl lg:rounded-3xl overflow-hidden bg-slate-900 border border-[#C7D9FE] shadow-sm">
            <iframe
              src={embedUrl}
              title="الفيديو التعريفي"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-16 lg:space-y-24 animate-in fade-in duration-300 max-w-full pb-16 bg-[#F5F7FA] dark:bg-[#080D21] text-[#0D1B3E] dark:text-slate-100 transition-colors">
      
      {/* INTRO VIDEO IF PLACEMENT IS TOP */}
      {settings.homeVideoPlacement === 'top' && renderIntroVideo()}

      {/* HERO SECTION - Luxury Dark (Black + White + Orange) */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-14">
        
        {/* Glowing Orange Ambient Radial Glow behind instructor photo */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#F97316]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">
          
          {/* 1. Teacher Photo with Luxury Orange & Obsidian Semi-Circle Backdrop */}
          <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] flex flex-col items-center select-none">
            
            {/* The Luxury Obsidian & Orange Arch / Half-Circle Backdrop */}
            <div className="relative w-full h-[320px] sm:h-[370px] md:h-[410px] flex items-end justify-center">
              
              {/* Outer Decorative Ring */}
              <div className="absolute top-2 w-[270px] h-[270px] sm:w-[320px] sm:h-[320px] md:w-[350px] md:h-[350px] rounded-full border-2 border-[#F97316]/40 pointer-events-none animate-[spin_30s_linear_infinite]" />
              
              {/* The Solid Obsidian & Orange Gradient Arch behind the teacher's upper body */}
              <div className="absolute top-4 w-[250px] h-[250px] sm:w-[290px] sm:h-[290px] md:w-[320px] md:h-[320px] rounded-full bg-gradient-to-b from-[#0B0B0F] via-[#14141E] to-[#1C1410] border border-[#F97316]/50 shadow-xl shadow-[#F97316]/20 flex items-center justify-center overflow-hidden">
                {/* Subtle internal energy rings */}
                <div className="absolute inset-2 rounded-full border border-[#F97316]/20" />
                <div className="absolute inset-8 rounded-full border border-[#FDBA74]/20" />
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#F97316]/15 rounded-full blur-xl" />
              </div>

              {/* Floating Math Equation Badge on Left: f(x) = ∫ e^x dx */}
              <div className="absolute -left-2 sm:-left-4 top-1/3 z-20 bg-[#080B10]/95 backdrop-blur-md border border-[#F97316]/60 px-3 py-1 rounded-2xl shadow-md">
                <span className="text-xs sm:text-sm font-black font-mono text-[#F97316] tracking-wide dir-ltr inline-block">
                  f(x) = ∫ e^x
                </span>
              </div>

              {/* Floating Math Equation Badge on Right: e^(iπ) + 1 = 0 */}
              <div className="absolute -right-2 sm:-right-4 top-1/3 z-20 bg-[#080B10]/95 backdrop-blur-md border border-[#FDBA74]/50 px-3 py-1 rounded-2xl shadow-md">
                <span className="text-xs sm:text-sm font-black font-mono text-[#FDBA74] tracking-wide dir-ltr inline-block">
                  e^(iπ) + 1 = 0
                </span>
              </div>

              {/* The Real Teacher Cutout / Custom Hero Photo overlapping the backdrop */}
              <img
                key={settings.instructorPhotoUrl || 'default-teacher-photo'}
                src={settings.instructorPhotoUrl && settings.instructorPhotoUrl.trim() !== '' ? settings.instructorPhotoUrl : teacherCutout}
                alt={settings.instructorTitle || "مداح الرياضيات"}
                className="relative z-10 h-full w-auto object-contain object-bottom drop-shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback1) {
                    target.dataset.triedFallback1 = 'true';
                    target.src = '/teacher.png';
                  } else if (!target.dataset.triedFallback2) {
                    target.dataset.triedFallback2 = 'true';
                    target.src = '/teacher.jpg';
                  }
                }}
              />
              
              {/* Instructor Title Badge at Bottom */}
              <div className="absolute -bottom-3 z-30 inline-flex items-center gap-2 rounded-full bg-[#0B0B0F] border-2 border-[#F97316] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#F97316] shadow-lg">
                <Award className="h-4 w-4 text-[#F97316]" />
                <span>{settings.instructorTitle || "مداح الرياضيات • معلم ومعد مادة الرياضيات"}</span>
              </div>
            </div>

          </div>

          {/* 2. Main Heading directly under the teacher photo */}
          <div className="space-y-4 max-w-3xl mx-auto pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] text-xs font-bold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
              <span>المنصة الأولى لتعليم الرياضيات لجميع المراحل الدراسية</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.2] tracking-tight">
              <span className="block font-calligraphy text-4xl sm:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#F97316] gold-glow-text py-1">
                مداح الرياضيات
              </span>
              <span className="block text-2xl sm:text-4xl lg:text-5xl mt-1">
                طريقك إلى <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDBA74] to-[#F97316]">الدرجة النهائية</span> في الرياضيات
              </span>
            </h1>

            {/* 3. Short 1-2 line description */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              شرح مبسط وشامل للجبر والهندسة وحساب المثلثات والتفاضل والتكامل والإحصاء مع بنك أسئلة متدرج وامتحانات إلكترونية مصححة فورياً.
            </p>
          </div>

          {/* 4. Action Buttons (Orange + Dark Surface) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            {student ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C] px-8 py-3.5 sm:px-9 sm:py-4 text-sm sm:text-base font-black text-[#0B0B0F] shadow-lg shadow-[#F97316]/25 hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <GraduationCap className="h-5 w-5 text-[#0B0B0F]" />
                <span>الدخول إلى لوحة دراستي</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C] px-8 py-3.5 sm:px-9 sm:py-4 text-sm sm:text-base font-black text-[#0B0B0F] shadow-lg shadow-[#F97316]/25 hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="h-5 w-5 text-[#0B0B0F]" />
                <span>ابدأ التعلم الآن مجاناً</span>
              </button>
            )}

            <button
              onClick={onOpenActivationModal}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#F97316] bg-[#14141E] px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-[#FDBA74] hover:bg-[#1E1611] hover:border-[#F97316] hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <Key className="h-5 w-5 text-[#F97316]" />
              <span>تفعيل كود الاشتراك</span>
            </button>
          </div>

          {/* 5. Remaining Elements: Stats & Quick Badges (Obsidian + Gold Luxury Cards) */}
          <div className="pt-4 max-w-3xl mx-auto space-y-4">
            
            {/* Live active students & platform badge */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F97316]/40 bg-[#0B0B0F] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span>
                  {activeCount >= 3 ? (
                    <>
                      <strong className="text-[#F97316] font-black mx-1 font-mono">{activeCount.toLocaleString('ar-EG')}</strong>{' '}
                      طالب بيذاكر دلوقتي
                    </>
                  ) : (
                    'انضم لآلاف الطلاب الذين يذاكرون الرياضيات الآن'
                  )}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#FDBA74]/40 bg-[#0B0B0F] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                <Sparkles className="h-4 w-4 text-[#FDBA74]" />
                <span>المنصة الرائدة لتعليم الرياضيات لجميع المراحل</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 p-4 sm:p-6 rounded-3xl bg-[#0B0B0F] border border-[#F97316]/30 shadow-xl text-center text-white">
              <div>
                <p className="text-xl sm:text-3xl font-black text-[#F97316] font-mono">+15,000</p>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">طالب مستفيد</p>
              </div>
              <div className="border-x border-slate-700/50">
                <p className="text-xl sm:text-3xl font-black text-[#F97316] font-mono">100%</p>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">تغطية أفكار الامتحانات</p>
              </div>
              <div>
                <p className="text-xl sm:text-3xl font-black text-[#FDBA74] font-mono">24/7</p>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">دعم ومتابعة مستمرة</p>
              </div>
            </div>

            {/* Security & Speed Trust Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B0B0F] border border-[#F97316]/30 text-xs text-slate-200 font-medium shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#F97316] shrink-0" />
              <span>منصة آمنة ومحمية بالكامل مع سيرفرات فائقة السرعة ومشاهدة غير محدودة</span>
            </div>

          </div>

        </div>
      </section>

      {/* INTRO VIDEO IF PLACEMENT IS BELOW HERO */}
      {(settings.homeVideoPlacement === 'below_hero' || !settings.homeVideoPlacement) && renderIntroVideo()}

      {/* EXAM COUNTDOWN BANNER */}
      <div className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12">
        <ExamCountdownBanner onNavigate={onNavigate} />
      </div>

      {/* PLATFORM ADVANTAGES */}
      <section className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-10 lg:mb-14">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0D1B3E] dark:text-white">لماذا منصة <span className="text-[#F97316] dark:text-[#F97316] font-calligraphy">مداح الرياضيات</span>؟</h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#6B7280] dark:text-slate-300">صُممت المنصة لتغطية مناهج الرياضيات لجميع المراحل الدراسية بأسلوب علمي مبسّط</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <ScrollReveal index={0} className="h-full">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#F97316] hover:scale-[1.02] transition-all h-full">
              <div className="rounded-2xl bg-white dark:bg-[#0B0B0F] border border-[#F97316]/40 p-4 w-fit text-[#F97316] shadow-xs">
                <PlayCircle className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-[#0D1B3E] dark:text-white text-lg lg:text-xl">شرح وافي ومبسط</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-300 leading-relaxed">
                فيديوهات بجودة عالية وتطبيقات عملية ورسوم هندسية لتجسيد المفاهيم والمعادلات الرياضية خطوة بخطوة.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal index={1} className="h-full">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#FDBA74] hover:scale-[1.02] transition-all h-full">
              <div className="rounded-2xl bg-[#F97316]/25 border border-[#F97316]/50 p-4 w-fit text-[#0D1B3E] shadow-xs">
                <Award className="h-7 w-7 text-[#FDBA74]" />
              </div>
              <h3 className="font-bold text-[#0D1B3E] text-lg lg:text-xl">امتحانات وتصحيح فوري</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                بنك أسئلة متدرج الصعوبة مع مؤقت زمني ونموذج إجابة مفصل لكل سؤال لتشخيص نقاط الضعف وعلاجها فوراً.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal index={2} className="h-full">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#FDBA74] hover:scale-[1.02] transition-all h-full">
              <div className="rounded-2xl bg-white border border-[#B4CFFE] p-4 w-fit text-[#FDBA74] shadow-xs">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-[#0D1B3E] text-lg lg:text-xl">مذكرات وملازم PDF</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                ملازم مطبوعة ورقمية عالية الجودة، تشمل ملخصات القوانين، الخرائط الذهنية، وأسئلة امتحانات سابقة.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal index={3} className="h-full">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#FDBA74] hover:scale-[1.02] transition-all h-full">
              <div className="rounded-2xl bg-[#F97316]/25 border border-[#F97316]/50 p-4 w-fit text-[#0D1B3E] shadow-xs">
                <ShieldCheck className="h-7 w-7 text-[#FDBA74]" />
              </div>
              <h3 className="font-bold text-[#0D1B3E] text-lg lg:text-xl">تفعيل فوري بالأكواد</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                اشترك بسهولة عبر كود التفعيل السري دون تعقيدات، مع حماية أجهزتك ومتابعة مستواك بصفة دورية.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FEATURED COURSES TEASER (YOUTUBE DESKTOP HORIZONTAL CAROUSEL & GRID TOGGLE) */}
      <section className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[#F97316] animate-pulse"></span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0D1B3E]">الكورسات والمناهج المتاحة</h2>
            </div>
            <p className="text-xs sm:text-sm lg:text-base text-[#6B7280] mt-1">تصفح المحاضرات والمناهج الدراسية المصممة لجميع المراحل</p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View Mode Toggle (Desktop) */}
            {courses.length > 0 && (
              <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setCourseDisplayMode('carousel')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    courseDisplayMode === 'carousel'
                      ? 'bg-[#FDBA74] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#0D1B3E]'
                  }`}
                  title="عرض كاروسيل أفقي"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>كاروسيل</span>
                </button>
                <button
                  onClick={() => setCourseDisplayMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    courseDisplayMode === 'grid'
                      ? 'bg-[#FDBA74] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#0D1B3E]'
                  }`}
                  title="عرض شبكة كاملة"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>شبكة كاملة</span>
                </button>
              </div>
            )}

            {courses.length > 0 && courseDisplayMode === 'carousel' && (
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => scrollCourses('right')}
                  className="p-2.5 rounded-xl bg-slate-50 text-[#6B7280] hover:text-[#FDBA74] hover:bg-blue-50 transition-all"
                  title="التمرير لليمين"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollCourses('left')}
                  className="p-2.5 rounded-xl bg-slate-50 text-[#6B7280] hover:text-[#FDBA74] hover:bg-blue-50 transition-all"
                  title="التمرير لليسار"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => onNavigate('courses-catalog')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FDBA74] hover:underline bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-200"
            >
              <span>عرض جميع الكورسات</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-3xl border border-[#C7D9FE] bg-[#EBF1FE] p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#B4CFFE] text-[#FDBA74] shadow-xs">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#0D1B3E] dark:text-white">الكورسات والمناهج قيد التجهيز</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-slate-300 leading-relaxed">
                يقوم الأستاذ مداح الرياضيات حالياً برفع المحاضرات وحصص الشرح الجديدة. تابع قناة التليجرام لمعرفة مواعيد النشر.
              </p>
            </div>
          </div>
        ) : courseDisplayMode === 'carousel' ? (
          /* YouTube Desktop Horizontal Scroll Row with Smooth Touch & Mouse Drag */
          <div 
            ref={coursesScrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-6 overflow-x-auto pb-6 pt-1 snap-x scroll-smooth transition-all ${
              isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x pan-y pinch-zoom'
            }}
          >
            {courses.map(course => (
              <HomeCourseCard
                key={course.id}
                course={course}
                instructorFallback={settings.instructorName}
                onNavigate={onNavigate}
                isCarouselItem={true}
              />
            ))}
          </div>
        ) : (
          /* Full Grid Mode for Desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {courses.map((course, idx) => (
              <ScrollReveal key={course.id} index={idx} className="h-full">
                <HomeCourseCard
                  course={course}
                  instructorFallback={settings.instructorName}
                  onNavigate={onNavigate}
                  isCarouselItem={false}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* INTRO VIDEO IF PLACEMENT IS BELOW COURSES */}
      {settings.homeVideoPlacement === 'below_courses' && renderIntroVideo()}

      {/* PDF MATERIALS TEASER */}
      <section className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12 space-y-8">
        <ScrollReveal index={0} className="w-full">
          <div className="rounded-3xl border border-[#C7D9FE] bg-[#EBF1FE] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="space-y-3 text-center lg:text-right">
              <span className="rounded-full bg-white border border-[#B4CFFE] px-4 py-1.5 text-xs font-bold text-[#FDBA74] shadow-xs">
                المكتبة والملازم
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0D1B3E]">
                أقوى مذكرات الشرح وبنوك الأسئلة PDF
              </h2>
              <p className="text-xs sm:text-base text-[#6B7280] max-w-2xl leading-relaxed">
                تصفح مذكرات الشرح والمسائل المحلولة وخرائط القوانين الذهنية المجهزة خصيصاً للطباعة أو القراءة المباشرة من التابلت والكمبيوتر.
              </p>
            </div>

            <button
              onClick={() => onNavigate('pdf-library')}
              className="rounded-2xl bg-[#F97316] px-9 py-4 text-sm sm:text-base font-bold text-[#0D1B3E] shadow-md shadow-[#F97316]/25 hover:bg-[#F97316] hover:scale-105 transition-all shrink-0 cursor-pointer"
            >
              تصفح مكتبة الـ PDF
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* TESTIMONIALS / SUCCESS STORIES */}
      <section className="mx-auto max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0D1B3E]">آراء وتجارب طلابنا المتفوقين</h2>
          <p className="text-xs sm:text-base text-[#6B7280]">فخورون برحلة نجاح طلابنا في مختلف محافظات مصر</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <ScrollReveal index={0} className="h-full">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs h-full">
              <div className="flex items-center gap-1 text-[#F97316]">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F97316]" />)}
              </div>
              <p className="text-xs sm:text-sm text-[#0D1B3E] dark:text-slate-200 leading-relaxed">
                "الرياضيات كانت من المواد اللي مقلق منها، لكن بفضل أسلوب الأستاذ مداح المنظم وبنك الأسئلة قدرت أقفل الامتحان التجريبي بدرجة نهائية!"
              </p>
              <div className="pt-3 border-t border-[#F97316]/30 text-xs sm:text-sm font-bold text-[#F97316]">
                أحمد محمد — أوائل الدقهلية
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal index={1} className="h-full">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs h-full">
              <div className="flex items-center gap-1 text-[#F97316]">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F97316]" />)}
              </div>
              <p className="text-xs sm:text-sm text-[#0D1B3E] dark:text-slate-200 leading-relaxed">
                "ميزة تصحيح الامتحانات الفورية ومعرفة سبب الخطأ بالخطوات الرياضية التفصيلية وفرت عليا وقت كبير جداً وخلتني أثق في نفسي."
              </p>
              <div className="pt-3 border-t border-[#F97316]/30 text-xs sm:text-sm font-bold text-[#F97316]">
                مريم خالد — الجيزة
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal index={2} className="h-full">
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs h-full">
              <div className="flex items-center gap-1 text-[#F97316]">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F97316]" />)}
              </div>
              <p className="text-xs sm:text-sm text-[#0D1B3E] leading-relaxed">
                "المذكرات والـ PDF منظمة جداً وكل قانون معاه رسم توضيحي وأمثلة الوزارة السابقة. منصة متكاملة بمعنى الكلمة."
              </p>
              <div className="pt-3 border-t border-[#C7D9FE]/80 text-xs sm:text-sm font-bold text-[#FDBA74]">
                يوسف طارق — الإسكندرية
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
};
