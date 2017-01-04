(function () {
  'use strict';

  var refIndex = window.od_key || 'od',
    ref = window[ refIndex ],
    // API_URL = '//ads-api.onedio.com/events';
    API_ROOT='http://data-dev.onedio.com:8082',
    API_URL = API_ROOT+'/events';
  /**
   * {@link Event} Class constructor.
   * @constructor
   * @name Event
   * @param {Object} parameters Actual event parameters to be directly injected into kafka.
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event = function ( parameters ) {
    if ( typeof parameters !== 'undefined' ) {
      this.set( 'e', 'new' ).set( 'p', parameters[ 0 ] );
    }
  };

  ref.Event.prototype.callback = "od"; 
  /**
   * {@link Event} class set method.
   * @function
   * @memberOf Event
   * @name set
   * @param {String} k Key
   * @param {Mixed} v Value
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   * @return {Event} Returns the {@link Event} Class object for chaining purposes.
   */
  ref.Event.prototype.set = function ( k, v ) {
    this[ k ] = v;
    return this;
  };

  /**
   * {@link Event} class get method.
   * @function
   * @memberOf Event
   * @name get
   * @param {String} k Key
   * @return {Mixed} Value of the specified key (k)
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.prototype.get = function ( k ) {
    return this[ k ];
  };

  /**
   * Generates an {@link Event}.
   * @static
   * @function
   * @memberOf Event
   * @name generate
   * @param {Object} parameters Creates an {@link Event} with the provided properties.
   * @return {Event} Returns a newly created {@link Event} Class object.
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.generate = function ( parameters ) {
    return new ref.Event( parameters ).set( 'c', ref.contextUUID ).set( 't', 1 * new Date().valueOf() - ref.initTime );
  };

  /**
   * Spawns the context by sending a request.
   * @constructor
   * @name spawnContext
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.spawnContext = function () {
    new ref.Event()
            .set('Callback','demoCallback')
            .setParameters()
            .send('/init');
  };

  /**
   * Sets UTM parameters.
   * @private
   * @function
   * @memberOf Event
   * @name setUTMParameters
   * @return {Event} Returns the {@link Event} Class object.
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.prototype.setUTMParameters = function () {
    var query = window.location.search.substring( 1 ),
      parameters = query.split( '&' );
    for ( var i = 0; i < parameters.length; i++ ) {
      var kv = parameters[ i ].split( '=' );
      if ( [ 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content' ].indexOf( kv[ 0 ] ) !== -1 ) {
        this.set( kv[ 0 ], kv[ 1 ] );
      }
    }
    return this;
  };

  /**
   * Sets list of languages of the user.
   * @private
   * @function
   * @name setLanguages
   * @return {Event} Returns the {@link Event} Class object for chaining purposes.
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.prototype.setLanguages = function () {
    var languages = [];
    if ( navigator.languages ) {
      // Google Chrome & Opera
      languages = navigator.languages;
    } else if ( navigator.language ) {
      // Firefox & Safari
      languages.push( navigator.language );
    } else {
      // Internet Explorer
      languages.push( navigator.browserLanguage );
      if ( languages.indexOf( navigator.userLanguage ) === -1 ) {
        languages.push( navigator.userLanguage );
      }
      if ( languages.indexOf( navigator.systemLanguage ) === -1 ) {
        languages.push( navigator.systemLanguage );
      }
    }
    this.set( 'l', languages );
    return this;
  };

  /**
   * Sets the referer.
   * @private
   * @function
   * @name setReferer
   * @return {Event} Returns the {@link Event} Class object for chaining purposes.
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.prototype.setReferer = function () {
    if ( document.referrer.length !== 0 ) {
      this.set( 'r', document.referrer );
    }
    return this;
  };

  /**
   * Sets the screen resolution.
   * @private
   * @function
   * @name setScreenResolution
   * @return {Event} Returns the {@link Event} Class object for chaining purposes.
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.prototype.setScreenResolution = function () {
    this.set( 's', [ screen.width, screen.height ] );
    return this;
  };

  /**
   * Sets the browser resolution.
   * @private
   * @function
   * @name setBrowserResolution
   * @return {Event} Returns the {@link Event} Class object for chaining purposes.
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.prototype.setBrowserResolution = function () {
    this.set( 'b', [ Math.max( document.documentElement.clientWidth,
      window.innerWidth || 0 ),
      Math.max( document.documentElement.clientHeight,
        window.innerHeight || 0 ) ] );
    return this;
  };

  /**
   * Sets all required parameters to the {@link Event}.
   * @private
   * @function
   * @memberOf Event
   * @name setUTMParameters
   * @return {Event} Returns the {@link Event} Class object for chaining purposes.
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.prototype.setParameters = function () {
    return this
      .setUserAgent()      
      .setLanguages()
      .setReferer()
      .setScreenResolution()
      .setBrowserResolution()
      .setUTMParameters();
  };

  /**
   * Sends the {@link Event} via HTTP GET with script injection for faster transfer.
   * @private
   * @function
   * @memberOf Event
   * @name send
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.Event.prototype.send = function (endpoint) {
    var script = 'script',
      async = document.createElement( script ),
      first = document.getElementsByTagName( script )[ 0 ];
    var qs = "?"+(JSON.stringify(this));
    async.async = 1;
    async.src = API_ROOT + endpoint + qs;  
    first.parentNode.insertBefore( async, first );
  };

  /**
   * It processes command queue for previously added events and sends them.
   * @private
   * @function
   * @name processQueue
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.processQueue = function () {
    for ( var i = 0; i < ref.q.length; i++ ) {
      ref.Event.generate( ref.q[ i ] ).send();
    }
  };

  /**
   * Sends context details.
   * @constructor
   * @name sendContextDetails
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.sendContextDetails = function ( parameters ) {
    new ref.Event().set( 'p', parameters ).set( 'c', ref.contextUUID ).set( 'e', 'newContextDetails' ).send();
  };

  /**
   * Changes OA function which is defined in window variable
   * so that instead of queueing events, it send them right away.
   * @private
   * @function
   * @name changeNewEvent
   * @author sarpdoruk@gmail.com (Sarpdoruk Tahmaz)
   */
  ref.changeNewEvent = function () {
    ref.newEvent = function () {
      ref.Event.generate( arguments ).send();
    };
  };

  ref.init = function ( response ) {
    ref.contextUUID = response.c;

    ref.changeNewEvent();
    delete ref.changeNewEvent;

    if ( typeof ref.q !== 'undefined' ) {
      ref.processQueue();
      delete ref.q;
    }
    delete ref.processQueue;

    // Call oaInitDone function for custom purposes
    if ( typeof oaInitDone === 'function' ) {
      oaInitDone();
    }
    delete ref.init;
  };

  /*
   Create a new Event called init and send it.
   */
  ref.Event.spawnContext();

})( window );

