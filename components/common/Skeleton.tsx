import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  className = '' 
}) => {
  return (
    <div 
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 1, className = '' }) => {
  return (
    <div className={`${styles.textContainer} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          height="14px" 
          width={i === lines - 1 ? '60%' : '100%'} 
        />
      ))}
    </div>
  );
};

interface SkeletonCircleProps {
  size?: string;
  className?: string;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ size = '40px', className = '' }) => {
  return (
    <Skeleton 
      width={size} 
      height={size} 
      borderRadius="50%" 
      className={className}
    />
  );
};
