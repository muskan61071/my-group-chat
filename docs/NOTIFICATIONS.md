# Notifications System Guide

HiveTalk features real-time in-app alerts, unread badge tracking, and desktop notifications.

---

## 1. Notification Types

| Type | Trigger | Target |
| :--- | :--- | :--- |
| `announcement` | New announcement posted | All group members |
| `mention` | User mentioned `@username` in message | Mentioned user |
| `call_incoming` | Incoming voice or video call | Target group or user |
| `system` | Group update or role changes | Group members |

---

## 2. Notification Channels

1. **In-App Toast & Badges**:
   - Real-time updates delivered over the user's personal socket room (`user:<userId>`).
   - Group unread badges update immediately when new messages arrive.
2. **Web Push / Browser Notifications**:
   - Supported via `Notification.requestPermission()`.
   - Triggers desktop banners when the application tab is in the background.

---

## 3. Data Structure

```typescript
export interface NotificationItem {
  id: string;
  userId?: string;
  groupId?: string;
  type: 'announcement' | 'mention' | 'call' | 'system';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: number;
  metadata?: Record<string, any>;
}
```
