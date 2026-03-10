import { Response } from 'express';
import { validationResult } from 'express-validator';
import Comment from '../models/Comment';
import Activity from '../models/Activity';
import Day from '../models/Day';
import { AuthRequest } from '../middleware/auth.middleware';
import { triggerWebhook } from '../services/webhook.service';
import { emitCommentNew, emitFeedEvent, emitTripNotification } from '../socket/socket.service';

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { activityId, content } = req.body;
    const userId = req.user?.userId;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const comment = new Comment({
      activityId,
      userId,
      content,
    });

    await comment.save();

    await comment.populate('userId', 'name email avatarUrl');

    const day = await Day.findById(activity.dayId);
    const tripId = day?.tripId?.toString();
    if (day) {
      await triggerWebhook(tripId!, 'comment.added', {
        commentId: comment._id,
        activityId,
        userId,
        content,
      });
    }
    if (tripId) {
      const author = (comment.userId as any)?.name ?? 'Someone';
      const avatarUrl = (comment.userId as any)?.avatarUrl as string | undefined;
      const userIdObj = comment.userId as any;
      emitCommentNew(tripId, {
        _id: comment._id.toString(),
        activityId: activityId.toString(),
        userId: userIdObj
          ? {
              _id: userIdObj._id?.toString?.() ?? userIdObj,
              name: userIdObj.name ?? 'Unknown',
              email: userIdObj.email ?? '',
              avatarUrl: userIdObj.avatarUrl,
            }
          : null,
        content: comment.content,
        createdAt: (comment as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
        updatedAt: (comment as any).updatedAt?.toISOString?.(),
      });
      emitFeedEvent(tripId, {
        type: 'comment',
        userName: author,
        text: 'added a comment',
        detail: content.length > 60 ? content.slice(0, 60) + '…' : content,
        userAvatarUrl: avatarUrl,
      });
      emitTripNotification(tripId, {
        type: 'comment',
        title: 'New comment',
        body: content.length > 80 ? content.slice(0, 80) + '…' : content,
        actorId: userId!,
        actorName: author,
        metadata: { activityId: activityId.toString() },
      });
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCommentsByActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { activityId } = req.params;

    const comments = await Comment.find({ activityId })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Can only edit your own comments' });
    }

    comment.content = content;
    await comment.save();

    await comment.populate('userId', 'name email avatarUrl');

    res.json({ message: 'Comment updated', comment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Can only delete your own comments' });
    }

    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
