(function () {
    var UTMKeys = {
        'utm_source': 'UTMSource',
        'utm_medium': 'UTMMedium',
        'utm_campaign': 'UTMCampaign',
        'utm_term': 'UTMTerm',
        'utm_content': 'UTMContent'
    };
    var refIndex = window.od_key || 'od',
        ref = window[refIndex],
        // API_URL = '//ads-api.onedio.com/events';
        API_ROOT = 'http://data-dev.onedio.com:8082';
    var Storage = function () {
        this.set = function (key, value) {
            this[key] = value;
            return this;
        };
        this.get = function (key) {
            return this[key];
        };
        this.serialize = function () {
            return JSON.stringify(this);
        };
    };
    var ErrorHandler = function () {
        var lastIndicator = null;
        this.parse = function (error) {
            if (!error.hasOwnProperty('Explanation')) {
                console.log("Explanation is not found in error body");
                return 0;
            }
            if (!error.Explanation.hasOwnProperty('Type')) {
                console.log("Type has not exists in explanation body");
                return 0;
            }
            if (error.Explanation.Value.hasOwnProperty('ElementIndicator')) {
                lastIndicator = (lastIndicator ? lastIndicator : "") + " > " + error.Explanation.Value.ElementIndicator;
            }
            if (error.Explanation.Type == 'NestedError') {
                this.parse(error.Explanation.Value.DecodeError);
            } else {
                console.log("Hata " + lastIndicator + " kısmında. Beklenen değer: " + error.Explanation.Value.Expectation);
            }

        };
    };
    ref.Init = function () {
        var initStorage = new Storage();
        this.setStorage(initStorage)
            .setContextInfo()
            .setCallback()
            .send('/init');
        ;
    };
    ref.UUID = null;
    ref.send = function (endpoint) {
        var script = 'script',
            async = document.createElement(script),
            first = document.getElementsByTagName(script)[0];
        var qs = "?" + this.getStorage().serialize();
        async.async = true;
        async.src = API_ROOT + endpoint + qs;
        first.parentNode.insertBefore(async, first);
        console.dir(async.src);
    };
    ref.getStorage = function () {
        return this['storage'];
    };
    ref.setStorage = function (storage) {
        this['storage'] = storage;
        return this;
    };
    ref.Event = function () {
    };

    ref.GenerateEvent = function (parameters) {
        if (parameters.length < 1) {
            console.log("Parameters must be json object");
        }
        var eventStorage = new Storage();

        var contextEventStorage = new Storage();

        var DetailStorage = [];

        contextEventStorage.set('TimeOffsetMS', 1 * new Date().valueOf() - ref.initTime);

        contextEventStorage.set('ContextEventDetails',parameters)

        DetailStorage.push('ContextEvent',contextEventStorage);

        eventStorage.set('ContextUUID', this.UUID)
            .set('Details', DetailStorage);

        var contextRequestStorage = new Storage();
        contextRequestStorage.set('ContextRequest',eventStorage);
        this.setStorage(contextRequestStorage);
    };
    ref.setContextInfo = function () {
        var contextInfo = {
            UserAgent: this.getUserAgent(),
            Languages: this.getLanguages(),
            ScreenResolution: this.getScreenResolution(),
            BrowserResolution: this.getBrowserResolution()
        };
        if (this.getReferrer()) {
            contextInfo.Referrer = this.getReferrer();
        }
        var UTM = this.getUTM();
        if (Object.keys(UTM).length > 0) {
            contextInfo.UTM = UTM;
        }

        this.getStorage().set('ContextInfo', contextInfo);
        return this;
    };
    ref.setCallback = function (callback) {
        callback = callback || 'od.defaultInitCallback';
        this.getStorage().set('Callback', callback);
        return this;

    };
    ref.getUserAgent = function () {
        return navigator.userAgent;
    };
    ref.getUTM = function () {
        var UTM = {};
        var query = window.location.search.substring(1),
            parameters = query.split('&');
        for (var i = 0; i < parameters.length; i++) {
            var kv = parameters[i].split('=');
            if (Object.keys(UTMKeys).indexOf(kv[0]) !== -1) {
                UTM[UTMKeys[kv[0]]] = kv[1];
            }
        }
        return UTM;
    };
    ref.getReferrer = function () {
        if (document.referrer.length !== 0) {
            return document.referrer;
        }
        return null;
    };
    ref.getLanguages = function () {
        var languages = [];
        if (navigator.languages) {
            // Google Chrome & Opera
            languages = navigator.languages;
        } else if (navigator.language) {
            // Firefox & Safari
            languages.push(navigator.language);
        } else {
            // Internet Explorer
            languages.push(navigator.browserLanguage);
            if (languages.indexOf(navigator.userLanguage) === -1) {
                languages.push(navigator.userLanguage);
            }
            if (languages.indexOf(navigator.systemLanguage) === -1) {
                languages.push(navigator.systemLanguage);
            }
        }
        return languages;
    };
    ref.getScreenResolution = function () {
        return [screen.width, screen.height];
    };
    ref.getBrowserResolution = function () {
        return [Math.max(document.documentElement.clientWidth,
            window.innerWidth || 0),
            Math.max(document.documentElement.clientHeight,
                window.innerHeight || 0)];
    };
    ref.proceedQueue = function () {
        if (!this.hasOwnProperty('q')) {
            return 0;
        }
        var queue = this.q;
        for (var i = 0; i < queue.length; i++) {
            this.GenerateEvent.apply(this, queue[i]);
            this
                .setCallback()
                .send('/event');
        }
        this.q=[];
    };
    ref.newEvent = function(parameters){
        this.GenerateEvent.apply(this, parameters);
        this
            .setCallback()
            .send('/event');
    };
    ref.Init();

    ref.defaultInitCallback = function (response, error) {
        if (error) {
            var errorHandler = new ErrorHandler();
            errorHandler.parse(error);
        } else {
            this.UUID = response;
            this.proceedQueue();
        }
    }
})(window);
