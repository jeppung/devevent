import mongoose, { Document, Schema } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    overview: {
      type: String,
      required: [true, "Event overview is required"],
      trim: true,
      maxlength: [1000, "Overview cannot exceed 1000 characters"],
    },
    image: {
      type: String,
      required: [true, "Event image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Event venue is required"],
      trim: true,
      maxlength: [200, "Venue cannot exceed 200 characters"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    mode: {
      type: String,
      required: [true, "Event mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
    },
    audience: {
      type: String,
      required: [true, "Target audience is required"],
      trim: true,
      maxlength: [200, "Audience description cannot exceed 200 characters"],
    },
    agenda: {
      type: [String],
      required: [true, "Event agenda is required"],
      validate: {
        validator: function (agenda: string[]) {
          return agenda.length > 0;
        },
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Event organizer is required"],
      trim: true,
      maxlength: [100, "Organizer name cannot exceed 100 characters"],
    },
    tags: {
      type: [String],
      required: [true, "Event tags are required"],
      validate: {
        validator: function (tags: string[]) {
          return tags.length > 0 && tags.length <= 10;
        },
        message: "Must have between 1 and 10 tags",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook for slug generation and data normalization
EventSchema.pre("save", function (next) {
  // Generate slug from title if title changed or document is new
  if (this.isModified("title") || this.isNew) {
    this.slug = generateSlug(this.title);
  }

  // Normalize and validate date format (convert to ISO string)
  if (this.isModified("date") || this.isNew) {
    try {
      const dateObj = new Date(this.date);
      if (isNaN(dateObj.getTime())) {
        return next(
          new Error("Invalid date format. Please provide a valid date.")
        );
      }
      this.date = dateObj.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    } catch {
      return next(
        new Error("Invalid date format. Please provide a valid date.")
      );
    }
  }

  // Normalize time format (ensure consistent HH:MM AM/PM format)
  if (this.isModified("time") || this.isNew) {
    this.time = normalizeTimeFormat(this.time);
  }

  // Validate required arrays are not empty
  if (this.agenda.length === 0) {
    return next(new Error("Agenda cannot be empty"));
  }

  if (this.tags.length === 0) {
    return next(new Error("Tags cannot be empty"));
  }

  next();
});

/**
 * Generates a URL-friendly slug from the title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Normalizes time format to consistent HH:MM AM/PM format
 */
function normalizeTimeFormat(time: string): string {
  try {
    // Parse various time formats and convert to standard format
    const timeRegex = /^(\d{1,2}):?(\d{0,2})\s*(am|pm|AM|PM)?$/i;
    const match = time.trim().match(timeRegex);

    if (!match) {
      throw new Error("Invalid time format");
    }

    const [, hours, minutes = "00", periodMatch = ""] = match;
    let hour24 = parseInt(hours, 10);
    const min = parseInt(minutes, 10);
    let period = periodMatch;

    // Validate hours and minutes
    if (hour24 < 1 || hour24 > 24 || min < 0 || min > 59) {
      throw new Error("Invalid time values");
    }

    // Convert to 12-hour format if no period specified and hour > 12
    if (!period && hour24 > 12) {
      period = "PM";
      hour24 -= 12;
    } else if (!period && hour24 === 0) {
      hour24 = 12;
      period = "AM";
    } else if (!period) {
      period = hour24 >= 12 ? "PM" : "AM";
      if (hour24 > 12) hour24 -= 12;
      if (hour24 === 0) hour24 = 12;
    }

    // Format to HH:MM AM/PM
    const formattedHour = hour24.toString().padStart(2, "0");
    const formattedMin = min.toString().padStart(2, "0");

    return `${formattedHour}:${formattedMin} ${period.toUpperCase()}`;
  } catch {
    // Return original time if normalization fails
    return time;
  }
}

// Create and export the model
export const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
