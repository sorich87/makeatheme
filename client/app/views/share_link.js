var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    id: "x-share-link"
  , template: "share_link"
  , data: {
    theme: app.data.theme._id
  }
});
