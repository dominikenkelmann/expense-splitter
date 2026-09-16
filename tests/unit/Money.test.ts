import { describe, it, expect } from 'vitest';
import { Money } from '../../src/domain/value-objects/Money';

describe('Money Value Object', () => {
  it('should initialize from cents and decimal values', () => {
    const fromCents = Money.fromCents(1250);
    const fromDecimal = Money.fromDecimal(12.5);

    expect(fromCents.getCents()).toBe(1250);
    expect(fromDecimal.getCents()).toBe(1250);
  });

  it('should perform exact integer addition and subtraction without floating point errors', () => {
    const a = Money.fromDecimal(0.1);
    const b = Money.fromDecimal(0.2);
    const sum = a.add(b);

    expect(sum.getCents()).toBe(30);
    expect(sum.subtract(a).getCents()).toBe(20);
  });

  it('should format currency correctly', () => {
    expect(Money.fromCents(1250).format('€')).toBe('€12.50');
    expect(Money.fromCents(5).format('€')).toBe('€0.05');
    expect(Money.fromCents(-300).format('€')).toBe('-€3.00');
  });
});
