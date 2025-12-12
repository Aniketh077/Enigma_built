const express = require('express');
const router = express.Router();
const {
  createRFQ,
  getRFQById,
  updateRFQ,
  deleteRFQ,
  getRFQPool,
  requestRFQ,
  acceptManufacturer,
  rejectManufacturer,
  updateRFQStatus,
  getAcceptedRFQs,
  getMyRFQs
} = require('../controllers/rfqController');
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// RFQ CRUD
router.post('/', createRFQ);
router.get('/my-rfqs', getMyRFQs);
router.get('/pool', getRFQPool);
router.get('/accepted', getAcceptedRFQs);
router.get('/:id', getRFQById);
router.put('/:id', updateRFQ);
router.delete('/:id', deleteRFQ);

// RFQ Actions
router.post('/:id/request', requestRFQ);
router.post('/:id/accept-manufacturer', acceptManufacturer);
router.post('/:id/reject-manufacturer', rejectManufacturer);
router.put('/:id/status', updateRFQStatus);

module.exports = router;

