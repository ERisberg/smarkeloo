import $ from "jquery";

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
          "https://github.com/ERisberg/smarkeloo/blob/main/src/css/main.css"
        )
      );

      const menu = $("<div></div>");
      $(menu)
        .css({
          position: "absolute",
          top: "0",
          left: "0",
          "z-index": "100",
        })
        .attr("id", "erlib_menu");

      $("body").append(menu);
    })(jQuery);
  }
}
