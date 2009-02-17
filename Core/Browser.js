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

    //this = {};
    
    this.IE        = 'IE';
    this.OPERA     = 'OPERA';
    this.SAFARI    = 'SAFARI';
    this.AIR       = 'AIR';
    this.WEBKIT    = 'WEBKIT';
    this.GECKO     = 'GECKO';
    this.CHROMIUM  = 'CHROMIUM';

        
    var useragent = navigator.userAgent;
    this.useragent = useragent;
    this.isMobile  = false;
    this.isWin     = false;
    this.isMac     = false;
    this.isLinux   = false;
    this.isNix     = false;
    this.engine    = {};
    
    var match = false;
    var found = false;
    var engine;
    var standardsMode = false;
    
    // Detecting IE Browser
    match = useragent.match(/MSIE\s([^;]*)/);
    
    // Must match Browser and version
    if(match && match[1]) {
    
        if(parseInt(match[1]) >= 8 && XDomainRequest) {
            standardsMode = true;
        }
        // This is an IE Based browser
        // The version is stored into capturing group
        engine = useragent.match(/Trident[\s\/]([^\s;]*)/) || 'Trident';
        
        this.engine.name = engine;
        
        if(engine[1]) {
            this.engine.version = engine[1];
        }
        
        this.browser =  this.IE;
        this.version =  match[1];
        this.family  =  this.IE;
        this.standardsMode = standardsMode;
        
        // Handle IEMobile
        if(/IEMobile/.test(useragent)) {
            this.isMobile = true;
        }
        
        found = true;
    }
    
    // Testing Opera
    if(!found) {
       
        match = useragent.match(/Opera[\s\/]([^\s]*)/);
        if(match && match[1]) {
            
            engine = useragent.match(/Presto[\s\/]([^\s;]*)/) || 'Presto';
            this.engine.name = engine;
            
            if(engine[1]) {
                this.engine.version = parseFloat(engine[1]);
            }
            
            this.browser = this.OPERA;
            this.version = match[1];
            this.family  = this.OPERA;
            
            found = true;
        }
    }
    
    // Detect Chromium prior to KHTML, as Google hacks a lot webkit engine
    // it is better to detect it as a non-webkit browser
    
    if(!found) {
        match = useragent.match(/Chrome[\s\/]([^\s]*)/);
        if(match && match[1]) {
            
            engine = useragent.match(/AppleWebKit[\s\/]([^\s;]*)/) || 'AppleWebKit';
            this.engine.name = engine;
            
            if(engine[1]) {
                this.engine.version = parseFloat(engine[1]);
            }
            
            this.browser = this.CHROMIUM;
            this.version = match[1];
            this.family  = this.WEBKIT;
            
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
            this.engine.name = engine;
            
            if(engine[1]) {
                this.engine.version = engine[1];
            }
            
            // Now testing WebKit Browsers
            match = useragent.match(/Safari[\s\/]([^\s;]*)/);
            
            if(match && match[1]) {
                // This is Safari
                this.browser = this.SAFARI;
                
                // Safari version
                var version = useragent.match(/Version\/([^\s]*)/);
                if(version && version[1]) {
                    this.version = version[1];
                }
                found = true;
            }
            
            // Checking if it's Adobe Air
            match =  useragent.match(/AdobeAIR\/([^\s]*)/);
            if(match && match[1]) {
                
                this.browser = this.AIR;
                this.version = match[1];
                
                found = true;
            }
            
            // Mobile browser check
            if(/ Mobile\//.test(useragent)) {
                this.isMobile = true;
            }
            
            this.family  = this.WEBKIT;
            found = true;
        }
    }
    
    if(!found) {
        // Detecting Gecko
        match = useragent.match(/Gecko\/([^\s]*)/);
        if(match && match[1]) {
            
            this.browser = this.GECKO;
            
            this.engine.name = this.GECKO;
            this.engine.version = match[1];
            this.family = this.GECKO;
            
            version = useragent.match(/rv:([^\s\)]*)/);
            if(version && version[1]) {
                this.version = parseFloat(version[1]);
            }
            
            found = true;
        }
    }
    
    var platform = navigator.platform;
    
    this.isMac   = platform.indexOf('Mac')   !== -1;
    this.isWin   = platform.indexOf('Win')   !== -1;
    this.isLinux = platform.indexOf('Linux') !== -1;
    this.isNix   = this.isMac || this.isLinux || false;
    
    // Shortcuts to use in conditional statements
    this.isIE     = this.family === this.IE;
    this.isGecko  = this.family === this.GECKO;
    this.isWebkit = this.family === this.WEBKIT;
    this.isOpera  = this.family === this.OPERA;
    
    return this;
}();

// Set some shorthands for the class
Swell.alias(Swell.Core.Browser, 'Browser');