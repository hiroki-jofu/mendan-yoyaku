import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import useReservationStore from '../reservationStore';
import Calendar from '../components/Calendar';
import ScheduleEditor from '../components/ScheduleEditor';
import { DailySchedule } from '../types';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import * as XLSX from 'xlsx';

const AdminTodaysReservations: React.FC<{ selectedInterviewerId: string | null }> = ({ selectedInterviewerId }) => {
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
          todaysReservations.map(ts => (
            <li key={ts.id} className="list-group-item">
              <strong>{ts.startTime}</strong>
              <ul className="list-unstyled mt-2 mb-0">
                {ts.reservations?.map((r, i) => (
                  <li key={i}>{r.studentName} ({r.grade}, {r.affiliation})</li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted">本日の予約はありません。</li>
        )}
      </ul>
    </div>
  );
};

interface AdminPageProps {
  onGoToSelectPage: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onGoToSelectPage }) => {
  const { interviewers, schedules, updateInterviewer } = useReservationStore();
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string | null>(interviewers[0]?.id || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    interviewers.forEach(interviewer => {
      const interviewerSchedules = schedules.filter(s => s.interviewerId === interviewer.id);
      if (interviewerSchedules.length === 0) return;

      const data = interviewerSchedules.flatMap(schedule =>
        schedule.timeSlots.flatMap(slot =>
          (slot.reservations && slot.reservations.length > 0) ?
          slot.reservations.map(res => ({
            '日付': schedule.date,
            '開始時間': slot.startTime,
            '終了時間': slot.endTime,
            '氏名': res.studentName,
            '学年': res.grade,
            '所属': res.affiliation,
          }))
          : []
        )
      );

      if (data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, interviewer.name);
      }
    });

    if (wb.SheetNames.length > 0) {
      XLSX.writeFile(wb, 'schedules.xlsx');
    }
  };

  const highlightedDays = useMemo(() => {
    if (!selectedInterviewerId) return [];
    return schedules
      .filter(s => s.interviewerId === selectedInterviewerId)
      .map(s => {
        const totalCapacity = s.timeSlots.reduce((acc, ts) => acc + (ts.capacity || 1), 0);
        const totalReservations = s.timeSlots.reduce((acc, ts) => acc + (ts.reservations?.length || 0), 0);
        const isFull = totalReservations >= totalCapacity;

        return {
          date: s.date,
          content: `予約 ${totalReservations}/${totalCapacity}`,
          backgroundColor: isFull ? '#fff9c4' : '#e0f7fa',
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
      <header className="pb-3 mb-4 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h1>管理用ページ</h1>
          <p>面談の予約枠を管理します。</p>
        </div>
        <div className="d-flex">
          <DropdownButton id="admin-menu" title="メニュー" variant="outline-secondary" className="me-2">
            <Dropdown.Item onClick={() => setShowProfileModal(true)}>プロフィール設定</Dropdown.Item>
            <Dropdown.Item onClick={handleExport}>予定をエクセル形式で書き出し</Dropdown.Item>
          </DropdownButton>
          <button className="btn btn-outline-primary" onClick={onGoToSelectPage}>
            最初の画面に戻る
          </button>
        </div>
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
          <>
            <AdminTodaysReservations selectedInterviewerId={selectedInterviewerId} />
            <Calendar onDateClick={handleDateClick} highlightedDays={highlightedDays} />
          </>
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

      <ProfileSettingsModal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        interviewers={interviewers}
        updateInterviewer={updateInterviewer}
      />
    </div>
  );
};

export default AdminPage;
