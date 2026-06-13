import { Router } from 'express';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', authenticate, createAnnouncement);

export default router;
