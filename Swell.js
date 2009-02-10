/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <a href="mailto:christopheeble@gmail.com">Christophe Eble</a>
 * @author <a href="mailto:alpherz@gmail.com">Jonathan Gautheron</a>
*/
if (typeof Swell === 'undefined' || !Swell) {
    /**
     * The Swell global namespace object.
     * @namespace Swell
     * @static
     */
    var Swell = {};
}

Swell.SUPERCLASS_NAME = 'Swell';
Swell.CONSTRUCTOR_NAME = 'construct';

/**
 * Returns the namespace specified and creates it if it doesn't exist
 * 
 * @method namespace
 * @static
 * @param  {String} arguments 1-n namespaces to create 
 * @return {Object}  A reference to the last namespace object created
*/

Swell.namespace = function() {
        
    var a = arguments, root = null, i, j, namespace;
    for(i=0; i < a.length; i++) {
        namespace = a[i].split('.');
        root = Swell;
        
        // Swell is always implied
        for(j=(namespace[0] == Swell.SUPERCLASS_NAME) ? 1 : 0; j < namespace.length; j++) {
            // Check if namespace is not defined, create it or make a backreference
            root[namespace[j]] = root[namespace[j]] || {};
            root = root[namespace[j]];
        }
    }

    return root;
};

/**
 * Sets an alias for a given namespace
 * 
 * @method alias
 * @static
 * @return {void}
*/

Swell.alias = function() {
    // Turn the arguments object into array
    var args = [].slice.call(arguments,0), o, n;

    // Checking if there's at least one alias
    if(args.length >= 2) {
        // Unshift the first argument of the array as it is the "aliasable" object
        o = args.shift();
    
        // Reverse loop to gain some speed :D
        n = args.length;
        while (n--) {
            window[args[n]] = o;
        }
    }
};

Swell.uniqueId = function() {
    // Generates a unique ID for an element
    // uses Math.random for generation
    // and lastly check if node does not exist in the DOM
    var _getId = function() {
        return 'Swell-id-' + Math.random()*1e16;
    }
    
    var _elRef = _getId();
    while(document.getElementById(_elRef) !== null) {
        _elRef = _getId();
    }
    
    return _elRef;
};

/**
 * Resolve the namespace specified by a string
 * and returns an object reference
 * 
 * @method getNameSpace
 * @static
 * @param  {String} ns 1-n namespaces to retrieve
 * @return {Object}  A reference to the last namespace object created
*/

Swell.getNameSpace = function(ns) {
    var root = null, i, j, namespace, stack = [];

    namespace = ns.split('.');
    stack.push(Swell.SUPERCLASS_NAME);
    
    // Swell is always implied
    for(j=(namespace[0] == Swell.SUPERCLASS_NAME) ? 1 : 0; j < namespace.length; j++) {
        // Check if namespace is not defined, create it or make a backreference
        stack.push(namespace[j]);
    }
    return stack.join('.');
};