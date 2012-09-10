// Template model class.
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      name: ""
    , template: ""
    , build: ""
    , regions: { header: "default", footer: "default" }
  }

  , label: function () {
    for (i in this.standards) {
      if (this.get("name") === this.standards[i].name) {
        return this.standards[i].label;
      }
    }

    return this.get("name");
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
