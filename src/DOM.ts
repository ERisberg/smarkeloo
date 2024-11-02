export class DOM {
  public static createButton(label: string, onClick: () => void) {
    (function ($) {
      const btn = $("<button/>", {
        text: label,
        click: onClick,
      });

      $("#erlib_menu").append(btn);
    })(jQuery);
  }

  public static createMenu() {
    (function ($) {
      $("head").append(
        $('<link rel="stylesheet" type="text/css" />').attr(
          "href",
          "https://rawcdn.githack.com/ERisberg/smarkeloo/2fa7798df485b2d209ab06137378099c00462d1d/src/css/main.css"
        )
      );

      const menu = $("<div></div>");
      $(menu).attr("id", "erlib_menu").addClass("erlib_menu");

      $("body").append(menu);
    })(jQuery);
  }
}
