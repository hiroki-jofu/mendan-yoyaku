import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import useReservationStore from '../reservationStore';
import Calendar from '../components/Calendar';
import TimeSlotPicker from '../components/TimeSlotPicker';
import BookingModal from '../components/BookingModal';
import { Reservation, TimeSlot } from '../types';

const TodaysReservations: React.FC<{ selectedInterviewerId: string | null }> = ({ selectedInterviewerId }) => {
  const { schedules } = useReservationStore();

  const todaysReservations = useMemo(() => {
    if (!selectedInterviewerId) return [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const schedule = schedules.find(s => s.date === todayStr && s.interviewerId === selectedInterviewerId);
    if (!schedule) return [];

    return schedule.timeSlots.filter(ts => ts.reservations && ts.reservations.length > 0);
  }, [schedules, selectedInterviewerId]);

  return (
    <div className="card mt-4 mb-4">
      <div className="card-header">
        <h5 className="mb-0">本日の面談予約</h5>
      </div>
      <ul className="list-group list-group-flush">
        {todaysReservations.length > 0 ? (
          todaysReservations.map(r => (
            <li key={r.id} className="list-group-item">
              <strong>{r.startTime}</strong> ({r.reservations?.length || 0} / {r.capacity || 1})
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted">本日の予約はありません。</li>
        )}
      </ul>
    </div>
  );
};


interface ReservationPageProps {
  onGoToSelectPage: () => void;
}

const ReservationPage: React.FC<ReservationPageProps> = ({ onGoToSelectPage }) => {
  const { interviewers, schedules, bookTimeSlot, cancelReservation } = useReservationStore();
  
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

  const handleCancelSlot = (timeSlotId: string, reservationId: string, password?: string) => {
    if (!selectedDate || !selectedInterviewerId) return;
    cancelReservation(selectedInterviewerId, format(selectedDate, 'yyyy-MM-dd'), timeSlotId, reservationId, password);
  };

  const handleConfirmBooking = async (reservation: Omit<Reservation, 'id'>) => {
    if (selectedDate && bookingSlot && selectedInterviewerId) {
      const success = await bookTimeSlot(selectedInterviewerId, format(selectedDate, 'yyyy-MM-dd'), bookingSlot.id, reservation);
      if (success) {
        setBookingSlot(null);
      }
    }
  };

  const highlightedDays = useMemo(() => {
    return schedules
      .filter(s => s.interviewerId === selectedInterviewerId)
      .map(s => {
        const totalCapacity = s.timeSlots.reduce((acc, ts) => acc + (ts.capacity || 1), 0);
        const totalReservations = s.timeSlots.reduce((acc, ts) => acc + (ts.reservations?.length || 0), 0);
        const isFull = totalReservations >= totalCapacity;
        return {
          date: s.date,
          content: isFull ? '満席' : `空きあり`,
          backgroundColor: isFull ? '#ffebee' : '#e0f7fa',
          textColor: isFull ? '#c62828' : '#00796b',
        };
      });
  }, [schedules, selectedInterviewerId]);

  const timeSlotsForSelectedDate = useMemo(() => {
    if (!selectedDate || !selectedInterviewerId) return [];
    const schedule = schedules.find(s => s.date === format(selectedDate!, 'yyyy-MM-dd') && s.interviewerId === selectedInterviewerId);
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
        <button className="btn btn-outline-primary" onClick={onGoToSelectPage}>
          最初の画面に戻る
        </button>
      </header>

      <ul className="nav nav-tabs mb-3">
        {interviewers.map(interviewer => (
          <li className="nav-item" key={interviewer.id}>
            <button 
              className={`nav-link ${selectedInterviewerId === interviewer.id ? 'active' : ''}`}
              onClick={() => !selectedDate && setSelectedInterviewerId(interviewer.id)}
              disabled={!!selectedDate}
            >
              {interviewer.name}
            </button>
          </li>
        ))}
      </ul>

      <main>
        {!selectedDate ? (
          <>
            <TodaysReservations selectedInterviewerId={selectedInterviewerId} />
            <Calendar onDateClick={handleDateClick} highlightedDays={highlightedDays} />
          </>
        ) : (
          <>
            <button className="btn btn-secondary mb-3" onClick={() => setSelectedDate(null)}>カレンダーに戻る</button>
            <TimeSlotPicker 
              timeSlots={timeSlotsForSelectedDate}
              onBookSlot={handleBookSlot}
              onCancelSlot={handleCancelSlot}
            />
          </>
        )}
      </main>

      <BookingModal 
        show={!!bookingSlot}
        timeSlot={bookingSlot}
        onClose={() => setBookingSlot(null)}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};

export default ReservationPage;
