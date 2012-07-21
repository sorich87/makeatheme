define([
  'jquery',
  'underscore',
  'backbone',
  ], function($, _, Backbone){
  var BaseView = Backbone.View.extend({
      initialize: function(options) {
      this.loadModel();
      this.switchModes();
      this.saveChanges();
    }

    // Load model data in corresponding elements
    , loadModel: function () {
      var _this = this;

      _.each(_this.editables, function(f, c) {
        if (f.type === "text")
          _this.$(c).text(_this.model.get(f.name));
        else if( f.type === "html")
          _this.$(c).html(_this.model.get(f.name));
      });
    }

    // Highlight contenteditable areas on edit
    , switchModes: function () {
      var _this = this;

      EventDispatcher.on("mode:edit", function () {
        _.each(_this.editables, function(f, c) {
          switch (f.type) {
            case "text":
              _this.$(c).attr("contenteditable", true);
            break;
            case "image":
              _this.$(c).prepend("<div class='x-edit' style='position: absolute; right: 0; padding: 5px 10px; background-color: #ffffe0;'>Change Image</div>");
            break;
          }
        });
      });

      EventDispatcher.on("mode:view", function () {
        _.each(_this.editables, function(f, c) {
          switch (f.type) {
            case "text":
              _this.$(c).attr("contenteditable", false);
            break;
            case "image":
              _this.$(c).find(".x-edit").remove();
            break;
          }
        });
      });
    }

    // Save changes to model when an element is edited
    , saveChanges: function () {
      var _this = this;

      _.each(_this.editables, function(f, c) {
        _this.$(c).on("blur keyup paste", function () {
          if (f.type === "text")
            _this.model.set(f.name, $(this).text());
          else if (f.type === "html")
            _this.model.set(f.name, $(this).html());
        });
      });
    }
  });

  return BaseView;
});
