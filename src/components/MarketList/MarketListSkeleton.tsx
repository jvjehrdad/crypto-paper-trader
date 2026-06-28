import React from 'react';
import { Skeleton, SkeletonCircle } from '../common/Skeleton';
import styles from './MarketListSkeleton.module.css';

export const MarketListSkeleton: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Skeleton width="80px" height="16px" />
      </div>
      <div className={styles.list}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.coinInfo}>
              <SkeletonCircle size="32px" />
              <div className={styles.details}>
                <Skeleton width="50px" height="14px" />
                <Skeleton width="70px" height="11px" />
              </div>
            </div>
            <div className={styles.priceInfo}>
              <Skeleton width="80px" height="14px" />
              <Skeleton width="50px" height="11px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
