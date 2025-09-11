import React from 'react';
import { TimeSlot } from '../types';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  onBookSlot: (timeSlotId: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ timeSlots, onBookSlot }) => {
  const availableSlots = timeSlots.filter(ts => !ts.reservation);

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="mb-0">ご希望の時間を選択してください</h5>
      </div>
      <div className="list-group list-group-flush">
        {availableSlots.length > 0 ? (
          availableSlots.map(ts => (
            <button 
              key={ts.id} 
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              onClick={() => onBookSlot(ts.id)}
            >
              <span>{ts.startTime} - {ts.endTime}</span>
              <span className="badge bg-primary rounded-pill">予約する</span>
            </button>
          ))
        ) : (
          <div className="list-group-item">予約可能な時間枠はありません。</div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
