class CartCount extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    window.addEventListener("cart:changed", this.update.bind(this));
    window.addEventListener("cart:add", this.increment.bind(this));
  }
  update(e) {
    if (!e.detail.item_count) return;
    this.innerHTML = `${e.detail.item_count}`;
  }
  increment(e) {
    if (!e.detail.added_count) return;
    this.innerHTML = `${parseInt(this.innerHTML) + e.detail.added_count}`;
  }
}
customElements.define("cart-count", CartCount);