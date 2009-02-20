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
        
        /**
         * @private
         * @description Build header definition before request
        */
        var _processHeaders = function() {
            for(var h in this.headers) {
                this.xhr.setRequestHeader(h, this.headers[h]);
            }
        };
        
        /**
         * @property _xRequestedWith
         * @description Sends an X-Requested-With header to tell server that request is an XMLHttp request
         * @private
         * @static
         * @see http://trac.dojotoolkit.org/ticket/5801
        */
        var _xRequestedWith = {'X-Requested-Width' : 'XMLHttpRequest'};
        
        /** @lends Swell.Lib.IO.Ajax.prototype */ 
        return {         
            /**
             * @property LOADING
             * @description used internally for checking if readyState is equal to 1 (loading)
             * @static
            */
            LOADING       : 1,
            /**
             * @property COMPLETED
             * @description used internally for checking if readyState is equal to 4 (completed)
            */
            COMPLETED     : 4,
            /** 
             * @constructs
             * @augments Swell.Core.CustomEventModel
            */
            construct : function() {
                
                var _xhr  = _getXhrObject();
                // Exit nicely if XHR object detection failed
                if(!_xhr) {
                    return false;
                }
                // Assign a pointer to the current XHR object, this will help us later in the script
                this.xhr = _xhr;
                
                // Maintain a stack of headers to process
                this.headers = {};
                
                // Initialize events
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
                this.setHeaders(_xRequestedWith);
                
                // Process headers, the function is private as no one should be able to access
                // raw xmlhttp headers
                _processHeaders.call(this);
                
                // Then call...
                this.xhr.send(null);
            },
            
            setHeader : function(name, value) {
                if(!this.xhr) {
                    return false;
                }
                // Header has not yet been attached to XmlHttp Request object
                if(!this.headers.hasOwnProperty(name)) {
                    this.headers[name] = value;
                }
            },
            
            setHeaders : function(o) {
                if(!this.xhr) {
                    return false;
                }
                if(!Swell.Core.isUndefined(o) && Swell.Core.isObject(o)) {
                    for(var prop in o) {
                        this.setHeader(prop, o[prop]);
                    }
                }
            },
            
            /**
             * Initialize events of the class
            */
            createEvents : function() {
                this.onInitiate();
                this.onProgress();
                this.onComplete();
            },
            
            /**
             * @event onInitiate
             * @description Fires when XmlHttpRequest is initiated
            */
            onInitiate : function() {
                this.createEvent('onInitiate');
            },
            /**
             * @event onProgress
             * @description Fires when XmlHttpRequest is currently processed
            */
            onProgress : function() {
                this.createEvent('onProgress');
            },
            /**
             * @event onComplete
             * @description Fires when XmlHttpRequest is completed
            */
            onComplete : function() {
                this.createEvent('onComplete');
            }
        };
    }()
});

// Set some shorthands for the class
Swell.alias(Swell.Lib.IO.Ajax, 'Ajax', 'Connection');