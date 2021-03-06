/**
 * tweets map-reduce cron
 * 
 * MIT Licensed, see License.txt
 * 
 */

// utilities module
var utilities = require('chrisweb-utilities');

// NODE_ENV can be "development", "staging" or "production"
if (typeof(process.env.NODE_ENV) === 'undefined') {

    //process.env.NODE_ENV = 'production';
    process.env.NODE_ENV = 'development';
    
    utilities.log('NODE_ENV NOT FOUND, setting it by default to "' + process.env.NODE_ENV.toUpperCase() + '"', 'fontColor:red', 'backgroundColor:white');

}

// get the environment variable
var environment = process.env.NODE_ENV;

// get configuration
var configurationModule = require('./server/configuration/configuration');
var configuration = configurationModule.get(process.env.NODE_ENV);

// cron vendor module
var cron = require('cron');

// mongo module
var mongoModule = require('./server/library/mongo');

var mongoClient;

var mongodbOptions = {};

// mongodb connection
mongoModule.getClient(mongodbOptions, function mongooseConnectCallback(error, mongooseConnection) {
    
    if (error) {
        
        utilities.log('[MONGODB]' + error, 'fontColor:red');
        
    } else {
        
        utilities.log('[MONGODB] connected', 'fontColor:green');
        
        mongoClient = mongooseConnection;
        
    }
    
});

// get the tweets mongoose model
var TweetModel = require('./server/models/tweet');

var tweetModel = new TweetModel();

utilities.log('* * * * * initializing cron');

/**
 * 
 * launches all the functions every twenty minutes
 * 
 * @returns {undefined}
 */
var twentyMinutesLauncher = function twentyMinutesLauncherFunction() {
    
    utilities.log('* * * * * cron job(s) get(s) executed', 'fontColor:blue');
    
    var options = {};

    tweetModel.mapReduceList(options, function(error, results, statistics) {

        if (error) {

            utilities.log('error: ' + error, 'fontColor:red');
            
        } else {
            
            utilities.log(statistics);
            utilities.log(results);
            
        }

    });
    
};

// start the "populate top playlists" cron job
var cronJob = cron.CronJob;

try {
    
    var job;
    
    if (process.env.NODE_ENV.toLowerCase() === 'development') {
        
        //cronTime: '*/1 * * * * *', // execute it every 1 second
        //onTick: function() { utilities.log('test'); }
        
        job = new cronJob({
            cronTime: '0 */1 * * * *', // execute it every 1 minute
            onTick: twentyMinutesLauncher
        });
        
    } else {
        
        job = new cronJob({
            cronTime: '0 */20 * * * *', // execute it every 20 minutes
            onTick: twentyMinutesLauncher
        });
        
    }
    
} catch(error) {

    utilities.log('cron pattern not valid, error: ' + error, 'fontColor:red');
    
}

job.start();

// close db connections on shutdown
process.on('SIGINT', function() {

    mongoModule.disconnect(mongoClient, function (error) {
        
        if (error) {
            
            utilities.log('mongodb disconnect: ' + error, 'fontColor:red');
            
        }

        utilities.log('[MAPREDUCE CRON] process is shutting down...');

        process.exit(0);

    });

});