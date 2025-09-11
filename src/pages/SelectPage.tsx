import React from 'react';
import styles from './SelectPage.module.css';

interface SelectPageProps {
  onSelectAdmin: () => void;
  onSelectReservation: () => void;
}

const SelectPage: React.FC<SelectPageProps> = ({ onSelectAdmin, onSelectReservation }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>面談予約アプリ</h1>
      <p className={styles.description}>どちらのページにアクセスしますか？</p>
      <div className={styles.buttonContainer}>
        <button onClick={onSelectAdmin} className={`${styles.button} ${styles.adminButton}`}>
          管理用ページ
        </button>
        <button onClick={onSelectReservation} className={`${styles.button} ${styles.reservationButton}`}>
          予約用ページ
        </button>
      </div>
    </div>
  );
};

export default SelectPage;
