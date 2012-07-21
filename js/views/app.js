define([
       'jquery',
       'underscore',
       'backbone',
       'collections/menu',
       'models/menu_item',
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
    }

    // Trigger mode:edit and mode:view events other views listen to
    , switchModes: function () {
      var _this = this;

      _this.$(".customize").on("click", function () {
        EventDispatcher.trigger("mode:edit");

        _this.$el.addClass("x-edit");

        $(this).hide("slow");
        _this.$(".save").show("slow");
      });

      _this.$(".save").on("click", function () {
        EventDispatcher.trigger("mode:view", this);

        _this.$el.removeClass("x-edit");

        $(this).hide("slow");
        _this.$(".customize").show("slow");

        EventDispatcher.trigger("notification", ['Customization saved! You can <a href="#">buy the theme now</a> or come back later.', 'success']);
      });
    }

    // Listen to notification events and display them
    , listenNotifications: function () {
      var _this = this;

      require(['bootstrap/js/bootstrap-alert'], function () {
        $(".alert").alert();
      });

      EventDispatcher.on("notification", function (opts) {
        $(_this.make("div", { class: "alert alert-" + opts[1] + " notification" },
                    '<button class="close" data-dismiss="alert">×</button>' + opts[0]))
                    .appendTo(_this.el);
      });
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
