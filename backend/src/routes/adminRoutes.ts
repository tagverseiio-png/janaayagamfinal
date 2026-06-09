import { Router } from 'express';
import { getEmployees, createEmployee, deleteEmployee } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('Superadmin', 'SUPER_ADMIN'));

router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.delete('/employees/:id', deleteEmployee);

export default router;
