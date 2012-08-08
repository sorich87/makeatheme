var jam = {
    "packages": [
        {
            "name": "backbone",
            "location": "vendor/backbone",
            "main": "backbone.js"
        },
        {
            "name": "bootstrap",
            "location": "vendor/bootstrap"
        },
        {
            "name": "handlebars",
            "location": "vendor/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "jquery",
            "location": "vendor/jquery",
            "main": "jquery.js"
        },
        {
            "name": "jquerypp",
            "location": "vendor/jquerypp",
            "main": "index.js"
        },
        {
            "name": "text",
            "location": "vendor/text",
            "main": "text.js"
        },
        {
            "name": "underscore",
            "location": "vendor/underscore",
            "main": "underscore.js"
        }
    ],
    "version": "0.1.11",
    "shim": {
        "jquerypp": {
            "deps": [
                "jquery"
            ]
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}