require([
  "jquery",
  "underscore",
  "backbone",
  "init",
  "router",
  "views/auth_modals",
  "lib/data_method"
], function($, _, Backbone, init, AppRouter, AuthModalsView) {
  $(function () {
    // Load routes
    new AppRouter;

    // Enable HTML5 pushstate
    Backbone.history.start({pushState: true});

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    $(document).on("click", "a:not([data-bypass])", function(e) {
      var href = { prop: $(this).prop("href"), attr: $(this).attr("href") }
        , root = location.protocol + "//" + location.host + "/";

      if (href.prop && href.prop.slice(0, root.length) === root) {
        e.preventDefault();

        Backbone.history.navigate(href.attr, true);
      }
    });

    // Load authentication modals
    if (init.editor !== true) {
      new AuthModalsView;
    }
  });
});
