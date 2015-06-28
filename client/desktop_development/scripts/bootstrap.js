/**
 * 
 * application bootstrap
 * 
 * @param {type} utilities
 * @param {type} SplashScreenPlugin
 * @param {type} RouterPlugin
 * @param {type} LeftNavigationPlugin
 * @param {type} HeaderNavigationPlugin
 * @param {type} EventsManager
 * @param {type} Ribs
 * @param {type} TracksManager
 * @param {type} PlaylistsManager
 * @param {type} PlayerPlugin
 * 
 * @returns {_L19.Anonym$6}
 */
define([
    'chrisweb-utilities',
    'library.plugin.splashScreen',
    'library.plugin.router',
    'library.plugin.leftNavigation',
    'library.plugin.headerNavigation',
    'library.eventsManager',
    'ribsjs',
    'library.tracksManager',
    'library.playlistsManager',
    'library.plugin.player',
    
    'library.jquery.plugin.hasAttr' // adds a new hasAttr function to $ (jquery)
], function (
    utilities,
    SplashScreenPlugin,
    RouterPlugin,
    LeftNavigationPlugin,
    HeaderNavigationPlugin,
    EventsManager,
    Ribs,
    TracksManager,
    PlaylistsManager,
    PlayerPlugin
) {

    'use strict';
    
    // did the components already get initialized
    var componentsAreReady = false;
    
    /**
     * 
     * run
     * 
     * @returns {undefined}
     */
    var run = function runFunction() {
        
        // first initialize the splashScreen plugin
        SplashScreenPlugin.initialize();
        
        // then we initialize the router plugin
        // the router plugin will intialize the router
        RouterPlugin.initialize(function(error, unsupported) {
            
            if (error) {

                utilities.log(error, 'fontColor:red');
                
                require(['views/pages/notsupported'], function(NotSupportedView) {
                    
                    var notSupportedView = new NotSupportedView({
                        templateVariables: {
                            feature: unsupported.feature
                        }
                    });
                    
                    Ribs.Container.clear('#core');
                    
                    Ribs.Container.add('#core', notSupportedView);
                    
                    Ribs.Container.dispatch('#core');
                    
                });
                
            }
            
        });
        
        // on dom load
        $(function() {
            
            utilities.log('dom finished loading...');
            
            EventsManager.trigger(EventsManager.constants.DOM_LOADED);
            
        });
        
        // on event "post route" and the UI does not already exist
        EventsManager.on(EventsManager.constants.ROUTER_POSTROUTE, function(attributes) {
            
            if (attributes.routeName !== 'renderHomepage') {
                
                if (!componentsAreReady) {
                    
                    initializeComponents();
                    
                }
                
            }
            
        });
        
    };
    
    /**
     * 
     * as soon as the user is logged in and the application components have
     * not been initialized (ui, player, ...)
     * 
     * @returns {undefined}
     */
    var initializeComponents = function initializeComponentsFunction() {
        
        componentsAreReady = true;
        
        var $body = $('body');
        
        // remove the style attribute from the body tag that got added by
        // skrollr
        if ($body.hasAttr('style')) {
            
            $body.removeAttr('style');
            
        }
        
        // initialize the left navigation plugin
        LeftNavigationPlugin.initialize();
        
        // initialize the header navigation plugin
        HeaderNavigationPlugin.initialize();
        
        // initialize the tracks manager
        TracksManager.initialize();
        
        // initialize the playlists manager
        PlaylistsManager.initialize();
        
        // initialize the player plugin
        PlayerPlugin.initialize();
        
    };
    
    return {
        applicationStart: run
    };

});