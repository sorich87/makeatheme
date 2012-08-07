require(["jquery"], function($) {
  $(function () {
    require(["bootstrap/js/bootstrap-collapse"], function () {
      // Show FAQ on index, collapsed by default
      $(".collapse").collapse();
      $("[href='#faq']").on("click", function (e) { e.preventDefault() });
    });

    require(["bootstrap/js/bootstrap-modal"], function () {
      // Hide modal previously shown before showing a new one
      $("#register, #login, #new-password, #confirm-password").on("show", function () {
        $("#register, #login, #new-password, #confirm-password").not("#" + this.id).modal("hide");
      })
    });
  });
});
