const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user.js');

// Register form
router.get('/register', (req, res) => {
  res.render('register');
})

// Register process
router.post('/register',
  [
    check('name').isLength({min: 1}).trim().withMessage('Name Required'),
    check('email').isLength({min: 1}).trim().withMessage('Email Required'),
    check('email').isEmail().withMessage('Invalid Email'),
    check('username').isLength({min: 1}).trim().withMessage('Username Required'),
    check('password').isLength({min: 1}).trim().withMessage('Password Required'),
    check('password2', 'password confimation must be the same')
      .exists()
      .custom((value, {req}) => value === req.body.password)
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('register', {
        errors: errors.mapped()
      })
    } else {
      let newUser = new User();
      newUser.name = req.body.name;
      newUser.email = req.body.email;
      newUser.username = req.body.username;
      newUser.password = req.body.password;
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) console.log(err);
          newUser.password = hash;
          newUser.save((err) => {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash('success', 'You are now registered');
              res.redirect('/users/login');
            };
          });
        });
      });
    };
  }
);

// Login Form
router.get('/login', (req, res) => {
  res.render('login');
})

// Login process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
})

// Log Out
router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
})

module.exports = router;
