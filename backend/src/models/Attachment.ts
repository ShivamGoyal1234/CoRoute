import mongoose, { Schema, Document } from 'mongoose';
import { IAttachment } from '../types';

interface IAttachmentDocument extends IAttachment, Document {}

const attachmentSchema = new Schema<IAttachmentDocument>(
  {
    activityId: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
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

attachmentSchema.index({ activityId: 1, uploadedAt: -1 });

export default mongoose.model<IAttachmentDocument>('Attachment', attachmentSchema);
