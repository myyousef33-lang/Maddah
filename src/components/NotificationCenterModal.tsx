import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, X, Check, Trash2, Sparkles, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { NotificationItem, Student } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [student, setStudent] = useState<Student | null>(StorageService.getCurrentStudent());

  useEffect(() => {
    const update = () => {
      const s = StorageService.getCurrentStudent();
      setStudent(s);
      const allNotifs = StorageService.getNotifications();
      // filter relevant notifications for current student or general
      const userNotifs = allNotifs.filter(n => !n.studentId || n.studentId === 'all' || (s && n.studentId === s.id));
      setNotifications(userNotifs);
    };
    update();
    return subscribeToStorage(update);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#0D1B3E] text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">مركز التنبيهات والأخبار</h2>
              <p className="text-[11px] text-slate-300">أحدث الإشعارات والتعليمات الخاصة بك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notifications Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell className="h-6 w-6" />
              </div>
              <p className="text-xs text-[#6B7280]">لا توجد تنبيهات جديدة حالياً</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-blue-200 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0D1B3E] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{notif.createdAt?.split('T')[0] || ''}</span>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0D1B3E] text-white font-bold text-xs hover:bg-blue-900 transition-all"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </div>
  );
};
