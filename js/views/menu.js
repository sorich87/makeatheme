define([
  'jquery',
  'underscore',
  'backbone',
  'views/base',
  'collections/menu',
  'views/menu_item'
  ], function($, _, Backbone, BaseView, Menu, MenuItemView) {
  var MenuView = BaseView.extend({
      el: $("<ul></ul>").appendTo($('#theme iframe').contents().find(".x-menu"))

    , initialize: function (options) {
      this.constructor.__super__.initialize.apply(this, [options])
    }

    , loadModel: function () {
      Menu.reset([{name: "Page", url: "#"}, {name: "Another Page", url: "#"}]);
    }

    , switchModes: function () {
      EventDispatcher.on("mode:edit", function () {
        this.$el.append("<li class='x-edit'><a href=''>Add Page</a></li>");
      }, this);

      EventDispatcher.on("mode:view", function () {
        this.$(".x-edit").remove();
      }, this);
    }

    , saveChanges: function () {
      Menu.on('add',   this.addOne, this);
      Menu.on('reset', this.addAll, this);
    }

    , addOne: function(menu_item) {
      var view = new MenuItemView({model: menu_item});
      this.$el.append(view.render().el);
    }

    , addAll: function() {
      Menu.each(this.addOne, this);
    }
  });

  return MenuView;
});
