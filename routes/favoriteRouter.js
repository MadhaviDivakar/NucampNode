const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser,  (req, res, next) => {
    Favorite.find({ user: req.user._id }) 
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);   
    })
    .catch(err => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach((campsite) => {
            if (!favorite.campsites.includes(campsite._id)) {
              favorite.campsites.push(campsite._id);
            }
          });
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body }).then(
            (favorites) => {
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 200;
              res.json(favorites);
            }
          );
        }
      })
      .catch((err) => next(err));
  })
    .put(cors.corsWithOptions, authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}/favorites`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
            } else {
                res.end('You do not have any favorites to delete.')
            }
        })
        .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
.get(cors.cors, authenticate.verifyUser,  (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/:campsiteID`);
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id}) 
        .then(favorites => {
          if (favorites) {   
            if (favorites.campsites.includes(req.params.campsiteId)) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.send('Campsite already in your favorites.');
            } else { 
              favorites.campsites.push(req.params.campsiteId);
              favorites.save()
              .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
              })
            }
            } else {
              Favorite.create({user: req.user._id, campsites: req.body})
              .then(favorite => {
                console.log('Favorite added', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              })
            } 
        })
        .catch(err => next(err));
      })
    .put(cors.corsWithOptions, authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne(req.params.favoriteId)
        .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
        .catch(err => next(err));
    });

module.exports = favoriteRouter;