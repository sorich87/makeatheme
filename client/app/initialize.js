var application = require('application');

$(function() {
  application.initialize();

  // Enable HTML5 pushstate
  Backbone.history.start({pushState: true});

  jQuery(function ($) {

    // When a modal is closed, go back to the previous page
    // or go to the homepage if no previous page (#main is empty)
    $(document).on("hidden", ".modal", function () {
      if ($("#main").children().length === 0) {
        Backbone.history.navigate("/", true);
      } else {
        history.go(-1);
      }
    });

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router.
    // If the link has a `data-bypass` attribute, bypass the delegation completely.
    // If the link has a `data-replace` attribute, update the URL without creating
    // an entry in the browser history.
    $(document).on("click", "a:not([data-bypass])", function(e) {
      var href = { prop: $(this).prop("href"), attr: $(this).attr("href") }
        , root = location.protocol + "//" + location.host + "/";

      if (href.prop && href.prop.slice(0, root.length) === root) {
        e.preventDefault();

        Backbone.history.navigate(href.attr, {
          trigger: true,
          replace: !!$(this).data("replace")
        });
      }
    });
  });
});
