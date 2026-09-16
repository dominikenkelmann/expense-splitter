import type { SplitMode } from '@domain/entities/Expense';

export interface CustomSplitInput {
  participantId: string;
  shareInCents: number;
}

export interface AddExpenseRequest {
  groupId: string;
  description: string;
  amountInCents: number;
  payerId: string;
  splitMode: SplitMode;
  splitParticipantIds?: string[];
  customSplits?: CustomSplitInput[];
}

export interface SplitAllocationDTO {
  participantId: string;
  shareInCents: number;
}

export interface AddExpenseResponse {
  expenseId: string;
  groupId: string;
  description: string;
  amountInCents: number;
  payerId: string;
  splitMode: SplitMode;
  allocations: SplitAllocationDTO[];
  createdAt: Date;
}
