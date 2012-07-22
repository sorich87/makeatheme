define([
  'jquery',
  'underscore',
  'backbone',
  'collections/menu',
  'models/menu_item'
  ], function($, _, Backbone, Menu, MenuItem) {

  // Global event dispatcher to coordinate events between views
  window.EventDispatcher = _.clone(Backbone.Events);

  var AppView;

  AppView = Backbone.View.extend({
    el: $('body')

    , initialize: function() {
      this.resizeIframe();
      this.loadModels();
      this.switchModes();
      this.listenNotifications();
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
    }

    // Trigger mode:edit and mode:view events other views listen to
    , switchModes: function () {
      var _this = this;

      _this.$(".customize").on("click", function () {
        EventDispatcher.trigger("mode:edit");

        $(this).hide("slow");
        _this.$(".preview").show("slow");
      });

      _this.$(".preview").on("click", function () {
        EventDispatcher.trigger("mode:view", this);

        $(this).hide("slow");
        _this.$(".customize").show("slow");

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

    // Resize the iframe so that it fits all the window
    , resizeIframe: function() {
      var _this = this;

      var adjustIframeHeight = function () {
        _this.$("#theme iframe").height(function () {
          return $(document).height();
        });
      };

      adjustIframeHeight();

      $(window).resize(function () {
        adjustIframeHeight();
      });
    }
  });

  return AppView;
});
