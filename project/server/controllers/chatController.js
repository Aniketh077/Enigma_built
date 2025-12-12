const Chat = require('../models/Chat');
const RFQ = require('../models/RFQ');

// @desc    Get chat messages for RFQ
// @route   GET /api/chat/rfq/:rfqId
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const userId = req.user._id;

    // Verify access to RFQ
    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    const isBuyer = rfq.buyerId.toString() === userId.toString();
    const isManufacturer = rfq.selectedManufacturerId && 
      rfq.selectedManufacturerId.toString() === userId.toString();

    if (!isBuyer && !isManufacturer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Chat.find({ rfqId })
      .populate('senderId', 'fullName companyName')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Send chat message
// @route   POST /api/chat/rfq/:rfqId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const { message, attachments } = req.body;
    const senderId = req.user._id;

    // Verify access to RFQ
    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    const isBuyer = rfq.buyerId.toString() === senderId.toString();
    const isManufacturer = rfq.selectedManufacturerId && 
      rfq.selectedManufacturerId.toString() === senderId.toString();

    if (!isBuyer && !isManufacturer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const chatMessage = await Chat.create({
      rfqId,
      senderId,
      message,
      attachments: attachments || []
    });

    const populatedMessage = await Chat.findById(chatMessage._id)
      .populate('senderId', 'fullName companyName');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/chat/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Chat.findById(req.params.id)
      .populate('rfqId');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify access
    const rfq = message.rfqId;
    const userId = req.user._id;
    const isBuyer = rfq.buyerId.toString() === userId.toString();
    const isManufacturer = rfq.selectedManufacturerId && 
      rfq.selectedManufacturerId.toString() === userId.toString();

    if (!isBuyer && !isManufacturer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only mark as read if not sender
    if (message.senderId.toString() !== userId.toString()) {
      message.read = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getChatMessages,
  sendMessage,
  markAsRead
};

