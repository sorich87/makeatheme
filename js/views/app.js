define([
  'jquery',
  'underscore',
  'backbone',
  'collections/menu',
  'models/menu_item'
  ], function($, _, Backbone, Menu, MenuItem) {

  // Global event dispatcher to coordinate events between views
  window.EventDispatcher = _.clone(Backbone.Events);

  var AppView = Backbone.View.extend({
      el: $(window.parent.document)

    // All the view initialize functions are in the order:
    // prepare DOM -> listen to events -> load data
    , initialize: function() {
      this.switchModes();
      this.listenNotifications();
      this.loadModels();
    }

    // Load models
    , loadModels: function() {
      require(["models/site", "views/site"], function (Site, SiteView) {
        new SiteView({model: new Site});
      });

      require(["models/page", "views/page"], function (Page, PageView) {
        new PageView({model: new Page});
      });

      require(["views/menu"], function (MenuView) {
        new MenuView();
      });

      require(["views/layout"], function (LayoutView) {
        new LayoutView();
      });
    }

    // Trigger mode:edit and mode:view events other views listen to
    // Show or hide the customize and preview buttons
    , switchModes: function () {
      var _this = this;

      _this.$(".customize").on("click", function () {
        EventDispatcher.trigger("mode:edit");

        $("body").addClass("x-edit");

        $(this).hide();
        _this.$(".preview").show();
      });

      _this.$(".preview").on("click", function () {
        EventDispatcher.trigger("mode:view");

        $("body").removeClass("x-edit");

        $(this).hide();
        _this.$(".customize").show();

        EventDispatcher.trigger("notification", ['Customization saved! You can <a href="#">buy the theme now</a> or come back later.', 'success']);
      });
    }

    // Listen to notification events and display them
    , listenNotifications: function () {
      require(['bootstrap/js/bootstrap-alert'], function () {
        $(".alert").alert();
      });

      EventDispatcher.on("notification", function (opts) {
        $(this.make("div", { class: "alert alert-" + opts[1] + " notification" },
                    '<button class="close" data-dismiss="alert">×</button>' + opts[0]))
                    .appendTo(this.el);
      }, this);
    }
  });

  return AppView;
});
