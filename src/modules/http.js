/**
 * @author Oscar Fonts <oscar.fonts@geomati.co>
 */
define(['base64', 'jquery'], function(base64, $) {

    var auth = undefined;
    var use_cache = true;
    var cache = {};

    var parseJson = function(string) {
        if (string.length > 0) {
            try {
                return JSON.parse(string);
            } catch(e) {
                return undefined;
            }
        } else {
            return undefined;
        }
    };

    var send = function(request) {
        // Adds Authorization header
        // WARNING: This sends a clear pw on the wire for every single AJAX request...
        if (auth) {
            request.beforeSend = function(xhr) {
                xhr.setRequestHeader("Authorization",
                    "Basic " + base64.encode(auth.username + ":" + auth.password));
            };
        }

        // Control which parsers will be used
        request.converters = {
            "* text": window.String,
            "text html": true,
            "text json": parseJson,
            "text xml": jQuery.parseXML
        };

        // Perform the actual AJAX call
        return $.ajax(request).then(
            onAjaxSuccess,
            onAjaxError
        );
    };

    var onAjaxSuccess = function(response) {
        return response;
    };

    var onAjaxError = function(xhr, status, response) {
        return { error: response, code: xhr.status };
    };

    var clearFromCache = function(url) {
        $.each(cache, function(key) {
            // Any cached entry starting with the given url...
            if (key.indexOf(url) == 0) {
                // ...is deleted from the cache
                delete cache[key];
            }
        });
    };

    var get = function(url, params) {
        // Attach GET parameters to url identifier
        var p = "";
        if (params) {
            if (typeof params !== "string") {
                p = "?" + $.param(params);
            } else {
                p = "?" + params;
            }
        }
        var url_id = url + p;

        // Get the promise
        var promise;
        if (!auth && use_cache && cache[url_id]) {
            // from the local cache
            promise = cache[url_id];
        } else {
            // or from the remote server
            promise = send({
                url: url,
                data: params
            });
        }

        if(!auth && use_cache && !cache[url_id]) {
            // add this call to cache
            cache[url_id] = promise;
        }

        return promise;
    };

    var put = function(url, data) {
        clearFromCache(url);

        return send({
            type: 'PUT',
            url: url,
            contentType: "application/json",
            data: JSON.stringify(data)
        });
    };

    var post = function(url, data) {
        clearFromCache(url);

        return send({
            type: 'POST',
            url: url,
            contentType: "application/json",
            data: JSON.stringify(data)
        });
    };

    var del = function(url) {
        clearFromCache(url);

        return send({
            type: 'DELETE',
            url: url
        });
    };

    var enableCache = function() {
        use_cache = true;
    };

    var disableCache = function() {
        use_cache = false;
    };

    var setAuthentication = function(user, password) {
        auth = {
            username: user,
            password: password
        };
    };

    var clearAuthentication = function() {
        auth = undefined;
    };

    return {
        get: get,
        put: put,
        post: post,
        del: del,
        cache: {
            enable: enableCache,
            disable: disableCache
        },
        auth: {
            set: setAuthentication,
            clear: clearAuthentication
        }
    };
});