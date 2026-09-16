export interface ParticipantProps {
  id: string;
  name: string;
}

export class Participant {
  readonly id: string;
  readonly name: string;

  constructor(props: ParticipantProps) {
    this.id = props.id;
    this.name = props.name;
  }
}
