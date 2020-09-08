import { addAndRemoveClasses } from "./helpers";

window.addEventListener("DOMContentLoaded", _ => {
  console.log("DOM loaded");

  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  const modalUnderlay = document.getElementById("underlay");

  menuBtn.addEventListener("click", _ => {
    toggleMenu();
  });

  modalUnderlay.addEventListener("click", _ => {
    toggleMenu();
  });

  function toggleMenu() {
    addAndRemoveClasses({
      elementNode: menu,
      enabledClass: "menu--opened",
      disabledClass: "menu--closed"
    });

    addAndRemoveClasses({
      elementNode: modalUnderlay,
      enabledClass: "menu__underlay--show",
      disabledClass: "menu__underlay--hide"
    });
  }
});

