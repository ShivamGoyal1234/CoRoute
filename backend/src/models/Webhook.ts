import mongoose, { Schema, Document } from 'mongoose';
import { IWebhook, WebhookEvent } from '../types';

interface IWebhookDocument extends IWebhook, Document {}

const webhookSchema = new Schema<IWebhookDocument>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    events: {
      type: [String],
      enum: Object.values(WebhookEvent),
      default: [],
    },
    secret: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
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

webhookSchema.index({ tripId: 1, isActive: 1 });

export default mongoose.model<IWebhookDocument>('Webhook', webhookSchema);
