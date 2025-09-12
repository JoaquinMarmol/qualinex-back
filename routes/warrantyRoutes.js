const express = require('express');
const { body } = require('express-validator');
const { 
  createWarranty, 
  getAllWarranties, 
  getUserWarranties 
} = require('../controllers/warrantyController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Validation rules for warranty creation
const warrantyValidation = [
  body('vehicleMake')
    .trim()
    .notEmpty()
    .withMessage('La marca del vehículo es requerida')
    .isLength({ min: 1, max: 50 })
    .withMessage('La marca debe tener entre 1 y 50 caracteres'),
  
  body('vehicleModel')
    .trim()
    .notEmpty()
    .withMessage('El modelo del vehículo es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El modelo debe tener entre 1 y 50 caracteres'),
  
  body('vehicleYear')
    .trim()
    .notEmpty()
    .withMessage('El año del vehículo es requerido')
    .matches(/^\d{4}$/)
    .withMessage('El año debe ser un número de 4 dígitos')
    .custom((value) => {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        throw new Error(`El año debe estar entre 1900 y ${currentYear + 1}`);
      }
      return true;
    }),
  
  body('vehicleVIN')
    .trim()
    .notEmpty()
    .withMessage('El VIN del vehículo es requerido')
    .isLength({ min: 17, max: 17 })
    .withMessage('El VIN debe tener exactamente 17 caracteres')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('El VIN contiene caracteres inválidos'),
  
  body('installerName')
    .trim()
    .notEmpty()
    .withMessage('El nombre del instalador es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del instalador debe tener entre 2 y 100 caracteres'),
  
  body('warrantyCode')
    .trim()
    .notEmpty()
    .withMessage('El código de garantía es requerido')
    .isLength({ min: 5, max: 20 })
    .withMessage('El código de garantía debe tener entre 5 y 20 caracteres')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('El código de garantía solo puede contener letras mayúsculas, números y guiones')
];

// Routes
router.post('/', authMiddleware, warrantyValidation, createWarranty);
router.get('/', authMiddleware, adminMiddleware, getAllWarranties);
router.get('/my-warranties', authMiddleware, getUserWarranties);

module.exports = router;

