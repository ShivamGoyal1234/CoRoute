import mongoose, { Schema, Document } from 'mongoose';
import { ITrip } from '../types';

interface ITripDocument extends ITrip, Document {}

const tripSchema = new Schema<ITripDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    baseCurrency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    totalBudget: {
      type: Number,
      default: 0,
    },
    budgetCategories: {
      type: [
        {
          key: String,
          label: { type: String, required: true },
          description: String,
          amount: { type: Number, default: 0 },
        },
      ],
      default: undefined,
    },
    joinSecret: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.pre('validate', function (next) {
  const trip = this as ITripDocument;
  if (trip.endDate < trip.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

tripSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model<ITripDocument>('Trip', tripSchema);
