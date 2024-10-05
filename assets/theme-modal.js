window.theme = window.theme || {};
window.theme.scroll = window.theme.scroll || (function () {
  let lastScrollPosition = 0;
  let scrollEnabled = true;

  const getScrollbarWidth = () => {
    let scrollDiv = document.createElement("div");
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);
  
    // Get the scrollbar width
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  
    // Delete the div
    document.body.removeChild(scrollDiv);

    return scrollbarWidth;
  }

  return {
    isEnabled() {
      return scrollEnabled;
    },
    disable: () => {
      scrollEnabled = false;
      lastScrollPosition = window.scrollY;
      document.body.style.top = -window.scrollY + "px";
      if (window.innerWidth > 750) {
        document.body.style.paddingRight = `${getScrollbarWidth()}px`;
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

class ThemeModalButton extends HTMLElement {
  static TAGS = ['theme-modal','theme-alert','theme-notification', 'theme-drawer']
  static TAG_NAMES = ThemeModalButton.TAGS.map(tag => tag.toUpperCase())
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("click", (e) => {
      const id = this.getAttribute("for")
      const target = document.getElementById(id) || this.closest(ThemeModalButton.TAGS.join(','))
      console.log("target",target)
      if (!target) {
        console.warn(`[${this.tagName}] Target not found.`);
        return;
      }
      if (!ThemeModalButton.TAG_NAMES.includes(target.tagName)) {
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

customElements.define("theme-modal-button", ThemeModalButton);
  
class ThemeModal extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) this.close();
    });
    window.addEventListener('modal:open', (e) => {
      // console.log("modal:open", e.detail.id, this.id)
      if(e.detail.id == this.id) this.open();
    })
    window.addEventListener('modal:close', (e) => {
      // console.log("modal:close", e.detail.id, this.id)
      if(e.detail.id == this.id) this.close();
    })
    window.addEventListener('modal:toggle', (e) => {
      // console.log("modal:toggle", e.detail.id, this.id)
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
customElements.define("theme-modal", ThemeModal);

class ThemeAlert extends ThemeModal {
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
  return new Promise((resolve) => {
    const alertElement = document.createElement("theme-alert");
    alertElement.setAttribute("scrolling", "disabled");
    alertElement.setAttribute("id", `alert-${crypto.randomUUID()}`)
    alertElement.innerHTML = `
      <div class="${options.container.class}">
        <p>${message}</p>
        <theme-modal-button class="${options.button.class}">${options.button.label}</theme-modal-button>
      </div>
    `;
    document.body.appendChild(alertElement);
    alertElement.addEventListener("closed", () => {
      alertElement.remove();
      resolve()
    });
    alertElement.open();
  })
  
};

class ThemeDrawer extends ThemeModal {
  constructor() {
    super();
  }
}
customElements.define("theme-drawer", ThemeDrawer);
class ThemeNotification extends ThemeModal {
  constructor() {
    super();
  }
}
customElements.define("theme-notification", ThemeNotification);


// window.Shopify.theme.notify = (
//   template
// ) => {
//   const notificationElement = document.createElement("theme-notification");
//   notificationElement.setAttribute("id", `notification-${crypto.randomUUID()}`)
//   const clone = template.content.cloneNode(true);
//   notificationElement.appendChild(clone);
//   document.body.appendChild(notificationElement);
//   console.log(notificationElement.cloneNode(true))
//   notificationElement.addEventListener("closed", () => {
//     setTimeout(() => {
//       notificationElement.remove();
//     }, 1000)
//   });
//   setTimeout(() => {
//     notificationElement.close();
//   }, 10000)
//   setTimeout(() => {
//     notificationElement.open();
//   }, 300)
// };