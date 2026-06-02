// backend/src/routes/report.js
import express from 'express';
import { generateReportPDF } from '../controllers/reportController.js';

const router = express.Router();

router.get('/generate/:prediction_id', generateReportPDF);

export default router;
