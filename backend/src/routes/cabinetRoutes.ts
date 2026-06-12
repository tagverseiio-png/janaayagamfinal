import { Router } from 'express';
import { generateCabinetReport, getLatestCabinetReport } from '../controllers/cabinetController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/latest', getLatestCabinetReport);
router.post('/generate', generateCabinetReport);

export default router;
