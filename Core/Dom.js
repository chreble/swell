/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <a href="mailto:christopheeble@gmail.com">Christophe Eble</a>
 * @author <a href="mailto:alpherz@gmail.com">Jonathan Gautheron</a>
*/

Swell.namespace('Core.Dom');

Swell.Core.Class({
    
    name      : 'DomObject',
    namespace : 'Core',
    functions : {
    
        /**
         * @constructor
        */
        construct : function(e) {
        }
    }
});

Swell.Core.Dom = new function(){
    
    var _registeredElements = {};
    
    return {
    
        /**
         * Returns an HTMLElement by its ID
         *
         * @function get
         * @param {String|Array} el the element ID to grab, or an array of several IDs
         * @param {Boolean} domObject returns a domObject instead of a HTMLElement (optional)
         * @return {HTMLElement}
        */
        get : function(el, domObject) {
            if (Swell.Core.isString(el)) {
                return document.getElementById(el);
            }
            
            if (Swell.Core.isArray(el)) {
                var _i = el.length, _els = [];
                while (i--) {
                    _els.push(this.get(el[_i]));
                }
                return _els;
            }
        },
        
        /**
         * Check if the given element has the specified class
         *
         * @function hasClass
         * @param {String|HTMLElement} el check if the given element has the specified class
         * @param {Boolean} domObject returns a domObject instead of a HTMLElement (optional)
         * @return {Boolean}
        */
        hasClass : function(el, className) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            if (!Swell.Core.isUndefined(el.nodeType)) {
                var _expr = new RegExp('([^\s]|[^\w])?(' + className + ')([^\s]|[^\w])?');
                return _expr.test(el.className);
            }
        },
        
        addClass : function(el, className) {
            if (!Swell.Core.isUndefined(el.nodeType)) {
                if (Swell.Core.isArray(className)) {
                    var _l = className.length;
                    while (_l--) {
                        this.addClass(el, className[_l]);
                    }
                    return;
                }
                if (this.hasClass(el, className)) {
                    return false;
                }
                
                el.className = [el.className, className].join(' ');
                return;
            }
            
            if (Swell.Core.isString(el)) {
                this.addClass(this.get(el), className);
            }
            
            if (Swell.Core.isArray(el)) {
                var _i = el.length;
                while (_i--) {
                    this.addClass(el[_i], className);
                }
            }
        },
        
        removeClass : function(el, className) {
            
        }
        
    }
    
}();

// Set some shorthands for the class
Swell.alias(Swell.Core.Dom, 'Dom');