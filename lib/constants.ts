export interface Event {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const sampleEvents: Event[] = [
  {
    title: "React Conference 2025",
    image: "/images/event1.png",
    slug: "react-conference-2025",
    location: "San Francisco, CA",
    date: "2025-03-15",
    time: "09:00 AM",
  },
  {
    title: "JavaScript Summit",
    image: "/images/event2.png",
    slug: "javascript-summit",
    location: "New York, NY",
    date: "2025-04-22",
    time: "10:00 AM",
  },
  {
    title: "Next.js Developer Meetup",
    image: "/images/event3.png",
    slug: "nextjs-developer-meetup",
    location: "Austin, TX",
    date: "2025-05-10",
    time: "07:00 PM",
  },
  {
    title: "TypeScript Workshop",
    image: "/images/event4.png",
    slug: "typescript-workshop",
    location: "Seattle, WA",
    date: "2025-06-05",
    time: "02:00 PM",
  },
  {
    title: "Web Performance Summit",
    image: "/images/event5.png",
    slug: "web-performance-summit",
    location: "Los Angeles, CA",
    date: "2025-07-18",
    time: "09:30 AM",
  },
  {
    title: "DevOps Days",
    image: "/images/event6.png",
    slug: "devops-days",
    location: "Chicago, IL",
    date: "2025-08-12",
    time: "08:00 AM",
  },
  {
    title: "AI & Machine Learning Conference",
    image: "/images/event-full.png",
    slug: "ai-machine-learning-conference",
    location: "Boston, MA",
    date: "2025-09-20",
    time: "09:15 AM",
  },
];
