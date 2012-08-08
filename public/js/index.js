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

    // Load authentication modals
    new AuthModalsView;
  });
});
