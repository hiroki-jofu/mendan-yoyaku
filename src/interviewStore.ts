import { create } from 'zustand';
import { InterviewData, InterviewRecord } from './types';
import { dbPromise, INTERVIEW_STORE_NAME } from './database';

const DATA_KEY = 'all-interviews';

// --- Data Access Functions --- //
const saveDataToDB = async (data: InterviewData[]) => {
  try {
    const db = await dbPromise;
    await db.put(INTERVIEW_STORE_NAME, data, DATA_KEY);
  } catch (error) {
    console.error('Failed to save interview data to IndexedDB:', error);
  }
};

const loadDataFromDB = async (): Promise<InterviewData[]> => {
  try {
    const db = await dbPromise;
    return (await db.get(INTERVIEW_STORE_NAME, DATA_KEY)) || [];
  } catch (error) {
    console.error('Failed to load interview data from IndexedDB:', error);
    return [];
  }
};

// --- Zustand Store --- //

interface InterviewState {
  interviews: InterviewData[];
  isInitialized: boolean;
  initializeApp: () => Promise<void>;
  addInterview: (date: string, records: InterviewRecord[]) => void;
  updateInterview: (date: string, records: InterviewRecord[]) => void;
  deleteInterview: (date: string) => void;
  deleteAllInterviews: () => void;
  setInterviews: (data: InterviewData[]) => void;
}

const useInterviewStore = create<InterviewState>((set, get) => ({
  interviews: [],
  isInitialized: false,

  initializeApp: async () => {
    const interviews = await loadDataFromDB();
    set({ interviews, isInitialized: true });
  },

  addInterview: (date, records) => {
    const { interviews } = get();
    const updatedInterviews = [...interviews, { date, records }];
    set({ interviews: updatedInterviews });
    saveDataToDB(updatedInterviews);
  },

  updateInterview: (date, records) => {
    const { interviews } = get();
    const updatedInterviews = interviews.map((i) => (i.date === date ? { ...i, records } : i));
    set({ interviews: updatedInterviews });
    saveDataToDB(updatedInterviews);
  },

  deleteInterview: (date) => {
    const { interviews } = get();
    const updatedInterviews = interviews.filter((i) => i.date !== date);
    set({ interviews: updatedInterviews });
    saveDataToDB(updatedInterviews);
  },

  deleteAllInterviews: () => {
    set({ interviews: [] });
    saveDataToDB([]);
  },

  setInterviews: (data) => {
    set({ interviews: data });
    saveDataToDB(data);
  },
}));

export default useInterviewStore;
