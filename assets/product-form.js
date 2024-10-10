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
  submit() {
    const formData = new FormData(this.form);
    // const sectionId = formData.get('section-id');
    formData.append("sections", "cart-drawer");
    this.submitButton.classList.add("loading");
    fetch(window.Shopify.routes.cartAddUrl + ".js", {
      method: "POST",
      credentials: "same-origin",
      body: formData
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      if (response.status) {
        const error_string = `\nCART GET FAILED \nStatus: ${response.status} \nMessage: ${response.message} \nDescription: ${response.description}`;
        throw new Error(error_string, { cause: "Cart Error" });
      } else {
        this.submitButton.classList.remove("loading");
        window.dispatchEvent(
          new CustomEvent("cart:add", {
            detail: {...response, added_count: Number(formData.get("quantity")) || 1 } 
          })
        );
      }
    })
    .catch((error) => {
      this.submitButton.classList.remove("loading");
      console.error(error);
    });
  }
  connectedCallback() {
    this.form = this.querySelector(`form`);
    this.productUrlInput = this.form.querySelector(`[name="url"]`);
    this.variantIdInput = this.form.querySelector(`[name="id"]`);
    this.sellingPlanInput = this.form.querySelector(`[name="selling_plan"]`);
    this.submitButton = this.form.querySelector(`button[type="submit"]`);
    this.variantIdInput?.addEventListener('input', this.updateVariant.bind(this));
    this.sellingPlanInput?.addEventListener('input', this.updateSellingplan.bind(this));
    this.submitButton?.addEventListener('click', this.submit.bind(this));
  }
}
customElements.define("product-form", ProductForm);