import express from 'express';
import courseRoutes from './courseRoutes';

const router = express.Router();

// Mount course routes
router.use('/', courseRoutes);

export default router;