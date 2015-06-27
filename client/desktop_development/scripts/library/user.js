define([
    'chrisweb-utilities',
    'library.eventsManager',
    'models.User',
    'moment'
    
], function (utilities, EventsManager, UserModel) {
    
    'use strict';
    
    var instance = null;

    /**
     * user singleton
     * 
     * @constructor
     * @alias module library/user
     */
    var UserSingleton = function UserSingletonFunction() {
        
        if (instance !== null) {
            throw new Error('singleton has already been instantiated, use getInstance()');
        }
        
        this.model = new UserModel();
        
    };
    
    UserSingleton.prototype = {

        /**
         * 
         * fetch the user data from server
         * 
         * @param requestCallback userDataCallback
         */
        fetchUserData: function fetchUserDataFunction(userDataCallback) {

            this.model.fetch({
                success: function(model, response, options) {
                    
                    if (userDataCallback !== undefined) {
                    
                        userDataCallback(false, model);
                        
                    }
                    
                },
                error: function(model, response, options) {
                    
                    utilities.log(response);
                    
                    if (userDataCallback !== undefined) {
                    
                        userDataCallback(true);
                        
                    }
                    
                }
            });
            
        },
        
        /**
         * 
         * get an attribute
         * 
         * @param {string} attributeName
         */
        getAttribute: function getAttributeFunction(attributeName) {

            var attributeValue = this.model.get(attributeName);
            
            return attributeValue;

        },
        
        /**
         * 
         * set an attribute
         * 
         * @param {string} attributeName
         * @param {*} attributeValue
         */
        setAttribute: function setAttributeFunction(attributeName, attributeValue) {

            this.model.set(attributeName, attributeValue);

        },
        
        /**
         * check if the user is logged
         * 
         * @param requestCallback isLoggedCallback
         * 
         */
        isLogged: function isLoggedFunction(isLoggedCallback) {

            var isLogged;

            // fetch the user data from server if the user data is not already
            // in the model
            if (this.model.get('id') === null) {
                
                this.fetchUserData(function(error, model) {
                    
                    isLogged = model.get('isLogged');
                    
                    if (isLoggedCallback !== undefined) {
                    
                        // check if the user is logged
                        isLoggedCallback(false, isLogged);
                        
                    }
                    
                    EventsManager.trigger(EventsManager.constants.USER_ISLOGGED, { isLogged: isLogged });
                    
                });
                
            } else {
                
                isLogged = this.model.get('isLogged');
                
                if (isLoggedCallback !== undefined) {
                
                    isLoggedCallback(false, isLogged);
                    
                }
                
                EventsManager.trigger(EventsManager.constants.USER_ISLOGGED, { isLogged: isLogged });
                
            }
            
        }
        
    };
    
    /**
     * get an instance of the user class
     */
    var getInstance = function getInstanceFunction() {
        
        if (instance === null) {
            
            utilities.log('[USER] initialized...');
            
            instance = new UserSingleton();
            
        }
        
        return instance;
        
    };

    return getInstance;
    
});