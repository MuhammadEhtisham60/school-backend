import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import * as studentController from './student.controller.js';

const router = Router();

// Ensure upload directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Multer Upload Configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG images and PDF files are allowed.'));
  }
});

// Configure the expected upload fields
const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'bFormCopy', maxCount: 1 },
  { name: 'prevResultCard', maxCount: 1 },
  { name: 'guardianCnic', maxCount: 1 }
]);

// Apply authentication middleware to all student routes
router.use(authMiddleware);

// Define CRUD routes for students
router.post('/admission', uploadFields, studentController.enrollStudent);
router.post('/enroll', uploadFields, studentController.enrollStudent); // support both aliases
router.get('/', studentController.getStudentsList);
router.get('/:id', studentController.getStudentDetails);
router.put('/:id', uploadFields, studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Student Fee Management routes
router.get('/:id/fees', studentController.getStudentFees);
router.patch('/:id/fees/:month', studentController.updateMonthlyFee);
router.post('/:id/fees/:month/pay', studentController.payMonthlyFee);

export default router;
