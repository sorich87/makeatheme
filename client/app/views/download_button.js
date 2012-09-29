var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    id: "x-download-button"

  , events: {
      "click button.x-download": "download"
    , "click button.x-login": "login"
  }

  , render: function () {
    var button;

    if (app.currentUser.id === void 0) {
      button = "<button class='x-btn x-btn-success x-login'>Login to Download</button>";
    } else {
      button = "<button class='x-btn x-btn-success x-download'>Download Theme</button>";
    }

    this.$el.empty().append(button);

    return this;
  }

  , login: function () {
    window.top.Backbone.history.navigate("/login", true);
  }

  , download: function (e) {
    var $iframe = $("#download-iframe", window.top.document)
      , url = "/themes/" + app.data.theme._id + "/download";

    e.preventDefault();

    if ($iframe.length === 0) {
      $iframe = $("<iframe id='download-iframe' width='0' height='0' src='" + url + "'></iframe>")
        .appendTo($("body", window.top.document));
    } else {
      $iframe.attr("src", url);
    }
  }
});
