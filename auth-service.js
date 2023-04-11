/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
*   EXCEPT web322 course official page: https://web322.ca/
* 
*  Name: Anna Sychikova Student ID: 159363217 Date: I started 3/4 of April
*
*  Cyclic Web App URL: https://outrageous-boa-gown.cyclic.app 
*
*  GitHub Repository URL: https://github.com/asychikova/web322appAnna
*
********************************************************************************/ 

const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://asychikova:web322_HarryS@senecaweb.xy76r7l.mongodb.net/test");
        db.on("error", (err)=>{
            reject(err); 
        });
        db.once("open", ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

var userSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  loginHistory: [{
      dateTime: { type: Date, required: true },
      userAgent: { type: String, required: true }
  }]
});
let User; 

module.exports.registerUser = function(userData) {
  return new Promise(function(resolve, reject) {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match, please make sure that passwords are the same");
      return;
    }
bcrypt.hash(userData.password, 10)
  .then(function(hash) {
      if (!userData.userName) {
      reject("User Name is required, please enter User Name");
          return;
        }
    let newUser = new User({
        userName: userData.userName,
        password: hash,
        email: userData.email
      });
        return newUser.save();
      })
      .then(function() {
        resolve();
      })
      .catch(function(err) {
        if (err.code === 11000) {
        reject("Sorry, but this User Name already taken");
        } else {
          reject("There was an error creating the user: " + err);
        }
      });
  });
};

module.exports.checkUser = function(userData) {
  return User.findOne({ userName: userData.userName })
  .then((user) => {
      if (!user) {
        return Promise.reject(`User ${userData.userName} not found`);
      }

      return bcrypt.compare(userData.password, user.password)
      .then((result) => {
          if (result) {
          user.loginHistory.push({ dateTime: new Date().toString(), userAgent: userData.userAgent });
            return user.save()
              .then(() => {
                return user;
              })
              .catch((err) => {
                return Promise.reject(`There was an error verifying the user: ${err}`);
              });
          } else {
            return Promise.reject(`Incorrect password for user ${userData.userName}, please enter correct password`);
          }
        })
        .catch((err) => {
        return Promise.reject(`There was an error verifying the password: ${err}`);
        });
    });
};

