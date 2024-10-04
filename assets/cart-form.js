    
Shopify.theme = Shopify.theme || {};
Shopify.theme.cart = Shopify.theme.cart || {};
Shopify.theme.cart.sections = Shopify.theme.cart.sections || []
class CartForm extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const quantities = this.querySelectorAll(`[name="updates[]"]`);
    const removeButtons = this.querySelectorAll(`[name="line-item-remove"]`);
    
    Shopify.theme.cart.sections.push(this.section())

    quantities.forEach((qty) => {
      qty.addEventListener("change", async (e) => {
        this.loading = true;
        console.log("Change")
        const res = await Shopify.theme.cart.update({ updates: { [qty.dataset.lineItemKey]: Number(qty.value) } }, {
          events: true,
          callback: resolve,
          sections: [this.section]
        });
        this.updateView(res.sections[this.section]);
      });
    });

    removeButtons.forEach((rm) => {
      rm.addEventListener("click", (e) => {
        e.preventDefault();
        this.removeByUrl(rm.href);
      });
    });

    window.addEventListener("cart:open", (e) => {
      this.updateView(e.detail?.sections[this.section]);
      this.open()
    });
  }

  get section() {
    return this.getAttribute("section") || "cart-main";
  }

  removeByUrl(href) {
    this.loading = true;
    const url = new URL(href);
    url.searchParams.append("sections", this.section);
    fetch(`${url}`, {
      headers: {
        Accept: "application/json",
      },
    })
    .then((res) => res.json())
    .then((res) => {
      this.updateView(res.sections[this.section]);
      this.loading = false;
    })
    .catch((err) => {
      console.error(err);
      this.loading = false;
    });
  }

  updateView(htmlString) {
    this.loading = true;
    const div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    const newForm = div.querySelector("cart-form");
    this.replaceWith(newForm);
    window.dispatchEvent(new CustomEvent("cart:updated"));
    this.loading = false;
  }

  set loading(v) {
    if (v) {
      this.setAttribute("loading", v);
    } else {
      this.removeAttribute("loading");
    }
  }
  get loading() {
    return this.hasAttribute("loading");
  }

  static get observedAttributes() {
    return [];
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }
}

customElements.define("cart-form", CartForm);