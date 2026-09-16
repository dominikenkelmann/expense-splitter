import type { Money } from '../value-objects/Money';

export type SplitMode = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

export interface SplitAllocation {
  participantId: string;
  share: Money;
}

export interface ExpenseProps {
  id: string;
  description: string;
  amount: Money;
  payerId: string;
  splitMode: SplitMode;
  allocations: SplitAllocation[];
  createdAt: Date;
}

export class Expense {
  readonly id: string;
  readonly description: string;
  readonly amount: Money;
  readonly payerId: string;
  readonly splitMode: SplitMode;
  readonly allocations: SplitAllocation[];
  readonly createdAt: Date;

  constructor(props: ExpenseProps) {
    this.id = props.id;
    this.description = props.description;
    this.amount = props.amount;
    this.payerId = props.payerId;
    this.splitMode = props.splitMode;
    this.allocations = props.allocations;
    this.createdAt = props.createdAt;
  }
}
