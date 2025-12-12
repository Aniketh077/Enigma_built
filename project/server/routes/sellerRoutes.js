const express = require('express');
const router = express.Router();
const {
  createSellerRequest,
  getAllSellerRequests,
  getSellerRequestById,
  approveSellerRequest,
  rejectSellerRequest,
  deleteSellerRequest
} = require('../controllers/sellerController');
const { protect } = require('../middlewares/auth');
const { admin } = require('../middlewares/admin');

router.post('/', createSellerRequest);

router.get('/', protect, admin, getAllSellerRequests);
router.get('/:id', protect, admin, getSellerRequestById);

router.put('/:id/approve', protect, admin, approveSellerRequest);
router.put('/:id/reject', protect, admin, rejectSellerRequest);

router.delete('/:id', protect, admin, deleteSellerRequest);

module.exports = router;
