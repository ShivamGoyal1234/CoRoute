import mongoose, { Schema, Document } from 'mongoose';
import { IActivity, ActivityStatus } from '../types';

interface IActivityDocument extends IActivity, Document {}

const activitySchema = new Schema<IActivityDocument>(
  {
    dayId: {
      type: Schema.Types.ObjectId,
      ref: 'Day',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    cost: {
      type: Number,
      default: 0,
    },
    orderIndex: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(ActivityStatus),
      default: ActivityStatus.PLANNED,
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expenseCategory: {
      type: String,
      enum: ['food', 'shop', 'other'],
      default: undefined,
    },
    coordinates: {
      type: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ dayId: 1, orderIndex: 1 });

export default mongoose.model<IActivityDocument>('Activity', activitySchema);
