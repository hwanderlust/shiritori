import { get } from "./helpers";
type SubmenuElement = "rules" | "about" | "contact" | "settings";

export default function Submenu() {

  const rulesBtn = get("rulesBtn") as HTMLButtonElement;
  const aboutBtn = get("aboutBtn") as HTMLButtonElement;
  const contactBtn = get("contactBtn") as HTMLButtonElement;
  const settingsBtn = get("settingsBtn") as HTMLButtonElement;
  const rulesSubmenu = get("submenuRules");
  const aboutSubmenu = get("submenuAbout");
  const contactSubmenu = get("submenuContact");
  const settingsSubmenu = get("submenuSettings");
  const submenuWindow = get("submenu");
  const menuWindow = get("menu");
  const modalUnderlay = get("underlay");
  const SUBMENU = [rulesSubmenu, aboutSubmenu, contactSubmenu, settingsSubmenu];
  const musicSlider = get("musicSlider") as HTMLInputElement;

  function toggleContent(el: SubmenuElement): void {
    const elMap = {
      "rules": rulesSubmenu,
      "about": aboutSubmenu,
      "contact": contactSubmenu,
      "settings": settingsSubmenu,
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
      rulesBtn.addEventListener("click", _ => {
        toggleContent("rules");
      });
      aboutBtn.addEventListener("click", _ => {
        toggleContent("about");
      });
      contactBtn.addEventListener("click", _ => {
        toggleContent("contact");
      });
      settingsBtn.addEventListener("click", _ => {
        toggleContent("settings");
      });

      musicSlider.addEventListener("click", _ => {
        const input = musicSlider.previousElementSibling as HTMLInputElement;
        const playerParentEl = get("musicPlayer").parentElement;

        // let default input trigger 'checked' status
        if (input.checked === true) {
          // actually when input.checked is FALSE
          playerParentEl.style.display = "none";
          playerParentEl.parentElement.style.justifyContent = "flex-end";
          return;
        }

        if (!input.checked && playerParentEl.style.display === "none") {
          // actually when input.checked is TRUE
          playerParentEl.style.display = "unset";
          playerParentEl.parentElement.style.justifyContent = "space-between";
        }
      });

      get("radio10").addEventListener("click", _ => {
        window.sessionStorage.setItem("time", `10`);
      });
      get("radio15").addEventListener("click", _ => {
        window.sessionStorage.setItem("time", `15`);
      });
      get("radio20").addEventListener("click", _ => {
        window.sessionStorage.setItem("time", `20`);
      });
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