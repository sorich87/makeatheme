var app = require("application"),
    View = require("views/base/view"),
    menubar = require("views/templates/menubar");

module.exports = View.extend({
  tagName: "ul",
  className: "nav",
  model: app.currentTheme,

  appEvents: {
    "theme:renamed": "render"
  },

  render: function () {
    this.$el.empty().append(menubar({theme_name: this.model.get("name")}));

    this.buildFileMenu();
    this.buildViewMenu();
    this.buildTemplateMenu();

    return this;
  },

  buildFileMenu: function () {
    var menu = this.$("#file-menu"),
        copyThemeView = app.createView("copy_theme"),
        renameThemeView = app.createView("rename_theme"),
        saveThemeView = app.createView("save_theme"),
        shareThemeView = app.createView("share_theme"),
        downloadThemeView = app.createView("download_theme");

    this.subViews.push(copyThemeView, saveThemeView, shareThemeView,
                       downloadThemeView);

    if (app.currentUser.canEdit(app.currentTheme)) {
      menu.append(saveThemeView.render().$el);
      menu.append(renameThemeView.render().$el);
      menu.append(shareThemeView.render().$el);
      menu.append(this.divider());
      menu.append(downloadThemeView.render().$el);
      menu.append(this.divider());
    }

    menu.append(copyThemeView.render().$el);
  },

  buildViewMenu: function () {
    var menu = this.$("#view-menu"),
        deviceSwitchView = app.createView("device_switch");

    this.subViews.push(deviceSwitchView);

    menu.append(deviceSwitchView.render().$el);
  },

  buildTemplateMenu: function () {
    var menu = this.$("#template-menu"),
        templatesSelectView = app.createView("templates_select");

    this.subViews.push(templatesSelectView);

    if (app.currentUser.canEdit(app.currentTheme)) {
    } else {
      menu.append(templatesSelectView.render().$el);
    }
  },

  divider: function () {
    return "<li class='divider'></li>";
  }
});

