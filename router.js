const AuthenticationController = require('./controllers/authentication'),
    // UserController = require('./controllers/user'),
    ChatController = require('./controllers/chat'),
    profileController = require('./controllers/profile'),
    express = require('express'),
    passportService = require('./config/passport'),
    passport = require('passport'),
    WidgetController = require('./controllers/widget_controller');

// Middleware to require login/auth
var requireAuth = passport.authenticate('jwt', { session: false });
var requireLogin = passport.authenticate('local', { session: false });
var facebookAuth = passport.authenticate('facebook', { scope: ['email', 'user_birthday', 'pages_show_list']});
var googleAuth = passport.authenticate('google', { scope : ['profile', 'email'] });

// Constants for role types
const REQUIRE_ADMIN = "Admin",
    REQUIRE_OWNER = "Owner",
    REQUIRE_VISITOR = "Visitor";

module.exports = function(app) {
  // Initializing route groups
  const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        chatRoutes = express.Router(),
        profileRouters = express.Router();

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

  // widget routes -
  apiRoutes.use('/widget/embedcode', WidgetController.embedCode);

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

  //for facebook authentication
  // route for facebook authentication and login
  app.get('/auth/facebook', facebookAuth);

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/profile', isLoggedIn, AuthenticationController.login);


    //Google Auth
    app.get('/auth/google', googleAuth);
    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));

    //TODO Kanad changes does not account for jwt token
    // app.get('/profile', isLoggedIn, function(req, res) {
    //     //Redirect Owner to the Dashboard after succesful authentication
    //     res.redirect('http://localhost:4730/#/app/dashboard');
    //
    //     // res.status(200).send({
    //     //     user: req.user
    //     // });
    // });

    // route for logging out
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    //apiRoutes.post('/profile/welcome-message', requireAuth, profileController.updateWelcomeMessage);
    apiRoutes.use('/profile', profileRouters);
    //Route to update owners' welcome message
    profileRouters.post('/welcome-message', requireAuth, profileController.updateWelcomeMessage);

    //Route to get owner's info
    profileRouters.post('/getownerinfo', requireAuth, profileController.getOwnerInfo);
    // Set url for API group routes
    app.use('/api', apiRoutes);

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    console.log("User not authenticated");
    // if they aren't redirect them to the home page
    res.redirect('/');
}

//Other routes needed
//1. Register a Visitor under an Owners account
//2. Establish connection between a Visitor and Owner
//3. Disconnect a Visitor from an Owner
//4. Get a list of all Visitors for an Owner
//5. Get a list of all Visitors & Owners for Admin
//6. Search for a Visitor or Owner for Admin
