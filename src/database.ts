import { openDB, DBSchema } from 'idb';
import { InterviewData, DailySchedule, Interviewer } from './types';

const DB_NAME = 'diary-app-db';
const DB_VERSION = 2;

export const INTERVIEW_STORE_NAME = 'interviews';
export const SCHEDULE_STORE_NAME = 'schedules';
export const INTERVIEWER_STORE_NAME = 'interviewers';

interface AppDB extends DBSchema {
  [INTERVIEW_STORE_NAME]: {
    key: string;
    value: InterviewData[];
  };
  [SCHEDULE_STORE_NAME]: {
    key: [string, string]; // [date, interviewerId]
    value: DailySchedule;
  };
  [INTERVIEWER_STORE_NAME]: {
    key: string;
    value: Interviewer;
  };
}

export const dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore(INTERVIEW_STORE_NAME);
    }
    if (oldVersion < 2) {
      if (!db.objectStoreNames.contains(SCHEDULE_STORE_NAME)) {
        db.createObjectStore(SCHEDULE_STORE_NAME, { keyPath: ['date', 'interviewerId'] });
      }
      if (!db.objectStoreNames.contains(INTERVIEWER_STORE_NAME)) {
        db.createObjectStore(INTERVIEWER_STORE_NAME, { keyPath: 'id' });
      }
    }
  },
});
