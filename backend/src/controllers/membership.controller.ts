import { Response } from 'express';
import { validationResult } from 'express-validator';
import Membership from '../models/Membership';
import Trip from '../models/Trip';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { MemberRole } from '../types';
import { triggerWebhook } from '../services/webhook.service';
import { sendTripInviteEmail } from '../services/email.service';

export const inviteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const existingMembership = await Membership.findOne({
      tripId,
      userId: user._id,
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'User is already a member of this trip' });
    }

    const membership = new Membership({
      tripId,
      userId: user._id,
      role: role || MemberRole.VIEWER,
    });

    await membership.save();

    await triggerWebhook(tripId, 'member.invited', {
      membershipId: membership._id,
      userId: user._id,
      email: user.email,
      role,
    });

    if (req.user) {
      const inviter = await User.findById(req.user.userId);
      if (inviter) {
        void sendTripInviteEmail(user.email, inviter.name, trip.title).catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Trip invite email failed:', err);
        });
      }
    }

    res.status(201).json({
      message: 'Member invited successfully',
      membership: {
        ...membership.toObject(),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTripMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;

    const memberships = await Membership.find({ tripId }).populate(
      'userId',
      'name email avatarUrl'
    );

    const trip = await Trip.findById(tripId).populate('createdBy', 'name email avatarUrl');

    res.json({
      members: memberships,
      owner: trip?.createdBy,
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(MemberRole).includes(role)) {
      return res.status(400).json({ error: 'Valid role required' });
    }

    const membership = await Membership.findById(id).populate('userId', 'name email avatarUrl');

    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    const trip = await Trip.findById(membership.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Owner access required' });
    }

    membership.role = role;
    await membership.save();

    res.json({ message: 'Role updated', membership });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findById(id);
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    if (membership.role === MemberRole.OWNER) {
      return res.status(400).json({ error: 'Cannot remove trip owner' });
    }

    const trip = await Trip.findById(membership.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Owner access required' });
    }

    const tripId = membership.tripId.toString();
    await membership.deleteOne();

    await triggerWebhook(tripId, 'member.removed', {
      membershipId: id,
      userId: membership.userId,
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const leavTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.userId;

    const membership = await Membership.findOne({ tripId, userId });
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    if (membership.role === MemberRole.OWNER) {
      return res.status(400).json({ error: 'Owner cannot leave trip. Delete the trip instead.' });
    }

    await membership.deleteOne();

    res.json({ message: 'Left trip successfully' });
  } catch (error) {
    console.error('Leave trip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
