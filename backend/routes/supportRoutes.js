import express from 'express';
import { createSupportMessage, getSupportMessages, deleteSupportMessage } from '../controllers/supportController.js';

const router = express.Router();

router.route('/')
  .post(createSupportMessage)
  .get(getSupportMessages);

router.route('/:id')
  .delete(deleteSupportMessage);

export default router;
