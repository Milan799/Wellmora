import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.route('/')
  .post(createOrder)
  .get(authorizeRoles('admin'), getOrders);

router.route('/myorders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById)
  .put(authorizeRoles('admin'), updateOrderStatus);

export default router;
