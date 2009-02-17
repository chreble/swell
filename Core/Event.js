/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <a href="mailto:christopheeble@gmail.com">Christophe Eble</a>
 * @author <a href="mailto:alpherz@gmail.com">Jonathan Gautheron</a>
*/
Swell.namespace('Core.Event');

Swell.Core.Class({
    
    name      : 'CustomEvent',
    namespace : 'Core',
    functions : function() {
        
        /** @lends Swell.Core.CustomEvent.prototype */
        return {
        
            /**
             * Custom event name
             * @property name
             * @type {String}
             */
            name : null,
            /**
             * Hash of custom event subscribers
             * @property subscribers
             * @type {Function[]}
            */
            subscribers : [],
            /**
             * Tell the Class that browser is DOM Level 3 compliant
             * @property isDomLevel3Browser
             * @type {Boolean}
            */
            isDomLevel3Browser : false,
            /**
             * Original scope of the CustomEvent (generally binds an event to a class)
             * @property scope
             * @type {Object}
            */
            scope : null,
            
            /** @constructs */
            construct : function(name, scope) {
                var _ev;
                
                this.subscribers = [];
                // Initialize custom event name
                this.name = name;
                // Sets current scope on window if scope is not an object
                this.scope = (Swell.Core.isObject(scope)) ? scope : window;
                
                // We have to check if current implementation supports
                // CustomEvent
                if(document.createEvent) {
                    // Try-catch CustomEvent
                    // So DOM Level 3 Compliant browsers can execute this code while others will fallback on the custom implementation
                    try {
                        // This code has not yet been tested as there's no Browser support for now.
                        _ev = document.createEvent('CustomEvent');
                        _ev.initCustomEventNS(null, this.name, true, true, this.name);
                        window.dispatchEvent(_ev);
                        this.isDomLevel3Browser = true;
                    } catch(e) {
                        this.isDomLevel3Browser = false;
                    }
                }
            },
            
            /**
             * Check if the passed function is already subscribed
             * @function isSubscribed
             * @param {Function} fn function reference (doesn't work with anonymous functions)
             * @return {Boolean}
            */
            isSubscribed : function(fn) {
                var _l = this.subscribers.length;
                while(_l--) {
                    if(fn === this.subscribers[_l].callback) {
                        return true;
                    }
                }
                return false;
            },
            
            /**
             * Subscribe to the Event
             *
             * @function subscribe
             * @param {Function} fn the function to be called back when event fires
             * @param {Object} [scope] the execution scope of the callback function e.g. (this keyword) (optional)
             * @param {Mixed} [args] The arguments to pass to the callback function (optional)
            */
            subscribe : function(fn, scope, args) {

                if(args) {
                    if(!Swell.Core.isArray(args)) {
                        args = [args];
                    }
                } else {
                    args = [];
                }
                // Exit nicely if fn is not a valid function reference
                if(!Swell.Core.isFunction(fn)) {
                    return false;
                }
                // Then check if scope is an object (if defined)
                if(!scope || !Swell.Core.isObject(scope)) {
                    scope = this.scope;
                }
                
                var _wrapperFn;
                // We use a wrapper function for scope correction
                // This ensure to have a proper reference with "this" keyword
                // inside the callback function
                _wrapperFn = function() {
                    // get function arguments
                    var _funcArgs= [].slice.call(arguments, 0);
                    // Call function with cumulated arguments
                    return fn.call(scope, this.args, _funcArgs);
                };
                
                //late static binding some arguments
                _wrapperFn.args = args;
                _wrapperFn.callback = fn;
                
                // We have to check if function signature is not in the subscribers stack
                if(!this.isSubscribed(fn)) {
                    this.subscribers.push(_wrapperFn);
                    return true;
                }
                return false;
            },

            /**
             * Unsubscribe a specific callback
             *
             * @function unsubscribe
             * @param {Function} callback function
             *
            */
            unsubscribe : function() {
                var _n, _callback;
                // Testing if fn is a function :D
                if(!arguments[1] && !Swell.Core.isFunction(arguments[0])) {
                    return false; // Exit nicely
                }
                
                // Unsubscribe specific listener
                for(_n=0, _l = this.subscribers.length; _n < _l; _n++) {
                    _callback = this.subscribers[_n].callback;
                    
                    if(!arguments[1]) {
                        if(arguments[0] === _callback) {
                            this.subscribers[_n].callback = null;
                            this.subscribers[_n].args = null;
                            // Safe removal from array
                            this.subscribers.splice(_n, 1);
                        }
                    } else {
                        this.subscribers[_n].callback = null;
                        this.subscribers[_n].args = null;
                        this.subscribers.splice(_n, 1);
                    }
                }
                return true;
            },
            
            /**
             * Unsubscribe all callback functions from the event
             * @function unsubscribeAll
             *                   
            */
            unsubscribeAll : function() {
                // Detach all subscribers
                this.unsubscribe(null, true);
                // Reset subscriber array (prevent memleak)
                this.subscribers = [];
            },
            
            /**
             * Fire an event registered through createEvent
             * This will execute the callback functions with
             * the scope and the arguments passed in
             * the caller can provide arguments as well
             *
             * @function fire
             * @param {Mixed} [arguments] Arguments to passback to the callback function (optional)
             *
            */
            fire : function() {
                var _args = [].slice.call(arguments, 0), _n, _l;
                for(_n=0, _l = this.subscribers.length; _n < _l; _n++) {
                    this.subscribers[_n].apply(this.subscribers[_n], _args);
                }
            },
            
            /**
             * Get all the subscribers
             *
             * @function getSubscribers
             * @return {Array} list of all the subscribers for this event
             *
            */
            getSubscribers : function() {
                return this.subscribers;
            }
        }
        
    }()
    
});

/**
 * CustomEventModel is meant to be used in the inheritance chain only
 * This will provide a Built-in Custom-Event system for any class
 * inheriting CustomEventModel
 *
 * @Class CustomEventModel
*/

Swell.Core.Class({
    
    name : 'CustomEventModel',
    namespace : 'Core',
    functions : {
        /**
         * Constructor, initialize listeners, and construct the parent class
         *
         * @function construct
         * @constructor
        */
        construct : function(){
            this.listeners = {};
            this.parent();
        },
        
        /**
         * Create a new Custom event
         *
         * @function createEvent
         * @param {String} name Name of the Event e.g. "initialized"
         * @param {Object} [scope] Default Execution scope of the callback function (optional)
        */
        createEvent : function(name, scope) {
            // Address potential scope issues
            scope = scope || this;
            //Override existing listeners, create a stack when a new one is created
            this.listeners[name] = new Swell.Core.CustomEvent(name, scope);
        },
        
        /**
         * Fire a Custom event registered with createEvent
         *
         * @function fireEvent
         * @param {String} name Name of the Event to fire e.g. "initialized"
         * @param {Mixed} [args] Arguments to pass to the callback function (optional)
        */
        fireEvent : function(name, args) {
            var _listener;
            _listener = this.listeners[name];

            if (_listener) {
                _listener.fire(args);
            }
        },
        
        /**
         * Subscribe to a Custom event registered with createEvent
         *
         * @function subscribe
         * @param {String} name Name of the Event to subscribe e.g. "initialized"
         * @param {Function} callback Callback function to call when the event fires
         * @param {Object} [scope] Overrides default execution scope of the callback function (optional)
         * @param {Mixed} [args] Arguments to pass to the callback function (optional)
        */
        subscribe : function(name, callback, scope, args) {
            var _listener;
            _listener = this.listeners[name];

            if (_listener) {
                _listener.subscribe(callback, scope, args);
            }
        },
        
        /**
         * Unsubscribe to a Custom event registered with createEvent
         *
         * @function unsubscribe
         * @param {String} name Name of the Event to unsubscribe e.g. "initialized"
         * @param {Function} [callback] Callback function to unsubscribe (optional)
        */
        unsubscribe : function(name, callback) {
            if(this.listeners.hasOwnProperty(name) && !callback) {
                // Unsubscribe all
                this.listeners[name].unsubscribeAll();
            } else {
                this.listeners[name].unsubscribe(callback);
            }
        },
        
        /**
         * Return all custom events
         *
         * @function getEvents
         * @return {Swell.Core.CustomEvent[]}
        */
        getEvents : function() {
            return this.listeners;
        }
    }
});


/**
 * @class
*/
Swell.Core.Class({
    
    name      : 'EventObject',
    namespace : 'Core',
    functions : {
        
        modifiers : {
            /**
             * Shift key
             * @property {Boolean}
            */
            shift : false,
            /**
             * Ctrl key
             * @property {Boolean}
            */
            ctrl  : false,
            /**
             * Alt key
             * @property {Boolean}
            */
            alt : false,
        },
        /**
         * @constructor
        */
        construct : function(e) {
            // The first parameter is a DOM event
            this.event = e;
            
            this.modifiers.shift = this.event.shiftKey || false;
            this.modifiers.alt   = this.event.altKey   || false;
            this.modifiers.ctrl  = this.event.ctrlKey  || false;
        },
        
        getTarget : function() {
            return this.event.target || this.event.srcElement;
        },
        
        /**
         * Normalize charcode returned by a keyboard event across browsers
         * @method getKeyCode
         * @return {int} the event's charCode
         * @static
         */
        getKeyCode : function() {
            return this.event.keyCode;
        },
        
        /**
         * Stopping event propagation
         * @function stopPropagation
        */
        stopPropagation : function() {
            if(this.event.stopPropagation) {
                this.event.stopPropagation();
                if(this.event.cancelBubble) {
                    this.event.cancelBubble = true;
                }
            } else { // the IE Way
                this.event.cancelBubble = true;
            }
        },
        
        /**
         * Prevent event from executing its default behavior
         * @function preventDefault
         * @param {String} [msg] Text to return when event is cancelled (IE Only)
        */
        preventDefault : function(msg) {
            /**
            * @see http://msdn.microsoft.com/en-us/library/ms534372(VS.85).aspx
            */
            msg = msg || false; // This will sets the returnValue for IE Only
            
            if(this.event.preventDefault) {
                this.event.preventDefault();
            } else { // the IE Way
                this.event.returnValue = msg;
            }
        },
        
        /**
         * Stopping event propagation and default behavior
         * @function stop
        */
        stop : function() {

            this.stopPropagation();
            this.preventDefault();
            
            return false;
        }
    }
});

/**
 * The Event Class provides tools for cross-browser event handling
 *
 * @class Swell.Core.Event
 * @namespace Swell.Core
 * @requires Swell.Core
 * @static
*/

Swell.Core.Event = new function(){
    
    // Keep a private collection of events
    // this will help to remove listeners attached to object later
    var __listeners__ = {};
    
    var _getById = function(id) {
        var el = document.getElementById(id);
        return (el) ? el : false;
    }
    
    /** @scope Swell.Core.Event */
    return {
        /**
         * Assign an event handler to a DOM element and maintain a representation of
         * the handler into a cache object
         * 
         * @function add
         *
         * @param {String|HTMLElement|Array} o the object to assign the handler to
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function that will be attached to the event (this function will always receive a Swell.Core.EventObject as the first argument,
         *                      this helps providing a single and consistent way of retrieving properties of event object in a cross-browser approach)
         * @param {Object} scope the obj passed in becomes the execution scope of the handler
         * @param {Mixed} args, arbitrary variables that will be passed back to the handler
         * @param {Boolean|Undefined} skipcache for internal use only, use this parameter with caution
         *
         * @see http://en.wikipedia.org/wiki/DOM_Events
         * @see http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget-addEventListener
        */
        add : function(o, type, fn, scope, args, skipcache) {

            var _type, _wrapperFn, _fnScope, _eventObject, isCached = true;
            
            // Testing if o is an object or a string
            // add is just dealing with DOM events, and is not meant to
            // handle custom events of Swell Objects
            // as Swell.Core.Dom is not part of the core distribution <~20K :D
            // We will use the good old document.getElementById for element retrieval
            
            if(Swell.Core.isString(o)) {
                o = _getById(o);
            } else if(Swell.Core.isArray(o)) {
                // Loop on function
                for(var n = 0; n < o.length; n++) {
                    this.add(o[n], type, fn, scope, args);
                }
                o = null;
            }
            
            if(!o) {
                return;
            }
            // Check if fn is a function, exit nicely
            if(!Swell.Core.isFunction(fn)) {
                return;
            }
            
            args = args || [];
            
            _wrapperFn = function(e) {
            
                var _funcArgs = [];
                
                // Create a new Swell Event object
                _eventObject = new Swell.Core.EventObject(e);
                
                _funcArgs.push(_eventObject, args)
                
                // Pass the event object to the function
                // This will be a Swell Event
                _fnScope = (Swell.Core.isObject(scope)) ? scope : _eventObject.getTarget();
                fn.apply(_fnScope, _funcArgs);
            }
            
            // Append callback property to wrapper function
            _wrapperFn.handler = fn;
            
            // Store safe representation of event type
            _type = type;
            
            // Append handler into collection, this will help
            // to garbage collect even anonymous functions
            if(!skipcache) {
                isCached = this.addToCache(o, _type, _wrapperFn);
            }
            
            if(isCached) {
                // Check if object supports native addEventListener (DOM Level 2) 
                if(o.addEventListener) {
                    o.addEventListener(type, _wrapperFn, false);
                } else if(o.attachEvent) {
                    // This is IE event handling, as IE never implements standards the right way :(
                    // append "on" keyword
                    o.attachEvent('on'+type, _wrapperFn);
                }
            }
        },

        /**
         * KeyListener is a utility that provides an easy interface for listening for
         * keydown/keyup events fired against DOM elements.
         *
         * @function addKeyListener
         * @param {HTMLElement|String|String[]|HTMLElement[]} o The element on which the listener will be attached to 
         * @param {Object|String} keys
         * @param {Function} callback function to call when key is detected
         * 
        */
        addKeyListener : function(o, keys, callback, scope, args, stop) {
            if(!Swell.Core.isFunction(callback)) {
                return false;
            }
            // Keyboard events, fires in this order : (1) keydown, (2) keypress, (3) keyup
            // Attempting to detect keydown event
            var _onKeyDown = function(e, _keys) {
                
                //Execution scope is the object on which the keylistener has been attached
                scope = scope || e.getTarget();
                args  = args  || null; 
                
                // If String, it's a hotkey combination
                if(Swell.Core.isString(_keys)) {
                    //Check if it's a valid hotkey (must match modifiers and keys)
                    if(this.isValidHotKey(e.modifiers, e.getKeyCode(), _keys)) {
                        if(stop) {
                            e.stop();
                        }
                        callback.call(scope, e, args);
                    }
                } else if(Swell.Core.isObject(_keys)) {
                    
                    var _match = false;
                    
                    _keys.shift = _keys.shift || false;  
                    _keys.alt   = _keys.alt   || false;
                    _keys.ctrl  = _keys.ctrl  || false;
                    
                    if (e.modifiers.shift === _keys.shift && 
                        e.modifiers.alt   === _keys.alt &&
                        e.modifiers.ctrl  === _keys.ctrl) { 
                        // All Modifiers Match Either True or False
                        // Checking keys
                        if(_keys.hasOwnProperty('keys')) {
                            if(Swell.Core.isArray(_keys.keys)) {
                                if(Swell.Core.inArray(e.getKeyCode(), _keys.keys)) {
                                    _match = true;
                                }
                            } else {
                                if(_keys.keys == e.getKeyCode()) {
                                    _match = true;
                                }
                            }
                            if(_match) {
                                callback.call(scope, e, args);
                            }
                        }
                    }
                }
            };
            // Capture modifiers only
            this.add(o, 'keydown', _onKeyDown, this, keys);
        },
        
        /**
         * Checks if a string representation of a key event, matches the current keydown sequence
         *
         * @function isValidHotKey
         * @example ctrl+a, (for hotkey), esc|space (one handler multiple keys), or single key ex : enter, esc, space... (Look at the keymapper to have a complete reference)
         * @param {Object} modifiers object representing the current state of modifiers e.g. : shift : true, alt : true, ctrl : false
         * @param {Int} keycode keycode returned by the keydown handler
         * @param {String} str hotkey combination to parse
         * @return {Boolean} true if the current event matches the hotkey
        */
        isValidHotKey : function(modifiers, keycode, str) {
            var _combinations = [], _n, _keyCode, _hasModifier = false, _hotKeyModifier_ = {}, _p, _match = false, _kc;
            // Strip spaces
            str = str.replace(/\s/g, '');
            // At first detect if there's a combination operator
            if(str.indexOf('+') !== -1) {
                // There are multiple keys
                _combinations = str.split('+');
                // Ok we got the combination
                // Now we have to test
                for(_n=0; _n < _combinations.length; _n++) {
                    // Capturing modifiers (multiple modifiers are supported)
                    // Checking if modifier is supported
                    if(modifiers.hasOwnProperty(_combinations[_n])) {
                        _hotKeyModifier_[_combinations[_n]] = false;
                        // Now checking if modifier is currently at the same state
                        if(modifiers[_combinations[_n]]) {
                            _hotKeyModifier_[_combinations[_n]] = true;
                        }
                    } else {
                        // Capturing only one KeyCode (cannot detect more than one keystroke at once)
                        // capturing the first valid keycode
                        // Grab the keycode with the keymapper
                        _kc = this.getCharCodeFromHotKey(_combinations[_n], keycode);
                        
                        if(_kc) {
                            if(!_keyCode) {
                                _keyCode = _kc;
                            }
                        }
                    }
                }
            } else if(str.indexOf('|') !== -1) {
                _combinations = str.split('|');
                // Ok we got the combination
                // Now we have to test
                for(_n=0; _n < _combinations.length; _n++) {
                    // Capturing only one KeyCode (cannot detect more than one keystroke at once)
                    // capturing the first valid keycode
                    // Grab the keycode with the keymapper
                    if(!modifiers.shift && !modifiers.ctrl && !modifiers.alt) {
                        _kc = this.getCharCodeFromHotKey(_combinations[_n], keycode);
                        if(_kc) {
                            if(!_keyCode) {
                                _keyCode = _kc;
                            }
                        }
                    }
                }
            } else {
                // Modifiers cannot be set
                if(!modifiers.shift && !modifiers.ctrl && !modifiers.alt) {
                    _kc = this.getCharCodeFromHotKey(str, keycode);
                    if(_kc) {
                        _match = true;
                        _keyCode = _kc;
                    }
                }
            }
            if(_keyCode) {
                _match = true;
                if(Swell.Core.hasProperties(_hotKeyModifier_)) {
                    // We have to ensure that all properties of _hotKeyModifier_
                    // matches the properties of eventObject
                    for(_p in _hotKeyModifier_) {
                        // If Modifier is on and HotKey modifier is there as well
                        if(!modifiers[_p]) {
                            _match = false;
                            break;
                        }
                    }
                }
            }
            return _match;
        },
        
        /**
         * Obtain a Keycode from its string representation using the KeyMapper
         *
         * @function getCharCodeFromHotKey
         * @param {String} hotkey string representation of the hotkey e.g. space
         * @param {Int} keycode (compared internally with the one returned by the keymapper)
         * @return {Int|Boolean}
        */
        getCharCodeFromHotKey : function(hotkey, keycode) {
            var _kc;
            _kc = ((_kc = Swell.Core.Event.Key.Map.Alphabetical[hotkey]) && _kc == keycode)  ||
                  // Checking if combination is found in alphabetical keys
                  ((_kc = Swell.Core.Event.Key.Map.Special[hotkey]) && _kc == keycode)       ||
                  // Checking If combination is found in special keys
                  ((_kc = Swell.Core.Event.Key.Map.Navigation[hotkey]) && _kc == keycode)    ||
                  // Checking if combination is found in navigation keys
                  ((_kc = Swell.Core.Event.Key.Map.Functions[hotkey]) && _kc == keycode)     ||
                  // Checking if combination is found in function keys
                  ((_kc = Swell.Core.Event.Key.Map.Numerical.Pad[hotkey]) && _kc == keycode) ||
                  // Testing if keystroke is numeric
                  (Swell.Core.Browser.isGecko && (_kc = Swell.Core.Event.Key.Map.Numerical.Exceptions[Swell.Core.Browser.family].Pad[hotkey]) && _kc == keycode);
            
            return _kc || false;
        },
        
        /**
         * Suspend a whole event type e.g., click, or in junction with fn parameter a targetted event handler 
         *
         * @function suspend
         * @param {String|HTMLElement|Array} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fns the function to suspend
            this.remove(o, type, fn, true);
         *
        */
        suspend : function(o, type, fn) {
            /* Remove event listeners but preserve listener cache */
        },
        
        /**
         * Restore a whole event type e.g., click, or in junction with fn parameter a targetted event handler 
         *
         * @function restore
         * @param {String|HTMLElement|Array} o he object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to restore
        */
        restore : function(o, type, fn) {
            /* This will re-attach listeners to an element using the cache */
            this.add(o, type, fn, null, null, true);
        },
        
        /**
         * Remove an event handler from a DOM element and its representation in the cache 
         *
         * @function remove
         *
         * @param {String|HTMLElement|Array} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to remove
         * @param {Boolean|Undefined} preservecache for internal use only, use this parameter with caution
        */
        remove : function(o, type, fn, preservecache) {
            
            var _listeners, _i;
            type            = type || false;
            fn              = fn   || false;
            preservecache   = preservecache || false;
            
            // Testing if o is either a string, an object or an array
            if(Swell.Core.isString(o)) {
                o = _getById(o);
            } else if(Swell.Core.isArray(o)) {
                // Loop on function
                for(var n = 0; n < o.length; n++) {
                    this.remove(o[n], type, fn);
                }
                o = null;
            }
            
            if(!o) {
                return;
            }

            if(type && !fn) {
                //Type is defined but fn has not been passed to function
                // Grab the listener from the cache
                _listeners = this.loadFromCache(o, type);

                if(_listeners) {
                    //The listener is in the cache
                    //Remove listener of the object then remove from cache
                    // Reverse loop to gain some speed :D
                    _i = _listeners.length;
                    while (_i--) {
                        if(o.removeEventListener) {
                            o.removeEventListener(type, _listeners[_i], false);
                        } else if(o.detachEvent) {
                            o.detachEvent('on' + type, _listeners[_i]);
                        }
                    }
                    //Remove type from cache
                    if(!preservecache) {
                        this.deleteFromCache(o, type);
                    }
                }
            } else if(type && Swell.Core.isFunction(fn)) {
                // Grab the listeners from cache
                _listeners = this.loadFromCache(o, type);
                if(_listeners) {
                    //The listener is in the cache
                    //Compare the listener we want to remove with each listeners
                    //in the cache, remove listener when needed
                    _i = _listeners.length;
                    while (_i--) {
                        if(_listeners[_i].handler === fn) {
                            if(o.removeEventListener) {
                                o.removeEventListener(type, _listeners[_i], false);
                            } else if(o.detachEvent) {
                                o.detachEvent('on' + type, _listeners[_i]);
                            }
                            //Remove listener from cache
                            if(!preservecache) {
                                this.deleteFromCache(o, type, fn);
                            }
                        }
                    }
                }
            }
        },
        
        /**
         * Delete an event from the cache
         *
         * @function deleteFromCache
         * @param {HTMLElement} o he object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to delete from cache
        */
        deleteFromCache : function(o, type, fn) {
            
            var _k, _handler;
            type = type || false;
            fn   = fn   || false;
            
            if(!o.id) {
                return false;
            }
            if(__listeners__.hasOwnProperty(o.id)) {
                
                // Listener has been found in the cache
                // Delete it either by type or function
                // Add an elseif statement for more functionality (not recommended)
                
                if(type && fn) {
                    if(__listeners__[o.id].hasOwnProperty(type) && Swell.Core.isFunction(fn)) {
                        // Loop listeners of the event type
                        // and if we find a correct match, delete the entry from the cache
                        for(_k in  __listeners__[o.id][type]) {
                            // Create a reference on handler
                            _handler = __listeners__[o.id][type][_k];
                            // If there's a strict equality between functions
                            // we assume that listeners are equals and can be safely deleted from cache
                            if(_handler.handler === fn) {
                                __listeners__[o.id][type][_k] = null; //Prevent IE from leaking
                                delete __listeners__[o.id][type][_k];
                            }
                        }
                    }
                }
                else if(type && !fn) {
                    if(__listeners__[o.id].hasOwnProperty(type)) {
                        // Loop listeners of the event type
                        for(_k in  __listeners__[o.id][type]) {
                            __listeners__[o.id][type][_k] = null; //Prevent IE from leaking
                            delete __listeners__[o.id][type][_k];
                        }
                    }
                }
            }
            return true;
        },
        
        /**
         * Loads an event from the cache
         *
         * @function loadFromCache
         * @param {HTMLElement} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
        */
        loadFromCache : function(o, type) {
            
            var _listener = false;
            type = type || false;

            // Retrieve an object in the cache
            if(!o.id) {
                // ID has been deleted or we are trying to load an object that is not yet in the cache
                return false;
            }
            if(__listeners__.hasOwnProperty(o.id)) {
                // Listener has been found in the cache
                if(type) {
                    // Check if type exists
                    if(__listeners__[o.id].hasOwnProperty(type)) {
                        _listener = __listeners__[o.id][type];
                    }
                } else {
                    _listener = __listeners__[o.id];
                }
            }
            return _listener;
        },
        
        /**
         * Adds an event into cache
         *
         * @function addToCache
         * @param {HTMLElement} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to add into cache
        */
        addToCache : function(o, type, fn) {
            var _listener, _n, _handler, _found = false;
            // Add ID
            if(!o.id) {
                // Increment unique ID index
                o.id = Swell.uniqueId();
            }
            // Check if element is already registered into listeners
            // If Function and eventName are the same, we don't append the same listener
            // this is part of the W3C Recommandation for DOM Level 2 events
            if(__listeners__.hasOwnProperty(o.id)) {
                _listener = __listeners__[o.id];
            } else {
                _listener = __listeners__[o.id] = {};
            }
            // Checking if event is registered in the cache
            if(_listener.hasOwnProperty(type)) {
                // Now iterate through event handlers
                // and skip caching if the same handler is attached to the element
                for(_n=0; _n < _listener[type].length; _n++) {
                    _handler = _listener[type][_n]['handler'];
                    if(_handler === fn.handler) {
                        // Event handler is already defined, exit nicely
                        _found = true;
                        break;
                    }
                }
                // Tell caller that this handler cannot be cached (event will not be added to DOM)
                if(_found) {
                    return false;
                }
            }
            // Creating hash of handlers
            if(Swell.Core.isArray(_listener[type])) {
                _listener[type].push(fn);
            } else {
               _listener[type] = [fn];
            }
            // Everything should be ok at this point, handler is in the cache
            return true;
        },
        
        /**
         * Return all listeners of an object, (nota : this only concerns events added with Swell.Core.Event)
         *
         * @function getListeners
         * @param {HTMLElement} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to add into cache
        */
        getListeners : function(o) {
            if(Swell.Core.isString(o)) {
                o = _getById(o);
            }
            if(!o.id) {
                return false;
            }
            if(__listeners__.hasOwnProperty(o.id)) {
                return __listeners__[o.id];
            }
            return false;
        },
        
        /**
         * Copy listeners of an object to another
         *
         * @function cloneListeners
         * @param {HTMLElement} o the object that holds the handler
         * @param {HTMLElement} dest the object that will receive the cloned handlers
        */
        cloneListeners : function(o, dest, type) {
            
            var _handlers, _k, _n;
            if(Swell.Core.isString(dest)) {
                dest = _getById(dest);
            }
            if(Swell.Core.isString(o)) {
                o = _getById(o);
            }
            if(!o) {
                return false;
            }
            
            _handlers = this.loadFromCache(o);
            if(_handlers) {
                // Start copying...
                for(_k in _handlers) {
                    // If type is defined
                    if(type && type !== _k) {
                        // Type is not targetted
                        continue;
                    }
                    // And another loop for handlers
                    _n = _handlers[_k].length;
                    while(_n--) {
                        this.add(dest, _k, _handlers[_k][_n].handler);
                    }
                }
            }
            return true;
        },
        
        /** 
         * Here goes built-in events
        */
        onDomReady : function(fn, scope, args) {
            var _engineVer, _browserVer, _useDOMContentLoaded = false;
            if(args) {
                if(!Swell.Core.isArray(args)) {
                    args = [args];
                }
            } else {
                args = [];
            }
            
            // Checking if Browser is a Gecko based browser
            // Using DOMContentLoaded if available
            if(Swell.Core.Browser.isGecko) {
                _useDOMContentLoaded = true;
            } else {
                // Checking other browsers
                if(Swell.Core.Browser.isWebkit) {
                    _engineVer = parseFloat(Swell.Core.Browser.engine.version);
                    // Testing if Webkit engine supports DOMContentLoaded event
                    if(_engineVer >= 525.13) {
                        _useDOMContentLoaded = true;
                    }
                } else if(Swell.Core.Browser.isOpera) {
                    // Testing browser version
                    _browserVer = parseFloat(Swell.Core.Browser.version);
                    if(_browserVer >= 9) {
                        //DOMContentLoaded is supported by Opera >= 9
                        _useDOMContentLoaded = true;
                    }
                }
            }
            if(_useDOMContentLoaded) {
                this.add(document, 'DOMContentLoaded', fn, scope, args);
            } else {
                // Target IE Only
                if(Swell.Core.Browser.isIE) {
                    if(document.location.protocol !== 'https') {
                        //Ugly hack of Dean Edwards :D
                        document.write('<scr' + 'ipt id="SwellDomReady" defer="true" ' + 'src=//:><\/scr' + 'ipt>');
                        this.add('SwellDomReady', Swell.Core.Event.Type.READYSTATE, function(e) {
                            if(this.readyState === 'complete') {
                                // We can call our original handler
                                fn.apply(scope, args);
                            }
                        });
                    } else { // This is Diego's perini trick (re-engineered of course), used as well by YUI and almost all the others :D
                        (function() {
                            try {
                                document.documentElement.doScroll('left');
                            } catch(e) {
                                setTimeout(arguments.callee, 0);
                                return;
                            }
                            fn.apply(scope, args);
                        })();
                    }
                }
            }
        },
        
        /**
         * @borrows Swell.Core.Event.add as this.on
        */
        on : function() {
            return this.add.apply(this, arguments);
        },
        
        /**
         * @borrows Swell.Core.Event.add as this.addEventListener
        */
        addEventListener : function() {
            return this.add.apply(this, arguments);
        },
        
        /**
         * @borrows Swell.Core.Event.add as this.addEvent
        */
        addEvent : function() {
            return this.add.apply(this, arguments);
        },
        
        /**
         * @alias Swell.Core.Event.remove
        */
        un : function() {
            return this.remove.apply(this, arguments);
        }
    }
    
}();

/**
 * Constants for event names.
 * @enum {string}
 * @static
 * @see http://www.quirksmode.org/dom/events/
*/
Swell.Core.Event.Type = {

    // Mouse events
    CLICK               : 'click',
    DBLCLICK            : 'dblclick',
    MOUSEDOWN           : 'mousedown',
    MOUSEUP             : 'mouseup',
    MOUSEOVER           : 'mouseover',
    MOUSEOUT            : 'mouseout',
    MOUSEMOVE           : 'mousemove',
    MOUSEWHEEL          : 'mousewheel',

    // Key events
    KEYPRESS            : 'keypress',
    KEYDOWN             : 'keydown',
    KEYUP               : 'keyup',
    PASTE               : 'paste',

    // Focus
    BLUR                : 'blur',
    FOCUS               : 'focus',

    // Forms
    CHANGE              : 'change',
    SELECT              : 'select',
    SUBMIT              : 'submit',
    RESET               : 'reset',

    // Misc
    LOAD                : 'load',
    UNLOAD              : 'unload',
    HELP                : 'help',
    RESIZE              : 'resize',
    SCROLL              : 'scroll',
    READYSTATE          : 'readystatechange',
    CONTEXTMENU         : 'contextmenu',
    ERROR               : 'error',
    
    // IE Proprietary events (the most common)
    MOUSEENTER          : 'mouseenter',
    MOUSELEAVE          : 'mouseleave',
    DEACTIVATE          : 'deactivate',
    FOCUSIN             : 'focusin',
    FOCUSOUT            : 'focusout',
    HASHCHANGE          : 'hashchange',
    ABORT               : 'abort',
    ACTIVATE            : 'activate',
    AFTERPRINT          : 'afterprint',
    
    // Mozilla Specific Events
    COPY                : 'copy',
    CUT                 : 'cut'
    
};

/**
 * Constants for key strokes.
 * @enum {string}
 * @static
 * @see http://www.quirksmode.org/js/keys.html
*/
Swell.Core.Event.Key ={

    // Most-used special keys
    ALT             : 18,
    CTRL            : 17,
    DEL             : 46,
    ENTER           : 13,
    END             : 35,
    ESC             : 27,
    BACKSPACE       : 8,
    HOME            : 36,
    SHIFT           : 16,
    TAB             : 9,

    // Nav keys
    LEFT            : 37,
    UP              : 38,
    RIGHT           : 39,
    DOWN            : 40,
    PAGEUP          : 33,
    PAGEDOWN        : 34,
    
    // Lock Keys
    CAPSLOCK        : 20,
    NUMLOCK         : 144,
    
    // Function Keys (F1 - F12)
    F1              : 112,
    F2              : 113,
    F3              : 114,
    F4              : 115,
    F5              : 116,
    F6              : 117,
    F7              : 118,
    F8              : 119,
    F9              : 120,
    F10             : 121,
    F11             : 122,
    F12             : 123
}
/**
 * Provides a comprehensive, and reliable way to map alphabetical and numeric characters
 * based on keyCode, this map will help us to implement hot-key combinations such as ctrl+v etc.
 * The Most annoying thing is that 
 *
 * For keydown and keyup events, you can identify most common keys (letters, numbers, and a few others) 
 * by just looking at the event.keyCode and more or less pretending that it is an ASCII code. However, it isn't really, 
 * and the many Javascript manuals that say it can be converted to a character by doing "String.fromCharCode(event.keyCode)" 
 * are wrong
 *
 * We will just provide an almost "reliable" keymap for keydown event
 *
 * @static
*/ 
Swell.Core.Event.Key.Map ={
    Alphabetical : {
        // Alphabetical Chars
        'a' : 65, 'b' : 66, 'c' : 67, 'd' : 68, 'e' : 69, 'f' : 70,
        'g' : 71, 'h' : 72, 'i' : 73, 'j' : 74, 'k' : 75, 'l' : 76, 'm' : 77,
        'n' : 78, 'o' : 79, 'p' : 80, 'q' : 81, 'r' : 82, 's' : 83, 't' : 84,
        'u' : 85, 'v' : 86, 'w' : 87, 'x' : 88, 'y' : 89, 'z' : 90
    },
    Numerical : {
        Pad : {
            '0'     : 96, '1' : 97, '2' : 98, '3' : 99, '4' : 100,
            '5'     : 101, '6' : 102, '7' : 103, '8' : 104, '9' : 105,
            'slash' : 111, 'asterisk' : 106, 'dash' : 109, 'minus' : 107,
            'dot'   : 110
        },
        Exceptions : {
            // On Opera numeric pad keyCodes are other browsers shift combination WTF???
            GECKO : {
                Pad : {
                    '0' : 48, '1' : 49, '2' : 50, '3' : 51, '4' : 52,
                    '5' : 53, '6' : 54, '7' : 55, '8' : 56, '9' : 57
                }
            }
        }
    },
    Special : {
        'del'           : 46,   'enter'     : 13,    'end'              : 35,   'esc'               : 27,
        'tab'           : 9,    'space'     : 32,    'pause'            : 19,   'capslock'          : 20,
        'scrolllock'    : 145,  'numlock'   : 144,   'insert'           : 45,   'altgr'             : 18,
        'comma'         : 188,  'dash'      : 54,    'openbracket'      : 219,  'closebracket'      : 221,
        'slash'         : 191,  'backslash' : 220,   'singlequote'      : 222,  'dblquote'          : 51,
        'ampersand'     : 49,   'backspace' : 8,     'openparenthesis'  : 53,   'closeparenthesis'  : 219,
        'asterisk'      : 220,  'semicolon' : 190,   'equalsign'        : 187,  'dollar'            : 186,
        'underscore'    : 56,   'ctrl'      : 17
    },
    
    Navigation : {
        'left' : 37, 'right'  : 39,  'up'   : 38, 'down' : 39,
        'pgup' : 33, 'pgdown' : 40,  'home' : 36
    },
    
    Functions : {
        'F1' : 112, 'F2' : 113, 'F3' : 114, 'F4' : 115, 'F5' : 116, 'F6' : 117,
        'F7' : 118, 'F8' : 119, 'F9' : 120, 'F10' : 121, 'F11' : 122, 'F12' : 123
    }
}

// Set some shorthands for the class
Swell.alias(Swell.Core.Event, 'Event');