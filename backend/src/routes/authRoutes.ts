import { Router } from 'express';
import { loginEmployee, loginCitizen, signupCitizen, updateVolunteerStatus } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/employee/login', loginEmployee);
router.post('/citizen/login', loginCitizen);
router.post('/citizen/signup', signupCitizen);
router.patch('/citizen/volunteer', authenticate, updateVolunteerStatus);

export default router;
