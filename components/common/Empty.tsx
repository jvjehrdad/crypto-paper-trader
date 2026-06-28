import React from 'react';
import styles from './Empty.module.css';

interface EmptyProps {
  message: string;
}

export const Empty: React.FC<EmptyProps> = ({ message }) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>📭</div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};
