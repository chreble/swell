/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <a href="mailto:christopheeble@gmail.com">Christophe Eble</a>
 * @author <a href="mailto:alpherz@gmail.com">Jonathan Gautheron</a>
*/
(function() {

    /*
     * Inspired by inheritance implementation done by Alex Arnell <alex@twologic.com>
    */
    var Class = {

        extend : function(parent, cfg) {
            var mixin;
            if(arguments.length == 1) cfg = parent, parent = null;
            var func = function() {
                this[Swell.CONSTRUCTOR_NAME] = this[Swell.CONSTRUCTOR_NAME] || Function();
                if (!Class.extending) this[Swell.CONSTRUCTOR_NAME].apply(this, arguments);
            };
            if (Swell.Core.isObject(parent)) {
                
                Class.extending = true;
                
                func.prototype = new parent();
                func.superclass = parent.prototype;
                
                delete Class.extending;
            }
            var mixins = [];
            if (cfg && cfg.mixins) {
                if (cfg.mixins.reverse) {
                    mixins = mixins.concat(cfg.mixins.reverse());
                } else {
                    mixins.push(cfg.mixins);
                }
                delete cfg.mixins;
            }
            if (cfg) Class.inherit(func.prototype, cfg);
            for (var i = 0; (mixin = mixins[i]); i++) {
                Class.mixin(func.prototype, mixin);
            }
            
            return func;
        },
        
        mixin : function(dest) {
            var src;
            for (var i = 1; (src = arguments[i]); i++) {
                if (!Swell.Core.isUndefined(src) && !Swell.Core.isNull(src)) {
                    for (var prop in src) {
                        if (!dest[prop]) { // only mixin functions, if they don't previously exist
                            dest[prop] = src[prop];
                        }
                    }
                }
            }
            return dest;
        },
        
        inherit : function(dest, src, fname) {
            if (arguments.length == 3) {
                var ancestor = dest[fname],
                descendent = src[fname],
                method = descendent;
                descendent = function() {
                    var ref = this.parent;
                    this.parent = ancestor;
                    var result = method.apply(this, arguments);
                    ref ? this.parent = ref: delete this.parent;
                    return result;
                }; // mask the underlying method
                descendent.valueOf = function() {
                    return method;
                };
                descendent.toString = function() {
                    return method.toString();
                };
                dest[fname] = descendent;
            } else {
                for (var prop in src) {
                    if (dest[prop] && Swell.Core.isFunction(src[prop])) {
                        Class.inherit(dest, src, prop);
                    } else {
                        dest[prop] = src[prop];
                    }
                }
            }
            return dest;
        }
    };

    Swell.namespace('Core');

    // Private static members
    Swell.Core ={
        /**
         * Just test if some native methods of Array object are available
         * 
         * @function isArray
         * @param {mixed} a The object being tested
         * @return {boolean}
        */
        isArray : function(a) { 
            if (a) {
               return (typeof a.pop === 'function');
            }
            return false;
        },
        
        /**
         * Test if variable passed to the function is a boolean
         * @function isBoolean
         * @param {mixed} o The object being tested
         * @return {boolean}
        */
        isBoolean : function(o) {
            return typeof o === 'boolean';
        },
        
        /**
         * Test if variable passed to the function is a function
         * @function isFunction
         * @param {mixed} o The object being tested
         * @return {boolean}
        */
        isFunction : function(o) {
            return typeof o === 'function';
        },
        
        /**
         * Test if variable passed to the function is null
         * @function isNull
         * @param {mixed} o The object being tested
         * @return {boolean}
        */
        isNull : function(o) {
            return o === null;
        },
        
        /**
         * Test if variable passed to the function is a number
         * @function isInteger
         * @param {Mixed} i The object being tested
         * @return {Boolean}
        */
        isInteger : function(i) {
            var o = parseInt(i);
            return (!isNaN(o) && o.toString() == i);
        },
        
        /**
         * Test if variable passed to the function is a float
         * @function isFloat
         * @param {Mixed} i The object being tested
         * @return {boolean}
        */
        isFloat : function(i) {
            var o = parseFloat(i);
            return (!isNaN(o) && o.toString() == i);
        },
        
        /**
         * Test if variable passed to the function is an object or a function
         * 
         * @function isObject
         * @param {mixed} o The object being tested
         * @return {boolean}
        */  
        isObject : function(o) {
            return (o && (typeof o === 'object' || Swell.Core.isFunction(o)));
        },
            
        /**
         * Test if variable passed to the function is a string
         * 
         * @function isString
         * @param {Mixed} o The object being tested
         * @return {Boolean}
        */
        isString : function(o) {
            return typeof o === 'string';
        },
            
        /**
         * Test if variable passed to the function is undefined
         * 
         * @function isUndefined
         * @param {mixed} o The object being tested
         * @return {boolean}
        */ 
        isUndefined : function(o) {
            return typeof o === 'undefined';
        },
        
        /**
         * Test if object passed to the function has properties
         * 
         * @function hasProperties
         * @param {Object} o The object being tested
         * @return {Boolean}
        */ 
        hasProperties : function(o){
            if(!Swell.Core.isObject(o)) {
                return false;
            }
            if(o.__count__) {
                return o.__count__;
            } else {
                for(var prop in o) {
                    return true;
                }
            }
        },

        /**
         * Returns an array of keys taking an object as a source 
         * 
         * @function getKeys
         * @param {Object} o Object with keys
         * @return {String[]} keys
        */ 
        getKeys : function(o) {
            var k, tmp;
            if(Swell.Core.isObject(o)) {
                tmp = [];
                for(k in o) {
                    tmp.push(k);
                }
                return tmp;
            }
            return false;
        },
        
        /**
         * Check if a needle is contained into the array passed as second argument
         * 
         * @function inArray
         * @param {Mixed} needle value to search in the haystack
         * @param {Array} haystack array to search in
         * @return {Boolean}
        */ 
        inArray : function(needle, haystack) {
            var _l = haystack.length;
            while(_l--) {
                if(needle === haystack[_l]) {
                    return true;
                }
            }
            return false;
        },
        
        /**
         * Get the prototype object, uses the native method when possible (starting from JavaScript 1.9.1)
         * 
         * @see https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Object/GetPrototypeOf
         * @param {Object} o the object to get the prototype of
         * @function getPrototypeOf
         * @return {Object}
        */ 
        getPrototypeOf : function(o) {
            // Check if getPrototypeOf is a language construct in the current browser
            // No user-agent parsing here, just clever property testing
            if(Swell.Core.isFunction(Object.getPrototypeOf)) {
                return Object.getPrototypeOf(o);
            }
            // Determining Instance Relationships with __proto__ property
            if(Swell.Core.isObject(Object.__proto__)) {
                return o.__proto__;
            } else {
                return o.constructor.prototype;
            }
        },
        
        Class : function(o) {
            var constructor, proto, events, namespace, cls = {}, ns, inheritedCls = null, _ns;
            // If o is empty, create an anonymous class
            o = o || {};
            
            // Exit nicely if name property is not cfgined
            if(!o.hasOwnProperty('name')) {
                return false;
            }
            
            if(!o.hasOwnProperty('namespace')) {
                return false;
            } else {
                ns = Swell.namespace(o.namespace);
            }
            
            // Start creating class
            // The functions are the prototype :D
            if(o.hasOwnProperty('functions') && Swell.Core.isObject(o.functions)) {
                cls = o.functions;
            }
            
            // Check at first if Class has mixins of Another objects or anonymous mixins
            if(o.hasOwnProperty('mixins')) {
                cls.mixins = o.mixins;
            }
                       
            ns[o.name] = Class.extend(inheritedCls, cls);
            ns[o.name].ns = {'path' : o.namespace, 'name' : o.name};
            
            _ns = {'path' : o.namespace, 'name' : o.name};
            
            // Implement Multiple inheritance
            if(o.inherits && Swell.Core.isArray(o.inherits)) {
                for(var i=0; i < o.inherits.length; i++) {
                    Swell.Core.Class.extend.call({'namespace' : _ns}, ns[o.name], o.inherits[i]);
                }
            } else if(o.inherits && Swell.Core.isObject(o.inherits) && !Swell.Core.isArray(o.inherits)) {
                Swell.Core.Class.extend.call({'namespace' : _ns}, ns[o.name], o.inherits);
            }

            return ns[o.name];
        }
    };
    
    // Static functions
    Swell.Core.Class.extend =  function() {
        
        var _args, _src, _n, _l, _ns;
        
        _args = [].slice.call(arguments,0);
        _src = _args.shift();
        
        if(!this.hasOwnProperty('namespace')) {
            _ns = Swell.namespace(_src.ns.path);
            _ns.name = _src.ns.name;
        } else {
            _ns = Swell.namespace(this.namespace.path);
            _ns.name = this.namespace.name;
        }
        
        for(_n = 0, _l = _args.length; _n < _l; _n++) {
            _ns[_ns.name] = Class.extend(_ns[_ns.name], _args[_n].prototype);
        }
    };

})();