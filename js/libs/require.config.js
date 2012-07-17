var jam = {
    "packages": [
        {
            "name": "jquery",
            "location": "libs/jquery",
            "main": "jquery.js"
        },
        {
            "name": "backbone",
            "location": "libs/backbone",
            "main": "backbone.js"
        },
        {
            "name": "underscore",
            "location": "libs/underscore",
            "main": "underscore.js"
        },
        {
            "name": "text",
            "location": "libs/text",
            "main": "text.js"
        },
        {
            "name": "handlebars",
            "location": "libs/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "bootstrap",
            "location": "libs/bootstrap"
        }
    ],
    "version": "0.1.11",
    "shim": {}
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