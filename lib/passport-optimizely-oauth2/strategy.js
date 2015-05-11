/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://app.optimizely.com/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://api.23andme.com/token';
  options.scopeSeparator = options.scopeSeparator || '%20';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'optimizely';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  this._oauth2.useAuthorizationHeaderforGET(true);
  this._oauth2.get('https://www.optimizelyapis.com/experiment/v1/projects/', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profiles', err)); }

    try {
      var json = JSON.parse(body);

      var profile = { provider: 'optimizely' };
      profile.id = json.id;
      profile.displayName = json.first_name + ' ' + json.last_name;
      profile.firstName = json.first_name;
      profile.lastName = json.last_name;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;