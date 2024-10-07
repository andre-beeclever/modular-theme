!function(){class t extends HTMLElement{#t;#e;#i;#s;#n;#a;#h;constructor(){super(),this.#t=1,this.#e=0,this.#i=999,this.#s=null,this.#n=null,this.#a=null,this.#h=null,this.#s=this.attachShadow({mode:"open"})}connectedCallback(){this.render()}render(){this.#s.innerHTML=`
      <style>
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button {-webkit-appearance: none; margin: 0;}
        input:focus{outline: none;}
      </style>
      <div part="wrapper">
          <button part="decrement" ${this.value==this.min?"disabled":""}>-</button>
          <input part="input" type="number" value="${this.value}" min="${this.min}" max="${this.max}">
          <button part="increment" ${this.value==this.max?"disabled":""}>+</button>
      </div>
    `,this.#n=this.#s.querySelector('[part="decrement"]'),this.#n.addEventListener("click",()=>{this.value=Number(this.value)-1,this.update()}),this.#a=this.#s.querySelector('[part="input"]'),this.#a.addEventListener("change",()=>{this.value=Number(this.#a.value),this.update()}),this.#h=this.#s.querySelector('[part="increment"]'),this.#h.addEventListener("click",()=>{this.value=Number(this.value)+1,this.update()})}update(){this.dispatchEvent(new Event("change")),this.render()}set value(t){let e=Math.max(this.#e,Math.min(this.#i,Number(t)));this.#t=e,this.setAttribute("value",e)}get value(){return this.#t}set min(t){this.#e=Number(t),this.setAttribute("min",t)}get min(){return this.#e}set max(t){this.#i=Number(t),this.setAttribute("max",t)}get max(){return this.#i}static get observedAttributes(){return["value","id","min","max"]}attributeChangedCallback(t,e,i){e!==i&&(this[t]=i,this.render())}}customElements.define("quantity-rocker",t)}();
//# sourceMappingURL=quantity-rocker.js.map
