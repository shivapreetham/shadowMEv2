import express from 'express';
const router = express.Router();
import {scrapeAttendance} from '../controllers/attendanceScraper.js';

router.post('/:roomId',scrapeAttendance);

export default router;