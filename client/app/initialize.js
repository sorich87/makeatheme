var application = require('application');

$(function() {
  application.initialize();

  // Enable HTML5 pushstate
  Backbone.history.start({pushState: true});

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router. If the link has a `data-bypass`
  // attribute, bypass the delegation completely.
  jQuery(function ($) {
    $(document).on("click", "a:not([data-bypass])", function(e) {
      var href = { prop: $(this).prop("href"), attr: $(this).attr("href") }
        , root = location.protocol + "//" + location.host + "/";

      if (href.prop && href.prop.slice(0, root.length) === root) {
        e.preventDefault();

        Backbone.history.navigate(href.attr, true);
      }
    });
});
});
