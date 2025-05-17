import express from 'express';
import courseRoutes from './courseRoutes';
import enrollmentRoutes from './enrollmentRoutes';

const router = express.Router();

// Mount course routes
router.use('/', courseRoutes);

// Mount enrollment routes
router.use('/', enrollmentRoutes);

export default router;