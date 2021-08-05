// imports a express framework and its router utility
var express = require('express');
var router = express.Router();

// imports a Mongodb client for nodejs
const { MongoClient } = require('mongodb');

// impor middleware for x-api-key validation
let { validateKey } = require('../middleware/apiKey.js');

// Get db URL from enviroment vars
const mongoUrl = `${process.env.ME_CONFIG_MONGODB_URL}cuemby`;

/**
 * First endpoint POST
 * 
 * Receives a post request with
 * headers: {
 *  "x-api-key": key
 * }
 * body: {
 *  "Name": teamName,
 *  "Page": number of the page
 * }
 * 
 * Also runs the function that checks if the user has the key ==> validateKey
 */
router.post('/team', validateKey, function(req, res, next) {

  // Get request body params
  const teamName = req.body.Name;
  const page = req.body.Page;

  // Connects to database
  MongoClient.connect(mongoUrl, function (err, client) {
    // In case mongodb conection fails
    if (err) throw err
  
    let db = client.db('cuemby');
  
    // Fetch data from database
    db.collection('players').find({ team: { $regex: `^${teamName}`, $options: 'i' } }).toArray(
      (err, result) => {
        // In case mongodb fetching fails
        if (err) throw err

        // In case there's no data in db.collection('players')
        if (!result.length) {
          const response = {
            Page: 0,
            totalPages: 0,
            Items: 0,
            totalItems: result.length,
            Players: []
          }
  
          res.json(response);
        } else {
          const totalPages = Math.ceil(result.length / 10);
  
          // In case the user ask for an unexisting page
          if (page > totalPages) {
            res.json({ error: `Page doesn\'t exist.`, totalPages: totalPages, reqPage: page})
          } else {
            // The best case response
            // The data gets organized as the problem aks
            const items = (page < totalPages) ? 10 : result.length - ((totalPages - 1) * 10)
            const response = {
              Page: page,
              totalPages: totalPages,
              Items: items,
              totalItems: result.length,
              Players: result.slice(((page - 1) * 10), ((page) * 10) + items).map(el => {
                delete el.team;
                delete el._id;
                return el;
              })
            }
    
            // return the response
            res.json(response);
          }
        }
      }
    );
  })
});

/**
 * Second endpoint GET
 * 
 * Receives a post request with
 * headers: {
 *  "x-api-key": key
 * }
 * url query params AKA req.query: {
 *  "search": teamName,
 *  "order": asc | desc,
 *  "page": number of the page
 * }
 * 
 * Also runs the function that checks if the user has the key ==> validateKey
 */
router.get('/players', validateKey, function(req, res, next) {

  // Get request query params
  const search = req.query.search === undefined ? '' : req.query.search;
  const order = (req.query.order !== 'desc');
  const page = parseInt(req.query.page);

  // Connects to database
  MongoClient.connect(mongoUrl, function (err, client) {
    // In case mongodb conection fails
    if (err) throw err
  
    let db = client.db('cuemby');
  
    // Fetch data from database
    db.collection('players').find({ name: { $regex: `${search}`, $options: 'i' } }).toArray(
      (err, result) => {
        // In case mongodb fetching fails
        if (err) throw err

        // In case there's no data in db.collection('players')
        if (!result.length) {
          const response = {
            Page: 0,
            totalPages: 0,
            Items: 0,
            totalItems: result.length,
            Players: []
          }
  
          res.json(response);
        } else {
          const totalPages = Math.ceil(result.length / 10);

          // In case the user ask for an unexisting page
          if (page > totalPages) {
            res.json({ error: `Page doesn\'t exist.`, totalPages: totalPages, reqPage: page})
          } else {
            // The best case response
            // The data gets organized and ordered as the problem aks
            const items = (page < totalPages) ? 10 : result.length - ((totalPages - 1) * 10)
            const response = {
              Page: page,
              totalPages: totalPages,
              Items: items,
              totalItems: result.length,
              Players: result.map(el => {                
                delete el._id;
                return el;
              }).sort((f, s) => {
                if (order) {
                  if(f.name < s.name) { return -1; }
                  if(f.name > s.name) { return 1; }
                  return 0;
                } else {
                  if(f.name > s.name) { return -1; }
                  if(f.name < s.name) { return 1; }
                  return 0;
                }
              }).slice(((page - 1) * 10), ((page) * 10))
            }
    
            // return the response
            res.json(response);
          }
        }
      }
    );
  })
});

module.exports = router;
