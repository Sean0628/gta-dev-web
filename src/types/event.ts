export interface Event {
  id: string;
  meetup_id: string;
  title: string;
  datetime: string;
  venue?: string;
  description?: string;
  logo?: string;
  link?: string;
  created_at?: string;
  updated_at?: string;
}
