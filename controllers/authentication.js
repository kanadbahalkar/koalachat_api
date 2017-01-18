"use strict";

const jwt = require('jsonwebtoken'),
      crypto = require('crypto'),
      User = require('../models/user'),
      config = require('../config/main');

function generateToken(user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 10080 // in seconds
  });
}

function generateTempToken() {
  let tempToken = crypto.randomBytes(48).toString('hex');
  return tempToken;
}

// Set user info from request
let setUserInfo = (user) => {
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    anonymous: user.anonymous,
    ownerID: user.ownerID,
    userID: user.userID,
    website: user.website,
    accounts: user.accounts,
    profile: user.profile
  }
}

// Login Route
exports.login = function(req, res, next) {
  let userInfo = setUserInfo(req.user);

  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  });
};

// Return with temp authentication -
exports.returnTempToken = function(req, res, next) {
  let tempToken = generateTempToken();
  req.user.update({ tempToken: tempToken }, function(err, user) {
    if(err) throw err;
    res.redirect('/loggingin?tmp_token=' + tempToken)
  });
};

// Return JWT token in exchange of temp token
exports.getToken = function(req, res, next) {
  User.findOne({tempToken: req.body.temp_token}, function(err, user){
    if(err || !user){
      res.json({ success: false, message: 'Invalid temp token.'})
    }
    console.log(user);
    user.update({tempToken: null}, function(err, user){
      if(err){
        res.json(({ success: false, message: 'Something went wrong, please try again.' }))
      }
      res.status(200).json({
        success: true,
        token: generateToken({email: user.email, id: user._id})
      });
    })
  })
};

// Registration for Website Owners Route
exports.registerowner = function(req, res, next) {

  //Create a random OwnerID
  var oid = Math.random().toString(36).substring(3,16)+ +new Date;

  // Check for registration errors
  let email = req.body.email;
  let website = req.body.website;
  let password = req.body.password;
  let anonymous = req.body.anonymous;
  let role = req.body.role;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let givenName = req.body.givenName;

  // Return error if no email provided
  if (!email) {
    console.log('You must enter an email address.');
    return res.status(422).send({ error: 'You must enter an email address.'});
  }

  // Return error if no website provided
  if (!website) {
    console.log('Hey! We need your website address! :o');
    return res.status(422).send({ error: 'Hey! We need your website address! :o'});
  }

  // Return error if no password provided
  if (!password) {
    console.log('You must enter a password.');
    return res.status(422).send({ error: 'You must enter a password.' });
  }

  User.findOne({ email: email }, function(err, existingUser) {
      if (err) { return next(err); }

      // If user is not unique, return error
      if (existingUser) {
        console.log('That email address is already in use.');
        return res.status(422).send({ error: 'That email address is already in use.' });
      }

      // If email is unique and password was provided, create account
      let user = new User({
        email: email,
        password: password,
        website: website,
        ownerID: oid,
        userID: oid,
        role: role,
        anonymous: anonymous,
        profile: {
          firstName: firstName,
          lastName: lastName,
          givenName: givenName === '' ? firstName + ' ' + lastName : givenName
        }
      });


      user.save(function(err, user) {
        if (err) { return next(err); }

        // Subscribe member to Mailchimp list
        // mailchimp.subscribeToNewsletter(user.email);

        // Respond with JWT if user was created

        let userInfo = setUserInfo(user);

        res.status(201).json({
          token: 'JWT ' + generateToken(userInfo),
          user: userInfo
        });
      });
  });
}

// Registration for Visitors Route
exports.registervisitor = function(req, res, next) {
  // Check for registration errors
  const email = req.body.email || config.default_email;
  const password = req.body.password || config.default_password;
  let id = Math.random().toString(36).substring(3,16)+ +new Date;
  let ownerID = req.body.ownerID;
  let role = req.body.role;

  //if Visitor is not associated with owner then don't allow to create
  if (!ownerID) {
    console.log("Register visitor request is not associated with ownerID");
    return res.status(422).send({ error: "Register visitor request is not associated with ownerID" });
  }

  User.findOne({ email: email }, function(err, existingUser) {
      if (err) { return next(err); }

      // If user is not unique, return error
      if (existingUser && (email !== config.default_email) && (password !== config.default_password)) {
        //Log the user in
        //return User's conversation history
      }
      else {
        let user = new User({
          email: email,
          password: password,
          userID: id,
          ownerID: ownerID,
          role: role,
          profile: { firstName: 'Anonymous', lastName: 'Koala' }
        });

        user.save(function(err, user) {
          if (err) { return next(err); }

          let userInfo = setUserInfo(user);

          res.status(201).json({
            token: 'JWT ' + generateToken(userInfo),
            user: userInfo
          });
        });

        console.log('User created: ', user);
      }
  });
}

// Authorization Middleware
// Role authorization check
exports.roleAuthorization = function(role) {
  return function(req, res, next) {
    const user = req.user;

    User.findById(user._id, function(err, foundUser) {
      if (err) {
        console.log('No user was found.');
        res.status(422).json({ error: 'No user was found.' });
        return next(err);
      }

      // If user is found, check role.
      if (foundUser.role == role) {
        return next();
      }

      res.status(401).json({ error: 'You are not authorized to view this content.' });
      return next('Unauthorized');
    })
  }
}
