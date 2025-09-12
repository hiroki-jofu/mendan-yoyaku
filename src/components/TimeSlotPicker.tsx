import React from 'react';
import { TimeSlot } from '../types';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  onBookSlot: (timeSlotId: string) => void;
  onCancelSlot: (timeSlotId: string, reservationId: string, password?: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ timeSlots, onBookSlot, onCancelSlot }) => {

  const handleCancelClick = (ts: TimeSlot) => {
    const studentName = prompt('予約のキャンセルには、予約時に入力した氏名とパスワードが必要です。\n氏名を入力してください。');
    if (!studentName) return;

    const password = prompt('パスワード(4桁)を入力してください。');
    if (!password) return;

    const reservationToCancel = ts.reservations?.find(r => r.studentName === studentName && r.password === password);

    if (reservationToCancel) {
      onCancelSlot(ts.id, reservationToCancel.id, password);
    } else {
      alert('入力された氏名とパスワードに一致する予約が見つかりませんでした。');
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="mb-0">ご希望の時間を選択してください</h5>
      </div>
      <div className="list-group list-group-flush">
        {timeSlots.length > 0 ? (
          timeSlots.map(ts => {
            const reservationCount = ts.reservations?.length || 0;
            const capacity = ts.capacity || 1;
            const isFull = reservationCount >= capacity;

            return (
              <div key={ts.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span>{ts.startTime} - {ts.endTime}</span>
                  {ts.title && <span className="badge bg-info text-dark ms-2">{ts.title}</span>}
                  <span className="badge bg-light text-dark ms-2">予約 {reservationCount} / {capacity}</span>
                </div>
                <div>
                  {isFull ? (
                    <span className="badge bg-secondary me-2">満席</span>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => onBookSlot(ts.id)}>予約する</button>
                  )}
                  {reservationCount > 0 && 
                    <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleCancelClick(ts)}>キャンセル</button>
                  }
                </div>
              </div>
            )
          })
        ) : (
          <div className="list-group-item">予約可能な時間枠はありません。</div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotPicker;