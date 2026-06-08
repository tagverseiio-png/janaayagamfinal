import { Router } from 'express';
import { loginEmployee, loginCitizen, loginEmployeeAadhaar } from '../controllers/authController';

const router = Router();

router.post('/employee/login', loginEmployee);
router.post('/employee/aadhaar-login', loginEmployeeAadhaar);
router.post('/citizen/login', loginCitizen);

export default router;
