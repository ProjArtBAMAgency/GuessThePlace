import express from 'express';


import {
    getZones,
    getZoneById,
    getZonesForMap
} from '../../../controllers/zonesController.js';

const router = express.Router();

router.get('/', getZones);
router.get('/map', getZonesForMap);
router.get('/:id', getZoneById);


export default router;