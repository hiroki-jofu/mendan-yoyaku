import React, { useMemo } from 'react';
import { format, isFuture, isPast } from 'date-fns';
import useReservationStore from '../reservationStore';
import { ReservationUser } from '../types';

interface MyReservationsProps {
  user: ReservationUser;
}

const MyReservations: React.FC<MyReservationsProps> = ({ user }) => {
  const { schedules, interviewers, cancelReservation } = useReservationStore();

  const myReservations = useMemo(() => {
    const allReservations: any[] = [];
    schedules.forEach(schedule => {
      const interviewer = interviewers.find(i => i.id === schedule.interviewerId);
      schedule.timeSlots.forEach(ts => {
        if (ts.reservation?.userId === user.id) {
          allReservations.push({
            ...ts,
            date: schedule.date,
            interviewerName: interviewer?.name || '不明',
            interviewerId: schedule.interviewerId,
          });
        }
      });
    });
    return allReservations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [schedules, user.id, interviewers]);

  const upcomingReservations = myReservations.filter(r => isFuture(new Date(r.date)));
  const pastReservations = myReservations.filter(r => isPast(new Date(r.date)));

  const handleCancel = (reservation: any) => {
    if (window.confirm(`${reservation.date} ${reservation.startTime} の予約をキャンセルしますか？`)) {
      cancelReservation(reservation.interviewerId, reservation.date, reservation.id);
    }
  }

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="mb-0">{user.name}さんの予約一覧</h5>
      </div>
      <div className="card-body">
        <h6>今後の予約</h6>
        {upcomingReservations.length > 0 ? (
          <ul className="list-group">
            {upcomingReservations.map(r => (
              <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{format(new Date(r.date), 'yyyy/MM/dd')} {r.startTime}</strong>
                  <span className="ms-2">担当: {r.interviewerName}</span>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(r)}>キャンセル</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">今後の予約はありません。</p>
        )}

        <h6 className="mt-4">過去の予約</h6>
        {pastReservations.length > 0 ? (
          <ul className="list-group">
            {pastReservations.map(r => (
              <li key={r.id} className="list-group-item">
                <strong>{format(new Date(r.date), 'yyyy/MM/dd')} {r.startTime}</strong>
                <span className="ms-2">担当: {r.interviewerName}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">過去の予約はありません。</p>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
