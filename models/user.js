'use strict';
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      bcrypt = require('bcrypt-nodejs');

// User Schema
const UserSchema = new Schema({
 	anonymous: {
     type: Boolean,
     default: true
  },
  ownerID: {
    type: String,
    required: false
  },
  welcomeMessage:{
    type: String,
    required: false,
    default: "Hey there! Are you looking for something specific? Let me know, I\'m here to answer your questions ... :)"
  },
  website: {
    type: String,
    required: false
  },
  websiteVerified: {
     type: Boolean,
     default: false
  },
  faqurl: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: false
  },
  // Stores list of pages manage by user on facebook
  accounts: [{
    access_token: {type: String},
    name: {type: String},
    category: {type: String},
    id: {type: String}
  }],
  password: {
    type: String,
    required: false
  },
  autherticationType: {
    type: String,
    enum: ['local', 'google', 'facebook', 'twitter'],
    default: 'local'
  },
  userID: {
    type: String,
    required: false
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    givenName: {type: String},
    photo: {type: String},
    required: false
  },
  role: {
    type: String,
    enum: ['Visitor', 'Owner', 'Admin', 'Agent', 'Bot'],
    default: 'Visitor'
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
