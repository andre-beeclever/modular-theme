class ProductOptionValue extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const form = this.closest('form');
    const variantId = this.getAttribute('variant-id');
    const productUrl = this.getAttribute('product-url');
    if(!!form){
      const variantIdInput = form.querySelector(`[name="id"]`);
      const productUrlInput = form.querySelector(`[name="url"]`);
      this.addEventListener('click', () => {
        productUrlInput.value = productUrl;
        variantIdInput.value = variantId;
        productUrlInput.dispatchEvent(new Event('input'));
        variantIdInput.dispatchEvent(new Event('input'));
      });
    }
  }
}
customElements.define("product-option-value", ProductOptionValue);

class ProductForm extends HTMLElement {
  constructor() {
    super();
  }
  get section() {
    return this.getAttribute("section") || "product-main";
  }
  updateURL() {
    const newUrl = new URL(location);
    if(!!this.productUrlInput){
      newUrl.pathname = this.productUrlInput.value;
    }
    if(!!this.variantIdInput && this.variantIdInput.value && !this.variantIdInput.disabled) {
      newUrl.searchParams.set('variant', this.variantIdInput.value);
    }
    if(!!this.sellingPlanInput && this.sellingPlanInput.value && !this.sellingPlanInput.disabled) {
      newUrl.searchParams.set('selling_plan', this.sellingPlanInput.value);
    }
    history.replaceState(null, "", newUrl.href);
    return newUrl;
  }
  updateDOM(callback) {
    const fetchUrl = this.updateURL();
    fetchUrl.searchParams.set('sections', this.section);
    this.loading = true;
    fetch(fetchUrl.href)
    .then((res) => res.json())
    .then((res) => {
      const data = res[this.section];
      const template = document.createElement("template");
      template.innerHTML = data.trim();
      const newDOM = template.content.querySelector('product-form');
      callback(this, newDOM)
      this.loading = false;
    })
    .catch((err) => {
      console.error(err);
      this.loading = false;
    });
  }
  updateVariant() {
    this.updateDOM((oldDOM, newDOM) => {
      oldDOM.replaceWith(newDOM);
    });
  }
  updateSellingplan() {
    this.updateDOM((oldDOM, newDOM) => {
      oldDOM.replaceWith(newDOM);
    });
  }
  connectedCallback() {
    this.productUrlInput = this.querySelector(`form [name="url"]`);
    this.variantIdInput = this.querySelector(`form [name="id"]`);
    this.sellingPlanInput = this.querySelector(`form [name="selling_plan"]`);
    this.updateURL();
    this.variantIdInput?.addEventListener('input', this.updateVariant.bind(this));
    this.sellingPlanInput?.addEventListener('input', this.updateSellingplan.bind(this));
  }
}
customElements.define("product-form", ProductForm);