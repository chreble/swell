/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <a href="mailto:christopheeble@gmail.com">Christophe Eble</a>
 * @author <a href="mailto:alpherz@gmail.com">Jonathan Gautheron</a>
*/

Swell.setNameSpace('Core.Dom');

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