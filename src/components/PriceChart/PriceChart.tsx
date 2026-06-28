import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from 'chart.js';
import type { CoinMarketChart } from '../../types';
import { getMarketChart } from '../../api/coingecko';
import { Loading, Error, Empty } from '../common';
import { formatCurrency } from '../../utils/formatting';
import styles from './PriceChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  coinId: string | null;
}

export const PriceChart: React.FC<PriceChartProps> = ({ coinId }) => {
  const [chartData, setChartData] = useState<CoinMarketChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchChartData = async () => {
    if (!coinId) {
      setChartData(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMarketChart(coinId, 7);
      setChartData(data);
    } catch {
      setError('Failed to fetch chart data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchChartData();
  }, [coinId]);
  
  if (!coinId) {
    return (
      <div className={styles.container}>
        <Empty message="Select a coin to view price chart" />
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className={styles.container}>
        <Loading message="Loading chart data..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <Error message={error} onRetry={fetchChartData} />
      </div>
    );
  }
  
  if (!chartData || chartData.prices.length === 0) {
    return (
      <div className={styles.container}>
        <Empty message="No chart data available" />
      </div>
    );
  }
  
  const labels = chartData.prices.map(([timestamp]) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const prices = chartData.prices.map(([, price]) => price);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Price (USD)',
        data: prices,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgb(139, 92, 246)',
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed?.y;
            return value !== null ? formatCurrency(value) : '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 7,
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
          callback: (value: number | string) => formatCurrency(typeof value === 'number' ? value : parseFloat(value)),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };
  
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>7-Day Price Chart</h3>
      <div className={styles.chartContainer}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
