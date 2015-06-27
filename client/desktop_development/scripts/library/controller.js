/**
 * 
 * controller library
 *
 * @param {type} utilities 
 * @param {type} Ribs
 * 
 * @returns {_L17.Anonym$1}
 */
define([
    'chrisweb-utilities',
    'ribsjs'
    
], function (utilities, Ribs) {
    
    'use strict';
    
    var LibraryController = Ribs.Controller.extend({
        
        onInitialize: function(options, configuration, router) {
            
            utilities.log('[LIBRARY CONTROLLER] initializing ...', 'fontColor:blue');
            
        }
        
    });
    
    return LibraryController;
    
});