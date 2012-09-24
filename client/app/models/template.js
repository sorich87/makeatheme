// Template model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    idAttribute: "_id"

  , defaults: {
      name: ""
    , template: ""
    , build: ""
    , regions: { header: "default", footer: "default" }
  }

  , label: function () {
    var key;

    for (key in this.standards) {
      if (!this.standards.hasOwnProperty(key)) {
        continue;
      }

      if (this.get("name") === this.standards[key].name) {
        return this.standards[key].label;
      }
    }

    return this.get("name");
  }

  , setRegion: function (name, slug) {
    var regions = this.get("regions");
    regions[name] = slug;
    this.set("regions", regions);
  }

  , standards: [
      {
        name: "index"
      , label: "Default"
    }
    , {
        name: "front-page"
      , label: "Front Page"
    }
    , {
        name: "home"
      , label: "Blog"
    }
    , {
        name: "single"
      , label: "Article"
    }
    , {
        name: "page"
      , label: "Page"
    }
    , {
        name: "archive"
      , label: "Archive"
    }
    , {
        name: "search"
      , label: "Search Results"
    }
    , {
        name: "404"
      , label: "Error 404"
    }
  ]
});
