define(["http", "xml"], function(http, xml) {
    return {
        service: function(url) {
            function getCapabilities() {
                var params = {
                    service: "wms",
                    version: "1.3.0",
                    request: "GetCapabilities"
                };
                return http.get(url, params).then(function(response) {
                    if (response) {
                        return xml.read(response, true);
                    }
                });
            }

            function getLayers(capabilities) {
                var ret = [];
                if (capabilities && capabilities.hasOwnProperty("WMS_Capabilities")) {
                    var layers = capabilities.WMS_Capabilities.Capability.Layer.Layer;
                    for (var i in layers) {
                        var layer = {
                            name: layers[i].Name,
                            title: layers[i].Title
                        };
                        var times = [];
                        if (layers[i].Dimension && layers[i].Dimension.name && layers[i].Dimension.name == "time") {
                            times = layers[i].Dimension["#text"].split(",");
                            if (times.length) {
                                for (var i in times) {
                                    times[i] = new Date(times[i]);
                                }
                                layer.dates = times;
                            }
                        }
                        ret.push(layer);
                    }
                }
                return ret;
            }

            return {
                getLayers: function() {
                    return getCapabilities().then(getLayers);
                }
            };
        }
    };
});