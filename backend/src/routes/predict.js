// backend/src/routes/predict.js
import express from 'express';
import multer from 'multer';
import { analyzeFarm, ocrSoilCard } from '../controllers/predictController.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 16 * 1024 * 1024 } }); // 16MB max

router.post('/analyze', analyzeFarm);
router.post('/ocr', upload.single('image'), ocrSoilCard);

export default router;
