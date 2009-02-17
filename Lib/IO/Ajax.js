/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <a href="mailto:christopheeble@gmail.com">Christophe Eble</a>
 * @author <a href="mailto:alpherz@gmail.com">Jonathan Gautheron</a>
*/
Swell.Core.Class({
    
    name      : 'Ajax',
    namespace : 'Lib.IO',
    inherits  : Swell.Core.CustomEventModel,
    functions : function() {
            
        /**
         * Do not expose the internal functions below
         * to the public API
         *
         * @private
        */
        var _getXhrObject = function() {
            var _xmlHttp = null;
            // Testing if XMLHttpRequest is native (that should be the case for every modern browser)
            if(window.XMLHttpRequest) {
                _xmlHttp = new XMLHttpRequest();
            } else {
                // Wrap variable assignement into a try/catch block so it will prevent
                // javascript errors if the user has disabled ActiveX Controls
                try {
                    // This is IE Browsers < 7 > 5.0
                    _xmlHttp = new ActiveXObject('MSXML2.XMLHTTP.3.0'); // Use the latest and greatest one :D
                } catch (e) {
                    _xmlHttp = null;
                }
            }
            return _xmlHttp;
        };
        
        /** @lends Swell.Lib.IO.Ajax.prototype */ 
        return {
            /**
             * @description provide reliable readyState constants
             * 3,4 are reported correctly by all browsers
            */
            /**
             * @property LOADING
            */
            LOADING       : 1,
            /**
             * @property PROGRESS
            */
            PROGRESS      : 3,
            /**
             * @property COMPLETED
            */
            COMPLETED     : 4,
            /**
             * @property {XMLHttpRequest|NULL} Connection object
            */
            xhr    : null,
            
            /** @constructs */
            
            construct : function() {
                var _xhr  = _getXhrObject();
                // Exit nicely if XHR object detection failed
                if(!_xhr) {
                    return false;
                }
                // Assign a pointer to the current XHR object, this will help us later in the script
                this.xhr = _xhr;
                this.createEvents();
            },
            
            /**
             * Initiates an XML HTTP Request
             * Note : This implementation provides only asynchronous XMLHttpRequests because, 
                      due to the inherently asynchronous nature of networking, 
                      there are various ways memory and events can leak when using synchronous requests.
             *
             * @param {String} m http transaction method either GET or POST
             * @param {String} url full path to the remote page or resource to retrieve through XHR
             * @param {Function} fn callback function
             * @see http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_2.html
            */
            request : function(m, url, fn, scope, args) {
                
                var _args       = args || null,
                    _scope      = scope || null,
                    that    = this;

                // Exit nicely if fn is not a function
                if(!Swell.Core.isFunction(fn)) {
                    return false;
                }
                // Exit nicely if m is not get or post (case insensitive)
                if(!/^get$|^post$/i.test(m)) {
                    return false;
                }
                
                this.xhr.onreadystatechange = function(e) {
                    if(window.event) {
                        e = window.event;
                    }
                    if(that.xhr.readyState === that.LOADING) {
                        that.fireEvent('onProgress');
                    }
                    else if(that.xhr.readyState === that.COMPLETED) {
                        // Detach all subscribers of progress event
                        that.unsubscribe('onProgress');
                        // Fire complete event
                        that.fireEvent('onComplete');
                        // Execute callback function with the given scope and args
                        fn.call(_scope, that, _args);
                    }
                };
                
                // Fire onInitiate event
                this.fireEvent('onInitiate');
                
                // Open connection
                this.xhr.open(m.toUpperCase(), url, true);
                this.xhr.send(null);
            },
            
            /**
             * @event onInitiate
             * Fires when XmlHttpRequest is initiated
            */
            /**
             * @event onProgress
             * Fires when XmlHttpRequest is currently processed
            */
            /**
             * @event onComplete
             * Fires when XmlHttpRequest is completed
            */
            createEvents : function() {
                this.createEvent('onInitiate');
                this.createEvent('onProgress');
                this.createEvent('onComplete');
            }
        };
    }()
});

// Set some shorthands for the class
Swell.alias(Swell.Lib.IO.Ajax, 'Ajax', 'Connection');