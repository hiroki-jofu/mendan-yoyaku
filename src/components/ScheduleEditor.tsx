import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DailySchedule, TimeSlot } from '../types';
import useReservationStore from '../reservationStore';

const CATEGORIES = ['通常', '模擬授業', '集団討論'];

interface ScheduleEditorProps {
  date: Date;
  schedule: DailySchedule | null;
  interviewerId: string;
  onClose: () => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ date, schedule, interviewerId, onClose }) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [slotDuration, setSlotDuration] = useState(45);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [capacity, setCapacity] = useState(1);

  const { addOrUpdateSchedule, cancelReservation, copiedSlots, setCopiedSlots } = useReservationStore();

  const isGroupCategory = category === '模擬授業' || category === '集団討論';

  useEffect(() => {
    setTimeSlots(schedule?.timeSlots || []);
  }, [schedule]);

  const handleAddTimeSlot = () => {
    const [hour, minute] = newSlotStart.split(':').map(Number);
    const startTime = new Date(0, 0, 0, hour, minute);
    const endTime = new Date(startTime.getTime() + slotDuration * 60000);

    const newTimeSlot: TimeSlot = {
      id: uuidv4(),
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      title: category,
      reservations: [],
      capacity: isGroupCategory ? capacity : 1,
    };
    setTimeSlots([...timeSlots, newTimeSlot].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const handleDeleteTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(ts => ts.id !== id));
  };

  const handleCancelReservation = (timeSlotId: string, reservationId: string) => {
    if (window.confirm('この予約をキャンセルしますか？(管理者権限)')) {
      cancelReservation(interviewerId, format(date, 'yyyy-MM-dd'), timeSlotId, reservationId);
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

  const handleCopySlots = () => {
    const slotsToCopy = timeSlots.map(({ id, reservations, ...rest }) => rest);
    setCopiedSlots(slotsToCopy);
    alert(`${timeSlots.length}件の予約枠をコピーしました。`);
  };

  const handlePasteSlots = () => {
    if (copiedSlots) {
      const newSlots: TimeSlot[] = copiedSlots.map(slot => ({ ...slot, id: uuidv4(), reservations: [] }));
      setTimeSlots([...timeSlots, ...newSlots].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{format(date, 'yyyy年M月d日')} のスケジュール設定</h5>
        <button className="btn-close" onClick={onClose}></button>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleCopySlots} disabled={timeSlots.length === 0}>コピー</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={handlePasteSlots} disabled={!copiedSlots}>貼り付け</button>
        </div>

        <ul className="list-group mb-3">
          {timeSlots.map(ts => (
            <li key={ts.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{ts.startTime} - {ts.endTime}</strong>
                  <span className="badge bg-info text-dark ms-2">{ts.title}</span>
                  <span className="badge bg-light text-dark ms-2">予約 {ts.reservations?.length || 0} / {ts.capacity || 1}</span>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTimeSlot(ts.id)}>削除</button>
              </div>
              {(ts.reservations?.length || 0) > 0 && (
                <div className="mt-3">
                  <h6>予約情報</h6>
                  <ul className="list-group list-group-flush">
                    {ts.reservations?.map((r) => (
                      <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{r.studentName} ({r.grade}, {r.affiliation})</span>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleCancelReservation(ts.id, r.id)}>キャンセル</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
          {timeSlots.length === 0 && <li className="list-group-item text-muted">予約枠はまだありません。</li>}
        </ul>

        <div className="card p-3">
          <h6>新しい予約枠の追加</h6>
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label">開始時間</label>
              <input type="time" className="form-control" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">面談時間(分)</label>
              <input type="number" className="form-control" value={slotDuration} onChange={e => setSlotDuration(parseInt(e.target.value, 10))} />
            </div>
            <div className="col-md-3">
              <label className="form-label">カテゴリー</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {isGroupCategory && (
              <div className="col-md-2">
                <label className="form-label">受付人数</label>
                <input type="number" className="form-control" value={capacity} onChange={e => setCapacity(parseInt(e.target.value, 10))} />
              </div>
            )}
            <div className="col-md-2">
              <button className="btn btn-primary w-100 mt-3" onClick={handleAddTimeSlot}>＋ 追加</button>
            </div>
          </div>
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