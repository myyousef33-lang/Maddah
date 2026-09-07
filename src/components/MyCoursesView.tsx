import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, Key, CheckCircle2, Clock, Sparkles, ChevronLeft } from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { Course, Student } from '../types';
import { CourseRatingBadge } from './CourseRatingBadge';

interface MyCoursesViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenActivationModal: () => void;
}

export const MyCoursesView: React.FC<MyCoursesViewProps> = ({
  onNavigate,
  onOpenActivationModal
}) => {
  const [student, setStudent] = useState<Student | null>(StorageService.getCurrentStudent());
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  useEffect(() => {
    const update = () => {
      const s = StorageService.getCurrentStudent();
      setStudent(s);
      if (s) {
        const all = StorageService.getCourses();
        const enrolled = all.filter(c => s.enrolledCourseIds?.includes(c.id));
        setEnrolledCourses(enrolled);
      } else {
        setEnrolledCourses([]);
      }
    };
    update();
    return subscribeToStorage(update);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0D1B3E] via-[#162A5A] to-[#0D1B3E] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>مكتبة الكورسات المفعلة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            كورساتي التعليمية
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            تابِع محاضراتك، شاهد الدروس، وأكمِل تطبيق تمارين واختبارات المنهج أولاً بأول.
          </p>
        </div>
      </div>

      {/* Courses List */}
      {!student ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-[#00B4FF]">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0D1B3E]">تسجيل الدخول مطلوب</h3>
          <p className="text-xs text-[#6B7280]">يرجى تسجيل الدخول لعرض الكورسات التي تم تفعيلها بحسابك.</p>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-5 shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
            <Key className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#0D1B3E]">لا توجد كورسات مفعلة حالياً</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              قم بتفعيل كورس جديد باستخدام كود التفعيل الخاص بك أو عبر شحن المحفظة.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenActivationModal}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
            >
              تفعيل كود جديد
            </button>
            <button
              onClick={() => onNavigate('courses-catalog')}
              className="px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white font-bold text-xs hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20"
            >
              استعرض دليـل الكورسات
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map(course => {
            let totalLessons = 0;
            course.units?.forEach(u => {
              totalLessons += u.lessons?.length || 0;
            });

            return (
              <div
                key={course.id}
                className="rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-[11px] shadow-md flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>مُفعّل بحسابك</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#6B7280]">
                      <CourseRatingBadge rating={course.rating || 5} count={course.reviewCount || 12} />
                      <span>{totalLessons} درس تعليمي</span>
                    </div>

                    <h3 className="text-base font-bold text-[#0D1B3E] line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => onNavigate('course-details', { courseId: course.id })}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0D1B3E] text-white font-bold text-xs hover:bg-blue-900 transition-all shadow-md"
                  >
                    <span>الدخول للكورس والمشاهدة</span>
                    <ChevronLeft className="h-4 w-4 text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
