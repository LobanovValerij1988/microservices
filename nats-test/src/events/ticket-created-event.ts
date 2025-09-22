import { ESubjects } from "./subjects";
export interface ITicketCreatedEvent {
  subject: ESubjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
