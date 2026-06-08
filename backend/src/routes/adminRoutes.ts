import { Router } from 'express';
import { getEmployees, createEmployee, deleteEmployee } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';

const router = Router();

// In a real app we'd add an authorize(['CM', 'Superadmin']) middleware here
router.use(authenticate);

router.get('/employees', getEmployees);
router.post('/employees', createEmployee);
router.delete('/employees/:id', deleteEmployee);

export default router;
