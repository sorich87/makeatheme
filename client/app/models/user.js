// User model class.
var Model = require("models/base/model")
  , Themes = require("collections/themes");

module.exports = Model.extend({
    defaults: {
      first_name: ""
    , last_name: ""
    , email: ""
    , password: ""
    , password_confirmation: ""
    , themes: []
  }

  , initialize: function() {
    var collection = new Themes(this.attributes.themes);
  }

  , url: "/users"

  , validation: {
    first_name: {
      required: true
    }
    , last_name: {
      required: true
    }
    , email: {
        required: true
      , pattern: "email"
    }
    , password: {
      required: function (value, attr, computed) {
        if (computed && !computed.id) {
          return true;
        }
        return false;
      }
    }
    , password_confirmation: {
      equalTo: "password"
    }
  }
});
