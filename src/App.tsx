import React, { useState, useEffect } from 'react';
import useInterviewStore from './store';
import useReservationStore from './reservationStore';

import AdminPage from './pages/AdminPage';
import ReservationPage from './pages/ReservationPage';
import SelectPage from './pages/SelectPage';

type Page = 'select' | 'admin' | 'reservation';

function App() {
  const { isInitialized: interviewStoreInitialized, initializeApp: initializeInterviewApp } = useInterviewStore();
  const { isInitialized: reservationStoreInitialized, initializeApp: initializeReservationApp } = useReservationStore();
  const [page, setPage] = useState<Page>('select');

  useEffect(() => {
    initializeInterviewApp();
    initializeReservationApp();
  }, [initializeInterviewApp, initializeReservationApp]);

  if (!interviewStoreInitialized || !reservationStoreInitialized) {
    return null; 
  }

  const renderPage = () => {
    switch (page) {
      case 'admin':
        return <AdminPage />;
      case 'reservation':
        return <ReservationPage />;
      case 'select':
      default:
        return <SelectPage 
          onSelectAdmin={() => setPage('admin')} 
          onSelectReservation={() => setPage('reservation')} 
        />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;