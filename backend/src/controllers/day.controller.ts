import { Response } from 'express';
import { validationResult } from 'express-validator';
import Day from '../models/Day';
import Trip from '../models/Trip';
import Activity from '../models/Activity';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { emitTripNotification } from '../socket/socket.service';

export const createDay = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tripId, dayNumber, date, notes } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(0, 0, 0, 0);

    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);

    if (Number.isNaN(newDate.getTime()) || newDate < tripStart || newDate > tripEnd) {
      return res.status(400).json({ error: 'Day date must be within trip start and end dates' });
    }

    const tripDurationDays = Math.floor((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const existingDays = await Day.find({ tripId });
    if (existingDays.length >= tripDurationDays) {
      return res.status(400).json({ error: 'All days for this trip are already created' });
    }

    const sameDateDay = existingDays.find((d) => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === newDate.getTime();
    });
    if (sameDateDay) {
      return res.status(400).json({ error: 'A day for this date already exists in this trip' });
    }

    if (dayNumber < 1 || dayNumber > tripDurationDays) {
      return res.status(400).json({ error: `Day number must be between 1 and ${tripDurationDays}` });
    }

    const existingDay = await Day.findOne({ tripId, dayNumber });
    if (existingDay) {
      return res.status(400).json({ error: 'Day number already exists for this trip' });
    }

    const day = new Day({
      tripId,
      dayNumber,
      date,
      notes: notes || '',
    });

    await day.save();

    const author = await User.findById(req.user?.userId).select('name').lean();
    const authorName = (author as any)?.name ?? 'Someone';
    emitTripNotification(tripId, {
      type: 'day_added',
      title: 'Day added',
      body: `Day ${dayNumber} on ${new Date(date).toDateString()}`,
      actorId: req.user!.userId,
      actorName: authorName,
      metadata: { tripId },
    });

    res.status(201).json({
      message: 'Day created successfully',
      day,
    });
  } catch (error) {
    console.error('Create day error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDaysByTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;

    const days = await Day.find({ tripId }).sort({ dayNumber: 1 });

    const daysWithCounts = await Promise.all(
      days.map(async (day) => {
        const activityCount = await Activity.countDocuments({ dayId: day._id });
        return {
          ...day.toObject(),
          activityCount,
        };
      })
    );

    res.json({ days: daysWithCounts });
  } catch (error) {
    console.error('Get days error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDayById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const day = await Day.findById(id);
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    const activities = await Activity.find({ dayId: id }).sort({ orderIndex: 1 });

    res.json({
      day,
      activities,
    });
  } catch (error) {
    console.error('Get day error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateDay = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, notes } = req.body;

    const day = await Day.findByIdAndUpdate(
      id,
      { date, notes },
      { new: true, runValidators: true }
    );

    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    res.json({ message: 'Day updated', day });
  } catch (error) {
    console.error('Update day error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteDay = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const day = await Day.findById(id);
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    await Activity.deleteMany({ dayId: id });
    await day.deleteOne();

    const tripId = day.tripId.toString();
    const author = await User.findById(req.user?.userId).select('name').lean();
    const authorName = (author as any)?.name ?? 'Someone';
    emitTripNotification(tripId, {
      type: 'day_deleted',
      title: 'Day deleted',
      body: `Day ${day.dayNumber}`,
      actorId: req.user!.userId,
      actorName: authorName,
      metadata: { tripId },
    });

    res.json({ message: 'Day deleted successfully' });
  } catch (error) {
    console.error('Delete day error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
