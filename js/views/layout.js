define([
  'jquery',
  'underscore',
  'backbone',
  'views/base'
  ], function ($, _, Backbone, BaseView) {

  var LayoutView = BaseView.extend({
      el: $("html")

    , initialize: function (options) {
      this.constructor.__super__.initialize.apply(this, [options])
    }

    , switchModes: function () {
      var _this = this
        , preventDefault = function (e) {
          e.preventDefault();
        };

      EventDispatcher.on("mode:edit", function () {
        require(["jquerypp/event/drag"], function () {
          _this.$el.on("draginit", ".columns", function (ev, drag) {});

          // Cancel drag on content editable areas to allow edit
          _this.$el.on("dragdown", ".columns", function (ev, drag) {
            if ($(ev.target).attr("contenteditable") === true || $(ev.target).hasClass("x-edit")) {
              drag.cancel();
            }
          });

          // Links in draggable areas shouldn't be clickable
          _this.$(".columns a").on("click", preventDefault);
        });
      });

      EventDispatcher.on("mode:view", function () {
        require(["jquerypp/event/drag"], function () {
          _this.$el.off("draginit", ".columns");
          _this.$el.off("dragdown", ".columns");

          // Links are clickable again
          _this.$(".columns a").off("click", preventDefault);
        });
      });
    }
  });

  return LayoutView;
});
