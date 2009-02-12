/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <a href="mailto:christopheeble@gmail.com">Christophe Eble</a>
 * @author <a href="mailto:alpherz@gmail.com">Jonathan Gautheron</a>
*/
Swell.namespace('Lib.IO');

Swell.Lib.IO.Ajax = new function() {

    /**
     * Do not expose the internal functions below
     * to the public API
     *
     * @private
    */
    var _getXhrObject() {
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
    
    /** @scope Swell.Lib.IO.Ajax */ 
    return {
        /**
         * Initiates an XML HTTP Request
         *
         * @function request
         *
         * @param {String} m http transaction method either GET or POST
         * @param {String} url full path to the remote page or resource to retrieve through XHR
         * @param {Function} fn callback function
        */
        request : function(m, url, callback, scope, args) {
            
        }    
        
    };

}()

// Set some shorthands for the class
Swell.alias(Swell.Lib.IO.Ajax, 'Ajax', 'Connection');