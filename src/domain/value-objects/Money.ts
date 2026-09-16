export class Money {
  private constructor(private readonly cents: number) {}

  static fromCents(cents: number): Money {
    return new Money(Math.round(cents));
  }

  static fromDecimal(amount: number): Money {
    return new Money(Math.round(amount * 100));
  }

  getCents(): number {
    return this.cents;
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  format(currencySymbol: string = '€'): string {
    const isNegative = this.cents < 0;
    const absCents = Math.abs(this.cents);
    const euros = Math.floor(absCents / 100);
    const rem = (absCents % 100).toString().padStart(2, '0');
    return `${isNegative ? '-' : ''}${currencySymbol}${euros}.${rem}`;
  }
}
