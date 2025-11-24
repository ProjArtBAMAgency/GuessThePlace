import express from 'express';


import {
    getZones,
    getZoneById
} from '../../../controllers/zonesController.js';

const router = express.Router();

router.get('/', getZones);
router.get('/:id', getZoneById);

export default router;