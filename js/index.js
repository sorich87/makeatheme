require(["jquery"], function($) {
  $(function () {
    require(["bootstrap/js/bootstrap-collapse"], function () {
      $(".collapse").collapse();
      $("[href='#faq']").on("click", function (e) { e.preventDefault() });
    });
  });
});
