const toNum = (v: string | number): number => (typeof v === 'number' ? v : parseFloat(v));

export const dAdd = (a: string | number, b: string | number): number => toNum(a) + toNum(b);
export const dSubtract = (a: string | number, b: string | number): number => toNum(a) - toNum(b);
export const dMultiply = (a: string | number, b: string | number): number => toNum(a) * toNum(b);
export const dDivide = (a: string | number, b: string | number): number => {
  const divisor = toNum(b);
  if (divisor === 0) throw new Error('Division by zero');
  return toNum(a) / divisor;
};

export const dRound = (v: string | number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(toNum(v) * factor) / factor;
};

export const dGt = (a: string | number, b: string | number): boolean => toNum(a) > toNum(b);
export const dLt = (a: string | number, b: string | number): boolean => toNum(a) < toNum(b);
export const dGte = (a: string | number, b: string | number): boolean => toNum(a) >= toNum(b);
export const dLte = (a: string | number, b: string | number): boolean => toNum(a) <= toNum(b);
export const dIsZero = (v: string | number): boolean => toNum(v) === 0;
export const dIsPositive = (v: string | number): boolean => toNum(v) > 0;
export const dIsNegative = (v: string | number): boolean => toNum(v) < 0;
export const dAbs = (v: string | number): number => Math.abs(toNum(v));

export const toStr = (v: string | number): string => String(v);
export const toFixed = (v: string | number, decimals: number): string => toNum(v).toFixed(decimals);

export const calculateFee = (amount: string | number, feePercentage: string | number): number => {
  return dMultiply(amount, dDivide(feePercentage, 100));
};

export const calculateTotalWithFee = (amount: string | number, fee: string | number): number => {
  return dAdd(amount, fee);
};

export const calculateProfitLoss = (
  currentPrice: string | number,
  averageBuyPrice: string | number,
  amount: string | number
): number => {
  return dMultiply(dSubtract(currentPrice, averageBuyPrice), amount);
};

export const calculateProfitLossPercentage = (
  currentPrice: string | number,
  averageBuyPrice: string | number
): number => {
  return dMultiply(dDivide(dSubtract(currentPrice, averageBuyPrice), averageBuyPrice), 100);
};

export const calculateAverageBuyPrice = (
  existingAmount: string | number,
  existingAveragePrice: string | number,
  newAmount: string | number,
  newPrice: string | number
): number => {
  if (dIsZero(existingAmount)) return toNum(newPrice);

  const totalCost = dAdd(dMultiply(existingAmount, existingAveragePrice), dMultiply(newAmount, newPrice));
  const totalAmount = dAdd(existingAmount, newAmount);

  return dDivide(totalCost, totalAmount);
};
