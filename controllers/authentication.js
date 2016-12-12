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

// Set user info from request
let setUserInfo = (user) => {
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    anonymous: user.anonymous,
    ownerID: user.ownerID,
    website: user.website,
    accounts: user.accounts,
    profile: user.profile
  }
}

// Login Route
exports.login = function(req, res, next) {
  let userInfo = setUserInfo(req.user);
  console.log(req.user);

  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  });
}

// Registration for Website Owners Route
exports.registerowner = function(req, res, next) {

  //Create a random OwnerID
  var oid = Math.random().toString(36).substring(3,16)+ +new Date;

  // Check for registration errors
  const email = req.body.email;
  const website = req.body.website;
  const password = req.body.password;
  const anonymous = req.body.anonymous;
  const role = req.body.role;

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
        ownerID : oid,
        role: role,
        anonymous: anonymous
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
