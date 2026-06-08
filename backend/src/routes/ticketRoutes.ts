import { Router } from 'express';
import { createTicket, getTickets, updateTicket } from '../controllers/ticketController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all ticket routes
router.use(authenticate);

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', updateTicket);

export default router;
