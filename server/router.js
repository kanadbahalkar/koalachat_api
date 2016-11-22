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

  // View Visitors and an authenticated Owner
  // chatRoutes.get('/visitors', requireAuth, ChatController.getVisitors);

  // Retrieve single conversation by Visitor
  // chatRoutes.get('/conversations/:visitorId', requireAuth, ChatController.getConversationByVisitor);

  // Retrieve single conversation by id
  chatRoutes.get('/conversations/:conversationId', requireAuth, ChatController.getConversation);

  // Send reply in conversation
  chatRoutes.post('/conversations/:conversationId', requireAuth, ChatController.sendReply);

  // Start new conversation
  chatRoutes.post('/new/:recipient', requireAuth, ChatController.newConversation);

  // Broadcast message to all clients
  // chatRoutes.post('/announcement', requireAuth, ChatController.announcement);

  // chatRoutes.post('/messages/:clientID/', requireAuth, ChatController.getMessage);

  // Set url for API group routes
  app.use('/api', apiRoutes);
};

//Other routes needed
//1. Register a Visitor under an Owners account
//2. Establish connection between a Visitor and Owner
//3. Disconnect a Visitor from an Owner
//4. Get a list of all Visitors for an Owner
//5. Get a list of all Visitors & Owners for Admin
//6. Search for a Visitor or Owner for Admin