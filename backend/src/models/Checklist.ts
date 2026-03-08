import mongoose, { Schema, Document } from 'mongoose';
import { IChecklist } from '../types';

interface IChecklistDocument extends IChecklist, Document {}

const checklistSchema = new Schema<IChecklistDocument>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    task: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      enum: ['packing', 'booking', 'documentation', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

checklistSchema.index({ tripId: 1, isCompleted: 1 });

export default mongoose.model<IChecklistDocument>('Checklist', checklistSchema);
