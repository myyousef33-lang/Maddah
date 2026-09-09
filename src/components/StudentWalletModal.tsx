import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  QrCode,
  Sparkles,
  Key
} from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';
import { Student, PaymentMethod, WalletTransaction } from '../types';

interface StudentWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StudentWalletModal: React.FC<StudentWalletModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [student, setStudent] = useState<Student | null>(StorageService.getCurrentStudent());
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'deposit' | 'voucher' | 'history'>('deposit');
  
  // Deposit form state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<string>('150');
  const [refNumber, setRefNumber] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Instant Voucher / Code recharge state
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [isRedeemingVoucher, setIsRedeemingVoucher] = useState(false);

  useEffect(() => {
    const update = () => {
      const current = StorageService.getCurrentStudent();
      setStudent(current);
      const activeMethods = StorageService.getPaymentMethods().filter(m => m.isActive);
      setMethods(activeMethods);
      if (activeMethods.length > 0 && !selectedMethod) {
        setSelectedMethod(activeMethods[0]);
      }
      if (current) {
        setTransactions(StorageService.getStudentWalletTransactions(current.id));
      }
    };
    update();
    return subscribeToStorage(update);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'حجم صورة الإيصال يجب ألا يتعدى 5 ميجابايت.' });
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
      setStatusMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) {
      setStatusMessage({ type: 'error', text: 'يرجى تسجيل الدخول أولاً.' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال مبلغ صحيح لشحن المحفظة.' });
      return;
    }

    if (!selectedMethod) {
      setStatusMessage({ type: 'error', text: 'يرجى اختيار طريقة الدفع.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      StorageService.createDepositRequest({
        studentId: student.id,
        studentName: student.name,
        studentPhone: student.phone,
        amount: numAmount,
        methodId: selectedMethod.id,
        methodName: selectedMethod.name,
        transactionRefNumber: refNumber.trim(),
        receiptImageUrl: receiptBase64
      });

      setStatusMessage({
        type: 'success',
        text: 'تم إرسال طلب الشحن بنجاح! سيتم مراجعة الإيصال وإضافة الرصيد إلى محفظتك خلال دقائق.'
      });

      // Reset form
      setRefNumber('');
      setReceiptBase64('');
      setReceiptFileName('');
      setActiveTab('history');
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء إرسال طلب الشحن، يرجى المحاولة لاحقاً.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) {
      setStatusMessage({ type: 'error', text: 'يرجى تسجيل الدخول أولاً لتفعيل كود الشحن.' });
      return;
    }
    if (!voucherCode.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود الشحن الفوري أولاً.' });
      return;
    }
    setIsRedeemingVoucher(true);
    setStatusMessage(null);
    try {
      const res = await StorageService.redeemCodeAsync(voucherCode.trim(), student.id);
      setIsRedeemingVoucher(false);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setVoucherCode('');
        setStudent(StorageService.getCurrentStudent());
        setTransactions(StorageService.getStudentWalletTransactions(student.id));
        setActiveTab('history');
        if (onSuccess) onSuccess();
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setIsRedeemingVoucher(false);
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال للتحقق من كود الشحن.' });
    }
  };

  const currentBalance = student?.walletBalance || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header with Balance Card */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-amber-50/40 p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-[#F97316]">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0D1B3E] flex items-center gap-2">
                  محفظة الطالب
                  <span className="text-xs font-bold text-[#FDBA74] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    رصيد آمن
                  </span>
                </h2>
                <p className="text-xs text-[#6B7280]">اشحن رصيدك واشترك في الكورسات والمذكرات فوراً</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white p-2 text-[#6B7280] hover:bg-slate-100 hover:text-[#0D1B3E] transition-colors shadow-xs"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Balance Display */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#F5F7FA] p-4 border border-slate-200">
            <div>
              <span className="text-xs text-[#6B7280] block font-medium">الرصيد المتاح حالياً</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-[#FDBA74] font-mono">
                  {currentBalance.toLocaleString('ar-EG')}
                </span>
                <span className="text-sm font-bold text-[#0D1B3E]">جنيه مصري</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
                  activeTab === 'deposit'
                    ? 'bg-[#F97316] text-white font-black shadow-xs'
                    : 'bg-white text-[#6B7280] border border-slate-200 hover:bg-slate-50'
                }`}
              >
                + شحن تحويل
              </button>
              <button
                onClick={() => setActiveTab('voucher')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                  activeTab === 'voucher'
                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-black shadow-xs'
                    : 'bg-white text-[#6B7280] border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Key className="h-3 w-3 text-amber-500" />
                <span>كود شحن فوري</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
                  activeTab === 'history'
                    ? 'bg-[#F97316] text-white font-black shadow-xs'
                    : 'bg-white text-[#6B7280] border border-slate-200 hover:bg-slate-50'
                }`}
              >
                العمليات ({transactions.length})
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {statusMessage && (
            <div
              className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-bold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-6">
              
              {/* Step 1: Select Payment Method */}
              <div className="space-y-3">
                <label className="text-xs font-black text-[#0D1B3E] uppercase tracking-wider block">
                  1. اختر طريقة التحويل أو الدفع:
                </label>
                {methods.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-[#F5F7FA] p-4 text-center text-xs text-[#6B7280]">
                    لا توجد بوابات دفع مفعلة حالياً. يمكنك التواصل مع الإدارة.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {methods.map(m => {
                      const isSelected = selectedMethod?.id === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMethod(m)}
                          className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/60 border-[#FDBA74] shadow-xs'
                              : 'bg-[#F5F7FA] border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-[#FDBA74]">
                              <Smartphone className="h-4 w-4" />
                            </div>
                            {isSelected && (
                              <div className="h-2 w-2 rounded-full bg-[#FDBA74] shadow-xs" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-black text-[#0D1B3E] block">{m.name}</span>
                            <span className="text-[11px] text-[#FDBA74] font-mono truncate block mt-0.5">
                              {m.accountNumber}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Payment Details & Instructions Box */}
              {selectedMethod && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#F97316]" />
                      <span className="text-xs font-bold text-[#0D1B3E]">بيانات التحويل لـ {selectedMethod.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedMethod.accountNumber, 'acc-num')}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-200 transition-colors shadow-xs"
                    >
                      {copiedId === 'acc-num' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedId === 'acc-num' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200/60">
                    <div>
                      <span className="text-[10px] text-[#6B7280] block">رقم المحفظة / الحساب</span>
                      <span className="text-sm font-black text-[#FDBA74] font-mono select-all">
                        {selectedMethod.accountNumber}
                      </span>
                    </div>
                    {selectedMethod.accountName && (
                      <div className="text-left">
                        <span className="text-[10px] text-[#6B7280] block">اسم صاحب الحساب</span>
                        <span className="text-xs font-bold text-[#0D1B3E]">
                          {selectedMethod.accountName}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedMethod.instructions && (
                    <div className="text-[11px] text-[#0D1B3E] leading-relaxed bg-white p-3 rounded-xl border border-amber-200/60 flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-[#F97316] shrink-0 mt-0.5" />
                      <div>
                        <strong>تعليمات التحويل:</strong> {selectedMethod.instructions}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Deposit Amount & Reference Info */}
              <div className="space-y-4">
                <label className="text-xs font-black text-[#0D1B3E] uppercase tracking-wider block">
                  2. أدخل بيانات الحوالة لتأكيد الشحن:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#6B7280] mb-1 block">المبلغ المحول (ج.م) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="150"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-[#F5F7FA] px-4 py-2.5 text-sm font-bold text-[#0D1B3E] placeholder-slate-400 focus:border-[#FDBA74] focus:bg-white focus:outline-none"
                      />
                      <span className="absolute left-3 top-2.5 text-xs text-[#FDBA74] font-bold">ج.م</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#6B7280] mb-1 block">رقم العملية / رقم المحفظة المحول منها</label>
                    <input
                      type="text"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      placeholder="مثال: 010xxxxxxxx أو رقم الإيصال"
                      className="w-full rounded-xl border border-slate-200 bg-[#F5F7FA] px-4 py-2.5 text-sm font-bold text-[#0D1B3E] placeholder-slate-400 focus:border-[#FDBA74] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload Receipt Image */}
                <div>
                  <label className="text-[11px] font-bold text-[#6B7280] mb-1 block">صورة إيصال التحويل (Screenshot) *</label>
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-[#F5F7FA] p-6 hover:border-blue-300 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                    {receiptBase64 ? (
                      <div className="flex items-center gap-3 text-center">
                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-blue-200">
                          <img src={receiptBase64} alt="Receipt preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 block flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            تم إرفاق الإيصال بنجاح
                          </span>
                          <span className="text-[10px] text-[#6B7280] truncate max-w-[200px] block">
                            {receiptFileName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-[#FDBA74]">
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-[#0D1B3E] block">اضغط لرفع صورة الإيصال أو اسحب الملف هنا</span>
                        <span className="text-[10px] text-[#6B7280] block">PNG, JPG بحد أقصى 5 ميجابايت</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#F97316] py-3.5 text-sm font-black text-[#0D1B3E] hover:bg-[#F97316] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'جارٍ إرسال طلب الشحن...' : 'تأكيد وإرسال طلب الشحن'}
              </button>
            </form>
          )}

          {activeTab === 'voucher' && (
            <form onSubmit={handleVoucherSubmit} className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-5 space-y-2">
                <div className="flex items-center gap-2 text-[#EA580C] font-black text-sm">
                  <Key className="h-4 w-4 text-[#F97316]" />
                  <span>شحن المحفظة الفوري عبر كارت الشحن</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  إذا حصلت على كود شحن أو كارت شحن رصيد من المنصة أو السنتر، اكتب الكود أدناه وسيتم إضافة المبلغ لمحفظتك فوراً دون الحاجة لانتظار مراجعة الإيصال.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[#0D1B3E] block">كود الشحن الفوري (Voucher Code):</label>
                <div className="relative">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="مثال: WALLET-ABCD-1234 أو MATH-XXXX"
                    className="w-full rounded-2xl border-2 border-slate-200 bg-[#F8FAFC] p-4 text-center text-lg font-mono font-black tracking-widest text-[#0D1B3E] uppercase focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key className="h-5 w-5" />
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 block text-center font-medium">
                  تأكد من إدخال الحروف والأرقام كما هي مطبوعة
                </span>
              </div>

              <button
                type="submit"
                disabled={isRedeemingVoucher}
                className="w-full rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] py-3.5 text-sm font-black text-white hover:brightness-105 shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isRedeemingVoucher ? 'جارٍ التحقق وشحن الرصيد...' : 'شحن المحفظة الآن بالرصيد'}</span>
              </button>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-[#F5F7FA] p-8 text-center space-y-2">
                  <Clock className="h-8 w-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-[#0D1B3E]">لا توجد حركات رصيد سابقة</h4>
                  <p className="text-xs text-[#6B7280]">أي عملية شحن أو شراء ستظهر بالتفصيل هنا فور إتمامها.</p>
                </div>
              ) : (
                transactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit';
                  const isPending = tx.status === 'pending';
                  const isApproved = tx.status === 'approved';
                  const isRejected = tx.status === 'rejected';

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F5F7FA] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                            isDeposit
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-blue-50 border-blue-200 text-[#FDBA74]'
                          }`}
                        >
                          {isDeposit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0D1B3E]">
                              {isDeposit ? `شحن رصيد (${tx.methodName || 'محفظة'})` : `شراء ${tx.courseTitle || tx.pdfTitle || 'محتوى'}`}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {isApproved ? 'مكتمل' : isPending ? 'قيد المراجعة' : 'مرفوض'}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#6B7280] block mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span
                          className={`text-sm font-black font-mono block ${
                            isDeposit ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isDeposit ? `+${tx.amount}` : `-${tx.amount}`} ج.م
                        </span>
                        {tx.transactionRefNumber && (
                          <span className="text-[10px] text-[#6B7280] block font-mono">
                            #{tx.transactionRefNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
