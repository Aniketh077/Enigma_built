const express = require('express');
const router = express.Router();
const {
  getInvitations,
  acceptInvitation,
  declineInvitation,
  createInvitation
} = require('../controllers/invitationController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', getInvitations);
router.post('/', createInvitation);
router.post('/:id/accept', acceptInvitation);
router.post('/:id/decline', declineInvitation);

module.exports = router;

