import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import TripFile from '../models/TripFile';
import Trip from '../models/Trip';
import { AuthRequest } from '../middleware/auth.middleware';
import { getFileUrlAfterUpload } from '../storage';

const fileFilter = (req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/|application\/pdf|application\/msword|application\/vnd\.|text\//.test(file.mimetype);

  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
};

const TRIP_FILE_MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TRIP_FILE_MAX_SIZE },
  fileFilter,
});

export const uploadTripFile = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.body;
    const userId = req.user?.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID required' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const fileUrl = await getFileUrlAfterUpload(req.file);

    const tripFile = new TripFile({
      tripId,
      userId,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    await tripFile.save();
    await tripFile.populate('userId', 'name email avatarUrl');

    res.status(201).json({
      message: 'File uploaded successfully',
      file: tripFile,
    });
  } catch (error) {
    console.error('Upload trip file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTripFiles = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;

    const files = await TripFile.find({ tripId })
      .populate('userId', 'name email avatarUrl')
      .sort({ uploadedAt: -1 });

    res.json({ files });
  } catch (error) {
    console.error('Get trip files error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTripFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tripFile = await TripFile.findById(id);
    if (!tripFile) {
      return res.status(404).json({ error: 'File not found' });
    }

    await tripFile.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete trip file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
