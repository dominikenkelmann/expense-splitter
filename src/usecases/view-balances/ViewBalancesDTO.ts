export interface ViewBalancesRequest {
  groupId: string;
}

export interface ParticipantBalanceDTO {
  participantId: string;
  participantName: string;
  totalPaidInCents: number;
  totalShareInCents: number;
  netBalanceInCents: number;
}

export interface SettlementInstructionDTO {
  fromParticipantId: string;
  fromParticipantName: string;
  toParticipantId: string;
  toParticipantName: string;
  amountInCents: number;
}

export interface ViewBalancesResponse {
  groupId: string;
  groupName: string;
  currency: string;
  totalSpendInCents: number;
  participantBalances: ParticipantBalanceDTO[];
  settlements: SettlementInstructionDTO[];
  isInconsistent: boolean;
}
