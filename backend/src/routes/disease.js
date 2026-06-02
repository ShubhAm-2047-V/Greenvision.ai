// backend/src/routes/disease.js
import express from 'express';
import multer from 'multer';
import { scanDisease } from '../controllers/diseaseController.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 16 * 1024 * 1024 } }); // 16MB max

router.post('/scan', upload.single('image'), scanDisease);

export default router;
