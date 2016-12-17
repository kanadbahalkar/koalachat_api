'use strict';

// Importing Passport, strategies, and config
const passport = require('passport'),
    User = require('../models/user'),
    config = require('./main'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    LocalStrategy = require('passport-local'),
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const localOptions = {
    usernameField: 'email'
};
var configAuth = require('./auth');

// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                error: 'Your login details could not be verified. Please try again.'
            });
        }

        user.comparePassword(password, function(err, isMatch) {
            if (err) {
                return done(err);
            }
            if (!isMatch) {
                return done(null, false, {
                    error: "Your login details could not be verified. Please try again."
                });
            }

            return done(null, user);
        });
    });
});

let facebookLogin = new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ["emails", "displayName", "photos", "gender", "first_name", "website", "birthday", "accounts"]
    },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // try to find the user based on their google id
            User.findOne({
                'id': profile.id
            }, function(err, user) {
                if (err)
                    return done(err);

                let str = JSON.stringify(profile, null, '\t');
                console.log(str);

                if (user) {
                    // if a user is found, log them in
                    console.log('User Found');
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser = new User();
                    newUser.autherticationType = 'facebook';
                    newUser.id = profile.id;
                    // Only owner can login using facebook/google
                    newUser.ownerID = profile.id;
                    newUser.email = profile.emails ? profile.emails[0].value : '';
                    newUser.profile = {
                      'givenName': profile.displayName,
                      'photo': profile.photos ? profile.photos[0].value : ''
                    };
                    newUser.role = "Owner";
                    newUser.anonymous = false;
                    let accounts = [];
                    if (profile._json.accounts) {
                        profile._json.accounts.data.forEach(function(manage_page) {
                          let page = {};
                          page.id = manage_page.id;
                          page.access_token = manage_page.access_token;
                          page.name = manage_page.name;
                          page.category = manage_page.category;
                          accounts.push(page)
                      });
                    }
                    newUser.accounts = accounts;
                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser)
                    });

                }
            });
        });
    });

let googleLogin = new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
    },
    function(token, refreshToken, profile, done) {
        process.nextTick(function() {
          User.findOne({
              'id': profile.id
          }, function(err, user) {
              if (err)
                  return done(err);

              //let str = JSON.stringify(profile, null, '\t');
              //console.log(str);

              if (user) {
                  // if a user is found, log them in
                  console.log('User Found');
                  return done(null, user);
              } else {
                  // if the user isnt in our database, create a new user
                  var newUser = new User();
                  newUser.autherticationType = 'google';
                  newUser.id = profile.id;
                  // Only owner can login using facebook/google
                  newUser.ownerID = profile.id;
                  newUser.email = profile.emails ? profile.emails[0].value : '';
                  newUser.profile = {
                    'givenName': profile.displayName,
                    'photo': profile.photos ? profile.photos[0].value : ''
                  };
                  newUser.role = "Owner";
                  newUser.anonymous = false;
                  newUser.save(function(err) {
                    console.log('Saving user');
                      if (err)
                          throw err;
                      return done(null, newUser)
                  });
                }
              });
        });
    });

const jwtOptions = {
    // Telling Passport to check authorization headers for JWT
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    // Telling Passport where to find the secret
    secretOrKey: config.secret
};


// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    User.findById(payload._id, function(err, user) {
        if (err) {
            return done(err, false);
        }

        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(jwtLogin);
passport.use(localLogin);
passport.use(facebookLogin);
passport.use(googleLogin);
