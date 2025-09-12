import React, { useState, useEffect, useMemo, useRef } from 'react';
import Calendar from '../components/Calendar';
import InterviewModal from '../components/InterviewModal';
import Header from '../components/Header';
import SearchResultList from '../components/SearchResultList';

import useInterviewStore from '../interviewStore';
import { InterviewRecord, InterviewData } from '../types';
import styles from '../App.module.css';
import { format } from 'date-fns';

const InterviewRecordApp: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    interviews,
    addInterview,
    updateInterview,
    deleteInterview,
    deleteAllInterviews,
    setInterviews,
  } = useInterviewStore();

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const filteredInterviews = useMemo(() => {
    if (!searchQuery) return interviews;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return interviews
      .map((interview: InterviewData) => {
        if (!interview || !Array.isArray(interview.records)) return { ...interview, records: [] };
        const filteredRecords = interview.records.filter(
          (record: InterviewRecord) =>
            (record.studentName && record.studentName.toLowerCase().includes(lowerCaseQuery)) ||
            (record.studentGrade && record.studentGrade.toLowerCase().includes(lowerCaseQuery)) ||
            (record.studentDepartment && record.studentDepartment.toLowerCase().includes(lowerCaseQuery)) ||
            (record.category && record.category.toLowerCase().includes(lowerCaseQuery)) ||
            (record.content && record.content.toLowerCase().includes(lowerCaseQuery))
        );
        return { ...interview, records: filteredRecords };
      })
      .filter((interview: InterviewData) => interview.records.length > 0);
  }, [searchQuery, interviews]);

  const matchingRecords = useMemo(() => {
    if (!searchQuery) return [];
    return filteredInterviews.flatMap((interview: InterviewData) =>
      interview.records.map((record: InterviewRecord) => ({ ...record, date: interview.date }))
    );
  }, [searchQuery, filteredInterviews]);

  const currentInterviewData = useMemo(() => 
    selectedDate ? interviews.find((i: InterviewData) => i.date === format(selectedDate, 'yyyy-MM-dd')) : undefined
  , [selectedDate, interviews]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleModalClose = () => {
    setSelectedDate(null);
  };

  const handleSave = (records: InterviewRecord[]) => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingInterview = interviews.find((i: InterviewData) => i.date === dateStr);

    if (records.length === 0) {
      if (existingInterview) {
        deleteInterview(dateStr);
      }
    } else {
      if (existingInterview) {
        updateInterview(dateStr, records);
      } else {
        addInterview(dateStr, records);
      }
    }
    handleModalClose();
  };

  const handleDeleteDate = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    deleteInterview(dateStr);
    handleModalClose();
  };

  const handleDeleteAll = () => {
    if (window.confirm('本当にすべての記録を削除しますか？\nこの操作は元に戻せません。')) {
      deleteAllInterviews();
    }
  };

  const handleExportCsv = () => {
    if (interviews.length === 0) {
      alert('書き出す記録がありません。');
      return;
    }
    const escapeCsvCell = (cell: string) => {
      if (cell.includes(',') || cell.includes('" ') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    };
    const headers = ['面談日', '氏名', '学年', '学生所属', '面談カテゴリー', '本文'];
    const rows = interviews.flatMap((interview: InterviewData) => {
      if (!interview || !Array.isArray(interview.records)) return [];
      return interview.records.map((record: InterviewRecord) =>
        [interview.date, record.studentName, record.studentGrade, record.studentDepartment, record.category, record.content]
          .map(escapeCsvCell)
          .join(',')
      );
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mendan_kiroku_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBackupToFile = () => {
    if (interviews.length === 0) {
      alert('バックアップする記録がありません。');
      return;
    }
    const jsonContent = JSON.stringify(interviews, null, 2);
    const blob = new Blob([jsonContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `面談記録バックアップ_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreFromFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData: InterviewData[] = JSON.parse(content);

        if (!Array.isArray(parsedData) || (parsedData.length > 0 && !parsedData.every(item => 'date' in item && 'records' in item && Array.isArray(item.records)))) {
          alert('選択されたファイルの形式が正しくありません。');
          return;
        }
        
        if (window.confirm('現在の記録を上書きしてインポートしますか？\nこの操作は元に戻せません。')) {
          setInterviews(parsedData);
          alert('記録をインポートしました。');
        }

      } catch (error) {
        alert('ファイルの読み込みまたは解析に失敗しました。');
        console.error("File import error:", error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className={`${styles.container} container py-4`}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onExportCsv={handleExportCsv}
        onBackupToFile={handleBackupToFile}
        onRestoreFromFile={handleRestoreFromFile}
        onDeleteAll={handleDeleteAll}
      />

      <main>
        {searchQuery ? (
          <SearchResultList searchQuery={searchQuery} matchingRecords={matchingRecords} />
        ) : (
          <Calendar onDateClick={handleDateClick} />
        )}
      </main>

      {selectedDate && (
        <InterviewModal
          show={!!selectedDate}
          date={selectedDate}
          records={currentInterviewData?.records || []}
          onClose={handleModalClose}
          onSave={handleSave}
          onDeleteDate={handleDeleteDate}
        />
      )}

      <footer className="pt-3 mt-4 text-muted border-top">
        <p className="mb-0">&copy; 2025</p>
      </footer>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept=".txt" 
        style={{ display: 'none' }} 
      />
    </div>
  );
};

export default InterviewRecordApp;
