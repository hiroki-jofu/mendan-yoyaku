import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import useReservationStore from '../reservationStore';
import Calendar from '../components/Calendar';
import TimeSlotPicker from '../components/TimeSlotPicker';
import BookingModal from '../components/BookingModal';
import MyReservations from '../components/MyReservations';
import { ReservationUser, TimeSlot } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock users for demonstration
const mockUsers: ReservationUser[] = [
  { id: 'user-1', name: '田中 聡', email: 'tanaka@example.com' },
  { id: 'user-2', name: '中村 あゆみ', email: 'nakamura@example.com' },
  { id: 'user-3', name: '渡辺 健一', email: 'watanabe@example.com' },
];

const ReservationPage: React.FC = () => {
  const { interviewers, schedules, bookTimeSlot } = useReservationStore();
  
  const [currentUser, setCurrentUser] = useState<ReservationUser>(mockUsers[0]);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string | null>(interviewers[0]?.id || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingSlot, setBookingSlot] = useState<TimeSlot | null>(null);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleBookSlot = (timeSlotId: string) => {
    const schedule = schedules.find(s => s.date === format(selectedDate!, 'yyyy-MM-dd') && s.interviewerId === selectedInterviewerId);
    const slot = schedule?.timeSlots.find(ts => ts.id === timeSlotId);
    if (slot) {
      setBookingSlot(slot);
    }
  };

  const handleConfirmBooking = (notes: string) => {
    if (currentUser && selectedDate && bookingSlot && selectedInterviewerId) {
      bookTimeSlot(selectedInterviewerId, format(selectedDate, 'yyyy-MM-dd'), bookingSlot.id, {
        id: uuidv4(),
        userId: currentUser.id,
        userName: currentUser.name,
        notes,
      });
    }
    setBookingSlot(null);
    setSelectedDate(null);
  };

  const highlightedDays = useMemo(() => {
    return schedules
      .filter(s => s.interviewerId === selectedInterviewerId)
      .map(s => {
        const availableSlots = s.timeSlots.filter(ts => !ts.reservation).length;
        return {
          date: s.date,
          content: availableSlots > 0 ? `${availableSlots}件空き` : '満席',
          backgroundColor: availableSlots > 0 ? '#e0f7fa' : '#ffebee',
          textColor: availableSlots > 0 ? '#00796b' : '#c62828',
        };
      });
  }, [schedules, selectedInterviewerId]);

  const timeSlotsForSelectedDate = useMemo(() => {
    if (!selectedDate || !selectedInterviewerId) return [];
    const schedule = schedules.find(s => s.date === format(selectedDate, 'yyyy-MM-dd') && s.interviewerId === selectedInterviewerId);
    return schedule?.timeSlots || [];
  }, [schedules, selectedDate, selectedInterviewerId]);

  if (!selectedInterviewerId) {
    return (
      <div className="container py-4">
        <p>担当者を読み込んでいます...</p>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <header className="pb-3 mb-4 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h1>予約ページ</h1>
          <p className="mb-0">ご希望の面談日時を選択してください。</p>
        </div>
        <div className="col-md-3 text-end">
            <label htmlFor="user-select" className="form-label">予約者を選択</label>
            <select id="user-select" className="form-select" value={currentUser.id} onChange={e => setCurrentUser(mockUsers.find(u => u.id === e.target.value)!)}>
              {mockUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
        </div>
      </header>

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
          <>
            <TimeSlotPicker 
              timeSlots={timeSlotsForSelectedDate}
              onBookSlot={handleBookSlot}
            />
            <MyReservations user={currentUser} />
          </>
        )}
      </main>

      <BookingModal 
        show={!!bookingSlot}
        timeSlot={bookingSlot}
        user={currentUser}
        onClose={() => setBookingSlot(null)}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};

export default ReservationPage;