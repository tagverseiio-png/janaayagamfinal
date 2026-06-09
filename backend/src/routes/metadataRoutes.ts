import { Router } from 'express';
import { 
  getDepartments, 
  getJurisdictions, 
  createJurisdiction, 
  updateJurisdiction, 
  deleteJurisdiction,
  getComplaintCategories,
  getRoles,
  getZones,
  getLifecycleTransitions
} from '../controllers/metadataController';

const router = Router();

router.get('/departments', getDepartments);
router.get('/jurisdictions', getJurisdictions);
router.post('/jurisdictions', createJurisdiction);
router.put('/jurisdictions/:id', updateJurisdiction);
router.delete('/jurisdictions/:id', deleteJurisdiction);

router.get('/categories', getComplaintCategories);
router.get('/roles', getRoles);
router.get('/zones', getZones);
router.get('/lifecycle', getLifecycleTransitions);

export default router;

