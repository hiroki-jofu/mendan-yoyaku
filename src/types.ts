// 既存の面談記録アプリの型
export interface InterviewRecord {
  id: string; // 各記録の一意なID
  studentName: string;
  studentGrade: string;
  studentDepartment: string;
  category: string;
  content: string;
}

export interface InterviewData {
  date: string;
  records: InterviewRecord[];
}

// --- 面談予約アプリで追加する型 ---

export interface Interviewer {
  id: string;
  name: string;
  title: string;
  email: string;
}

export interface Reservation {
  id: string;
  studentName: string;
  grade: string;
  affiliation: string;
  email?: string;
  notes?: string;
  password?: string;
}

export interface TimeSlot {
  id: string;
  title?: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  reservations?: Reservation[];
}

export interface DailySchedule {
  date: string;
  interviewerId: string;
  timeSlots: TimeSlot[];
}

export interface ReservationState {
  interviewers: Interviewer[];
  schedules: DailySchedule[];
  copiedSlots: Omit<TimeSlot, 'id' | 'reservations'>[] | null;
  isInitialized: boolean;
  initializeApp: () => Promise<void>;
  addOrUpdateSchedule: (schedule: DailySchedule) => void;
  updateInterviewer: (interviewer: Interviewer) => void;
  bookTimeSlot: (interviewerId: string, date: string, timeSlotId: string, reservation: Omit<Reservation, 'id'>) => Promise<boolean>;
  cancelReservation: (interviewerId: string, date: string, timeSlotId: string, reservationId: string, password?: string) => Promise<boolean>;
  setCopiedSlots: (slots: Omit<TimeSlot, 'id' | 'reservations'>[]) => void;
}
