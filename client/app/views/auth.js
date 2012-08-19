// Display the login and register links
var View = require("views/base/view")
  , template = require("views/templates/auth_links");

module.exports = View.extend({
    el: $("body")

  , render: function () {
    var links = template({currentUser: this.options.currentUser});

    $("#auth-links").html(links);

    return this;
  }
});
