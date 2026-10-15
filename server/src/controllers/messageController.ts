import type { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/messageService.js';
import { apiSuccess } from '../utils/response.js';

export class MessageController {
  static async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const limit = Number(req.query.limit) || 50;
      const messages = await MessageService.getMessages(groupId, limit);
      return apiSuccess(res, { messages });
    } catch (err) {
      next(err);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const message = await MessageService.createMessage({
        groupId,
        senderId: req.user!.uid,
        senderName: req.user!.name || 'Member',
        senderPhoto: req.user!.picture,
        ...req.body,
      });
      return apiSuccess(res, message, 'Message sent', 201);
    } catch (err) {
      next(err);
    }
  }

  static async editMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const messageId = String(req.params.messageId);
      const { text } = req.body;
      const ok = await MessageService.editMessage(groupId, messageId, text);
      return apiSuccess(res, { ok });
    } catch (err) {
      next(err);
    }
  }

  static async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const messageId = String(req.params.messageId);
      const forEveryone = req.query.forEveryone !== 'false';
      const ok = await MessageService.deleteMessage(groupId, messageId, forEveryone);
      return apiSuccess(res, { ok });
    } catch (err) {
      next(err);
    }
  }

  static async toggleReaction(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const messageId = String(req.params.messageId);
      const { emoji } = req.body;
      const uid = req.user!.uid;
      const reactions = await MessageService.toggleReaction(groupId, messageId, uid, emoji);
      return apiSuccess(res, { reactions });
    } catch (err) {
      next(err);
    }
  }
}
