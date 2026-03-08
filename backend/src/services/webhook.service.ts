import axios from 'axios';
import crypto from 'crypto';
import Webhook from '../models/Webhook';
import { WebhookEvent } from '../types';

export const triggerWebhook = async (
  tripId: string,
  event: WebhookEvent | string,
  payload: any
) => {
  try {
    const webhooks = await Webhook.find({
      tripId,
      isActive: true,
      events: event,
    });

    if (webhooks.length === 0) {
      return;
    }

    const promises = webhooks.map(async (webhook) => {
      try {
        const webhookPayload = {
          event,
          tripId,
          timestamp: new Date().toISOString(),
          data: payload,
        };

        const headers: any = {
          'Content-Type': 'application/json',
          'X-CoRoute-Event': event,
        };

        if (webhook.secret) {
          const signature = crypto
            .createHmac('sha256', webhook.secret)
            .update(JSON.stringify(webhookPayload))
            .digest('hex');
          headers['X-CoRoute-Signature'] = signature;
        }

        await axios.post(webhook.url, webhookPayload, {
          headers,
          timeout: 5000,
        });

        console.log(`✅ Webhook triggered: ${webhook.url} for event ${event}`);
      } catch (error) {
        console.error(`❌ Webhook failed: ${webhook.url}`, error);
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Trigger webhook error:', error);
  }
};

export const validateWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};
