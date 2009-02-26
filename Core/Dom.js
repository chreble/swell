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

/**
 * The DOM Class provides tools for cross-browser DOM operations
 *
 * @class Swell.Core.Dom
 * @namespace Swell.Core
 * @requires Swell.Core
 * @static
*/
Swell.Core.Dom = new function(){
    /**
     * Registered domObject elements
     * @property _registeredElements
     * @type {Object}
    */
    var _registeredElements = {};
    
    /**
     * Registered className RegExp
     * @property _registeredExpr
     * @type {Object}
    */
    var _registeredExpr = {};
    
    /**
     * Returns the className regex
     *
     * @private
     * @function _expr
     * @param {String} className
     * @return {RegExp}
    */
    var _expr = function(className) {
        // if the className RegExp has already been used before...
        if (_registeredExpr[className]) {
            return _registeredExpr[className];
        }
        
        // keep the result in cache (~40% performance gain once cached)
        var _regExp = new RegExp('([^\s]|[^\w])?' + className + '([^\s]|[^\w])?');
        _registeredExpr[className] = _regExp;
        return _regExp;
    }
    
    /**
     * Executes the given function on the hidden element
     *
     * @private
     * @function _checkHiddenElementProperty
     * @param {String|HTMLElement} el
     * @param {Function} fn
     * @return {Mixed}
    */
    var _checkHiddenElementProperty = function(el, fn) {
        var _defaultPosition   = this.getStyle(el, 'position'),
            _defaultVisibility = this.getStyle(el, 'visibility');
            
        // we need to display the element to check its property
        this.setStyle(el, {
            'position'   : 'absolute',
            'visibility' : 'hidden',
            'display'    : ''
        });
        
        property = fn.call(this, el);
        
        // and eventually sets the element as its original state
        this.setStyle(el, {
            'position'   : _defaultPosition,
            'visibility' : _defaultVisibility,
            'display'    : 'none'
        });
        
        return property;
    }
    
    /**
     * Checks if the given node is not empty (and not linebreaks, spaces, tabs...)
     *
     * @private
     * @function _isEmptyNode
     * @param {String} nodeValue
     * @return {Boolean}
    */
    var _isEmptyNode = function(nodeValue) {
        if (/^[\s]+$/.test(nodeValue)) {
            return true;
        }
        return false;
    }
    
    /**
     * Checks if the given node is a text node
     *
     * @private
     * @function _isTextNode
     * @param {String} nodeValue
     * @return {Boolean}
    */
    var _isTextNode = function(node) {
        if (node.nodeType === 3) {
            return true;
        }
        return false;
    }
    
    /**
     * Checks if the element is a child of the given parent by looping through the DOM
     * We get there if we couldn't find or use querySelector
     *
     * @private
     * @function _isChild
     * @param {HTMLElement} child
     * @param {HTMLElement} parent
     * @param {Boolean} deep recursive iteration
     * @return {Boolean}
    */
    var _isChild = function(child, parent, deep) {
        var _el = parent.firstChild;
        if(child === _el) {
            return true;
        }
        _el = _el.nextSibling;
        while(_el !== parent.lastChild) {
            // if the node is not the one we're looking for
            if(_el !== child) {
                _el = _el.nextSibling;
                continue;
            }
            // found it!
            return true;
        }
        return false;
    }
    
    /** scope Swell.Core.Dom */
    return {
        /**
         * Returns a HTMLElement by its ID
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
         * @return {Array} HTMLElements
         * @see https://developer.mozilla.org/en/DOM/document.getElementsByClassName
         * @see https://developer.mozilla.org/En/DOM/Document.querySelectorAll
        */
        getElementsByClassName : function(className, root, tagName) {
            root = root || document.body;
            if (Swell.Core.isString(root)) {
                root = this.get(root);
            }
            
            // for native implementations
            if (document.getElementsByClassName) {
                return root.getElementsByClassName(className);
            }
            
            // at least try with querySelector (IE8 standards mode)
            // about 5x quicker than below
            if (root.querySelectorAll) {
                tagName = tagName || '';
                return root.querySelectorAll(tagName + '.' + className);
            }
            
            // and for others... IE7-, IE8 (quirks mode), Firefox 2-, Safari 3.1-, Opera 9-
            var tagName = tagName || '*', _tags = root.getElementsByTagName(tagName), _nodeList = [];
            for (var i = 0, _tag; _tag = _tags[i++];) {
                if (this.hasClass(_tag, className)) {
                    _nodeList.push(_tag);
                }
            }
            return _nodeList;
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
            
            if (document.querySelectorAll && el.id) {
                var _match = document.querySelectorAll('#' + el.id + '[class~=' + className + ']');
                return _match.length > 0 ? true : false;
            }
            
            if (!Swell.Core.isUndefined(el.nodeType)) {
                return _expr(className).test(el.className);
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
                
                el.className = el.className.replace(_expr(className), '');
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
         * @return {Mixed}
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
                for (var _i in style) {
                    el.style[_i] = style[_i];
                }
            }
        },
        
        /**
         * Sets the given element attribute
         *
         * @function setAttribute
         * @param {String|HTMLElement} el
         * @param {Object} o attributes associative object (attribute : value)
        */
        setAttribute : function(el, o) {
            var _node;
            
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            if (Swell.Core.isObject(o)) {
                for (var _i = 0, _l = el.attributes.length; _i < _l; _i++) {
                    _node = el.attributes[_i];
                    for (var _n in o) {
                        if (_node.name == _n) {
                            _node.value = o[_n];
                        } else {
                            // we won't allow nasty things such as cssText or appending a class
                            // they've got setStyle/addClass especially for that
                            el.setAttribute(_n, o[_n]);
                        }
                    }
                }
            }
        },
        
        /**
         * Returns the given element attribute value
         *
         * @function getAttribute
         * @param {String|HTMLElement} el
         * @param {String} attr attribute name
         * @return {Mixed}
        */
        getAttribute : function(el, attr) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            return el.getAttribute(attr);
        },
        
        /**
         * Returns children nodes of the given element
         *
         * @function getChildren
         * @param {String|HTMLElement} el
         * @param {Boolean} elementNodes return only element nodes
         * @return {Array} HTMLElements
        */
        getChildren : function(el, elementNodes) {
            elementNodes = elementNodes || false;
        
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            // if the element hasn't at least one child
            if (el.childNodes.length < 1) {
                return;
            }
            
            var _elementsClosure = function(node) {
                if (!elementNodes) {
                    return true;
                }
                if (node.nodeType === 1) {
                    return true;
                }
                return false;
            },  _childNodes = [], _l = el.childNodes.length;
            while (_l--) {
                if (!_isEmptyNode(el.childNodes[_l].nodeValue) && _elementsClosure(el.childNodes[_l])) {
                    _childNodes.push(el.childNodes[_l]);
                }
            }
            
            return _childNodes;
        },
        
        /**
         * Returns viewport width
         *
         * @function getViewportWidth
         * @return {Int}
        */
        getViewportWidth : function() {
            // gecko/webkit/presto/IE7
            if (window.innerWidth) {
                return window.innerWidth;
            }
            
            // IE standards mode
            if (document.documentElement.clientWidth) {
                return document.documentElement.clientWidth;
            }
            
            // IE quirks mode
            if (document.body.clientWidth) {
                return document.body.clientWidth;
            }
        },
        
        /**
         * Returns viewport height
         *
         * @function getViewportHeight
         * @return {Int}
        */
        getViewportHeight : function() {
            // gecko/webkit/presto/IE7
            if (window.innerHeight) {
                return window.innerHeight;
            }
            
            // IE6- standards mode
            if (document.documentElement.clientHeight) {
                return document.documentElement.clientHeight;
            }
            
            // IE6- quirks mode
            if (document.body.clientHeight) {
                return document.body.clientHeight;
            }
        },
        
        /**
         * Returns scroll width
         *
         * @function getScrollWidth
         * @return {Int}
        */
        getScrollWidth : function() {
            // gecko/webkit/presto/IE7
            if (window.pageXOffset) {
                return window.pageXOffset;
            }
            
            // IE6- standards mode
            if (document.documentElement.scrollLeft) {
                return document.documentElement.scrollLeft;
            }
            
            // IE6- quirks mode
            if (document.body.scrollLeft) {
                return document.body.scrollLeft;
            }
        },
        
        /**
         * Returns scroll height
         *
         * @function getScrollHeight
         * @return {Int}
        */
        getScrollHeight : function() {
            // gecko/webkit/presto/IE7
            if (window.pageYOffset) {
                return window.pageYOffset;
            }
            
            // IE6- standards mode
            if (document.documentElement.scrollTop) {
                return document.documentElement.scrollTop;
            }
            
            // IE6- quirks mode
            if (document.body.scrollTop) {
                return document.body.scrollTop;
            }
        },
        
        /**
         * Returns element left offset
         *
         * @function getElementX
         * @param {String|HTMLElement} el
         * @return {Int}
        */
        getElementX : function(el) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            // if the given element has a parent node
            if (el.offsetParent) {
                return el.offsetLeft + this.getElementX(el.offsetParent);
            }
            
            return el.offsetLeft;
        },
        
        /**
         * Returns element top offset
         *
         * @function getElementY
         * @param {String|HTMLElement} el
         * @return {Int}
        */
        getElementY : function(el) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            // if the given element has a parent node
            if (el.offsetParent) {
                return el.offsetTop + this.getElementY(el.offsetParent);
            }
            
            return el.offsetTop;
        },
        
        /**
         * Sets element left offset
         *
         * @function setElementX
         * @param {String|HTMLElement} el
         * @param {Int} pos the value in pixels
         * @param {Boolean} add should we override its current offset or add the value?
        */
        setElementX: function(el, pos, add) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            add = add || false;
            if (add) {
                return this.setStyle(el, { left : this.getElementX(el) + pos + 'px' });
            }
            
            return this.setStyle(el, { left : pos + 'px' }); 
        },
        
        /**
         * Sets element top offset
         *
         * @function setElementY
         * @param {String|HTMLElement} el
         * @param {Int} pos the value in pixels
         * @param {Boolean} add should we override its current offset or add the value?
        */
        setElementY : function(el, pos, add) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            add = add || false;
            if (add) {
                return this.setStyle(el, { top : this.getElementY(el) + pos + 'px' });
            }
            
            return this.setStyle(el, { top : pos + 'px' }); 
        },
        
        /**
         * Returns element width
         *
         * @function getElementWidth
         * @param {String|HTMLElement} el
         * @return {Int}
        */
        getElementWidth : function(el) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            // if the element is not hidden
            if (this.getStyle(el, 'display') !== 'none') {
                return el.offsetWidth || parseInt(this.getStyle(el, 'width'));
            }
            
            return _checkHiddenElementProperty.call(this, el, function(el) {
                return el.clientWidth || parseInt(this.getStyle(el, 'width'));
            });
        },
        
        /**
         * Returns element height
         *
         * @function getElementWidth
         * @param {String|HTMLElement} el
         * @return {Int}
        */
        getElementHeight : function(el) {
            if (Swell.Core.isString(el)) {
                el = this.get(el);
            }
            
            // if the element is not hidden
            if (this.getStyle(el, 'display') !== 'none') {
                return el.offsetHeight || parseInt(this.getStyle(el, 'height'));
            }
            
            return _checkHiddenElementProperty.call(this, el, function(el) {
                return el.clientHeight || parseInt(this.getStyle(el, 'height'));
            });
        },
        
        /**
         * Checks if the element is a child of the given parent
         *
         * @function isChild
         * @param {String|HTMLElement} child
         * @param {String|HTMLElement} parent
         * @param {Boolean} deep recursive iteration, defaults to false
         * @return {Boolean}
        */
        isChild : function(parent, child, deep) {
            deep = deep || false;
        
            if (Swell.Core.isString(parent)) {
                parent = this.get(parent);
            }
            
            if (!parent.hasChildNodes()) {
                return false;
            }
            
            // hope for a lucky strike
            child  = (!Swell.Core.isUndefined(child.id)) ? child.id : child;
            if (Swell.Core.isString(child) && parent.querySelector) {
                var _expr, _match;
                if (deep) {
                    _expr = '#' + child;
                } else if (!Swell.Core.isUndefined(parent.id)) {
                    _expr = '#' + parent.id + ' > #' + child;
                    parent = document.body;
                } else {
                    return _isChild.call(this, parent, child, deep);
                }
                _match = parent.querySelector(_expr);
                return _match !== null ? true : false;
            }
            
            if (Swell.Core.isString(child)) {
                child = this.get(child);
            }
            
            // last resort
            return _isChild.call(this, parent, child, deep);
        }
    }
    
}();

// Set some shorthands for the class
Swell.alias(Swell.Core.Dom, 'Dom');