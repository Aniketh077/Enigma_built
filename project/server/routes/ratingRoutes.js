const express = require('express');
const router = express.Router();
const {
  createRating,
  getRatings,
  getRatingByRFQ
} = require('../controllers/ratingController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', getRatings);
router.get('/rfq/:rfqId', getRatingByRFQ);
router.post('/', createRating);

module.exports = router;

