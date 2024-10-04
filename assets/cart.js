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
  init: function () {
    window.addEventListener(ADD_EVENT_NAME, (e) => {
      e.preventDefault()
      switch (this.onAdd) {
        case "drawer":
          window.dispatchEvent(new CustomEvent('cart:open', e))
          break;
        case "notification":
          // Todo: show a notification with a to cart link
          break;
        case "popup":
          // Todo: show a cart popup with success message and upselling
          break;
        case "redirect":
        default:
          window.location.href = window.Shopify.routes.cartUrl
          break;
      }
    })
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
      options.callback(response);
      if (options.events) {
        window.dispatchEvent(new CustomEvent(ADD_EVENT_NAME, { detail: { ...response } }));
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
      options.callback(response);
      if (options.events) {
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
      options.callback(response);
      if (options.events) {
        window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: { ...response } }));
        return response
      }
    })
    .catch(console.error);
  },

};
Shopify.theme.cart.init();