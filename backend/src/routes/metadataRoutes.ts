import { Router } from 'express';
import { getDepartments, getJurisdictions, createJurisdiction, updateJurisdiction, deleteJurisdiction } from '../controllers/metadataController';

const router = Router();

router.get('/departments', getDepartments);

router.get('/jurisdictions', getJurisdictions);
router.post('/jurisdictions', createJurisdiction);
router.put('/jurisdictions/:id', updateJurisdiction);
router.delete('/jurisdictions/:id', deleteJurisdiction);

export default router;
