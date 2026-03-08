import mongoose, { Schema, Document } from 'mongoose';
import { IComment } from '../types';

interface ICommentDocument extends IComment, Document {}

const commentSchema = new Schema<ICommentDocument>(
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ activityId: 1, createdAt: -1 });

export default mongoose.model<ICommentDocument>('Comment', commentSchema);
