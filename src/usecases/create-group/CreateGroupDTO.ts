export interface CreateGroupRequest {
  name: string;
  participantNames: string[];
  currency?: string;
}

export interface ParticipantDTO {
  id: string;
  name: string;
}

export interface CreateGroupResponse {
  groupId: string;
  name: string;
  currency: string;
  participants: ParticipantDTO[];
  createdAt: Date;
}
