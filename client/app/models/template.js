// Template model class.
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      name: ""
    , template: ""
    , build: ""
  }

  , label: function () {
    var labels = {
        index: "Default"
      , "front-page": "Front Page"
      , home: "Blog"
      , single: "Article"
      , page: "Page"
      , archive: "Archive"
      , search: "Search Results"
      , 404: "Error 404"
    };

    return labels[this.get("name")];
  }
});
