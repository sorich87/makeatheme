var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    id: "share-link"
  , className: "x-section well well-small"
  , template: "share_link"
  , data: {
    theme: app.currentTheme.id
  }
});
