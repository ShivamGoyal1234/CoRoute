import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import TripFile from '../models/TripFile';
import Trip from '../models/Trip';
import { AuthRequest } from '../middleware/auth.middleware';
import config from '../config';

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
    cb(null, 'trip-' + uniqueSuffix + path.extname(file.originalname));
  },
});

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
  storage,
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
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Trip ID required' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Trip not found' });
    }

    const tripFile = new TripFile({
      tripId,
      userId,
      fileUrl: `/uploads/${req.file.filename}`,
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
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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

    const filePath = path.join(process.cwd(), tripFile.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await tripFile.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete trip file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
