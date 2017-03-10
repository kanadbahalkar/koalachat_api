module.exports = {
    // Secret key for JWT signing and encryption
    'secret': 'koalaftw',
    // Database connection information
    'database': 'mongodb://kandyrox:kandyrox2017@ds049104.mlab.com:49104/heroku_7pv27c4s',
    // 'database': 'mongodb://koalachat:koalaftw@koalacluster-shard-00-00-5vtre.mongodb.net:27017,koalacluster-shard-00-01-5vtre.mongodb.net:27017,koalacluster-shard-00-02-5vtre.mongodb.net:27017/KoalaCluster?ssl=true&replicaSet=KoalaCluster-shard-0&authSource=admin', //ATLAS CLUSTER
    // 'database': 'localhost:27017',
    // Setting port for server
    'port': process.env.PORT || 4731,
    'default_email': 'anonymous@koala.com',
    'default_password': 'anonymouskoala',
    'api_ai_client_access_token': 'fe82ca64b4aa4507b3bb8ace27e738ca',
    'api_ai_developer_access_token': 'ca74b5dba5f442cab9dcc1d09c653783'
}
