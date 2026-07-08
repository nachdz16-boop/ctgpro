const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
  getAiBots,
  getAiBot,
  createAiBot,
  updateAiBot,
  deleteAiBot,
  toggleAiBotStatus,
  updateAiBotAvailability,
  chatWithAiBot,
  chatWithActiveAiBot,
  generateAiImage,
  createAiProductFromPrompt,
  uploadAiImage,
  createAiBotConversation,
  getAiBotConversations,
  getChatBots,
  getChatBot,
  getChatBotConversations,
  createChatBot,
  updateChatBot,
  deleteChatBot,
  toggleChatBotStatus,
} = require('../controllers/adminBotController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// AI bots
router.get('/ai-bots', getAiBots);
router.get('/ai-bots/:id', getAiBot);
router.post('/ai-bots', createAiBot);
router.put('/ai-bots/:id', updateAiBot);
router.delete('/ai-bots/:id', deleteAiBot);
router.patch('/ai-bots/:id/toggle', toggleAiBotStatus);
router.patch('/ai-bots/:id/availability', updateAiBotAvailability);
router.post('/ai-bots/active/chat', chatWithActiveAiBot);
router.post('/ai-bots/image/generate', generateAiImage);
router.post('/ai-bots/image/upload', upload.single('image'), uploadAiImage);
router.post('/ai-bots/active/product', createAiProductFromPrompt);
router.post('/ai-bots/:id/chat', chatWithAiBot);
router.post('/ai-bots/:id/conversations', createAiBotConversation);
router.get('/ai-bots/:id/conversations', getAiBotConversations);

// Chat bots
router.get('/chat-bots', getChatBots);
router.get('/chat-bots/conversations', getChatBotConversations);
router.get('/chat-bots/:id', getChatBot);
router.post('/chat-bots', createChatBot);
router.put('/chat-bots/:id', updateChatBot);
router.delete('/chat-bots/:id', deleteChatBot);
router.patch('/chat-bots/:id/toggle', toggleChatBotStatus);

module.exports = router;
