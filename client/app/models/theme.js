// Theme model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    idAttribute: "_id"
  , urlRoot: "/themes"

  , defaults: {
      name: ""
    , author: ""
    , screenshot_uri: ""
  }

  , toJSON: function () {
    var attributes = _.clone(this.attributes);

    ["regions", "templates"].forEach(function (object) {
      if (!attributes[object] || !attributes[object].models) {
        return [];
      }

      var filter = function (model) {
        return _.pick(model.attributes, "_id", "label", "name", "slug",
                      "template");
      };

      attributes[object] = _.map(attributes[object].models, filter);
    });

    if (attributes.style && "getRules" in attributes.style) {
      attributes.style = attributes.style.getRules();
    }

    return attributes;
  }
});
