import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { InterviewRecord } from '../types';
import { departmentOptions, categoryOptions } from '../constants';
import { format } from 'date-fns';

// 新しい空の記録を作成するヘルパー関数
const createNewRecord = (): InterviewRecord => ({
  id: Date.now().toString() + Math.random().toString(36),
  studentName: '',
  studentGrade: '1', // デフォルト値を'1'に設定
  studentDepartment: departmentOptions[0],
  category: categoryOptions[0],
  content: ''
});

interface InterviewModalProps {
  show: boolean;
  date: Date;
  records: InterviewRecord[];
  onClose: () => void;
  onSave: (records: InterviewRecord[]) => void;
  onDeleteDate: () => void;
}

const InterviewModal: React.FC<InterviewModalProps> = ({ show, date, records, onClose, onSave, onDeleteDate }) => {
  const [localRecords, setLocalRecords] = useState<InterviewRecord[]>([]);
  // 各レコードのエラーを管理するための状態
  const [errors, setErrors] = useState<{[id: string]: {[field: string]: string}}>({});

  useEffect(() => {
    setLocalRecords(records.length > 0 ? records.map(r => ({...r})) : [createNewRecord()]);
    setErrors({}); // モーダルが開かれるたびにエラーをリセット
  }, [records, show]);

  const handleRecordChange = (id: string, field: string, value: string) => {
    setLocalRecords(localRecords.map(r => r.id === id ? { ...r, [field]: value } : r));
    // 入力があったらそのフィールドのエラーをクリア
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      if (newErrors[id]) {
        delete (newErrors[id] as any)[field];
        if (Object.keys(newErrors[id]).length === 0) {
          delete newErrors[id];
        }
      }
      return newErrors;
    });
  };

  const addRecord = () => {
    setLocalRecords([...localRecords, createNewRecord()]);
  };

  const removeRecord = (id: string) => {
    setLocalRecords(localRecords.filter(r => r.id !== id));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleSave = () => {
    const newErrors: {[id: string]: {[field: string]: string}} = {};
    let hasError = false;

    localRecords.forEach(record => {
      const recordErrors: {[field: string]: string} = {};
      if (record.studentName.trim() === '') {
        recordErrors.studentName = '氏名は必須です。';
        hasError = true;
      }
      if (record.content.trim() === '') {
        recordErrors.content = '本文は必須です。';
        hasError = true;
      }

      if (Object.keys(recordErrors).length > 0) {
        newErrors[record.id] = recordErrors;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      alert('必須項目が入力されていません。');
      return;
    }

    // 空のレコードは保存しない（バリデーションで必須項目チェックしているので、実質不要になるが念のため）
    const recordsToSave = localRecords.filter(r => r.studentName.trim() !== '' || r.content.trim() !== '');
    onSave(recordsToSave);
  };

  const handleDelete = () => {
    if (window.confirm('この日のすべての記録を削除しますか？')) {
      onDeleteDate();
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{format(date, 'yyyy年M月d日')} の面談記録</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {localRecords.map((record, index) => (
          <div key={record.id} className="p-3 mb-3 border rounded position-relative shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 text-primary">記録 {index + 1}</h6>
              <Button variant="outline-danger" size="sm" onClick={() => removeRecord(record.id)}>この記録を削除</Button>
            </div>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">氏名</label>
                <input 
                  type="text" 
                  className={`form-control ${errors[record.id]?.studentName ? 'is-invalid' : ''}`} 
                  value={record.studentName} 
                  onChange={(e) => handleRecordChange(record.id, 'studentName', e.target.value)} 
                />
                {errors[record.id]?.studentName && (
                  <div className="invalid-feedback d-block">{errors[record.id].studentName}</div>
                )}
              </div>
              <div className="col-md-4">
                <label className="form-label">学年</label>
                <select className="form-select" value={record.studentGrade} onChange={(e) => handleRecordChange(record.id, 'studentGrade', e.target.value)}>
                    {Array.from({ length: 7 }, (_, i) => i + 1).map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                    ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">学生所属</label>
                <select className="form-select" value={record.studentDepartment} onChange={(e) => handleRecordChange(record.id, 'studentDepartment', e.target.value)}>
                  {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}を
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">面談カテゴリー</label>
                <select className="form-select" value={record.category} onChange={(e) => handleRecordChange(record.id, 'category', e.target.value)}>
                  {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">本文</label>
                <textarea
                  className={`form-control ${errors[record.id]?.content ? 'is-invalid' : ''}`}
                  rows={8}
                  value={record.content}
                  onChange={(e) => handleRecordChange(record.id, 'content', e.target.value)}
                ></textarea>
                {errors[record.id]?.content && (
                  <div className="invalid-feedback d-block">{errors[record.id].content}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        <Button variant="primary" onClick={addRecord}>
          ＋ 面談記録を追加
        </Button>
      </Modal.Body>
      <Modal.Footer className="justify-content-between">
        <Button variant="danger" onClick={handleDelete} disabled={records.length === 0}>
          この日の記録を全て削除
        </Button>
        <div>
          <Button variant="secondary" className="me-2" onClick={onClose}>閉じる</Button>
          <Button variant="primary" onClick={handleSave}>保存</Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default InterviewModal;