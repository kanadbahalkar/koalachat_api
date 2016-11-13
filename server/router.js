const AuthenticationController = require('./controllers/authentication'),
      // UserController = require('./controllers/user'),
      ChatController = require('./controllers/chat'),
      express = require('express'),
      passportService = require('./config/passport'),
      passport = require('passport');

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

// Constants for role types
const REQUIRE_ADMIN = "Admin",
      REQUIRE_OWNER = "Owner",
      REQUIRE_VISITOR = "Visitor";

module.exports = function(app) {
  // Initializing route groups
	const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        chatRoutes = express.Router();

  // Auth Routes
  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);

  // Registration route
  authRoutes.post('/registerowner', AuthenticationController.registerowner);

  // Registration route
  authRoutes.post('/registervisitor', AuthenticationController.registervisitor);

  // Login route
  authRoutes.post('/login', requireLogin, AuthenticationController.login);

  // Set chat routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/chat', chatRoutes);

  // View messages to and from authenticated user
  // chatRoutes.get('/', requireAuth, ChatController.getConversations);

  // Retrieve single conversation
  chatRoutes.get('/conversations/:conversationId', requireAuth, ChatController.getConversation);

  // Send reply in conversation
  chatRoutes.post('/conversations/:conversationId', requireAuth, ChatController.sendReply);

  // chatRoutes.get('/users', requireAuth, ChatController.getAllUsers);
  // chatRoutes.get('/conversations/users/:userID', requireAuth, ChatController.getClientConversations);

  // Start new conversation
  chatRoutes.post('/new/:recipient', requireAuth, ChatController.newConversation);

  // Broadcast message to all clients
  // chatRoutes.post('/announcement', requireAuth, ChatController.announcement);

  // chatRoutes.post('/messages/:clientID/', requireAuth, ChatController.getMessage);

	// Set url for API group routes
  app.use('/api', apiRoutes);
};
