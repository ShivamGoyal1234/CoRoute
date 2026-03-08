import mongoose, { Schema, Document } from 'mongoose';
import { ITripFile } from '../types';

interface ITripFileDocument extends ITripFile, Document {}

const tripFileSchema = new Schema<ITripFileDocument>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

tripFileSchema.index({ tripId: 1, uploadedAt: -1 });

export default mongoose.model<ITripFileDocument>('TripFile', tripFileSchema);
