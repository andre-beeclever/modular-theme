Shopify.theme = Shopify.theme || {};
Shopify.theme.cart = Shopify.theme.cart || {};
Shopify.theme.cart.mode = Shopify.theme.cart.mode || "page"; 
Shopify.theme.cart.onAdd = Shopify.theme.cart.onAdd || "redirect"; 
Shopify.theme.cart.sections = Shopify.theme.cart.sections || []

const DEFAULT_OPTIONS = {
  events: true, 
  sections: [],
  callback: (cart) => {}
}

const ADD_EVENT_NAME = "cart:add"
const CHANGE_EVENT_NAME = "cart:changed"

Shopify.theme.cart = {
  ...Shopify.theme.cart,
  init: function () {
    window.addEventListener(ADD_EVENT_NAME, (e) => {
      e.preventDefault()
      switch (this.onAdd) {
        case "drawer":
          window.dispatchEvent(new CustomEvent("modal:open", { detail: { id: 'cart-drawer'}}))
          break;
        case "notification":
          window.dispatchEvent(new CustomEvent("modal:open", { detail: { id: 'cart-notification'}}))
          break;
        case "modal":
          window.dispatchEvent(new CustomEvent("modal:open", { detail: { id: 'cart-modal'}}))
          break;
        case "redirect":
        default:
          window.location.href = window.Shopify.routes.cartUrl
          break;
      }
    })
    if(this.mode == "drawer"){
      console.log("Cart mode: Drawer")
      document.addEventListener('click', (e) => {    
        const target = e.target.closest('a');  
        if (target) {
          // console.log("Link clicked: ", target)  
          if (target.getAttribute("href") == window.Shopify.routes.cartUrl) {
              e.preventDefault(); 
              window.dispatchEvent(new CustomEvent("modal:open", { detail: { id: 'cart-drawer'}}))
          }
        }
      });
      const url = new URL(location)
      const shouldOpen = url.searchParams.get('cart') == "open"
      if(shouldOpen){
        window.dispatchEvent(new CustomEvent("modal:open", { detail: { id: 'cart-drawer'}}))
        url.searchParams.delete('cart')
        history.replaceState({}, "", url.href)
      }

    }
    else{
      console.log("Cart mode: Page")
    }
  },
  get: async (options = DEFAULT_OPTIONS) => {
    const url = window.Shopify.routes.cartUrl + "?sections=" + [...Shopify.theme.cart.sections, ...(options?.sections ?? [])].uniq().join(",");
    return await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json"
      },
      method: "GET",
    })
    .then((response) => response.json())
    .catch(console.error);
  },
  add: async (itemsToAdd, options = DEFAULT_OPTIONS) => {
    const url = window.Shopify.routes.cartAddUrl + "?sections=" + ([...Shopify.theme.cart.sections, ...(options?.sections ?? [])].uniq()).join(",");
    return await fetch(url, {
      body: JSON.stringify(itemsToAdd),
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json"
      },
      method: "POST",
    })
    .then((response) => response.json())
    .then((response) => {
      if(response.status){
        throw new Error(`${response.message}: ${response.description}`)
      }
      if(!!options.callback){
        options.callback(response);
      }
      if (options.events || true) {
        window.dispatchEvent(new CustomEvent(ADD_EVENT_NAME, { detail: { ...response, added_count: itemsToAdd.reduce((acc, i) => acc + Number(i.quantity), 0) } }));
        return response
      }
    })
    .catch(console.error);
  },
  update: async (itemsToUpdate, options = DEFAULT_OPTIONS) => {
    const url = window.Shopify.routes.cartUpdateUrl + "?sections=" + [...Shopify.theme.cart.sections, ...(options?.sections ?? [])].uniq().join(",");
    return await fetch(url, {
      body: JSON.stringify(itemsToUpdate),
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json"
      },
      method: "POST",
    })
    .then((response) => response.json())
    .then((response) => {
      if(response.status){
        throw new Error(`${response.message}: ${response.description}`)
      }
      if(!!options.callback){
        options.callback(response);
      }
      if (options.events || true) {
        window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: { ...response } }));
        return response
      }
    })
    .catch(console.error);
  },
  clear: async (options = DEFAULT_OPTIONS) => {
    const url = window.Shopify.routes.cartClearUrl + "?sections=" + [...Shopify.theme.cart.sections, ...(options?.sections ?? [])].uniq().join(",");
    return await fetch(url, {
      body: "",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json"
      },
      method: "POST",
    })
    .then((response) => response.json())
    .then((response) => {
      if(response.status){
        throw new Error(`${response.message}: ${response.description}`)
      }
      if(!!options.callback){
        options.callback(response);
      }
      if (options.events || true) {
        window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: { ...response } }));
        return response
      }
    })
    .catch(console.error);
  },
  prepareShippingRates: async (address) => {
    const url = `${window.Shopify.routes.cartUrl}/cart/prepare_shipping_rates.json?shipping_address[zip]=${address.zip}&shipping_address[country]=${address.country}&shipping_address[province]=${address.province}`
    return await fetch(url, {
      method: "post",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json"
      },
    })
    .then((response) => response.json())
    .then((response) => {
      if(response.status){
        throw new Error(`${response.message}: ${response.description}`)
      }
      return response;
    })
    .catch(console.error);
  }
};

Shopify.theme.cart.init();
