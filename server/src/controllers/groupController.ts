import type { Request, Response, NextFunction } from 'express';
import { GroupService } from '../services/groupService.js';
import { apiSuccess } from '../utils/response.js';

export class GroupController {
  static async listUserGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const uid = req.user!.uid;
      const groups = await GroupService.getUserGroups(uid);
      return apiSuccess(res, { groups });
    } catch (err) {
      next(err);
    }
  }

  static async getGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const group = await GroupService.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      return apiSuccess(res, { group });
    } catch (err) {
      next(err);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const members = await GroupService.getMembers(groupId);
      return apiSuccess(res, { members });
    } catch (err) {
      next(err);
    }
  }

  static async updateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const ok = await GroupService.updateGroup(groupId, req.body);
      return apiSuccess(res, { ok });
    } catch (err) {
      next(err);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const userId = String(req.params.userId || req.user!.uid);
      const ok = await GroupService.removeMember(groupId, userId);
      return apiSuccess(res, { ok });
    } catch (err) {
      next(err);
    }
  }
}
