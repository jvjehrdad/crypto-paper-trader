import React from 'react';
import { Skeleton } from '../common/Skeleton';
import styles from './PriceChartSkeleton.module.css';

export const PriceChartSkeleton: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Skeleton width="120px" height="16px" />
      </div>
      <div className={styles.chart}>
        <Skeleton width="100%" height="100%" borderRadius="12px" />
      </div>
    </div>
  );
};
