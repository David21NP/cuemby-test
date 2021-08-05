/**
 * 
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 * 
 * This functions works as middleware for validate the user 
 * has the correct x-api-key for access the server data
 */

const validateKey = (req, res, next) => {
  const receivedKey = req.headers["x-api-key"];
  const envKey = process.env.X_API_KEY;
  
  if (envKey.localeCompare(receivedKey) === 0) {
    next();
  } else {
    res.status(403).send({ error: { code: 403, message: 'You\'re not allowed'} })
  }
}

module.exports = { validateKey }