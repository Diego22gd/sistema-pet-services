// uploadRoutes.js
import express from 'express';
import { uploadImage, upload, handleMulterError } from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', 
  protect,
  upload.single('image'),
  handleMulterError,
  uploadImage
);

export default router;