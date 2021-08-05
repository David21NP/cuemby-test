print('Start #################################################################');

/**
 * This file gets run as soon as the database is working
 * and it creates the cuemby database with the players collection
 * for storing all the players from easports server
 */

db = db.getSiblingDB('cuemby');
db.createUser(
  {
    user: 'user',
    pwd: 'example',
    roles: [{ role: 'readWrite', db: 'cuemby' }],
  },
);
db.createCollection('players');

print('End #################################################################');