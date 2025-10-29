import mongoose, { Document, Schema, Types } from "mongoose";
import { Event } from "./event.model";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string) {
          // Email validation regex pattern
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Please provide a valid email address",
      },
      maxlength: [320, "Email cannot exceed 320 characters"], // RFC 5321 limit
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to validate that referenced event exists
BookingSchema.pre("save", async function (next) {
  // Only validate eventId if it's modified or document is new
  if (this.isModified("eventId") || this.isNew) {
    try {
      const eventExists = await Event.findById(this.eventId);

      if (!eventExists) {
        return next(new Error(`Event with ID ${this.eventId} does not exist`));
      }
    } catch {
      return next(new Error("Failed to validate event reference"));
    }
  }

  next();
});

// Compound index for eventId and email to prevent duplicate bookings
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Virtual populate to get event details when needed
BookingSchema.virtual("event", {
  ref: "Event",
  localField: "eventId",
  foreignField: "_id",
  justOne: true,
});

// Create and export the model
export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
