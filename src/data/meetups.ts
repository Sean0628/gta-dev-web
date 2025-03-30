export interface MeetupSource {
  url: string;
  platform: 'meetup' | 'other';
  type: 'meetups' | 'others';
}

export const meetupSources: MeetupSource[] = [
  {
    url: "https://www.meetup.com/techtank-to/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/torontojs/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/go-toronto/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/toronto-java-users-group/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/k8s-ca/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/drupalto/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/toronto-aws-users-united/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/elastic-toronto-user-group/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/toronto-tech-stack-exchange/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://www.meetup.com/machine-learning-to-meetup/",
    platform: "meetup",
    type: "meetups"
  },
  {
    url: "https://toronto-ruby.com/",
    platform: "other",
    type: "meetups"
  },
  {
    url: "https://builder-sundays.myshopify.com/",
    platform: "other",
    type: "others"
  }
];
