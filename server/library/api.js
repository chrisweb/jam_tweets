'use strict';

// utilities module
var utilities = require('../../bower_components/chrisweb-utilities/utilities');

// tweets charts day model
var ChartTweetModel = require('../models/chartTweet');

// track model
var TrackModel = require('../models/track');

// underscore vendor module
var _ = require('underscore');

// jamendo vendor module
var JamendoAPI = require('./jamendoAPI');

module.exports.start = function initialize(configuration, app, apiRouter) {

    apiRouter.use(function (request, response, next) {

        utilities.log('/api, method: ' + request.method + ', url:' + request.url + ', path:' + request.path);

        next();

    });

    apiRouter.get('/search', function (request, response, next) {

        utilities.log('[API] /api/search hit');

        //utilities.log(request);
        //utilities.log(request.query.q);

        var jamendoAPI = new JamendoAPI();

        var callback = function (error, searchResults) {

            if (error) {

                response.status(500);

                if (process.env.NODE_ENV === 'development') {

                    utilities.log('[API] ' + error, 'fontColor:red');

                    response.json({error: '[API] ' + error});

                } else {

                    response.json({error: '[API] failed to retrieve the tracks using the jamendo api'});

                }

            } else {

                response.status(200);
                response.json(searchResults);

            }

        };

        jamendoAPI.getTracksByQuery({
            namesearch: request.query.q,
            include: ['musicinfo', 'lyrics'],
            audioformat: 'ogg'
        }, callback);

    });

    apiRouter.get('/user', function (request, response, next) {

        //utilities.log('[API] session user: ', request.session.user);

        // clone the original object to avoid modifying the original object
        // on delete later on
        var userSessionData = _.clone(request.session.user);

        if (userSessionData === undefined) {

            var defaultUserData = {
                isLogged: false,
                lastFetchDate: Date.now()
            };

            response.status(200);
            response.json(defaultUserData);

        } else {

            // add some fields usefull for the client
            userSessionData.lastFetchDate = Date.now();
            userSessionData.isLogged = true;

            // remove the oauth data, from the clone, dont send it to the client
            delete userSessionData.oauth;

            response.status(200);
            response.json(userSessionData);

        }

    });

    apiRouter.get('/playlists', function (request, response, next) {

        var userSessionData = request.session.user;

        if (userSessionData === undefined) {

            var defaultUserData = {
                isLogged: false,
                lastFetchDate: Date.now()
            };

            response.status(401);
            response.json(defaultUserData);

        } else {

            var jamendoAPI = new JamendoAPI();

            var callback = function (error, playlistsResult) {

                if (error) {

                    response.status(500);

                    if (process.env.NODE_ENV === 'development') {

                        utilities.log('[API] ' + error, 'fontColor:red');

                        response.json({
                            code: 300,
                            error: '[API] ' + error
                        });

                    } else {

                        response.json({
                            code: 300,
                            error: '[API] failed to retrieve the user playlists using the jamendo api'
                        });

                    }

                } else {

                    // TODO: put the playlists in our database

                    response.status(200);
                    response.json(playlistsResult);

                }

            };

            jamendoAPI.getUserPlaylists({
                limit: '200',
                order: 'name',
                user_id: userSessionData.id,
                access_token: userSessionData.oauth.token
            }, callback);

        }

    });

    apiRouter.get('/charts/tweets/:period', function (request, response, next) {

        utilities.log('[API] fetching charts tweets day');

        // TODO: fix the callback hell

        var chartTweetModel = new ChartTweetModel({
            period: request.params.period
        });

        var options = {
            limit: 100
        };

        // get the map reduced results for the charts
        chartTweetModel.findMultiple(options, function (error, chartTweets) {

            if (error) {

                utilities.log('[API] ' + error, 'fontColor:red');

                response.status(500);
                response.json({
                    errorMessage: 'server error while fetching the charts tweets'
                });

            }

            var chartTweetsResponse = [];
            var i;

            for (i = 0; i < chartTweets.length; i++) {

                chartTweetsResponse.push(chartTweets[i].value);

            }

            response.status(200);
            response.json(chartTweetsResponse);

        });

    });

    /**
     * 
     */
    apiRouter.get('/tracks', function fetchTracksFunction(request, response, next) {
        
        utilities.log('[API] fetching tracks');
        
        var options = {};
        
        options.ids = request.query.tracksIds;
        
        // get the tracks that are already in our database
        var trackModel = new TrackModel();
        
        trackModel.findMultipleByJamendoId(options, function (error, mongoTracksResults) {
            
            if (error) {
                
                // if the db query fails all tracks will get fetched
                // using the API
                utilities.log('[API] trackModel -> findMultipleByJamendoId -> ' + error, 'fontColor:red');
                
            } else {
                
                //utilities.log(mongoTracksResults);
                
                // if our database did find some tracks in the database
                // we remove their id from the tracksIds list, so that
                // only those who are not yet in the database get
                // fetched via the jamendo API
                _.each(mongoTracksResults, function (mongoTracksResult) {
                    
                    // TODO: remove the ids we found in the db
                    
                    /*var index = tracksIds.indexOf(5);
                    
                     if (index > -1) {
                     tracksIds.splice(index, 1);
                     }*/
                    
                });
                
                // for the tracks that were not yet in our db we need to make
                // and API call to jamendo to retrieve them and add them to
                // our database
                var jamendoAPI = new JamendoAPI();
                
                // TODO: if all tracks have been found int he db dont do api call
                
                jamendoAPI.getTracksByQuery({
                    id: options.ids,
                    include: ['musicinfo', 'lyrics'],
                    audioformat: 'ogg'
                }, function getTracksByQueryCallback(error, apiResponse) {
                    
                    if (error) {
                        
                        utilities.log('[API] ' + error);
                        
                        response.status(500);
                        response.json('error while fetching the tracks');
                        
                    } else {
                        
                        //utilities.log(apiResponse);
                        
                        var tracksForMongodb = [];
                        
                        _.each(apiResponse.results, function (apiTracksResult) {
                            
                            var trackForMongodb = convertApiTrackToMatchMongodbSchema(apiTracksResult);
                            
                            tracksForMongodb.push(trackForMongodb);
                            
                        });
                        
                        // save the tracks into the database
                        //TODO: uncomment as soon as fetching tracks from mongodb instead of API has been implemented
                        /*trackModel.saveMultiple(tracksForMongodb, function (error, insertedDocuments) {
                            
                            if (error) {
                                
                                utilities.log('[API] ' + error, 'fontColor:red');
                                
                            }
                            
                        });*/
                        
                        // now merge the tracks that were already in the
                        // mongodb database and the ones that got
                        // returned by the tracks api call
                        var allTracks = tracksForMongodb.concat(mongoTracksResults);
                        
                        response.status(200);
                        //response.json(allTracks); // TODO: uncomment as soon as tracks from mongodb can get returned
                        response.json(tracksForMongodb);
                        
                    }
                    
                });
                
            }
            
        });
        
    });
    
    /**
     * 
     * converts a jamendo Api Track result to the format used in mongodb
     * 
     * @param {type} apiTrack
     * @returns {unresolved}
     */
    var convertApiTrackToMatchMongodbSchema = function convertApiTrackToMatchMongodbSchemaFunction(apiTrack) {

        var jamendoDate = apiTrack.releasedate;

        var year = jamendoDate.substring(0, 4);
        var month = jamendoDate.substring(5, 7);
        var day = jamendoDate.substring(8, 10);

        var releaseDate = new Date(year, month - 1, day);

        var mongodbTrack = {
            id: apiTrack.id,
            jamendo_id: apiTrack.id,
            jamendo_name: apiTrack.name,
            jamendo_duration: apiTrack.duration,
            jamendo_artist_id: apiTrack.artist_id,
            jamendo_artist_name: apiTrack.artist_name,
            jamendo_artist_idstr: apiTrack.artist_idstr,
            jamendo_album_name: apiTrack.album_name,
            jamendo_album_id: apiTrack.album_id,
            jamendo_license_cc_url: apiTrack.license_ccurl,
            jamendo_position: apiTrack.position,
            jamendo_release_date: releaseDate,
            jamendo_album_image: apiTrack.album_image,
            jamendo_stream_url: apiTrack.audio,
            jamendo_download_url: apiTrack.audiodownload,
            jamendo_pro_url: apiTrack.prourl,
            jamendo_short_url: apiTrack.shorturl,
            jamendo_share_url: apiTrack.shareurl,
            jamendo_music_info: apiTrack.musicinfo,
            jamendo_lyrics: apiTrack.name
        };

        return mongodbTrack;

    };

    app.use('/api', apiRouter);

};