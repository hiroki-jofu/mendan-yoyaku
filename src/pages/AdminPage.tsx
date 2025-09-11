import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import useReservationStore from '../reservationStore';
import Calendar from '../components/Calendar';
import ScheduleEditor from '../components/ScheduleEditor';
import { DailySchedule } from '../types';

const AdminPage: React.FC = () => {
  const { interviewers, schedules } = useReservationStore();
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string | null>(interviewers[0]?.id || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const highlightedDays = useMemo(() => {
    if (!selectedInterviewerId) return [];
    return schedules
      .filter(s => s.interviewerId === selectedInterviewerId)
      .map(s => {
        const availableSlots = s.timeSlots.filter(ts => !ts.reservation).length;
        const totalSlots = s.timeSlots.length;
        return {
          date: s.date,
          content: `予約 ${totalSlots - availableSlots}/${totalSlots}`,
          backgroundColor: availableSlots > 0 ? '#e0f7fa' : '#fff9c4',
        };
      });
  }, [schedules, selectedInterviewerId]);

  const selectedSchedule = useMemo(() => {
    if (!selectedDate || !selectedInterviewerId) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return schedules.find(s => s.date === dateStr && s.interviewerId === selectedInterviewerId) || null;
  }, [schedules, selectedDate, selectedInterviewerId]);

  if (!selectedInterviewerId) {
    return <div>担当者が設定されていません。</div>;
  }

  return (
    <div className="container py-4">
      <header className="pb-3 mb-4 border-bottom">
        <h1>管理用ページ</h1>
        <p>面談の予約枠を管理します。</p>
      </header>

      {/* Interviewer Tabs */}
      <ul className="nav nav-tabs mb-3">
        {interviewers.map(interviewer => (
          <li className="nav-item" key={interviewer.id}>
            <button 
              className={`nav-link ${selectedInterviewerId === interviewer.id ? 'active' : ''}`}
              onClick={() => setSelectedInterviewerId(interviewer.id)}
            >
              {interviewer.name}
            </button>
          </li>
        ))}
      </ul>

      <main>
        {!selectedDate ? (
          <Calendar onDateClick={handleDateClick} highlightedDays={highlightedDays} />
        ) : (
          <div ref={editorRef}>
            <ScheduleEditor 
              date={selectedDate} 
              schedule={selectedSchedule}
              interviewerId={selectedInterviewerId}
              onClose={() => setSelectedDate(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;