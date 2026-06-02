import express from 'express';
import { registerUser, confirmExistingUsers } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register — creates user with email auto-confirmed
router.post('/register', registerUser);

// GET /api/auth/fix-confirmations — one-time fix for existing unconfirmed accounts
router.get('/fix-confirmations', confirmExistingUsers);

export default router;
