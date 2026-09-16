import type { Participant } from './Participant';
import type { Expense } from './Expense';

export interface GroupProps {
  id: string;
  name: string;
  currency: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

export class Group {
  readonly id: string;
  readonly name: string;
  readonly currency: string;
  readonly participants: Participant[];
  readonly expenses: Expense[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: GroupProps) {
    this.id = props.id;
    this.name = props.name;
    this.currency = props.currency;
    this.participants = props.participants;
    this.expenses = props.expenses;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  hasParticipant(participantId: string): boolean {
    return this.participants.some((p) => p.id === participantId);
  }

  addExpense(expense: Expense): Group {
    return new Group({
      id: this.id,
      name: this.name,
      currency: this.currency,
      participants: this.participants,
      expenses: [...this.expenses, expense],
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
