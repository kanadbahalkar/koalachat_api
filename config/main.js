module.exports = {
    // Secret key for JWT signing and encryption
    'secret': 'koalaftw',
    // Database connection information
    'database': 'mongodb://kandyrox:kandyrox2017@ds049104.mlab.com:49104/heroku_7pv27c4s',
    // Setting port for server
    'port': process.env.PORT || 4731,
    'default_email': 'anonymous@koala.com',
    'default_password': 'anonymouskoala'
}
