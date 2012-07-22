define([
  'jquery',
  'underscore',
  'backbone',
  'collections/menu',
  'views/menu_item'
  ], function($, _, Backbone, Menu, MenuItemView) {
  var MenuView = Backbone.View.extend({
      el: $("<ul></ul>").appendTo($('#theme iframe').contents().find(".x-menu"))

    , initialize: function () {
      Menu.on('add',   this.addOne, this);
      Menu.on('reset', this.addAll, this);

      Menu.reset([{name: "Page", url: "#"}, {name: "Another Page", url: "#"}]);
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
