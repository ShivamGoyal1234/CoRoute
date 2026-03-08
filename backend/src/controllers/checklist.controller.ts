import { Response } from 'express';
import { validationResult } from 'express-validator';
import Checklist from '../models/Checklist';
import { AuthRequest } from '../middleware/auth.middleware';
import { triggerWebhook } from '../services/webhook.service';

export const createChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tripId, task, category, assignedTo } = req.body;

    const checklistItem = new Checklist({
      tripId,
      task,
      category: category || 'other',
      assignedTo,
      isCompleted: false,
    });

    await checklistItem.save();

    if (assignedTo) {
      await checklistItem.populate('assignedTo', 'name email avatarUrl');
    }

    res.status(201).json({
      message: 'Checklist item created',
      item: checklistItem,
    });
  } catch (error) {
    console.error('Create checklist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getChecklistByTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;
    const { category, isCompleted } = req.query;

    const filter: any = { tripId };
    if (category) filter.category = category;
    if (isCompleted !== undefined) filter.isCompleted = isCompleted === 'true';

    const items = await Checklist.find(filter)
      .populate('assignedTo', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    console.error('Get checklist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { task, isCompleted, assignedTo, category } = req.body;

    const item = await Checklist.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    const wasCompleted = item.isCompleted;

    item.task = task !== undefined ? task : item.task;
    item.isCompleted = isCompleted !== undefined ? isCompleted : item.isCompleted;
    item.assignedTo = assignedTo !== undefined ? assignedTo : item.assignedTo;
    item.category = category !== undefined ? category : item.category;

    await item.save();

    if (assignedTo) {
      await item.populate('assignedTo', 'name email avatarUrl');
    }

    // Trigger webhook if completed
    if (!wasCompleted && item.isCompleted) {
      await triggerWebhook(item.tripId.toString(), 'checklist.completed', {
        checklistId: id,
        task: item.task,
      });
    }

    res.json({ message: 'Checklist item updated', item });
  } catch (error) {
    console.error('Update checklist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const item = await Checklist.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    res.json({ message: 'Checklist item deleted' });
  } catch (error) {
    console.error('Delete checklist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
