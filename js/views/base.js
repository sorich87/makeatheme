define([
  'jquery',
  'underscore',
  'backbone',
  ], function($, _, Backbone){
  var BaseView = Backbone.View.extend({
    initialize: function(options) {
      this.saveChanges();
      this.switchModes();
      this.loadModel();
    }

    // Load model data in corresponding elements
    , loadModel: function () {
      if (this.editables === undefined)
        return;

      _.each(this.editables, function(f, c) {
        switch( f.type ) {
          case "text" :
            this.$(c).text(this.model.get(f.name));
          break;

          case "html" :
            this.$(c).html(this.model.get(f.name));
          break;
        }
      }, this);
    }

    // Highlight editable areas on edit
    , switchModes: function () {
      if (this.editables === undefined)
        return;

      EventDispatcher.on("mode:edit", function () {
        _.each(this.editables, function(f, c) {
          switch (f.type) {
            case "text":
              this.$(c).attr("contenteditable", true);
            break;

            case "image":
              this.$(c).prepend("<a class='x-edit' href=''>Change Image</a>");
            break;
          }
        }, this);
      }, this);

      EventDispatcher.on("mode:view", function () {
        _.each(this.editables, function(f, c) {
          switch (f.type) {
            case "text":
              this.$(c).attr("contenteditable", false);
            break;

            case "image":
              this.$(c).find(".x-edit").remove();
            break;
          }
        }, this);
      }, this);
    }

    // Save changes to model when an element is modified
    , saveChanges: function () {
      if (this.editables === undefined)
        return;

      _.each(this.editables, function(f, c) {
        var _this = this;

        this.$(c).on("blur keyup paste", function () {
          switch (f.type) {
            case "text" :
              _this.model.set(f.name, $(this).text());
            break;

            case "html" :
              _this.model.set(f.name, $(this).html());
            break;
          }
        });
      }, this);
    }
  });

  return BaseView;
});
