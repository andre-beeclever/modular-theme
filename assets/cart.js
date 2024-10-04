Shopify.theme = Shopify.theme || {};
Shopify.theme.cart = Shopify.theme.cart || {};
Shopify.theme.cart.mode = Shopify.theme.cart.mode || "page"; 
Shopify.theme.cart.onAdd = Shopify.theme.cart.onAdd || "redirect"; 

const DEFAULT_OPTIONS = {
  events: true, 
  sections: [],
  callback: (cart) => {}
}

const ADD_EVENT_NAME = "cart:add"
const CHANGE_EVENT_NAME = "cart:changed"

Shopify.theme.cart = {
  links: [],
  init: function () {
    window.addEventListener(ADD_EVENT_NAME, function (e) {
      const observeUrlChange = () => {
        // let oldHref = document.location.href;
        const body = document.querySelector('body');
        const observer = new MutationObserver(mutations => {
          // if (oldHref !== document.location.href) {
          //   oldHref = document.location.href;
          //   /* Changed ! your code here */
          // }
          if(document.location.href == window.Shopify.routes.cartUrl){
            console.log("Cart url")
          }
        });
        observer.observe(body, { childList: true, subtree: true });
      };
      
      window.onload = observeUrlChange;
    });
  },
  add: function (itemsToAdd, options = DEFAULT_OPTIONS) {
    const url = window.Shopify.routes.cartAddUrl + "?sections=" + options.sections.join(",");
    fetch(url, {
      body: JSON.stringify(itemsToAdd),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      method: "POST",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.status) {
          if (options.events) {
            window.dispatchEvent(new CustomEvent(ADD_EVENT_NAME, { detail: {} }));
          }
          const error_string = `\nCART ADD FAILED \nStatus: ${response.status} \nMessage: ${response.message} \nDescription: ${response.description}`;
          throw new Error(error_string, { cause: "Cart Error" });
        } else {
          options.callback(response);
          if (options.events) {
            window.dispatchEvent(new CustomEvent(ADD_EVENT_NAME, { detail: { ...response } }));
          }
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  },
  get: function (options = DEFAULT_OPTIONS) {
    const url = window.Shopify.routes.cartUrl + "?sections=" + options.sections.join(",");
    fetch(window.Shopify.routes.cartUrl, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      method: "GET",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.status) {
          const error_string = `\nCART GET FAILED \nStatus: ${response.status} \nMessage: ${response.message} \nDescription: ${response.description}`;
          throw new Error(error_string, { cause: "Cart Error" });
        } else {
          options.callback(response);
          if (options.events) {
            window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: { ...response } }));
          }
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  },
  update: function (itemsToUpdate, options = DEFAULT_OPTIONS) {
    const url = window.Shopify.routes.cartUpdateUrl + "?sections=" + options.sections.join(",");
    fetch(url, {
      body: JSON.stringify(itemsToUpdate),
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      method: "POST",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.status) {
          const error_string = `\nCART UPDATE FAILED \nStatus: ${response.status} \nMessage: ${response.message} \nDescription: ${response.description}`;
          throw new Error(error_string, { cause: "Cart Error" });
        } else {
          options.callback(response);
          if (options.events) {
            window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: { ...response } }));
          }
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  },
  clear: function (options = DEFAULT_OPTIONS) {
    const url = window.Shopify.routes.cartClearUrl + "?sections=" + options.sections.join(",");
    fetch(url, {
      body: "",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      method: "POST",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        if (response.status) {
          const error_string = `\nCART CLEAR FAILED \nStatus: ${response.status} \nMessage: ${response.message} \nDescription: ${response.description}`;
          throw new Error(error_string, { cause: "Cart Error" });
        } else {
          options.callback(response);
          if (options.events) {
            window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME, { detail: { ...response } }));
          }
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  },

};
Shopify.theme.cart.init();