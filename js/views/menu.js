define([
  'jquery',
  'underscore',
  'backbone',
  'views/base',
  'collections/menu',
  'views/menu_item'
  ], function($, _, Backbone, BaseView, MenuCollection, MenuItemView) {

  var menu, MenuView;

  menu = new MenuCollection;

  MenuView = Backbone.View.extend({
      el: $("<ul></ul>").appendTo(".x-menu")

    , initialize: function () {
      this.buildMenu();
      this.loadDefault();
    }

    , loadDefault: function () {
      // Load menu items
      menu.reset([
        {id: 1, name: "Page", url: "#", parent: 0},
        {id: 2, name: "Second Page", url: "#", parent: 0},
        {id: 3, name: "Third Page", url: "#", parent: 1},
        {id: 4, name: "Fourth Page", url: "#", parent: 3}
      ]);
    }

    , buildMenu: function () {
      menu.on('add',   this.addOne, this);
      menu.on('reset', this.addAll, this);
    }

    // Build menu item as parent or children element
    , addOne: function(menu_item) {
      var view, parent, $parent, ul, item_el;

      parent = menu_item.get("parent");

      item_el = new MenuItemView({
        model: menu_item,
        id: "menu-item-" + menu_item.get("id")
      }).render().el;

      if (parent === 0) {
        this.$el.append(item_el);
      } else {
        $parent = this.$("#menu-item-" + parent);
        ul = $parent.children("ul");

        if (ul.length === 0)
          ul = $("<ul></ul>").appendTo($parent);

        $(ul).append(item_el);
      }
    }

    // Build three-levels menu structure
    // Loop through the items array three times, adding top level items
    // and items which parent was already added and rejecting those which parent was not added
    , addAll: function() {
      var items = menu.models;

      for (var i = 0; i < 3; i++) {
        items = _.reject(items, function (item) {
          var parent = item.get("parent");

          if (parent === 0 || this.$("#menu-item-" + parent).length) {
            this.addOne(item);
            return true;
          }
        }, this);
      }
    }
  });

  return MenuView;
});
