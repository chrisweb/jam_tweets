/**
 * 
 * playlists controller
 * 
 * @param {type} $
 * @param {type} _
 * @param {type} utilities
 * @param {type} Controller
 * @param {type} Ribs
 * @param {type} playlistsManager
 * 
 * @returns {unresolved}
 */
define([
    'jquery',
    'underscore',
    'chrisweb-utilities',
    'library.controller',
    'ribsjs',
    'manager.playlists'

], function (
    $,
    _,
    utilities,
    Controller,
    Ribs,
    playlistsManager
) {
    
    'use strict';
    
    var CollaborativePlaylistsController = Controller.extend({
        
        onInitialize: function (options, configuration, router) {
            
            utilities.log('[COLLABORATIVE PLAYLISTS CONTROLLER] initializing ...', 'fontColor:blue');
            
            this.options = options;
            this.configuration = configuration;
            this.router = router;
            
        },
        indexAction: function indexActionFunction() {
            
            utilities.log('[PLAYLISTS CONTROLLER] action: index', 'fontColor:blue');
            
            // playlists page view
            require([
                'views/pages/playlists'
            ], function (PlaylistsPageView) {
                
                var playlistsPageView = new playlistsPageView();
                
                Ribs.Container.clear('#core');
                
                Ribs.Container.add('#core', playlistsPageView);
                
                Ribs.Container.dispatch('#core');
    
                // initialize the user library
                var userLibrary = new UserLibrary();
                
                userLibrary.getPlaylistsList(function getPlaylistsListCallback(error, playlistsList) {
                    
                    if (playlistsList.length > 0) {
                        
                        var playlistsToGet = [];
                        
                        _.each(playlistsList.models, function (model) {
                            
                            playlistsToGet.push({
                                playlistId: model.get('id'),
                                withPlaylistTracks: false
                            });

                        });
                        
                        PlaylistsManager.get(playlistsToGet, function getCallback(error, playlists) {
                            
                            // create the twitter charts tracks list view and add it to
                            // the dom
                            var twitterChartsTracksView = new TracksListView({
                                collection: tweetsPlaylistModel.get('playlistTracksCollection'),
                                ModelView: TrackRowView,
                                ModelViewOptions: {
                                    context: 'twitterCharts',
                                    reRenderOnChange: true,
                                    playlistId: tweetsPlaylistModel.get('id')
                                },
                                listSelector: '.tracksList'
                            });
                            
                            Ribs.Container.clear('#twitterChartsTracks');
                            
                            Ribs.Container.add('#twitterChartsTracks', twitterChartsTracksView);
                            
                            Ribs.Container.dispatch('#twitterChartsTracks');

                    
                        });

                    } else {
                        
                        utilities.log('no playlists found');

                    }
            
                });
    
            });

        }
    
    });
   

    return CollaborativePlaylistsController;
    
});