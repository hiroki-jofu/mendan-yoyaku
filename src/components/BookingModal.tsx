import React from 'react';
import { TimeSlot, ReservationUser } from '../types';

interface BookingModalProps {
  show: boolean;
  timeSlot: TimeSlot | null;
  user: ReservationUser;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ show, timeSlot, user, onClose, onConfirm }) => {
  const [notes, setNotes] = React.useState('');

  if (!show || !timeSlot) return null;

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes('');
  };

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">予約の確認</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>お名前:</strong> {user.name}</p>
            <p><strong>時間:</strong> {timeSlot.startTime} - {timeSlot.endTime}</p>
            <div className="mb-3">
              <label htmlFor="notes" className="form-label">連絡事項 (任意)</label>
              <textarea 
                id="notes" 
                className="form-control" 
                rows={3} 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>
            <p className="text-muted">この内容で予約を確定しますか？</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>キャンセル</button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>予約を確定する</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
