/**
 * Example usage of the Event and Booking models
 * This file demonstrates how to use the database models in your application
 */

import { connectToMongoDB } from "@/lib/mongodb";
import { Event, Booking, type IEvent } from "@/database";

// Example: Create a new event
export async function createEvent(eventData: Partial<IEvent>) {
  await connectToMongoDB();

  const event = new Event({
    title: "React Conference 2025",
    description:
      "Annual React conference featuring the latest in React development",
    overview:
      "Join us for a day of learning about React, Next.js, and modern web development",
    image: "/images/react-conf.jpg",
    venue: "Tech Convention Center",
    location: "San Francisco, CA",
    date: "2025-03-15",
    time: "9:00 AM",
    mode: "hybrid",
    audience: "React developers, frontend engineers",
    agenda: [
      "Registration and Welcome",
      "React 19 Features Overview",
      "Next.js App Router Deep Dive",
      "Performance Optimization",
      "Q&A Session",
    ],
    organizer: "React Community",
    tags: ["react", "javascript", "frontend", "nextjs"],
    ...eventData,
  });

  return await event.save();
}

// Example: Create a booking
export async function createBooking(eventId: string, email: string) {
  await connectToMongoDB();

  const booking = new Booking({
    eventId,
    email,
  });

  return await booking.save();
}

// Example: Get events with bookings
export async function getEventsWithBookings() {
  await connectToMongoDB();

  return await Event.aggregate([
    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "eventId",
        as: "bookings",
      },
    },
    {
      $addFields: {
        bookingCount: { $size: "$bookings" },
      },
    },
    {
      $project: {
        bookings: 0, // Exclude bookings array from result
      },
    },
  ]);
}
