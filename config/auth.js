config = require('./main');

module.exports = {
    'facebookAuth' : {
        'clientID'      : '182119938859848', // your App ID
        'clientSecret'  : '9fbdfc509d7b6d14cf5f9954855e5ee5', // your App Secret
        'callbackURL'   : config.api_server + 'auth/facebook/callback'
    },

    'googleAuth' : {
        'clientID'      : '352313595407-8oarqe1mun8g3u6jvf9nfp2c8qkk3eac.apps.googleusercontent.com',
        'clientSecret'  : 's7fREHIVewKrR8ecnl4WVWYq',
        'callbackURL'   : config.api_server + 'auth/google/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : '9D7eEnw3zpO1L6k8xxqV5Lpaa',
        'consumerSecret'    : 'CY0qqGJxKX57fZskdF1ecen4G00BzeaYumrHnZugRrWX2AjjeC',
        'callbackURL'       : config.api_server + 'auth/twitter/callback'
    }
  };
