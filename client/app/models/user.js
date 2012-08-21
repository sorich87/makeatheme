// User model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    defaults: {
      first_name: ""
    , last_name: ""
    , email: ""
    , password: ""
    , password_confirmation: ""
  }

  , url: "/user.json"

  , validation: {
      first_name: {
        required: true
    }
    , last_name: {
        required: true
    }
    , email: {
        required: true
      , pattern: 'email'
    }
    , password: {
        required: true
    }
    , password_confirmation: {
        required: true
      , equalTo: 'password'
    }
  }
});
