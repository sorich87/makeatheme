// Tests for AuthLinksView class.
var AuthLinksView = require("views/auth_links");

beforeEach(function () {
  var user = {
      on: function () {}
    , toJSON: function () { return {id: "1"} }
  };

  this.authLinksView = new AuthLinksView({
    model: user
  });
});

afterEach(function () {
  this.authLinksView.remove();
});

describe("AuthLinksView", function () {
  it("will re-render when the user model change", function () {
    var spy = sinon.spy(this.authLinksView.model, "on");

    this.authLinksView.initialize();

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith("change", this.authLinksView.render, this.authLinksView);
  });

  it("will show the login and register links when user is not logged in", function () {
    sinon.stub(this.authLinksView.model, "toJSON", function () { return {}; });

    this.authLinksView.render();

    expect(this.authLinksView.el.innerHTML).to.contain('id="register"');
    expect(this.authLinksView.el.innerHTML).to.contain('id="login"');
  });

  it("will show the logout button when user is logged in", function () {
    this.authLinksView.render();

    expect(this.authLinksView.el.innerHTML).to.contain('id="logout"');
  });

  it("will delete the user session on logout", function () {
    var stub = sinon.stub(window.jQuery, "ajax");

    this.authLinksView.render().$("#logout").click();

    expect(stub).to.have.been.calledOnce;
    expect(stub.args[0][0]).to.have.property("contentType", "application/json; charset=UTF-8");
    expect(stub.args[0][0]).to.have.property("type", "DELETE");
    expect(stub.args[0][0]).to.have.property("url", "/session");

    window.jQuery.ajax.restore();
  });

  it("will redirect the user to the homepage on logout", function () {
    sinon.stub(window.jQuery, "ajax", function (options) {
      options.complete(null, "success");
    });

    sinon.stub(this.authLinksView.model, "toJSON", function () { return {id: "1"}; });

    this.authLinksView.render().$("#logout").click();

    expect(window.location).to.equal("/");

    window.jQuery.ajax.restore();
  });
});
