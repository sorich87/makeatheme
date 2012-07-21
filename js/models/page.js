define(['underscore', 'backbone'], function (_, Backbone) {
  var PageModel = Backbone.Model.extend({
    defaults: {
        title: "Hello World!"
      , content: "<p>This is an example page. It&#8217;s different from a blog post\
          because it will stay in one place and will show up in your site navigation\
          (in most themes). Most people start with an About page that introduces them\
          to potential site visitors. It might say something like this:</p>\
          <blockquote><p>Hi there! I&#8217;m a bike messenger by day, aspiring actor\
          by night, and this is my blog. I live in Los Angeles, have a great dog named\
          Jack, and I like pi&#241;a coladas. (And gettin&#8217; caught in the rain.)</p></blockquote>\
          <p>&#8230;or something like this:</p>\
          <blockquote><p>The XYZ Doohickey Company was founded in 1971, and has been\
          providing quality doohickies to the public ever since. Located in Gotham City,\
          XYZ employs over 2,000 people and does all kinds of awesome things for the\
          Gotham community.</p></blockquote>\
          <p>As a new WordPress user, you should go to <a href='#'>your dashboard</a>\
          to delete this page and create new pages for your content. Have fun!</p>"
    },

    initialize: function() {
    }
  });

  return PageModel;
});
