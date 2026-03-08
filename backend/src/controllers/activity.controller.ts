import { Response } from 'express';
import { validationResult } from 'express-validator';
import Activity from '../models/Activity';
import Day from '../models/Day';
import Comment from '../models/Comment';
import Attachment from '../models/Attachment';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { triggerWebhook } from '../services/webhook.service';
import { emitFeedEvent, emitTripNotification } from '../socket/socket.service';

export const createActivity = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dayId, title, description, location, startTime, endTime, cost, status, imageUrl, expenseCategory, coordinates } = req.body;

    const day = await Day.findById(dayId);
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    const maxOrderActivity = await Activity.findOne({ dayId }).sort({ orderIndex: -1 });
    const orderIndex = maxOrderActivity ? maxOrderActivity.orderIndex + 1 : 0;

    const userId = req.user?.userId;
    const activity = new Activity({
      dayId,
      title,
      description: description ?? '',
      location,
      startTime,
      endTime,
      cost: cost || 0,
      orderIndex,
      status: status || 'planned',
      imageUrl: imageUrl || '',
      ...(userId && { userId }),
      ...(expenseCategory && { expenseCategory }),
      ...(coordinates && typeof coordinates?.lat === 'number' && typeof coordinates?.lng === 'number' && { coordinates }),
    });

    await activity.save();

    const tripId = day.tripId.toString();
    await triggerWebhook(tripId, 'activity.created', {
      activityId: activity._id,
      title: activity.title,
      dayId,
    });
    const author = await User.findById(req.user?.userId).select('name').lean();
    const authorName = (author as any)?.name ?? 'Someone';
    emitFeedEvent(tripId, {
      type: 'activity',
      userName: authorName,
      text: 'added an activity',
      detail: title,
    });
    emitTripNotification(tripId, {
      type: 'activity_added',
      title: 'Activity added',
      body: title,
      actorId: userId!,
      actorName: authorName,
      metadata: { activityId: activity._id.toString(), tripId },
    });

    res.status(201).json({
      message: 'Activity created successfully',
      activity,
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getActivitiesByDay = async (req: AuthRequest, res: Response) => {
  try {
    const { dayId } = req.params;

    const activities = await Activity.find({ dayId })
      .sort({ orderIndex: 1 })
      .populate('userId', 'name email avatarUrl')
      .lean();
    const activitiesWithCount = await Promise.all(
      activities.map(async (a: any) => {
        const commentCount = await Comment.countDocuments({ activityId: a._id });
        return { ...a, commentCount };
      })
    );

    res.json({ activities: activitiesWithCount });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getActivityById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const comments = await Comment.find({ activityId: id })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: 1 });

    const attachments = await Attachment.find({ activityId: id })
      .populate('userId', 'name email avatarUrl')
      .sort({ uploadedAt: -1 });

    res.json({
      activity,
      comments,
      attachments,
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, location, startTime, endTime, cost, status, imageUrl, expenseCategory, coordinates } = req.body;

    const updateFields: Record<string, unknown> = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (location !== undefined) updateFields.location = location;
    if (startTime !== undefined) updateFields.startTime = startTime;
    if (endTime !== undefined) updateFields.endTime = endTime;
    if (cost !== undefined) updateFields.cost = cost;
    if (status !== undefined) updateFields.status = status;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (expenseCategory !== undefined) updateFields.expenseCategory = expenseCategory;
    if (coordinates !== undefined && typeof coordinates?.lat === 'number' && typeof coordinates?.lng === 'number') {
      updateFields.coordinates = coordinates;
    }

    const activity = await Activity.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const day = await Day.findById(activity.dayId);
    const tripId = day?.tripId?.toString();
    if (day) {
      await triggerWebhook(tripId!, 'activity.updated', {
        activityId: id,
        updates: { title, status },
      });
    }
    if (tripId && Object.keys(updateFields).length > 0) {
      const author = await User.findById(req.user?.userId).select('name').lean();
      const authorName = (author as any)?.name ?? 'Someone';
      const parts: string[] = [];
      if (title !== undefined) parts.push(`"${String(title).slice(0, 30)}${String(title).length > 30 ? '…' : ''}"`);
      if (cost !== undefined) parts.push(`cost $${Number(cost)}`);
      if (status !== undefined) parts.push(`status ${status}`);
      const detail = parts.length > 0 ? parts.join(', ') : 'Activity updated';
      emitFeedEvent(tripId, {
        type: 'activity',
        userName: authorName,
        text: 'updated an activity',
        detail,
      });
      emitTripNotification(tripId, {
        type: 'activity_updated',
        title: 'Activity updated',
        body: detail,
        actorId: req.user!.userId,
        actorName: authorName,
        metadata: { activityId: id, tripId },
      });
    }

    res.json({ message: 'Activity updated', activity });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const reorderActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { activities } = req.body; 

    if (!Array.isArray(activities)) {
      return res.status(400).json({ error: 'Activities array required' });
    }

    await Promise.all(
      activities.map((item: any) =>
        Activity.findByIdAndUpdate(item.id, { orderIndex: item.orderIndex })
      )
    );

    res.json({ message: 'Activities reordered successfully' });
  } catch (error) {
    console.error('Reorder activities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    await Comment.deleteMany({ activityId: id });
    await Attachment.deleteMany({ activityId: id });

    const day = await Day.findById(activity.dayId);
    
    await activity.deleteOne();

    if (day) {
      await triggerWebhook(day.tripId.toString(), 'activity.deleted', {
        activityId: id,
      });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
