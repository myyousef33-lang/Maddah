import React, { useState, useEffect } from 'react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { Student } from '../types';

interface LiveDebugOverlayProps {
  currentView: string;
}

export const LiveDebugOverlay: React.FC<LiveDebugOverlayProps> = ({ currentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [rawStudent, setRawStudent] = useState<Student | null>(null);
  const [studentType, setStudentType] = useState<string>('null');
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);

  useEffect(() => {
    const updateDebugInfo = () => {
      try {
        const curStudent = StorageService.getCurrentStudent();
        setRawStudent(curStudent);
        if (curStudent === null) {
          setStudentType('null (غير مسجل)');
        } else if (typeof curStudent === 'object') {
          setStudentType(`Object (ID: ${curStudent.id}, Name: ${curStudent.name})`);
        } else {
          setStudentType(typeof curStudent);
        }

        const allCourses = StorageService.getCourses() || [];
        setCoursesCount(allCourses.length);

        if (curStudent) {
          const enrolled = allCourses.filter(c => StorageService.isStudentEnrolled(curStudent.id, c.id));
          setEnrolledCount(enrolled.length);
        } else {
          setEnrolledCount(0);
        }
      } catch (err) {
        setStudentType(`Error: ${String(err)}`);
      }
    };

    updateDebugInfo();
    const unsubscribe = subscribeToStorage(updateDebugInfo);
    return () => unsubscribe();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '12px',
        zIndex: 999999,
        backgroundColor: 'rgba(11, 11, 15, 0.95)',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        color: '#fbbf24',
        fontFamily: 'monospace, Courier, monospace',
        fontSize: '11px',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.85)',
        direction: 'rtl',
        textAlign: 'right',
        maxWidth: '320px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? '0' : '8px', borderBottom: isCollapsed ? 'none' : '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: isCollapsed ? '0' : '4px' }}>
        <strong style={{ color: '#fef08a', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🛠️</span> لوحة التشخيص الحية
        </strong>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: '#f59e0b',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 8px',
            fontWeight: 'bold',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          {isCollapsed ? 'توسيع ➕' : 'تصغير ➖'}
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', lineHeight: '1.4' }}>
          <div>
            <span style={{ color: '#9ca3af' }}>1) View الحالي: </span>
            <strong style={{ color: '#67e8f9' }}>{currentView}</strong>
          </div>

          <div>
            <span style={{ color: '#9ca3af' }}>2) حالة الطالب (student): </span>
            <strong style={{ color: rawStudent ? '#86efac' : '#f87171' }}>
              {rawStudent ? `${rawStudent.name} (${rawStudent.phone || 'بدون هاتف'})` : 'null (لا يوجد طالب مسجل)'}
            </strong>
          </div>

          <div>
            <span style={{ color: '#9ca3af' }}>3) عدد الكورسات: </span>
            <strong style={{ color: '#fef08a' }}>
              الإجمالي: {coursesCount} | المشترك بها: {enrolledCount}
            </strong>
          </div>

          <div>
            <span style={{ color: '#9ca3af' }}>4) حالة التحميل (Loading): </span>
            <strong style={{ color: '#86efac' }}>false (جاهز)</strong>
          </div>

          <div>
            <span style={{ color: '#9ca3af' }}>5) ناتج StorageService.getCurrentStudent(): </span>
            <div style={{ wordBreak: 'break-all', color: '#fde047', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '4px', marginTop: '2px' }}>
              {studentType}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
