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

// 面談担当者
export interface Interviewer {
  id: string;
  name: string;
}

// 予約を入れるユーザー
export interface ReservationUser {
  id: string;
  name: string;
  email: string;
}

// 予約情報
export interface Reservation {
  id: string;
  userId: string; // 予約したユーザーのID
  userName: string; // 予約したユーザーの名前
  notes?: string; // 予約時のメモなど
}

// 時間枠
export interface TimeSlot {
  id: string;
  startTime: string; // "HH:mm" 形式 (e.g., "10:00")
  endTime: string;   // "HH:mm" 形式 (e.g., "10:50")
  reservation?: Reservation | null; // 予約が入っている場合はここに情報が入る
}

// 特定の日の特定の面談担当者のスケジュール
export interface DailySchedule {
  date: string; // "yyyy-MM-dd" 形式
  interviewerId: string;
  timeSlots: TimeSlot[];
}