class SellingPlanPicker extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback(){
    this.sellinplanInput = this.querySelector('input[name="selling_plan"]');
    const purchseOptions = this.querySelectorAll('.purchase-option');
    for(const purchseOption of purchseOptions) {
      const input = purchseOption.querySelector('input[name="purchase-option"]');
      const content = purchseOption.querySelector('.purchase-option-content');
      input.addEventListener('input', () => {
        if(!!content) {
          let selected_plan = content.querySelector('input:checked') || content.querySelector('input');
          if(!!selected_plan) {
            selected_plan.checked = true;
            selected_plan.dispatchEvent(new Event('input'));
          }
        }
      });
    }
  }
}
customElements.define('selling-plan-picker', SellingPlanPicker);