!function(){class t extends HTMLElement{#t=1;#e=0;#i=999;#n=null;#s=null;#a=null;#h=null;constructor(){super(),this.#n=this.attachShadow({mode:"open"})}connectedCallback(){this.render()}render(){this.#n.innerHTML=`
      <style>
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button {-webkit-appearance: none; margin: 0;}
        input:focus{outline: none;}
      </style>
      <div part="wrapper">
          <button part="decrement" ${this.value==this.min?"disabled":""}>-</button>
          <input part="input" type="number" value="${this.value}" min="${this.min}" max="${this.max}">
          <button part="increment" ${this.value==this.max?"disabled":""}>+</button>
      </div>
    `,this.#s=this.#n.querySelector('[part="decrement"]'),this.#s.addEventListener("click",()=>{this.value=Number(this.value)-1,this.update()}),this.#a=this.#n.querySelector('[part="input"]'),this.#a.addEventListener("change",()=>{this.value=Number(this.#a.value),this.update()}),this.#h=this.#n.querySelector('[part="increment"]'),this.#h.addEventListener("click",()=>{this.value=Number(this.value)+1,this.update()})}update(){this.dispatchEvent(new Event("change")),this.render()}set value(t){let e=Math.max(this.#e,Math.min(this.#i,Number(t)));this.#t=e,this.setAttribute("value",e)}get value(){return this.#t}set min(t){this.#e=Number(t),this.setAttribute("min",t)}get min(){return this.#e}set max(t){this.#i=Number(t),this.setAttribute("max",t)}get max(){return this.#i}static get observedAttributes(){return["value","id","min","max"]}attributeChangedCallback(t,e,i){e!==i&&(this[t]=i,this.render())}}customElements.define("quantity-rocker",t)}();
//# sourceMappingURL=quantity-rocker.js.map
