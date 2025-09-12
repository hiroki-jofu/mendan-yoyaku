import React, { useState, useEffect } from 'react';
import { TimeSlot, Reservation } from '../types';

interface BookingModalProps {
  show: boolean;
  timeSlot: TimeSlot | null;
  onClose: () => void;
  onConfirm: (reservation: Omit<Reservation, 'id'>) => void;
}

const AFFILIATION_OPTIONS = [
  '教育学部',
  '人文学部',
  '理学部',
  '工学部',
  '都市デザイン学部',
  '人文社会芸術総合研究科',
  '理工学研究科',
  '教職実践開発研究科',
  'その他',
];

const GRADE_OPTIONS = ['1年', '2年', '3年', '4年'];

const BookingModal: React.FC<BookingModalProps> = ({ show, timeSlot, onClose, onConfirm }) => {
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (show) {
      setStudentName('');
      setGrade('');
      setAffiliation('');
      setEmail('');
      setNotes('');
      setPassword('');
    }
  }, [show]);

  if (!show || !timeSlot) return null;

  const handleConfirm = () => {
    if (!studentName || !grade || !affiliation) {
      alert('氏名、学年、所属は必須です。');
      return;
    }
    if (!/^[0-9]{4}$/.test(password)) {
      alert('パスワードは半角数字4桁で入力してください。');
      return;
    }
    const reservation: Omit<Reservation, 'id'> = {
      studentName,
      grade,
      affiliation,
      email,
      notes,
      password,
    };
    onConfirm(reservation);
  };

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">予約入力</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>時間:</strong> {timeSlot.startTime} - {timeSlot.endTime}</p>
            {timeSlot.title && <p><strong>内容:</strong> {timeSlot.title}</p>}
            
            <div className="card mb-3">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">氏名</label>
                    <input type="text" className="form-control" value={studentName} onChange={e => setStudentName(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">学年</label>
                    <select className="form-select" value={grade} onChange={e => setGrade(e.target.value)}>
                      <option value="">選択してください</option>
                      {GRADE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">学生所属</label>
                    <select className="form-select" value={affiliation} onChange={e => setAffiliation(e.target.value)}>
                      <option value="">選択してください</option>
                      {AFFILIATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">連絡用メールアドレス</label>
              <input type="email" id="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="予約完了通知が届きます" />
            </div>

            <div className="mb-3">
              <label htmlFor="notes" className="form-label">その他伝達事項</label>
              <textarea id="notes" className="form-control" rows={3} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="password">パスワード (キャンセル時に必要)</label>
              <input type="password" id="password" className="form-control" maxLength={4} pattern="[0-9]{4}" value={password} onChange={e => setPassword(e.target.value)} placeholder="半角数字4桁" />
            </div>

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
