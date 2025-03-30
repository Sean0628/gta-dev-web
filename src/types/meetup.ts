export interface Meetup {
  url: string;
  platform: 'meetup' | 'other';
  type: 'meetups' | 'others';
  name: string;
  logo?: string;
  description?: string;
}

export interface MeetupGroup {
  type: 'meetups' | 'others';
  items: Meetup[];
}