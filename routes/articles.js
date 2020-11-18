const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

// Bring in Models
let Article = require('../models/article.js');
let User = require('../models/user.js');

// Add Route
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add Articles'
  });
});

// Add Submit POST Route
router.post('/add',
  [
    check('title').isLength({min: 1}).trim().withMessage('Title Required'),
    check('body').isLength({min: 1}).trim().withMessage('Body Required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      res.render('add_article', {
        title: 'Add Articles',
        errors: errors.mapped()
      });
    } else {
      let article = new Article();
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;
      article.save((err) => {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash('success', 'Article Added');
          res.redirect('/');
        }
      });
    }
});

// load edit form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorized');
      return res.redirect('/');
    }
    res.render('edit_article', {
      title: 'Edit title',
      article: article
    })
  })
})

// Update Submit POST Route
router.post('/edit/:id', (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.user._id;
  article.body = req.body.body;

  let query = {_id: req.params.id}

  Article.update(query, article, (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Updated');
      res.redirect('/');
    }
  });
});

// Delete Request
router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = {_id: req.params.id}

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, (err) => {
        if (err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  })
});

// Get Single Article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'You are not logged in');
    res.redirect('/users/login');
  }
}

module.exports = router;
