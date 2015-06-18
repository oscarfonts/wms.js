require.config({
    baseUrl: '../src/',
    paths: {
        'jquery': '//code.jquery.com/jquery-2.1.4.min'
    }
});

require(['wms'], function(wms) {
    function showResponse(response) {
        document.getElementById("response").innerHTML = "Layers = " + JSON.stringify(response, null, 2);
    }

    function showError(response) {
        document.getElementById("response").innerHTML = "Error = " + JSON.stringify(response, null, 2);
    }

    document.getElementById("select").onchange = function(evt) {
        var url = evt.target.options[evt.target.selectedIndex].innerHTML;
        wms.service(url).getLayers().then(showResponse, showError);
    }
});
