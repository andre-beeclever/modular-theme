window.theme = window.theme || {};
window.theme.scroll = window.theme.scroll || (function () {
  let lastScrollPosition = 0;
  let scrollEnabled = true;
  return {
    isEnabled() {
      return scrollEnabled;
    },
    disable: () => {
      scrollEnabled = false;
      lastScrollPosition = window.scrollY;
      document.body.style.top = -window.scrollY + "px";
      if (window.innerWidth > 750) {
        document.body.style.paddingRight = "14px";
      }
      document.body.style.position = "fixed";
    },
    enable: () => {
      scrollEnabled = true;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.paddingRight = "";
      window.scrollTo({
        top: lastScrollPosition,
        behavior: "instant",
      });
    },
  };
})();

class PopupButton extends HTMLElement {
  static TAGS = ['pop-up','theme-alert','theme-notification']
  static TAG_NAMES = PopupButton.TAGS.map(tag => tag.toUpperCase())
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("click", (e) => {
      const id = this.getAttribute("for") || this.closest(PopupButton.TAGS.join(',')).id
      if(!id){
        console.warn(`[${this.tagName}] Target not found.`);
        return;
      }
      const target = document.getElementById(id);
      if (!target) {
        console.warn(`[${this.tagName}] Target not found.`);
        return;
      }
      if (!PopupButton.TAG_NAMES.includes(target.tagName)) {
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
  
class Popup extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("click", (e) => {
      if (e.target == this) this.close();
    });
    window.addEventListener('popup:open', (e) => {
      // console.log("popup:open", e.detail.id, this.id)
      if(e.detail.id == this.id) this.open();
    })
    window.addEventListener('popup:close', (e) => {
      // console.log("popup:close", e.detail.id, this.id)
      if(e.detail.id == this.id) this.close();
    })
    window.addEventListener('popup:toggle', (e) => {
      // console.log("popup:toggle", e.detail.id, this.id)
      if(e.detail.id == this.id) this.toggle();
    })
  }
  get isScrollingEnabled(){
    return this.getAttribute('scrolling') != "disabled"
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
        if(!this.isScrollingEnabled){
          window.theme.scroll.disable();
          console.warn(`[${this.tagName}] Disabled scroll.`);
        }
        this.dispatchEvent(new CustomEvent("opened"));
      } 
      else {
        if(!this.isScrollingEnabled){
          window.theme.scroll.enable();
          console.warn(`[${this.tagName}] Enabled scroll.`);
        }
        this.dispatchEvent(new CustomEvent("closed"));
      }
      return;
    } // do not sync open as it is used as a function
    this[property] = newValue;
  }
}
customElements.define("pop-up", Popup);

class ThemeAlert extends Popup {
  constructor() {
    super();
  }
}
customElements.define("theme-alert", ThemeAlert);

window.Shopify.theme.alert = (
  message,
  options = {
    button: { label: "Close", class: "btn btn--primary" },
    container: { class: "flex col gap-small spacing-m" },
  },
) => {
  const alertElement = document.createElement("theme-alert");
  alertElement.setAttribute("scrolling", "disabled");
  alertElement.innerHTML = `
    <div class="${options.container.class}">
      <p>${message}</p>
      <pop-up-button class="${options.button.class}">${options.button.label}</pop-up-button>
    </div>
  `;
  document.body.appendChild(alertElement);
  alertElement.addEventListener("closed", () => {
    alertElement.remove();
  });
  alertElement.open();
};


class ThemeNotification extends Popup {
  constructor() {
    super();
  }
}
customElements.define("theme-notification", ThemeNotification);


window.Shopify.theme.notify = (
  template
) => {
  const notificationElement = document.createElement("theme-notification");
  const clone = template.content.cloneNode(true);
  notificationElement.appendChild(clone);
  document.body.appendChild(notificationElement);
  console.log(notificationElement.cloneNode(true))
  notificationElement.addEventListener("closed", () => {
    setTimeout(() => {
      notificationElement.remove();
    }, 1000)
  });
  setTimeout(() => {
    notificationElement.close();
  }, 10000)
  setTimeout(() => {
    notificationElement.open();
  }, 300)
};