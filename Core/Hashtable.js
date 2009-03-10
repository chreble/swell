(function() {    
    
    Swell.Core.Class({ 
        name      : 'Enumerable',
        namespace : 'Swell.Core',
        functions : function() {
            
            var _enumerable;
            return {

                setEnumerable : function(o) {
                    _enumerable = o;
                },
                
                forEach : function(fn, scope, args) {
                    scope = scope || this;
                    if(Swell.Core.isObject(_enumerable)) {
                        for(var p in _enumerable) {
                            fn.call(scope, p, _enumerable[p], args); 
                        }
                    } else if(Swell.Core.isArray(_enumerable) || Swell.Core.isString(_enumerable)) {
                        for(var n = 0; n < _enumerable.length; n++) {
                            fn.call(scope, n, this[n], args); 
                        }
                    }
                }
            }
        }()
    });    
    
    Swell.Core.Class({
        name        : 'Hashtable',
        namespace   : 'Swell.Core',
        inherits    : [Swell.Core.Enumerable, Swell.Core.CustomEventModel],
        functions   : function() {
            
            var _hash = {};
            var _updateLength = function() {
                var _l = 0, _n;
                
                if(_hash.__count__) {
                    this.length = _hash.__count__;
                } else {
                    for(_n in _hash) {
                        _l++;
                    }
                    this.length = _l;
                }
            }
            
            var _initEvents = function() {
                /**
                 * @event onChange fires when an item is added/updated in the hashtable
                */
                this.createEvent('change');
                this.subscribe('change', _updateLength);
            }
           
            return {
                
                length : 0,
                
                /**
                 * Constructor, initialize enumerable
                 *
                 * @function construct
                 * @constructor
                */                
                construct : function() {
                    this.setEnumerable(_hash);
                    _initEvents.call(this);
                },
                
                /**
                 * Resets the hashtable
                 *
                 * @function dispose
                */                  
                empty : function() {
                    _hash = {};
                },
                
                /**
                 * Add/Update an entry in the hashtable
                 * 
                 * @function set
                 * @param {String} key Key name
                 * @return {Swell.Core.Hashtable}
                */ 
                set : function(key, value) {
                    if(arguments.length === 1) {
                        _hash[Swell.uniqueId()] = key;
                    } else {
                        _hash[key] = value;
                    }
                    this.fireEvent('change', this);
                    return this;
                },
                
                /**
                 * Add an entry in the hashtable if the key does not exist
                 * 
                 * @function set
                 * @param {String} key Key name
                 * @return {Swell.Core.Hashtable}
                */ 
                add : function(key, value) {
                    if(!this.exists(key)) {
                        this.set(key, value);
                        return this;
                    }
                    return false;
                },
                
                /**
                 * Update an entry in the hashtable if the key exists
                 * 
                 * @function set
                 * @param {String} key Key name
                 * @return {Swell.Core.Hashtable}
                */ 
                update : function(key, value) {
                    if(this.exists(key)) {
                        this.set(key, value);
                        return this;
                    }
                    return false;
                },
                
                /**
                 * Get the value of the corresponding key in the hashtable
                 * 
                 * @function get
                 * @param {String} key Key name
                 * @return {Mixed/Boolean} value
                */
                get : function(key) {
                    if(_hash.hasOwnProperty(key)) {
                        return _hash[key];
                    }
                    return false;
                },
                
                /**
                 * Exchanges all keys with their associated values in the hashtable
                 * 
                 * @function flip
                 * @return {Swell.Core.Hashtable}
                */
                flip : function() {
                    var _k, _tmp = {};
                     
                    for( _k in _hash ) {
                        _tmp[_hash[_k]] = _k;
                    }
                    _hash = _tmp;
                    return this;
                },
                
                /**
                 * Returns the first item of the hashtable
                 *
                 * @function first
                 * @param {Boolean} [extended] Returns an array with the first item as key and second one as val (optional)
                 * @return {Mixed}
                */
                first : function(extended) {
                    for(var _p in _hash) {
                        if(!Swell.Core.isUndefined(extended)) {
                            return [_p, _hash[_p]];
                        }
                        return _hash[_p]; 
                    }
                    return false;
                },
                
                /**
                 * Returns the last item of the hashtable
                 *
                 * @function last
                 * @param {Boolean} [extended] Returns an array with the last item as key and second one as val (optional)
                 * @return {Mixed}
                */
                last : function(extended) {
                    var _lastitem = false;
                    for(var _p in _hash) {
                        _lastitem = _hash[_p]; 
                    }
                    if(!Swell.Core.isUndefined(extended)) {
                        return [_p, _lastitem];
                    }
                    return _lastitem;
                },
                
                /**
                 * Unsets an item from the hashtable
                 *
                 * @function remove
                 * @return {Swell.Core.Hashtable}
                */
                remove : function(key) {
                    if(_hash.hasOwnProperty(key)) {
                        delete _hash[key];
                        this.fireEvent('change', this);
                    }
                    return this;
                },
                
                /**
                 * Applies the callback to the elements of the hashtable
                 * 
                 * @function map
                 * @return {Swell.Core.Hashtable}
                */
                map : function(fn) {
                    var _p, _tmp = {};
                    if(Swell.Core.isFunction(fn)) {
                        for(_p in _hash) {
                            _tmp[_p] = fn.call(null, _hash[_p]); 
                        }
                    }
                    return _tmp;
                },
                
                /**
                 * Test if a property exists in the hash table
                 * 
                 * @function exists
                 * @return {Boolean}
                */
                exists : function(key) {
                    return _hash.hasOwnProperty(key);
                },
                
                /**
                 * Applies an user function on every member of the hashtable
                 * 
                 * @function walk
                 * @return {Swell.Core.Hashtable}
                */
                walk : function(fn) {
                    var _p;
                    if(Swell.Core.isFunction(fn)) {
                        for(_p in _hash) {
                            _hash[_p] = fn.call(null, _hash[_p]); 
                        }
                    }
                    return this;
                },
                
                /**
                 * Returns an array of keys
                 * 
                 * @function keys
                 * @return {Mixed[]} keys
                */ 
                keys : function() {
                    var _k, _tmp = [];
                    for(_k in _hash) {
                        _tmp.push(_k);
                    }
                    return _tmp;
                },
                
                /**
                 * Pop the element off the end of array
                 * 
                 * @function pop
                 * @return {Mixed} value of the popped item
                */ 
                pop : function() {
                    var _item = this.last(true);
                    delete _item[0];
                    
                    return _item[1];
                },
                
                /**
                 * Returns an array of values
                 * 
                 * @function values
                 * @return {Mixed[]} values
                */ 
                values : function() {
                    var _k, _tmp = [];
                    for(_k in _hash) {
                        _tmp.push(_hash[_k]);
                    }
                    return _tmp;
                },
                
                /**
                 * Returns the wrapped native object
                 * 
                 * @function toObject
                 * @return {Object}
                */
                toObject : function() {
                    return _hash;
                },
                
                /**
                 * Returns a string representation of the wrapped native object
                 * 
                 * @function toSource
                 * @return {String}
                */
                toSource : function() {
                    if(_hash.toSource) {
                        return _hash.toSource();
                    } else {
                        var _stack = [];
                        for(var _n in _hash) {
                            _stack.push('"' + _n + '" : "' + _hash[_n] + '"');
                        }
                        return '({' + _stack.join(',') + '})';
                    }
                }
            }
        }()
    });
})();