import type { Request, Response, NextFunction } from 'express';
import { MediaService } from '../services/mediaService.js';
import { apiSuccess } from '../utils/response.js';

export class MediaController {
  static async uploadMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'No file provided' });
      }
      const groupId = String(req.params.groupId);
      const attachment = await MediaService.uploadFile(file, groupId);
      return apiSuccess(res, attachment, 'Media uploaded', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getCategorizedMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = String(req.params.groupId);
      const media = await MediaService.getCategorizedMedia(groupId);
      return apiSuccess(res, media);
    } catch (err) {
      next(err);
    }
  }
}
