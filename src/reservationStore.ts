import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DailySchedule, Interviewer, Reservation, TimeSlot, ReservationState } from './types';
import { dbPromise, SCHEDULE_STORE_NAME, INTERVIEWER_STORE_NAME } from './database';

const initialInterviewers: Interviewer[] = [
  { id: 'interviewer-1', name: '山田 太郎' },
  { id: 'interviewer-2', name: '佐藤 花子' },
  { id: 'interviewer-3', name: '鈴木 一郎' },
];

const saveScheduleToDB = async (schedule: DailySchedule) => {
  try {
    const db = await dbPromise;
    await db.put(SCHEDULE_STORE_NAME, schedule);
  } catch (error) {
    console.error('Failed to save schedule to IndexedDB:', error);
  }
};

const loadSchedulesFromDB = async (): Promise<DailySchedule[]> => {
  try {
    const db = await dbPromise;
    return await db.getAll(SCHEDULE_STORE_NAME);
  } catch (error) {
    console.error('Failed to load schedules from IndexedDB:', error);
    return [];
  }
};

const saveInterviewersToDB = async (interviewers: Interviewer[]) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction(INTERVIEWER_STORE_NAME, 'readwrite');
    await Promise.all(interviewers.map(interviewer => tx.store.put(interviewer)));
    await tx.done;
  } catch (error) {
    console.error('Failed to save interviewers to IndexedDB:', error);
  }
};

const loadInterviewersFromDB = async (): Promise<Interviewer[]> => {
  try {
    const db = await dbPromise;
    const interviewers = await db.getAll(INTERVIEWER_STORE_NAME);
    if (interviewers.length === 0) {
      await saveInterviewersToDB(initialInterviewers);
      return initialInterviewers;
    }
    return interviewers;
  } catch (error) {
    console.error('Failed to load interviewers from IndexedDB:', error);
    await saveInterviewersToDB(initialInterviewers);
    return initialInterviewers;
  }
};

const useReservationStore = create<ReservationState>((set, get) => ({
  interviewers: [],
  schedules: [],
  copiedSlots: null,
  isInitialized: false,

  initializeApp: async () => {
    const interviewers = await loadInterviewersFromDB();
    const schedules = await loadSchedulesFromDB();
    set({ interviewers, schedules, isInitialized: true });
  },

  addOrUpdateSchedule: (schedule) => {
    const { schedules } = get();
    const index = schedules.findIndex(s => s.date === schedule.date && s.interviewerId === schedule.interviewerId);
    let updatedSchedules;
    if (index !== -1) {
      updatedSchedules = [...schedules];
      updatedSchedules[index] = schedule;
    } else {
      updatedSchedules = [...schedules, schedule];
    }
    set({ schedules: updatedSchedules });
    saveScheduleToDB(schedule);
  },

  bookTimeSlot: async (interviewerId, date, timeSlotId, reservationData) => {
    const { schedules, addOrUpdateSchedule } = get();
    const schedule = schedules.find(s => s.date === date && s.interviewerId === interviewerId);
    if (!schedule) return false;

    const timeSlot = schedule.timeSlots.find(ts => ts.id === timeSlotId);
    if (!timeSlot) return false;

    const newReservation: Reservation = { ...reservationData, id: uuidv4() };
    const currentReservations = timeSlot.reservations || [];

    // For single-person slots (capacity is undefined or 1)
    if (!timeSlot.capacity || timeSlot.capacity <= 1) {
      if (currentReservations.length > 0) {
        alert('この枠は既に予約で埋まっています。');
        return false;
      }
      timeSlot.reservations = [newReservation];
    } else { // For multi-person slots
      if (currentReservations.length >= timeSlot.capacity) {
        alert('この枠は定員に達しています。');
        return false;
      }
      timeSlot.reservations = [...currentReservations, newReservation];
    }

    addOrUpdateSchedule({ ...schedule });
    return true;
  },

  cancelReservation: async (interviewerId, date, timeSlotId, reservationId, password) => {
    const { schedules, addOrUpdateSchedule } = get();
    const schedule = schedules.find(s => s.date === date && s.interviewerId === interviewerId);
    if (!schedule) return false;

    const timeSlot = schedule.timeSlots.find(ts => ts.id === timeSlotId);
    if (!timeSlot || !timeSlot.reservations) return false;

    const reservationToCancel = timeSlot.reservations.find(r => r.id === reservationId);
    if (!reservationToCancel) {
      alert('キャンセル対象の予約が見つかりません。');
      return false;
    }

    // Admin cancellation (no password needed)
    if (password === undefined) {
      timeSlot.reservations = timeSlot.reservations.filter(r => r.id !== reservationId);
      addOrUpdateSchedule({ ...schedule });
      alert('予約をキャンセルしました。(管理者)');
      return true;
    }

    // User cancellation (password needed)
    if (reservationToCancel.password === password) {
      timeSlot.reservations = timeSlot.reservations.filter(r => r.id !== reservationId);
      addOrUpdateSchedule({ ...schedule });
      alert('予約をキャンセルしました。');
      return true;
    } else {
      alert('パスワードが違います。');
      return false;
    }
  },

  setCopiedSlots: (slots) => set({ copiedSlots: slots }),

}));

export default useReservationStore;
