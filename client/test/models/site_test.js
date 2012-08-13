// Tests for Site model class.
var Site = require("models/site");

describe ("Site", function () {
  it ("will be created with default values for its attributes", function () {
    var site = new Site();

    expect(site.get("title")).to.equal("Your Site Name");
    expect(site.get("description")).to.equal("Just another WordPress site");
    expect(site.get("home_url")).to.equal("#");
    expect(site.get("site_url")).to.equal("#");
  });

  it ("will set passed attributes on the model instance when created", function () {
    var site = new Site({
        title: "Some Site"
      , description: "Just a good WordPress site"
      , home_url: "http://thememy.com/home"
      , site_url: "http://thememy.com/site"
    });

    expect(site.get("title")).to.equal("Some Site");
    expect(site.get("description")).to.equal("Just a good WordPress site");
    expect(site.get("home_url")).to.equal("http://thememy.com/home");
    expect(site.get("site_url")).to.equal("http://thememy.com/site");
  });
});
