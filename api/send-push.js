const webpush = require('web-push');

// Environment Variables for Vercel:
// VAPID_PUBLIC_KEY
// VAPID_PRIVATE_KEY
// VAPID_SUBJECT

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BBLsTTSRyMBDxiJjy8C0EvbC2L3hnFfp2Edo6O4P5iJFbbb9DcSUnS7HVMvSNajJsTyZX54cWE2pQEbKaHFA1u8';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'EmWtdyiBeHzQda1oHGkFGiO4TQEFyOOcf07SsGpvnnc';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:mdyahyamundewadi@gmail.com';

webpush.setVapidDetails(
  vapidSubject,
  publicVapidKey,
  privateVapidKey
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { subscription, notification } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription endpoint is required.' });
    }

    const payload = JSON.stringify({
      title: notification.title || '⚡ PWA Push Notification by Yahya',
      body: notification.body || 'You have received a new update!',
      icon: notification.icon || './icon-192.png',
      badge: './icon-192.png',
      image: notification.image || './notification-image.png',
      url: notification.url || './index.html'
    });

    await webpush.sendNotification(subscription, payload);

    return res.status(200).json({ success: true, message: 'Push notification sent successfully!' });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({ error: error.message });
  }
};
