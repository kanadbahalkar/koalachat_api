const express = require('express'),
    passport = require('passport'),
    passportService = require('./config/passport'),
    authenticationController = require('./controllers/authentication'),
    chatController = require('./controllers/chat'),
    profileController = require('./controllers/profile'),
    visitorController = require('./controllers/visitor'),
    widgetController = require('./controllers/widget_controller'),
    crawlerController = require('./controllers/crawler');

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
            profileRouters = express.Router(),
            widgetRouters = express.Router(),
            visitorRouters = express.Router(),
            crawlerRouters = express.Router();

    // Auth Routes
    // Set auth routes as subgroup/middleware to apiRoutes
    apiRoutes.use('/auth', authRoutes);
    // Registration route
    authRoutes.post('/registerowner', authenticationController.registerowner);
    // Login route
    authRoutes.post('/login', requireLogin, authenticationController.login);

    // Chat routes
    apiRoutes.use('/chat', chatRoutes);
    // Retrieve all conversations between owner and visitor
    chatRoutes.post('/conversations/:visitorid', requireAuth, chatController.getConversations);
    // Retrieve single conversation by id
    chatRoutes.post('/conversation/:conversationId', requireAuth, chatController.getConversation);
    // Send reply in conversation
    chatRoutes.post('/conversations/:conversationId', requireAuth, chatController.sendReply);
    // Start new conversation
    chatRoutes.post('/new/:recipient', requireAuth, chatController.newConversation);
    // Delete a conversation
    chatRoutes.post('/delete/:conversationId', requireAuth, chatController.deleteConversation);

    app.use(passport.initialize());
    app.use(passport.session());

    //for facebook authentication
    // route for facebook authentication and login
    app.get('/auth/facebook', facebookAuth);

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: '/login' }),
        function(req, res) {
            // Successful authentication, redirect home. 
            console.log("SADSAD");
            res.redirect('/');
        });
        
    app.get('/profile', isLoggedIn, authenticationController.login);


    //Google Auth
    app.get('/auth/google', googleAuth);
    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
                successRedirect : '/',
                failureRedirect : '/login'
        }));
    
    // route for logging out
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

    //Profile Routes
    apiRoutes.use('/profile', profileRouters);
    //Update owners' welcome message
    profileRouters.post('/setwelcomemessage', requireAuth, profileController.updateWelcomeMessage);
    //Get owner's info
    profileRouters.post('/getownerinfo', requireAuth, profileController.getOwnerInfo);
    //Update owner's info
    profileRouters.post('/updateownerinfo', requireAuth, profileController.updateOwnerInfo);
    //Allow anonymous / non-anonymous chats
    profileRouters.post('/allowanonymous', requireAuth, profileController.allowAnonymous);
    //Set notification frequency
    profileRouters.post('/emailfrequency', requireAuth, profileController.emailFrequency);

    //Widget Routes
    apiRoutes.use('/widget', widgetRouters);
    // Create widget embed code
    widgetRouters.post('/embedcode', widgetController.createEmbedCode);
    
    //Visitor Controllers
    apiRoutes.use('/visitor', visitorRouters);
    //Create new visitor
    visitorRouters.post('/newvisitor', visitorController.registerVisitor);
    //Set nickname for a visitor
    visitorRouters.post('/setnickname', requireAuth, visitorController.setNickname);
    //Blacklist visitor by email / ip address / id
    visitorRouters.post('/blacklistvisitor', requireAuth, visitorController.blacklistVisitor);
    //Get a list of all visitors / visitors with email / anonymous visitors
    visitorRouters.post('/getvisitors/:filter', requireAuth, visitorController.getVisitors);

    //Crawler Routes
    apiRoutes.use('/crawler', crawlerRouters);
    //Crawl Site to find FAQs URL
    crawlerRouters.post('/findfaqsurl', requireAuth, crawlerController.findFAQsURL);
    // Verify widget embed code
    crawlerRouters.post('/verifyembedcode', requireAuth, crawlerController.verifyEmbedCode);
    //Get FAQs from a given URL
    crawlerRouters.post('/findfaqs', requireAuth, crawlerController.findFAQs);
    // Find an individual question
    crawlerRouters.post('/findonequestion', crawlerController.findOneFAQ);
    //Add a new FAQ manually
    crawlerRouters.post('/addnewfaq', crawlerController.addNewFAQ);
    // Update an FAQ
    crawlerRouters.post('/updatequestion', crawlerController.updateFAQ);

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