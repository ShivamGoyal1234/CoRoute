import { Response } from 'express';
import { validationResult } from 'express-validator';
import Webhook from '../models/Webhook';
import { AuthRequest } from '../middleware/auth.middleware';
import { WebhookEvent } from '../types';

export const registerWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tripId, url, events, secret } = req.body;
    const userId = req.user?.userId;
    const validEvents = events.every((e: string) =>
      Object.values(WebhookEvent).includes(e as WebhookEvent)
    );

    if (!validEvents) {
      return res.status(400).json({ error: 'Invalid webhook events' });
    }

    const webhook = new Webhook({
      tripId,
      url,
      events,
      secret,
      isActive: true,
      createdBy: userId,
    });

    await webhook.save();

    res.status(201).json({
      message: 'Webhook registered successfully',
      webhook,
    });
  } catch (error) {
    console.error('Register webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWebhooksByTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;

    const webhooks = await Webhook.find({ tripId }).populate(
      'createdBy',
      'name email'
    );

    res.json({ webhooks });
  } catch (error) {
    console.error('Get webhooks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { url, events, isActive, secret } = req.body;

    const webhook = await Webhook.findById(id);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    
    if (events) {
      const validEvents = events.every((e: string) =>
        Object.values(WebhookEvent).includes(e as WebhookEvent)
      );

      if (!validEvents) {
        return res.status(400).json({ error: 'Invalid webhook events' });
      }
      webhook.events = events;
    }

    if (url) webhook.url = url;
    if (isActive !== undefined) webhook.isActive = isActive;
    if (secret !== undefined) webhook.secret = secret;

    await webhook.save();

    res.json({ message: 'Webhook updated', webhook });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findByIdAndDelete(id);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Delete webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAvailableEvents = (req: AuthRequest, res: Response) => {
  res.json({
    events: Object.values(WebhookEvent),
  });
};
