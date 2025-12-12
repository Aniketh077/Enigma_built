const express = require('express');
const router = express.Router();
const { searchRFQsController, searchManufacturersController } = require('../controllers/searchController');
const { protect } = require('../middlewares/auth');

router.get('/rfqs', protect, searchRFQsController);
router.get('/manufacturers', protect, searchManufacturersController);

module.exports = router;

