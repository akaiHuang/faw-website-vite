import { onValueCreated } from 'firebase-functions/v2/database';
import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getDatabase } from 'firebase-admin/database';

// 初始化 Firebase Admin
initializeApp();

// 當有新聯絡表單時發送推播
export const sendNewContactNotification = onValueCreated(
  {
    ref: '/contacts/{contactId}',
    region: 'asia-southeast1'
  },
  async (event) => {
    const contact = event.data.val();
    const contactId = event.params.contactId;

    console.log('New contact received:', contactId, contact.name);

    // 取得所有已註冊的 FCM tokens
    const db = getDatabase();
    const tokensSnapshot = await db.ref('fcmTokens').once('value');
    const tokensData = tokensSnapshot.val();

    if (!tokensData) {
      console.log('No FCM tokens registered');
      return null;
    }

    // 準備推播訊息
    const message = {
      notification: {
        title: '📬 You Got Mail!',
        body: `New message from ${contact.name}`,
      },
      data: {
        contactId: contactId,
        name: contact.name || '',
        email: contact.email || '',
        type: 'new_contact'
      },
      webpush: {
        notification: {
          icon: '/img/logopng.png',
          badge: '/img/logopng.png',
          tag: 'new-contact',
          renotify: true,
          requireInteraction: true
        },
        fcmOptions: {
          link: '/fawentro'
        }
      }
    };

    // 發送給所有已註冊的裝置
    const tokens = Object.values(tokensData).map(t => t.token).filter(Boolean);
    
    if (tokens.length === 0) {
      console.log('No valid tokens found');
      return null;
    }

    console.log(`Sending notification to ${tokens.length} devices`);

    // 批次發送
    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast({
      tokens,
      ...message
    });

    console.log(`Successfully sent: ${response.successCount}, Failed: ${response.failureCount}`);

    // 清理無效的 tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.log('Failed token:', tokens[idx], resp.error?.message);
        }
      });

      // 從資料庫移除無效 tokens
      const updates = {};
      for (const [userId, data] of Object.entries(tokensData)) {
        if (failedTokens.includes(data.token)) {
          updates[`fcmTokens/${userId}`] = null;
        }
      }
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        console.log('Removed invalid tokens:', Object.keys(updates).length);
      }
    }

    return { success: true, sent: response.successCount };
  }
);
