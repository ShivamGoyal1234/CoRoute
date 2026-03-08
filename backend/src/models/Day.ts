import mongoose, { Schema, Document } from 'mongoose';
import { IDay } from '../types';

interface IDayDocument extends IDay, Document {}

const daySchema = new Schema<IDayDocument>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

daySchema.index({ tripId: 1, dayNumber: 1 }, { unique: true });
daySchema.index({ tripId: 1, date: 1 });

export default mongoose.model<IDayDocument>('Day', daySchema);
