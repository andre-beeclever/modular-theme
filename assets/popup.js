
class Popup extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("click", (e) => {
      if (e.target == this) this.close();
    });
  }
  isOpen() {
    return this.hasAttribute("open");
  }
  open() {
    this.setAttribute("open", true);
  }
  close() {
    this.removeAttribute("open");
  }
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
  static get observedAttributes() {
    return ["open"];
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (property === "open") {
      if (this.isOpen()) {
        window.theme.scroll.disable();
        this.dispatchEvent(new CustomEvent("opened"));
        console.warn(`[${this.tagName}] Disabled scroll.`);
      } else {
        window.theme.scroll.enable();
        this.dispatchEvent(new CustomEvent("closed"));
        console.warn(`[${this.tagName}] Enabled scroll.`);
      }
      return;
    } // do not sync open as it is used as a function
    this[property] = newValue;
  }
}
customElements.define("pop-up", Popup);

class PopupButton extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(this.getAttribute("for"));
      if (!target) {
        console.warn(`[${this.tagName}] Target not found.`);
        return;
      }
      const validTagNames = ["POP-UP", "THEME-ALERT", "CART-DRAWER"];
      if (!validTagNames.includes(target.tagName)) {
        console.warn(`[${this.tagName}] Invalid target.`);
        return;
      }

      target.toggle();
    });
  }

  static get observedAttributes() {
    return [];
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }
}
customElements.define("pop-up-button", PopupButton);

class ThemeAlert extends Popup {
  constructor() {
    super();
  }
}
customElements.define("theme-alert", ThemeAlert);

window.theme.alert = (
  message,
  options = {
    button: { label: "Close", class: "btn btn--primary" },
    container: { class: "flex col gap-small spacing-m" },
  },
) => {
  const elementId = `alert-${crypto.randomUUID()}`;
  const alertElement = document.createElement("theme-alert");
  alertElement.setAttribute("id", elementId);
  alertElement.innerHTML = `
    <div class="${options.container.class}">
      <p>${message}</p>
      <pop-up-button class="${options.button.class}" for="${elementId}">${options.button.label}</pop-up-button>
    </div>
  `;
  document.body.appendChild(alertElement);
  alertElement.addEventListener("closed", () => {
    alertElement.remove();
  });
  alertElement.open();
};