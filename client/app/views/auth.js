// Display the login and register links
var View = require("views/base/view")
  , template = require("views/templates/auth_links");

module.exports = View.extend({
    el: $("body")

  , initialize: function () {
    this.model.on("change", this.render, this);
  }

  , render: function () {
    var links = template({currentUser: this.model.toJSON()});

    $("#auth-links").html(links);

    return this;
  }
});
