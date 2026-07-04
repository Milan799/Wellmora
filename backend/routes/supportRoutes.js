import express from 'express';
import { createSupportMessage, getSupportMessages } from '../controllers/supportController.js';

const router = express.Router();

router.route('/')
  .post(createSupportMessage)
  .get(getSupportMessages);

export default router;
