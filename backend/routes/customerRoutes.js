const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', authMiddleware, customerController.getAllCustomers);
router.post('/', authMiddleware, customerController.createCustomer);
router.put('/:id', authMiddleware, customerController.updateCustomer);
router.delete('/:id', authMiddleware, customerController.deleteCustomer);
router.post('/upload', authMiddleware, upload.single('file'), customerController.uploadCustomers);

module.exports = router;
