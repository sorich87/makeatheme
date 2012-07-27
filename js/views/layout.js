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
      EventDispatcher.on("mode:edit", function () {
        var _this = this;

        require(["jquerypp/event/drag"], function () {
          _this.$(".columns").css({
            border: "1px solid grey"
          });
          _this.$(".columns").on("draginit", function (ev, drag) {});
          _this.$(".columns").on("dragdown", function (ev, drag) {
            if ($(ev.target).attr("contenteditable") === true || $(ev.target).hasClass("x-edit")) {
              drag.cancel();
            }
          });
        });
      }, this);
    }
  });

  return LayoutView;
});
