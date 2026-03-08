import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message,
    });
  }

  if ((err as any).code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Profile picture must be under 2MB.' });
  }
  if (err.message?.includes('Invalid file type') || err.message?.includes('Only images')) {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'MongoError' && (err as any).code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry',
      details: 'This record already exists',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};
