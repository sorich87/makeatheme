var app = require('application');

jQuery(function($) {
  app.initialize();

  // Enable HTML5 pushstate
  Backbone.history.start({pushState: true});

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router if the user is not on the homepage.
  // If the link has a `data-bypass` attribute, bypass the delegation completely.
  // If the link has a `data-replace` attribute, update the URL without creating
  // an entry in the browser history.
  $(document).on("click", "a:not([data-bypass])", function(e) {
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") }
    , root = location.protocol + "//" + location.host + "/";

    if (href.prop && href.prop.slice(0, root.length) === root &&
       Backbone.history.fragment !== "") {
      e.preventDefault();

      Backbone.history.navigate(href.attr, {
        trigger: true,
        replace: !!$(this).data("replace")
      });
    }
  });

  // Google Analytics
  Backbone.history.on("route", function (name, args) {
    if ("_gaq" in window) {
      var url = "/" + this.getFragment();
      _gaq.push(["_trackPageview", url]);
    }
  });
});
