export type GradeLevel = 'grade1' | 'grade2' | 'grade3' | 'all' | string;

export const GradeLevel = {
  GRADE_1: 'grade1',
  GRADE_2: 'grade2',
  GRADE_3: 'grade3',
  GRADE_10: 'grade1',
  GRADE_11: 'grade2',
  GRADE_12: 'grade3',
  ALL: 'all'
} as const;

export interface StudentBadge {
  id: string;
  name?: string;
  title?: string;
  description: string;
  iconName?: string;
  icon?: string;
  earnedAt?: string;
  category?: 'exam' | 'streak' | 'course' | 'special' | 'exams' | 'points' | string;
}

export interface EarnedCertificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  studentName: string;
  certificateCode: string;
  grade?: string;
  percentage?: number;
  examOrUnitName?: string;
  score?: number;
  maxScore?: number;
  date?: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone?: string;
  grade: GradeLevel;
  governorate?: string;
  schoolName?: string;
  gender?: 'male' | 'female';
  passwordHash?: string;
  password?: string;
  avatarUrl?: string;
  avatarId?: string;
  equippedAccessories?: any;
  unlockedAccessories?: any;
  points?: number;
  walletBalance?: number;
  streakCount?: number;
  lastActiveDate?: string;
  lastActiveAt?: string;
  createdAt?: string;
  registeredAt?: string;
  enrolledCourseIds: string[];
  purchasedPdfIds?: string[];
  unlockedPdfIds?: string[];
  registeredDevices?: string[];
  maxDevicesAllowed?: number;
  badges?: StudentBadge[];
  certificates?: EarnedCertificate[];
  earnedCertificates?: EarnedCertificate[];
  deviceFingerprint?: string;
  isBlocked?: boolean;
  wheelSpins?: number;
  courseExpiryDates?: Record<string, string>;
  flashcardProgress?: Record<string, string>;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  durationMinutes?: number;
  videoUrl?: string;
  videoType?: string;
  pdfUrl?: string;
  pdfTitle?: string;
  isFreePreview?: boolean;
  order?: number;
  courseId?: string;
  unitId?: string;
  quizId?: string;
  homeworkNotes?: string;
  isCompleted?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order?: number;
  courseId?: string;
  unitExamId?: string;
}

export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  grade: GradeLevel;
  price: number;
  thumbnail: string;
  instructorName?: string;
  units: Unit[];
  createdAt?: string;
  isPublished?: boolean;
  reviews?: CourseReview[];
  rating?: number;
  reviewCount?: number;
  ratingCount?: number;
  validityDays?: number;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  image?: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points?: number;
}

export interface QuizExam {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  lessonId?: string;
  unitId?: string;
  type?: string;
  grade: GradeLevel;
  durationMinutes: number;
  passingPercentage: number;
  maxAttempts?: number;
  questions: Question[];
  createdAt?: string;
  isPublished?: boolean;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  courseId?: string;
  score: number;
  totalPoints?: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, number>;
  completedAt?: string;
  submittedAt?: string;
  timeSpentSeconds?: number;
  timeTakenSeconds?: number;
  maxScore?: number;
}

export interface StudentLessonProgress {
  id?: string;
  studentId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  lastWatchedPositionSeconds?: number;
  updatedAt?: string;
  completedAt?: string;
  lastViewedAt?: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  type?: string;
  targetType: 'course' | 'pdf' | 'wallet' | string;
  targetId?: string;
  targetTitle?: string;
  targetName?: string;
  valueAmount?: number;
  validityDays?: number;
  maxDevices?: number;
  isUsed: boolean;
  usedByStudentId?: string;
  usedByStudentName?: string;
  usedAt?: string;
  createdAt: string;
}

export type ActivationKey = ActivationCode;

export interface PdfCategory {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  grade?: GradeLevel;
  order?: number;
}

export interface PdfFile {
  id: string;
  title: string;
  description?: string;
  grade: GradeLevel;
  pdfUrl?: string;
  fileUrl?: string;
  url?: string;
  price: number;
  pageCount?: number;
  fileSizeMb?: number;
  fileSize?: string | number;
  categoryId?: string;
  categoryTitle?: string;
  category?: string;
  associatedCourseId?: string;
  isFree?: boolean;
  isLocked?: boolean;
  downloadCount?: number;
  createdAt?: string;
}

export type PdfMaterial = PdfFile;

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'alert' | string;
  createdAt: string;
  isRead?: boolean;
  studentId?: string;
  target?: string;
  targetGrade?: string;
  targetCourseId?: string;
  targetStudentId?: string;
  sender?: string;
  priority?: string;
  readBy?: string[];
  linkUrl?: string;
}

export interface PlatformSettings {
  platformName?: string;
  teacherName?: string;
  teacherTitle?: string;
  teacherPhone?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  telegramChannel?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  welcomeVideoUrl?: string;
  allowRegistrations?: boolean;
  maintenanceMode?: boolean;
  instructorName?: string;
  instructorTitle?: string;
  instructorPhone?: string;
  instructorPhotoUrl?: string;
  adminPin?: string;
  maxDevicesPerStudent?: number;
  ministryExamDate?: string;
  examDate?: string;
  homeIntroVideoUrl?: string;
  homeVideoPlacement?: string;
}

export interface WeaknessPoint {
  id: string;
  topicTitle?: string;
  unitTitle?: string;
  examId?: string;
  examTitle?: string;
  questionId?: string;
  conceptName?: string;
  chapterOrUnit?: string;
  errorCount?: number;
  frequency?: number;
  recommendationMsg?: string;
  suggestedAction?: string;
  recommendedLessonId?: string;
  suggestedLessonId?: string;
  suggestedLessonTitle?: string;
  recommendedCourseId?: string;
  errorReason?: string;
  lastMissedAt?: string;
  isResolved?: boolean;
}

export interface StudentWeaknessProfile {
  studentId: string;
  weaknessPoints?: WeaknessPoint[];
  weakPoints?: WeaknessPoint[];
  masteredConcepts?: string[];
  totalQuestionsAttempted?: number;
  totalErrors?: number;
  lastAnalysisDate?: string;
  updatedAt?: string;
}

export interface WeeklyChallengeQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points?: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  grade: GradeLevel;
  rewardPoints?: number;
  bonusPoints?: number;
  rewardWalletBalance?: number;
  startDate?: string;
  endDate?: string;
  deadlineDate?: string;
  questionCount?: number;
  isCompleted?: boolean;
  isPublished?: boolean;
  questions?: WeeklyChallengeQuestion[];
}

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  grade: GradeLevel;
  governorate?: string;
  points: number;
  rank?: number;
  passedExamsCount?: number;
  weeklyScore?: number;
  completedExamsCount?: number;
  lastActive?: string;
  equippedAccessories?: string[];
  badges?: StudentBadge[];
}

export interface AIChatMessage {
  id: string;
  sender?: 'user' | 'ai' | string;
  role?: 'user' | 'model' | 'ai' | string;
  text: string;
  imageUrl?: string;
  lessonId?: string;
  courseId?: string;
  timestamp: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'vodafone' | 'instapay' | 'card' | 'code' | 'vodafone_cash' | 'fawry' | string;
  accountDetails?: string;
  accountNumber?: string;
  accountName?: string;
  instructions?: string;
  order?: number;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  studentId: string;
  studentName?: string;
  studentPhone?: string;
  methodId?: string;
  methodName?: string;
  courseTitle?: string;
  pdfTitle?: string;
  transactionRefNumber?: string;
  processedAt?: string;
  amount: number;
  type: 'deposit' | 'purchase' | 'reward' | 'refund' | string;
  description?: string;
  status: 'completed' | 'pending' | 'rejected' | string;
  referenceCode?: string;
  receiptImageUrl?: string;
  createdAt: string;
}

export interface AdminAuditLogEntry {
  id: string;
  adminName: string;
  actionType: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
  description?: string;
  targetName?: string;
  adminIdentifier?: string;
  action?: string;
  category?: string;
}

export interface LessonComment {
  id: string;
  lessonId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentGrade?: string;
  content: string;
  rating?: number;
  adminReply?: string;
  adminRepliedAt?: string;
  replyContent?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
}

export interface SmartStudyRecommendation {
  id: string;
  studentId: string;
  title: string;
  reason: string;
  actionText?: string;
  targetView?: string;
  targetParams?: any;
  priority?: 'high' | 'medium' | 'low' | string;
  recommendedLessonId?: string;
  recommendedLessonTitle?: string;
  recommendedPdfId?: string;
  recommendedPdfTitle?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle?: string;
  gradeLevel?: string;
  lessonId?: string;
  dueDate?: string;
  deadline?: string;
  pdfUrl?: string;
  maxScore?: number;
  maxGrade?: number;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentGrade?: string;
  grade?: string;
  fileUrl?: string;
  solutionFiles?: string[];
  textAnswer?: string;
  studentNotes?: string;
  teacherNotes?: string;
  teacherAnnotatedData?: string;
  feedbackStatus?: string;
  annotatedPdfData?: string;
  submittedAt: string;
  score?: number;
  maxGrade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | string;
  courseId?: string;
  submissionType?: string;
}

