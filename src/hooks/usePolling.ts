import { useEffect, useRef, useCallback } from 'react';

export const usePolling = (
  callback: () => Promise<void>,
  interval: number,
  enabled = true
) => {
  const savedCallback = useRef(callback);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const isRequestPending = useRef(false);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  const executeCallback = useCallback(async () => {
    if (isRequestPending.current) {
      return;
    }
    
    isRequestPending.current = true;
    try {
      await savedCallback.current();
    } finally {
      isRequestPending.current = false;
    }
  }, []);
  
  useEffect(() => {
    if (!enabled) {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
      return;
    }
    
    executeCallback();
    
    intervalId.current = setInterval(executeCallback, interval);
    
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [interval, enabled, executeCallback]);
};
