import { get } from "./helpers";
import Submenu from "./submenu";

const submenuInstance = Submenu();

export default function Menu() {

  let menuBtn: HTMLElement;
  let menu: HTMLElement;
  let modalUnderlay: HTMLElement;

  function toggleMenu(): void {
    toggleClasses({
      elementNode: menu,
      enabledClass: "menu--opened",
    });

    toggleClasses({
      elementNode: modalUnderlay,
      enabledClass: "menu__underlay--show",
    });

    submenuInstance.hideSubmenu();
  }

  return {
    addListeners: function (): void {
      menuBtn = get("menuBtn");
      menu = get("menu");
      modalUnderlay = get("underlay");

      menuBtn.addEventListener("click", _ => {
        toggleMenu();
      });

      modalUnderlay.addEventListener("click", _ => {
        toggleMenu();
      });

      submenuInstance.addListeners();
    }
  }
}

interface ToggleClasses {
  elementNode: HTMLElement,
  enabledClass: string;
}

function toggleClasses({ elementNode, enabledClass }: ToggleClasses) {
  if (elementNode.classList.contains(enabledClass)) {
    elementNode.classList.remove(enabledClass);
    return;
  }

  elementNode.classList.add(enabledClass);
}