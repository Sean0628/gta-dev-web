export interface MeetupSource {
  url: string;
  platform: "meetup" | "other";
  type: "meetups" | "others";
}

export const meetupSources: MeetupSource[] = [
  {
    url: "https://www.meetup.com/techtank-to/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/torontojs/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/go-toronto/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/toronto-java-users-group/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/k8s-ca/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/drupalto/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/toronto-aws-users-united/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/elastic-toronto-user-group/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/toronto-tech-stack-exchange/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/machine-learning-to-meetup/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://toronto-ruby.com/",
    platform: "other",
    type: "meetups",
  },
  {
    url: "https://builder-sundays.myshopify.com/",
    platform: "other",
    type: "others",
  },
  {
    url: "https://www.meetup.com/brainstation-toronto-tech-skills-and-careers/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/metro-toronto-azure-community/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/pragmatic-tech/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/laravel-toronto/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/vue-toronto/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/toronto-modern-data/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/cloud-architecture-meetup-group/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/aittg-toronto/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/digitalnatives/",
    platform: "meetup",
    type: "meetups",
  },
  // TODO: Need custom scraping script for techinto
  // {
  //   url: "https://www.meetup.com/techinto/",
  //   platform: "other",
  //   type: "meetups",
  // },
  {
    url: "https://www.meetup.com/mindstone-toronto-ai-meetup/", // "https://community.mindstone.com/events"
    platform: "meetup",
    type: "meetups",
  },
  // TODO: Need custom scraping script for GenAI Collective Toronto
  // {
  //   url: "https://www.genaicollective.ai/chapters/toronto",
  //   platform: "other",
  //   type: "meetups",
  // },
  // TODO: Need custom scraping script for AI Tinkerers
  // {
  //   url: "https://aitinkerers.org/p/welcome",
  //   platform: "other",
  //   type: "meetups",
  // },
  {
    url: "https://www.meetup.com/toronto-ai-aligners/",
    platform: "meetup",
    type: "meetups",
  },
  // TODO: Need custom scraping script for TAICO
  // {
  //   url: "https://taico.ca",
  //   platform: "other",
  //   type: "meetups",
  // },
  // TODO: Need custom scraping script for TechTO
  // {
  //   url: "https://www.techto.org",
  //   platform: "other",
  //   type: "meetups",
  // },
  {
    url: "https://www.meetup.com/data-drinks-toronto/",
    platform: "meetup",
    type: "meetups",
  },
  {
    url: "https://www.meetup.com/ai-human-flourishing-meetup/",
    platform: "meetup",
    type: "meetups",
  },
];
