/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <a href="mailto:christopheeble@gmail.com">Christophe Eble</a>
 * @author <a href="mailto:alpherz@gmail.com">Jonathan Gautheron</a>
*/

/**
 * The Browser Class provides tools for browser detection
 *
 * @class Swell.Core.Browser
 * @namespace Swell.Core
 * @requires Swell.Core
 * @static
 */
 
Swell.namespace('Core.Browser');
 
Swell.Core.Browser = new function(){

    this.current = {};
    
    this.current.IE        = 'IE';
    this.current.OPERA     = 'OPERA';
    this.current.SAFARI    = 'SAFARI';
    this.current.AIR       = 'AIR';
    this.current.WEBKIT    = 'WEBKIT';
    this.current.GECKO     = 'GECKO';
    this.current.CHROMIUM  = 'CHROMIUM';

        
    var useragent = navigator.userAgent;
    this.current.useragent = useragent;
    this.current.isMobile  = false;
    this.current.isWin     = false;
    this.current.isMac     = false;
    this.current.isLinux   = false;
    this.current.isNix     = false;
    this.current.engine    = {};
    
    var match = false;
    var found = false;
    var engine;
    
    // Detecting IE Browser
    match = useragent.match(/MSIE\s([^;]*)/);
    
    // Must match Browser and version
    if(match && match[1]) {
    
        // This is an IE Based browser
        // The version is stored into capturing group
        engine = useragent.match(/Trident[\s\/]([^\s;]*)/) || 'Trident';
        
        this.current.engine.name = engine;
        
        if(engine[1]) {
            this.current.engine.version = engine[1];
        }
        
        this.current.browser =  this.current.IE;
        this.current.version =  match[1];
        this.current.family  =  this.current.IE;
        
        // Handle IEMobile
        if(/IEMobile/.test(useragent)) {
            this.current.isMobile = true;
        }
        
        found = true;
    }
    
    // Testing Opera
    if(!found) {
       
        match = useragent.match(/Opera[\s\/]([^\s]*)/);
        if(match && match[1]) {
            
            engine = useragent.match(/Presto[\s\/]([^\s;]*)/) || 'Presto';
            this.current.engine.name = engine;
            
            if(engine[1]) {
                this.current.engine.version = parseFloat(engine[1]);
            }
            
            this.current.browser = this.current.OPERA;
            this.current.version = match[1];
            this.current.family  = this.current.OPERA;
            
            found = true;
        }
    }
    
    // Detect Chromium prior to KHTML, as Google hacks a lot webkit engine
    // it is better to detect it as a non-webkit browser
    
    if(!found) {
        match = useragent.match(/Chrome[\s\/]([^\s]*)/);
        if(match && match[1]) {
            
            engine = useragent.match(/AppleWebKit[\s\/]([^\s;]*)/) || 'AppleWebKit';
            this.current.engine.name = engine;
            
            if(engine[1]) {
                this.current.engine.version = parseFloat(engine[1]);
            }
            
            this.current.browser = this.current.CHROMIUM;
            this.current.version = match[1];
            this.current.family  = this.current.WEBKIT;
            
            found = true;
        }
    }
    
    // Testing Other Webkit based browsers
    if(!found) {
        match = useragent.match(/AppleWebKit\/([^\s]*)/);
        if(match && match[1]) {
            
            // This is a WebKit browser
            // Detecting if it's Safari Web Browser
            
            engine = useragent.match(/AppleWebKit[\s\/]([^\s;]*)/) || 'AppleWebKit';
            this.current.engine.name = engine;
            
            if(engine[1]) {
                this.current.engine.version = engine[1];
            }
            
            // Now testing WebKit Browsers
            match = useragent.match(/Safari[\s\/]([^\s;]*)/);
            
            if(match && match[1]) {
                // This is Safari
                this.current.browser = this.current.SAFARI;
                
                // Safari version
                var version = useragent.match(/Version\/([^\s]*)/);
                if(version && version[1]) {
                    this.current.version = version[1];
                }
                found = true;
            }
            
            // Checking if it's Adobe Air
            match =  useragent.match(/AdobeAIR\/([^\s]*)/);
            if(match && match[1]) {
                
                this.current.browser = this.current.AIR;
                this.current.version = match[1];
                
                found = true;
            }
            
            // Mobile browser check
            if(/ Mobile\//.test(useragent)) {
                this.current.isMobile = true;
            }
            
            this.current.family  = this.current.WEBKIT;
            found = true;
        }
    }
    
    if(!found) {
        // Detecting Gecko
        match = useragent.match(/Gecko\/([^\s]*)/);
        if(match && match[1]) {
            
            this.current.browser = this.current.GECKO;
            
            this.current.engine.name = this.current.GECKO;
            this.current.engine.version = match[1];
            this.current.family = this.current.GECKO;
            
            version = useragent.match(/rv:([^\s\)]*)/);
            if(version && version[1]) {
                this.current.version = parseFloat(version[1]);
            }
            
            found = true;
        }
    }
    
    var platform = navigator.platform;
    
    this.current.isMac   = platform.indexOf('Mac')   !== -1;
    this.current.isWin   = platform.indexOf('Win')   !== -1;
    this.current.isLinux = platform.indexOf('Linux') !== -1;
    
    this.current.isNix   = this.current.isMac || this.current.isLinux || false;
    
    return this.current;
}();

// Set some shorthands for the class
Swell.alias(Swell.Core.Browser, 'Browser');