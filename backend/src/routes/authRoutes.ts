import { Router } from 'express';
import { loginEmployee, loginCitizen, signupCitizen } from '../controllers/authController';

const router = Router();

router.post('/employee/login', loginEmployee);
router.post('/citizen/login', loginCitizen);
router.post('/citizen/signup', signupCitizen);

export default router;
