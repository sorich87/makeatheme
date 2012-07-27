define([
  'jquery',
  'underscore',
  'backbone',
  'views/base',
  'collections/menu',
  'views/menu_item'
  ], function($, _, Backbone, BaseView, Menu, MenuItemView) {
  var MenuView = BaseView.extend({
      el: $("<ul></ul>").appendTo(".x-menu")

    , initialize: function (options) {
      this.constructor.__super__.initialize.apply(this, [options])
    }

    , loadModel: function () {
      Menu.reset(Menu.models);
    }

    // Show "Add Page" links on edit
    , switchModes: function () {
      EventDispatcher.on("mode:edit", function () {
        this.$el.find(">li, >li>ul>li").each(function () {
          var ul = $(this).children("ul");

          if (ul.length === 0)
            ul = $("<ul></ul>").appendTo(this);

          $(ul).append("<li class='x-edit'><a href=''>Add Page</a></li>");
        });

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
      var items = Menu.models;

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
