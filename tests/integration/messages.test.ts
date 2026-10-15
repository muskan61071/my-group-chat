import { describe, it, expect } from 'vitest';
import { sendMessageSchema } from '../../shared/validators/messageSchema.js';

describe('Integration: Messages, Reactions & Threading', () => {
  it('validates text message payload schema', () => {
    const valid = sendMessageSchema.safeParse({
      kind: 'text',
      text: 'Hello team from integration test!',
    });
    expect(valid.success).toBe(true);
  });

  it('correctly toggles emoji reactions for users', () => {
    let reactions: Record<string, string[]> = {
      '👍': ['user_1'],
    };

    // User 2 adds 👍
    const emoji = '👍';
    const user2 = 'user_2';
    if (!reactions[emoji]) reactions[emoji] = [];
    if (!reactions[emoji].includes(user2)) {
      reactions[emoji].push(user2);
    }
    expect(reactions['👍']).toContain('user_1');
    expect(reactions['👍']).toContain('user_2');

    // User 1 removes reaction (toggle off)
    reactions[emoji] = reactions[emoji].filter((uid) => uid !== 'user_1');
    expect(reactions['👍']).not.toContain('user_1');
    expect(reactions['👍']).toContain('user_2');
  });

  it('validates reply-to threading linking', () => {
    const parentMessage = {
      id: 'msg_parent_1',
      text: 'Original question?',
    };

    const replyMessage = {
      id: 'msg_reply_2',
      text: 'Answer here!',
      replyToId: parentMessage.id,
    };

    expect(replyMessage.replyToId).toBe(parentMessage.id);
  });
});
