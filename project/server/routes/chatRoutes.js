const express = require('express');
const router = express.Router();
const {
  getChatMessages,
  sendMessage,
  markAsRead
} = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/rfq/:rfqId', getChatMessages);
router.post('/rfq/:rfqId', sendMessage);
router.put('/:id/read', markAsRead);

module.exports = router;

