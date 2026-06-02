// backend/src/routes/chat.js
import express from 'express';
import { handleChatMessage } from '../controllers/chatController.js';

const router = express.Router();

router.post('/message', handleChatMessage);

export default router;
