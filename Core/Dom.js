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
    
    return {
        /**
         * Registered domObject elements
         * @property _registeredElements
         * @type {Object}
        */
        _registeredElements : {},
        
        /**
         * Registered className RegExp
         * @property _registeredExpr
         * @type {Object}
        */
        _registeredExpr : {},
        
        /**
         * Returns the className regex
         *
         * @function _expr
         * @param {String} className
         * @return {RegExp}
        */
        _expr : function(className) {
            // if the className RegExp has already been used before...
            if (this._registeredExpr[className]) {
                return this._registeredExpr[className];
            }
            
            // keep the result in cache (~40% performance gain once cached)
            var _regExp = new RegExp('(?:[^\s]|[^\w])?' + className + '(?:[^\s]|[^\w])?');
            this._registeredExpr[className] = _regExp;
            return _regExp;
        },
        
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
                // getElementByID supported since IE 5.5
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
         * Returns an array of elements matching the given class name
         *
         * @function getElementsByClassName
         * @param {String|Array} className
         * @param {Boolean} root
         * @param {Boolean} tagName specify the tagName for quicker lookup on browsers that doesn't implement natively this method
         * @return {Array} NodeList
         * @see https://developer.mozilla.org/en/DOM/document.getElementsByClassName
         * @see https://developer.mozilla.org/En/DOM/Document.querySelectorAll
        */
        getElementsByClassName : function(className, root, tagName) {
            // https://developer.mozilla.org/En/Introduction_to_using_XPath_in_JavaScript
            root = root || document;
            
            // for native implementations
            if (document.getElementsByClassName) {
                if (Swell.Core.isString(root)) {
                    root = this.get(root);
                }
                return root.getElementsByClassName(className);
            }
            
            // at least try with querySelector (IE8)
            if (document.querySelectorAll) {
                return root.querySelectorAll(tagName + '.' + className);
            }
            
            // and for others... IE7-, Firefox 2-, Safari 3.1-, Opera 9-
            var tagName = tagName || '*', _tags = document.getElementsByTagName(tagName), _nodesList = [];
            for (var i = 0, _tag; _tag = _tags[i++];) {
                if (this.hasClass(_tag, className)) {
                    _nodesList.push(_tag);
                }
            }
            return _nodesList;
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
                return this._expr(className).test(el.className);
            }
        },
        
        /**
         * Add the class of the given element
         *
         * @function addClass
         * @param {String|Array|HTMLElement} el
         * @param {String|Array} className
        */
        addClass : function(el, className) {
            if (!Swell.Core.isUndefined(el.nodeType)) {
                if (Swell.Core.isArray(className)) {
                    var _l = className.length;
                    while (_l--) {
                        this.addClass(el, className[_l]);
                    }
                    return;
                }
                // check if the element doesn't already have the class
                if (this.hasClass(el, className)) {
                    return false;
                }
                // and finally add the class
                el.className = [el.className, className].join(' ');
                return;
            }
            
            // if the element is a string, we assume it's an ID
            if (Swell.Core.isString(el)) {
                this.addClass(this.get(el), className);
            }
            
            // and if this is an array, we loop through it
            if (Swell.Core.isArray(el)) {
                var _i = el.length;
                while (_i--) {
                    this.addClass(el[_i], className);
                }
            }
        },
        
        /**
         * Remove the given class of the element
         *
         * @function removeClass
         * @param {String|Array|HTMLElement} el
         * @param {String|Array} className
        */
        removeClass : function(el, className) {
            if (!Swell.Core.isUndefined(el.nodeType)) {
                if (Swell.Core.isArray(className)) {
                    var _l = className.length;
                    while (_l--) {
                        this.removeClass(el, className[_l]);
                    }
                    return;
                }
                
                el.className = el.className.replace(this._expr(className), '');
                return;
            }
            
            // if the element is a string, we assume it's an ID
            if (Swell.Core.isString(el)) {
                this.removeClass(this.get(el), className);
            }
            
            // and if this is an array, we loop through it
            if (Swell.Core.isArray(el)) {
                var _i = el.length;
                while (_i--) {
                    this.removeClass(el[_i], className);
                }
            }
        },
        
        /**
         * Toggles element class name
         *
         * @function toggleClass
         * @param {String|Array|HTMLElement} el
         * @param {String|Array} className
        */
        toggleClass : function(el, className) {
            if (!Swell.Core.isUndefined(el.nodeType)) {
                if (Swell.Core.isArray(className)) {
                    var _l = className.length;
                    while (_l--) {
                        this.toggleClass(el, className[_l]);
                    }
                    return;
                }
                
                if (this.hasClass(el, className)) {
                    this.removeClass(el, className);
                } else {
                    this.addClass(el, className);
                }
                return;
            }
            
            // if the element is a string, we assume it's an ID
            if (Swell.Core.isString(el)) {
                this.toggleClass(this.get(el), className);
            }
            
            // and if this is an array, we loop through it
            if (Swell.Core.isArray(el)) {
                var _i = el.length;
                while (_i--) {
                    this.toggleClass(el[_i], className);
                }
            }
        },
        
        /**
         * Returns the value of the given style
         *
         * @function getStyle
         * @param {String|HTMLElement} el
         * @param {String} style
         * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-OverrideAndComputed
         * @see https://developer.mozilla.org/en/Gecko_DOM_Reference/Examples#Example_6.3a_getComputedStyle
        */
        getStyle : function(el, style) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            if (el.currentStyle) {
                // IE proprietary method
                return el.currentStyle[style];
            }
            
            // W3C implementation
            // getPropertyValue(style) if not camelized
            return document.defaultView.getComputedStyle(el, null)[style];
        },
        
        /**
         * Applies the value of the given style
         *
         * @function setStyle
         * @param {String|HTMLElement} el
         * @param {Object} style associative object (style : value)
        */
        setStyle : function(el, style) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            if (Swell.Core.isObject(style)) {
                for (var i in style) {
                    el.style[i] = style[i];
                }
            }
        }
        
    }
    
}();

// Set some shorthands for the class
Swell.alias(Swell.Core.Dom, 'Dom');