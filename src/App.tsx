import React, { useState, useEffect, Suspense, lazy } from 'react';
import useInterviewStore from './interviewStore';
import useReservationStore from './reservationStore';
import ErrorBoundary from './components/ErrorBoundary';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const ReservationPage = lazy(() => import('./pages/ReservationPage'));
const SelectPage = lazy(() => import('./pages/SelectPage'));

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
    return <div>Loading...</div>; 
  }

  const goToSelectPage = () => setPage('select');

  const renderPage = () => {
    switch (page) {
      case 'admin':
        return <AdminPage onGoToSelectPage={goToSelectPage} />;
      case 'reservation':
        return <ReservationPage onGoToSelectPage={goToSelectPage} />;
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
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          {renderPage()}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
