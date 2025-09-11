import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DailySchedule, TimeSlot } from '../types';
import useReservationStore from '../reservationStore';

interface ScheduleEditorProps {
  date: Date;
  schedule: DailySchedule | null;
  interviewerId: string;
  onClose: () => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ date, schedule, interviewerId, onClose }) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const addOrUpdateSchedule = useReservationStore(state => state.addOrUpdateSchedule);
  const cancelReservation = useReservationStore(state => state.cancelReservation);

  useEffect(() => {
    setTimeSlots(schedule?.timeSlots || []);
  }, [schedule]);

  const handleAddTimeSlot = () => {
    // Simple 50-minute slot for demonstration
    const [hour, minute] = newSlotStart.split(':').map(Number);
    const startTime = new Date(0, 0, 0, hour, minute);
    const endTime = new Date(startTime.getTime() + 50 * 60000);

    const newTimeSlot: TimeSlot = {
      id: uuidv4(),
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      reservation: null,
    };
    setTimeSlots([...timeSlots, newTimeSlot].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const handleDeleteTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(ts => ts.id !== id));
  };

  const handleCancelReservation = (timeSlotId: string) => {
    if (window.confirm('この予約をキャンセルしますか？')) {
      cancelReservation(interviewerId, format(date, 'yyyy-MM-dd'), timeSlotId);
    }
  };

  const handleSaveSchedule = () => {
    const newSchedule: DailySchedule = {
      date: format(date, 'yyyy-MM-dd'),
      interviewerId,
      timeSlots,
    };
    addOrUpdateSchedule(newSchedule);
    onClose();
  };

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{format(date, 'yyyy年M月d日')} のスケジュール設定</h5>
        <button className="btn-close" onClick={onClose}></button>
      </div>
      <div className="card-body">
        {/* Time Slot List */}
        <ul className="list-group mb-3">
          {timeSlots.map(ts => (
            <li key={ts.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{ts.startTime} - {ts.endTime}</strong>
                {ts.reservation ? (
                  <span className="badge bg-warning text-dark ms-2">予約者: {ts.reservation.userName}</span>
                ) : (
                  <span className="badge bg-success ms-2">空き</span>
                )}
              </div>
              {ts.reservation ? (
                <button className="btn btn-sm btn-outline-warning" onClick={() => handleCancelReservation(ts.id)}>予約キャンセル</button>
              ) : (
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTimeSlot(ts.id)}>削除</button>
              )}
            </li>
          ))}
          {timeSlots.length === 0 && <li className="list-group-item text-muted">予約枠はまだありません。</li>}
        </ul>

        {/* Add Time Slot Form */}
        <div className="input-group mb-3">
          <input type="time" className="form-control" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} />
          <button className="btn btn-outline-primary" onClick={handleAddTimeSlot}>＋ 時間枠を追加</button>
        </div>

      </div>
      <div className="card-footer text-end">
        <button className="btn btn-secondary me-2" onClick={onClose}>キャンセル</button>
        <button className="btn btn-primary" onClick={handleSaveSchedule}>この日のスケジュールを保存</button>
      </div>
    </div>
  );
};

export default ScheduleEditor;