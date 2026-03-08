import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Attachment from '../models/Attachment';
import Activity from '../models/Activity';
import Day from '../models/Day';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import config from '../config';
import { emitFeedEvent, emitAttachmentNew, emitAttachmentRemoved, emitTripNotification } from '../socket/socket.service';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.upload.uploadDir;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter,
});

export const uploadAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const rawActivityId = req.body?.activityId;
    const activityId = typeof rawActivityId === 'string' ? rawActivityId : Array.isArray(rawActivityId) ? rawActivityId[0] : undefined;
    const userId = req.user?.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!activityId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'activityId required' });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Activity not found' });
    }

    const attachment = new Attachment({
      activityId,
      userId,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    await attachment.save();
    await attachment.populate('userId', 'name email avatarUrl');

    const day = await Day.findById(activity.dayId);
    const tripId = day?.tripId?.toString();
    if (tripId) {
      const userName = (attachment.userId as { name?: string })?.name ?? 'Someone';
      emitFeedEvent(tripId, {
        type: 'attachment_added',
        userName,
        text: 'added a file',
        detail: activity.title,
      });
      emitAttachmentNew(tripId, {
        activityId: activityId.toString(),
        attachment: attachment.toObject ? attachment.toObject() : attachment,
      });
      emitTripNotification(tripId, {
        type: 'file_added',
        title: 'File added',
        body: `${userName} added a file to "${activity.title}"`,
        actorId: userId!,
        actorName: userName,
        metadata: { activityId: activityId.toString(), tripId },
      });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload attachment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAttachmentsByActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { activityId } = req.params;

    const attachments = await Attachment.find({ activityId })
      .populate('userId', 'name email avatarUrl')
      .sort({ uploadedAt: -1 });

    res.json({ attachments });
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const attachment = await Attachment.findById(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    if (attachment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Can only delete your own attachments' });
    }

    const activity = await Activity.findById(attachment.activityId);
    const day = activity ? await Day.findById(activity.dayId) : null;
    const tripId = day?.tripId?.toString();
    const attachmentId = attachment._id.toString();
    const activityId = attachment.activityId.toString();
    const fileName = (attachment as any).fileName;

    const filePath = path.join(process.cwd(), attachment.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await attachment.deleteOne();

    if (tripId) {
      const author = await User.findById(userId).select('name').lean();
      const userName = (author as { name?: string } | null)?.name ?? 'Someone';
      const detail = activity ? activity.title : (fileName ? `"${fileName}"` : 'a file');
      emitFeedEvent(tripId, {
        type: 'attachment_removed',
        userName,
        text: 'removed a file',
        detail: activity ? activity.title : (fileName ? `"${fileName}"` : undefined),
      });
      emitAttachmentRemoved(tripId, { activityId, attachmentId });
      emitTripNotification(tripId, {
        type: 'file_removed',
        title: 'File removed',
        body: `${userName} removed ${detail}`,
        actorId: userId,
        actorName: userName,
        metadata: { activityId, tripId },
      });
    }

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
