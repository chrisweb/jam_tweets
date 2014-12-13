/**
 *
 * video player (fullscreen background)
 *   
 * @param {type} utilities
 * @param {type} EventsManager
 * 
 * @returns {_L7.Anonym$1}
 */
define([
    'chrisweb.utilities',
    'library.eventsManager'
    
], function (utilities, EventsManager) {
    
    'use strict';

    var initialize = function initializeFunction($element, videoFormat) {
        
        utilities.log('start video player', 'fontColor:green');
        
        var videoPlayer = '';

        if (videoFormat === 'gif') {
            
            videoPlayer += '<div class="backgroundVideo"></div>';
            
        } else {
        
            videoPlayer += '<video class="backgroundVideo" poster="/desktop/videos/hompage-thumbnail_1_1.png" autoplay="autoplay" loop>';
            videoPlayer += '<source src="/desktop/videos/hompage-video_1.webm" type=\'video/webm;codecs="vp8, vorbis"\'/>';
            videoPlayer += '<source src="/desktop/videos/hompage-video_1.mp4" type=\'video/mp4;codecs="avc1.42E01E, mp4a.40.2"\'/>';
            videoPlayer += '</video>';
            
        }
        
        var $videoPlayer = $(videoPlayer);
        
        $element.append($videoPlayer);
        
    };

    return {
        initialize: initialize
    };
    
});