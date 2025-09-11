import { create } from 'zustand';
import { DailySchedule, Interviewer, Reservation } from './types';
import { dbPromise, SCHEDULE_STORE_NAME, INTERVIEWER_STORE_NAME } from './database';

// --- Mock Data ---
const initialInterviewers: Interviewer[] = [
  { id: 'interviewer-1', name: '山田 太郎' },
  { id: 'interviewer-2', name: '佐藤 花子' },
  { id: 'interviewer-3', name: '鈴木 一郎' },
];

// --- Data Access Functions --- //
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

// --- Zustand Store --- //

interface ReservationState {
  interviewers: Interviewer[];
  schedules: DailySchedule[];
  isInitialized: boolean;
  initializeApp: () => Promise<void>;
  addOrUpdateSchedule: (schedule: DailySchedule) => void;
  bookTimeSlot: (interviewerId: string, date: string, timeSlotId: string, reservation: Reservation) => void;
  cancelReservation: (interviewerId: string, date: string, timeSlotId: string) => void;
}

const useReservationStore = create<ReservationState>((set, get) => ({
  interviewers: [],
  schedules: [],
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

  bookTimeSlot: (interviewerId, date, timeSlotId, reservation) => {
    const { schedules } = get();
    const schedule = schedules.find(s => s.date === date && s.interviewerId === interviewerId);
    if (schedule) {
      const updatedTimeSlots = schedule.timeSlots.map(ts =>
        ts.id === timeSlotId ? { ...ts, reservation } : ts
      );
      const updatedSchedule = { ...schedule, timeSlots: updatedTimeSlots };
      get().addOrUpdateSchedule(updatedSchedule);
    }
  },

  cancelReservation: (interviewerId, date, timeSlotId) => {
    const { schedules } = get();
    const schedule = schedules.find(s => s.date === date && s.interviewerId === interviewerId);
    if (schedule) {
      const updatedTimeSlots = schedule.timeSlots.map(ts =>
        ts.id === timeSlotId ? { ...ts, reservation: null } : ts
      );
      const updatedSchedule = { ...schedule, timeSlots: updatedTimeSlots };
      get().addOrUpdateSchedule(updatedSchedule);
    }
  },

}));

export default useReservationStore;