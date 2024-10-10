class SellingPlanPicker extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback(){
    this.sellinplanInput = this.querySelector('input[name="selling_plan"]');
    const purchseOptions = this.querySelectorAll('.purchase-option');
    const sellingplanOptions = this.querySelectorAll('.sellingplan-input');
    for(const purchseOption of purchseOptions) {
      const input = purchseOption.querySelector('input[name="purchase-option"]');
      const content = purchseOption.querySelector('.purchase-option-content');
      input.addEventListener('input', () => {
        if(!!content) {
          let selected_plan = content.querySelector('input.sellingplan-input:checked') || content.querySelector('input.sellingplan-input');
          if(!!selected_plan) {
            console.log('set purchase option selected plan: '+selected_plan.value);
            selected_plan.checked = true;
            selected_plan.dispatchEvent(new Event('input'));
          }
        }
      });
    }
    for(const sellingplanOption of sellingplanOptions) {
      sellingplanOption.addEventListener('input', () => {
        this.sellinplanInput.value = sellingplanOption.value;
        console.log('set selling plan main input to: '+sellingplanOption.value);
        //this.sellinplanInput.dispatchEvent(new Event('input'));
      });
    }
  }
}
customElements.define('selling-plan-picker', SellingPlanPicker);