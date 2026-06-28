export class Decimal {
  private value: string;

  constructor(value: string | number) {
    this.value = String(value);
  }

  static fromString(value: string): Decimal {
    return new Decimal(value);
  }

  static fromNumber(value: number): Decimal {
    return new Decimal(value);
  }

  toNumber(): number {
    return parseFloat(this.value);
  }

  toString(): string {
    return this.value;
  }

  add(other: Decimal | number): Decimal {
    const a = parseFloat(this.value);
    const b = typeof other === 'number' ? other : parseFloat(other.toString());
    return new Decimal(a + b);
  }

  subtract(other: Decimal | number): Decimal {
    const a = parseFloat(this.value);
    const b = typeof other === 'number' ? other : parseFloat(other.toString());
    return new Decimal(a - b);
  }

  multiply(other: Decimal | number): Decimal {
    const a = parseFloat(this.value);
    const b = typeof other === 'number' ? other : parseFloat(other.toString());
    return new Decimal(a * b);
  }

  divide(other: Decimal | number): Decimal {
    const a = parseFloat(this.value);
    const b = typeof other === 'number' ? other : parseFloat(other.toString());
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return new Decimal(a / b);
  }

  round(decimals: number): Decimal {
    const factor = Math.pow(10, decimals);
    return new Decimal(Math.round(parseFloat(this.value) * factor) / factor);
  }

  isGreaterThan(other: Decimal | number): boolean {
    const a = parseFloat(this.value);
    const b = typeof other === 'number' ? other : parseFloat(other.toString());
    return a > b;
  }

  isLessThan(other: Decimal | number): boolean {
    const a = parseFloat(this.value);
    const b = typeof other === 'number' ? other : parseFloat(other.toString());
    return a < b;
  }

  isGreaterThanOrEqualTo(other: Decimal | number): boolean {
    const a = parseFloat(this.value);
    const b = typeof other === 'number' ? other : parseFloat(other.toString());
    return a >= b;
  }

  isLessThanOrEqualTo(other: Decimal | number): boolean {
    const a = parseFloat(this.value);
    const b = typeof other === 'number' ? other : parseFloat(other.toString());
    return a <= b;
  }

  isZero(): boolean {
    return parseFloat(this.value) === 0;
  }

  isPositive(): boolean {
    return parseFloat(this.value) > 0;
  }

  isNegative(): boolean {
    return parseFloat(this.value) < 0;
  }

  abs(): Decimal {
    return new Decimal(Math.abs(parseFloat(this.value)));
  }
}

export const calculateFee = (amount: Decimal, feePercentage: Decimal): Decimal => {
  return amount.multiply(feePercentage.divide(100));
};

export const calculateTotalWithFee = (amount: Decimal, fee: Decimal): Decimal => {
  return amount.add(fee);
};

export const calculateProfitLoss = (
  currentPrice: Decimal,
  averageBuyPrice: Decimal,
  amount: Decimal
): Decimal => {
  return currentPrice.subtract(averageBuyPrice).multiply(amount);
};

export const calculateProfitLossPercentage = (
  currentPrice: Decimal,
  averageBuyPrice: Decimal
): Decimal => {
  return currentPrice.subtract(averageBuyPrice).divide(averageBuyPrice).multiply(100);
};

export const calculateAverageBuyPrice = (
  existingAmount: Decimal,
  existingAveragePrice: Decimal,
  newAmount: Decimal,
  newPrice: Decimal
): Decimal => {
  if (existingAmount.isZero()) {
    return newPrice;
  }
  
  const totalCost = existingAmount.multiply(existingAveragePrice).add(newAmount.multiply(newPrice));
  const totalAmount = existingAmount.add(newAmount);
  
  return totalCost.divide(totalAmount);
};
