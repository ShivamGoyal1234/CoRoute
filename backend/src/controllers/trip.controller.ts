import crypto from 'crypto';
import { Response } from 'express';
import { validationResult } from 'express-validator';
import Trip from '../models/Trip';
import Membership from '../models/Membership';
import Day from '../models/Day';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { MemberRole } from '../types';
import { triggerWebhook } from '../services/webhook.service';
import { emitFeedEvent, getFeedEvents, emitTripNotification } from '../socket/socket.service';

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, startDate, endDate, baseCurrency, totalBudget, budgetCategories: rawCategories } = req.body;
    const userId = req.user?.userId;
    const joinSecret = crypto.randomBytes(16).toString('hex');

    const budgetCategories = Array.isArray(rawCategories)
      ? rawCategories
          .filter((c: any) => c && typeof c.label === 'string')
          .map((c: any) => ({
            key: c.key || undefined,
            label: String(c.label).trim(),
            description: c.description ? String(c.description).trim() : undefined,
            amount: Number(c.amount) || 0,
          }))
      : undefined;

    const trip = new Trip({
      title,
      startDate,
      endDate,
      baseCurrency: baseCurrency || 'USD',
      totalBudget: totalBudget ?? 0,
      ...(budgetCategories?.length ? { budgetCategories } : {}),
      joinSecret,
      createdBy: userId,
    });

    await trip.save();

    const membership = new Membership({
      tripId: trip._id,
      userId,
      role: MemberRole.OWNER,
    });
    await membership.save();

    await triggerWebhook(trip._id.toString(), 'trip.created', {
      tripId: trip._id,
      title: trip.title,
      createdBy: userId,
    });

    res.status(201).json({
      message: 'Trip created successfully',
      trip,
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTrips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const memberships = await Membership.find({ userId }).populate({
      path: 'tripId',
      populate: {
        path: 'createdBy',
        select: 'name email avatarUrl',
      },
    });

    const validMemberships = memberships.filter((m: any) => m.tripId != null);
    const tripIds = validMemberships.map((m: any) => m.tripId._id);
    const allMemberships = await Membership.find({ tripId: { $in: tripIds } }).populate('userId', 'name avatarUrl');

    const travelersByTripId: Record<string, { _id: string; name: string; avatarUrl?: string }[]> = {};
    for (const m of allMemberships) {
      const mid = m as any;
      const tripId = mid.tripId?.toString?.() ?? mid.tripId;
      if (!travelersByTripId[tripId]) travelersByTripId[tripId] = [];
      const user = mid.userId;
      if (user) {
        travelersByTripId[tripId].push({
          _id: user._id.toString(),
          name: user.name ?? 'Unknown',
          avatarUrl: user.avatarUrl ?? undefined,
        });
      }
    }

    const trips = validMemberships.map((m: any) => {
      const tripObj = m.tripId.toObject();
      const tripId = tripObj._id.toString();
      const travelers = travelersByTripId[tripId] ?? [];
      return {
        ...tripObj,
        userRole: m.role,
        travelerCount: travelers.length,
        travelers,
      };
    });

    res.json({ trips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const trip = await Trip.findById(id).populate('createdBy', 'name email avatarUrl');
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const membership = await Membership.findOne({ tripId: id, userId });
    const userRole = (trip.createdBy as any)._id?.toString() === userId ? MemberRole.OWNER : membership?.role;
    const members = await Membership.find({ tripId: id }).populate('userId', 'name email avatarUrl');
    const days = await Day.find({ tripId: id }).sort({ dayNumber: 1 });

    res.json({
      trip: {
        ...trip.toObject(),
        userRole,
      },
      members,
      days,
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTripFeed = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const events = getFeedEvents(id);
    res.json({ feed: events });
  } catch (error) {
    console.error('Get trip feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendTripMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content) return res.status(400).json({ error: 'Message content required' });
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const author = await User.findById(req.user?.userId).select('name').lean();
    const userName = (author as any)?.name ?? 'Someone';
    emitFeedEvent(id, {
      type: 'message',
      userName,
      text: 'sent a message',
      detail: content.length > 200 ? content.slice(0, 200) + '…' : content,
    });
    emitTripNotification(id, {
      type: 'message',
      title: 'New message',
      body: content.length > 120 ? content.slice(0, 120) + '…' : content,
      actorId: req.user!.userId,
      actorName: userName,
      metadata: { tripId: id },
    });
    res.json({ message: 'Message sent' });
  } catch (error) {
    console.error('Send trip message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, startDate, endDate, baseCurrency, totalBudget, budgetCategories: rawCategories } = req.body;

    const update: Record<string, unknown> = { title, startDate, endDate, baseCurrency, totalBudget };
    if (Array.isArray(rawCategories)) {
      update.budgetCategories = rawCategories
        .filter((c: any) => c && typeof c.label === 'string')
        .map((c: any) => ({
          key: c.key || undefined,
          label: String(c.label).trim(),
          description: c.description ? String(c.description).trim() : undefined,
          amount: Number(c.amount) || 0,
        }));
    }

    const trip = await Trip.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    await triggerWebhook(id, 'trip.updated', {
      tripId: id,
      updates: { title, startDate, endDate },
    });

    const budgetChanged = totalBudget !== undefined || (rawCategories && Array.isArray(rawCategories));
    if (budgetChanged) {
      const author = await User.findById(req.user?.userId).select('name').lean();
      const authorName = (author as any)?.name ?? 'Someone';
      const detail = totalBudget !== undefined
        ? `Budget set to ${trip.baseCurrency} ${Number(totalBudget).toLocaleString()}`
        : 'Budget categories updated';
      emitFeedEvent(id, {
        type: 'budget',
        userName: authorName,
        text: 'updated the budget',
        detail,
      });
      emitTripNotification(id, {
        type: 'budget',
        title: 'Budget updated',
        body: detail,
        actorId: req.user!.userId,
        actorName: authorName,
        metadata: { tripId: id },
      });
    }

    res.json({ message: 'Trip updated', trip });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await Day.deleteMany({ tripId: id });
    await Membership.deleteMany({ tripId: id });
    
    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await triggerWebhook(id, 'trip.deleted', { tripId: id });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTripStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const days = await Day.countDocuments({ tripId: id });
    const members = await Membership.countDocuments({ tripId: id });
    const Activity = require('../models/Activity').default;
    const activities = await Activity.find({ dayId: { $in: await Day.find({ tripId: id }).select('_id') } });
    const totalExpenses = activities.reduce((sum: number, activity: any) => sum + (activity.cost || 0), 0);

    res.json({
      stats: {
        totalDays: days,
        totalMembers: members,
        totalExpenses,
      },
    });
  } catch (error) {
    console.error('Get trip stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
