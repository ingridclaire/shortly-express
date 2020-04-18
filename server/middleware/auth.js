const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
};

//An incoming request with no cookies should generate a session with a unique hash and store it the sessions database. The middleware function should use this unique hash to set a cookie in the response headers. (Ask yourself: How do I set cookies using Express?).
//If an incoming request has a cookie, the middleware should verify that the cookie is valid (i.e., it is a session that is stored in your database).
//If an incoming cookie is not valid, what do you think you should do with that session and cookie?

//record of a valid login (is the person still logged in?) -> session.js isLoggedIn method
//how is the hash connected to the token?
//is the token / cookie valid?


/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

