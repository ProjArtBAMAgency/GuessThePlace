import express from 'express';


import {
    getZones,
    getZoneById,
    getZonesForMap
} from '../../../controllers/zonesController.js';

const router = express.Router();

router.get('/', getZones);
router.get('/:id', getZoneById);
router.get('/map', getZonesForMap);

export default router;