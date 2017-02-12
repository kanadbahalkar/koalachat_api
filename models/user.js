'use strict';
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      bcrypt = require('bcrypt-nodejs');

// User Schema
const UserSchema = new Schema({
 	ownerID: {
    type: String
  },
  businessName: {
    type: String
  },
  welcomeMessage:{
    type: String,
    default: "Hey there! Are you looking for something specific? Let me know, I'm here to answer your questions ... :)"
  },
  website: {
    type: String
  },
  websiteVerified: {
     type: Boolean
  },
  faqurl: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  email: {
    type: String,
    lowercase: true,
    unique: true
  },
  // Stores list of pages manage by user on facebook
  managedPages: [{
    access_token: {type: String},
    name: {type: String},
    category: {type: String},
    id: {type: String}
  }],
  // Stores list of social accounts of the user
  socialAccounts: [{
    provider_id: {type: String},
    provider: {type: String}
  }],
  password: {
    type: String
  },
  authenticationType: {
    type: String,
    enum: ['local', 'google', 'facebook', 'twitter'],
    default: 'local'
  },
  userID: {
    type: String
  },
  allowAnonymous: {
    type: String
  },
  enablePlugin: {
    type: String
  },
  profile: {
    firstName: { type: String, default: 'Anonymous' },
    lastName: { type: String, default: 'Koala' },
    givenName: {type: String, default: 'Toby' },
    photo: { type: String },
    gender: { type: String },
    birthday: { type: Date }
  },
  role: {
    type: String,
    enum: ['Owner', 'Staff', 'Admin', 'Agent', 'Bot'],
    default: 'Owner'
  },
  emailFrequency: {
    newsletter: { type: Boolean, default: true },
    billingUpdates: { type: Boolean, default: true },
    announcements: {type: Boolean, default: true }
  },
  tempToken: {
 	  type: String
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
},
{
	timestamps: true
});

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function(next) {
  const user = this,
        SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Method to compare password for login
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  console.log("password:"+candidatePassword);
  console.log("hash :"+this.password);
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
       return cb(err);
     }

    cb(null, isMatch);
  });
}

UserSchema.methods.getAllUsers = () => {
  //let currentUser = this;
  //if (currentUser.type !== 'Admin')
  User.find({}, function(err, users) {
    if (err) return next(err);
    let usersList = [];
    users.map(user => usersList.push(user));
    return usersList;
  })
}

module.exports = mongoose.model('User', UserSchema);
