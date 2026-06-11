import { Router } from 'express';
import { createTicket, getTickets, updateTicket, checkDuplicates, addClaim } from '../controllers/ticketController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all ticket routes
router.use(authenticate);

// POST /api/tickets — JSON body with optional base64 photo field
router.post('/', createTicket);
router.get('/', getTickets);
router.get('/check-duplicates', checkDuplicates);
router.post('/claim', addClaim);
router.patch('/:id', updateTicket);

export default router;
