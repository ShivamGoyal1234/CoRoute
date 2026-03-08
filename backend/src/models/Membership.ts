import mongoose, { Schema, Document } from 'mongoose';
import { IMembership, MemberRole } from '../types';

interface IMembershipDocument extends IMembership, Document {}

const membershipSchema = new Schema<IMembershipDocument>(
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
    role: {
      type: String,
      enum: Object.values(MemberRole),
      default: MemberRole.VIEWER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

membershipSchema.index({ tripId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1 });
membershipSchema.index({ tripId: 1 });

export default mongoose.model<IMembershipDocument>('Membership', membershipSchema);
