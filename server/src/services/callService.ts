import { adminDb } from '../config/firebaseAdmin.js';

export interface CallRecord {
  id: string;
  groupId: string;
  type: 'voice' | 'video';
  initiatorId: string;
  initiatorName: string;
  initiatorPhoto?: string | null;
  status: 'active' | 'ended' | 'missed';
  startedAt: number;
  endedAt?: number;
  duration?: number;
  participants: string[];
}

const memCalls = new Map<string, CallRecord>();

export class CallService {
  /**
   * Initializes a new group call session
   */
  static async startCall(groupId: string, type: 'voice' | 'video', initiator: any): Promise<CallRecord> {
    const id = 'call_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const startedAt = Date.now();

    const call: CallRecord = {
      id,
      groupId,
      type,
      initiatorId: initiator.uid || initiator.userId,
      initiatorName: initiator.displayName || 'Caller',
      initiatorPhoto: initiator.photoURL,
      status: 'active',
      startedAt,
      participants: [initiator.uid || initiator.userId],
    };

    memCalls.set(id, call);

    try {
      await adminDb.collection('calls').doc(id).set(call);
    } catch {}

    return call;
  }

  /**
   * Ends a call session
   */
  static async endCall(callId: string, duration?: number): Promise<CallRecord | null> {
    const call = memCalls.get(callId);
    if (!call) return null;

    const endedAt = Date.now();
    call.status = 'ended';
    call.endedAt = endedAt;
    call.duration = duration || Math.round((endedAt - call.startedAt) / 1000);

    try {
      await adminDb.doc(`calls/${callId}`).update({
        status: 'ended',
        endedAt,
        duration: call.duration,
      });
    } catch {}

    return call;
  }

  /**
   * Retrieves call logs for a group or user
   */
  static async getCallHistory(groupId?: string, limitCount: number = 30): Promise<CallRecord[]> {
    try {
      let query = adminDb.collection('calls').orderBy('startedAt', 'desc').limit(limitCount);
      if (groupId) {
        query = adminDb.collection('calls').where('groupId', '==', groupId).orderBy('startedAt', 'desc').limit(limitCount);
      }

      const snap = await query.get();
      if (!snap.empty) {
        return snap.docs.map((d) => ({ ...d.data(), id: d.id } as CallRecord));
      }
    } catch {}

    const list = Array.from(memCalls.values()).sort((a, b) => b.startedAt - a.startedAt);
    return groupId ? list.filter((c) => c.groupId === groupId) : list;
  }
}
