import mongoose, { Schema, type Document } from "mongoose"

export interface IBookSuggestion extends Document {
  title: string
  author: string
  isbn?: string
  genre: string
  publicationYear?: number
  reason: string
  priority: "low" | "medium" | "high"
  status: "pending" | "approved" | "rejected"
  coverImage?: string
  suggestedBy: mongoose.Types.ObjectId
  approvedBy?: mongoose.Types.ObjectId
  rejectedBy?: mongoose.Types.ObjectId
  rejectionReason?: string
  approvedAt?: Date
  rejectedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const BookSuggestionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      enum: [
        "fiction",
        "non-fiction",
        "science",
        "technology",
        "history",
        "biography",
        "education",
        "reference",
        "other",
      ],
    },
    publicationYear: {
      type: Number,
      min: 1000,
      max: new Date().getFullYear() + 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    coverImage: {
      type: String,
      trim: true,
      required: false,
    },
    suggestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
BookSuggestionSchema.index({ suggestedBy: 1, createdAt: -1 })
BookSuggestionSchema.index({ status: 1, createdAt: -1 })
BookSuggestionSchema.index({ title: "text", author: "text" })

export default mongoose.models.BookSuggestion || mongoose.model("BookSuggestion", BookSuggestionSchema)
