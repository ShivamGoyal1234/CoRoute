import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import Membership from '../models/Membership';
import Trip from '../models/Trip';
import Day from '../models/Day';
import Activity from '../models/Activity';
import { MemberRole } from '../types';

export const checkTripAccess = (allowedRoles: MemberRole[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tripId = req.params.tripId || req.body.tripId || req.params.id;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (trip.createdBy.toString() === userId) {
        return next(); // Owner
      }

      const membership = await Membership.findOne({ tripId, userId });
      if (!membership) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
};

export const canEdit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let tripId = req.params.tripId || req.body.tripId || req.params.id;

    if (!tripId) {
      const dayId = req.params.dayId || req.body.dayId;
      const activityId =
        req.params.activityId ||
        req.body.activityId ||
        (Array.isArray(req.body.activities) && req.body.activities[0]?.id);

      if (dayId) {
        const day = await Day.findById(dayId);
        if (day) tripId = day.tripId.toString();
      } else if (activityId) {
        const activity = await Activity.findById(activityId);
        if (activity) {
          const day = await Day.findById(activity.dayId);
          if (day) tripId = day.tripId.toString();
        }
      }
    }

    if (!tripId) {
      return res.status(400).json({ error: 'Trip context required' });
    }

    let trip = await Trip.findById(tripId);
    if (!trip) {
      const activityId = req.params.activityId || req.body.activityId || req.params.id;
      if (activityId) {
        const activity = await Activity.findById(activityId);
        if (activity) {
          const day = await Day.findById(activity.dayId);
          if (day) {
            tripId = day.tripId.toString();
            trip = await Trip.findById(tripId);
          }
        }
      }
    }
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() === userId) {
      return next();
    }

    const membership = await Membership.findOne({ tripId, userId });
    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (membership.role === MemberRole.EDITOR || membership.role === MemberRole.OWNER) {
      return next();
    }

    res.status(403).json({ error: 'Editor or Owner role required' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const isOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tripId = req.params.tripId || req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Owner access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const canView = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let tripId = req.params.tripId || req.body.tripId || req.params.id;

    if (!tripId) {
      const dayId = req.params.dayId || req.body.dayId;
      const activityId = req.params.activityId || req.body.activityId;

      if (dayId) {
        const day = await Day.findById(dayId);
        if (day) tripId = day.tripId.toString();
      } else if (activityId) {
        const activity = await Activity.findById(activityId);
        if (activity) {
          const day = await Day.findById(activity.dayId);
          if (day) tripId = day.tripId.toString();
        }
      }
    }

    if (!tripId) {
      return res.status(400).json({ error: 'Trip context required' });
    }

    let trip = await Trip.findById(tripId);
    if (!trip) {
      const activityId = req.params.activityId || req.body.activityId || req.params.id;
      if (activityId) {
        const activity = await Activity.findById(activityId);
        if (activity) {
          const day = await Day.findById(activity.dayId);
          if (day) {
            tripId = day.tripId.toString();
            trip = await Trip.findById(tripId);
          }
        }
      }
    }
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.createdBy.toString() === userId) {
      return next();
    }

    const membership = await Membership.findOne({ tripId, userId });
    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
