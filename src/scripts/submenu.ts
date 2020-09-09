import { get } from "./helpers";
type SubmenuElement = "rules" | "about" | "contact";

export default function Submenu() {

  let SUBMENU: Array<HTMLElement>;
  let rulesBtn: HTMLElement;
  let aboutBtn: HTMLElement;
  let contactBtn: HTMLElement;
  let rulesListener;
  let aboutListener;
  let contactListener;
  let rulesSubmenu: HTMLElement;
  let aboutSubmenu: HTMLElement;
  let contactSubmenu: HTMLElement;
  let submenuWindow: HTMLElement;
  let menuWindow: HTMLElement;
  let modalUnderlay: HTMLElement;

  function toggleContent(el: SubmenuElement): void {
    const elMap = {
      "rules": rulesSubmenu,
      "about": aboutSubmenu,
      "contact": contactSubmenu
    };

    toggleClasses({
      triggeredElement: elMap[el],
      elements: SUBMENU,
      enabledClass: "submenu--show",
    });

    handleMobileMenuStyle({ menuWindow, modalUnderlay })

    showSubmenu(submenuWindow);
  }

  return {
    addListeners: function () {
      rulesBtn = get("rulesBtn");
      aboutBtn = get("aboutBtn");
      contactBtn = get("contactBtn");
      rulesSubmenu = get("submenuRules");
      aboutSubmenu = get("submenuAbout");
      contactSubmenu = get("submenuContact");
      submenuWindow = get("submenu");
      menuWindow = get("menu");
      modalUnderlay = get("underlay");
      SUBMENU = [rulesSubmenu, aboutSubmenu, contactSubmenu];

      rulesListener = rulesBtn.addEventListener("click", _ => {
        toggleContent("rules");
      });
      aboutListener = aboutBtn.addEventListener("click", _ => {
        toggleContent("about");
      });
      contactListener = contactBtn.addEventListener("click", _ => {
        toggleContent("contact");
      });
    },
    removeListeners: function () {
      rulesBtn.removeEventListener("click", rulesListener);
      aboutBtn.removeEventListener("click", aboutListener);
      contactBtn.removeEventListener("click", contactListener);
    },
    hideSubmenu: function () {
      if (isOpen(submenuWindow)) {
        hideSubmenu(submenuWindow);
      }
    }
  }
}

interface ToggleClasses {
  triggeredElement: HTMLElement,
  elements: Array<HTMLElement>;
  enabledClass: string;
}

/**
 * Add or remove the 'show' attribute for each section
 */
function toggleClasses({ triggeredElement, elements, enabledClass }: ToggleClasses): void {
  for (const el of elements) {
    if (el === triggeredElement) {
      triggeredElement.classList.add(enabledClass);
    } else if (el.classList.contains(enabledClass)) {
      el.classList.remove(enabledClass);
    }
  }
}

function isOpen(submenuWindow: HTMLElement): boolean {
  return submenuWindow.classList.contains("submenu--opened");
}

function showSubmenu(submenuWindow): void {
  if (isOpen(submenuWindow)) {
    return;
  }
  submenuWindow.classList.add("submenu--opened");
}

function hideSubmenu(submenuWindow: HTMLElement): void {
  submenuWindow.classList.remove("submenu--opened");
}


interface HandleMobileMenuStyle {
  menuWindow: HTMLElement;
  modalUnderlay: HTMLElement;
}
/**
 * Manages the mobile wireframe by maximizing window space for text by closing the menu when selecting a menu option and toggles (off) the underlay
 */
function handleMobileMenuStyle({ menuWindow, modalUnderlay }: HandleMobileMenuStyle): void {
  if (window.innerWidth <= 1023) {
    menuWindow.classList.remove("menu--opened");
    modalUnderlay.classList.remove("menu__underlay--show");
  }
}