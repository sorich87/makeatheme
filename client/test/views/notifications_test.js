var NotificationsView = require("views/notifications")
  , app = require("application");

beforeEach(function () {
  this.notificationsView = new NotificationsView().render();
});

afterEach(function () {
  this.notificationsView.remove();
});

describe("Notifications View", function () {
  it("will receive notifications", function () {
    var spy = sinon.spy();

    app.on("notification", spy);

    app.trigger("notification", "success", "Test");

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith("success", "Test");
  });

  it("will show notifications", function () {
    app.trigger("notification", "success", "Test");

    expect(this.notificationsView.$("li").length).to.equal(1);

    app.trigger("notification", "success", "Test");

    expect(this.notificationsView.$("li").length).to.equal(2);
  });

  it("will hide notifications after 4s", function () {
    var clock = sinon.useFakeTimers();

    app.trigger("notification", "success", "Test");

    expect(this.notificationsView.$("li").length).to.equal(1);

    clock.tick(4000);

    expect(this.notificationsView.$("li").length).to.equal(0);

    clock.restore();
  });
});
