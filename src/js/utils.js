
Object.defineProperty(Array.prototype, 'uniq', {
  value: function() { return Array.from(new Set(this)); }
});
Object.defineProperty(HTMLElement.prototype, 'hide', {
  value: function() { this.setAttribute('hidden', 'hidden') }
});
Object.defineProperty(HTMLElement.prototype, 'show', {
  value: function() { this.removeAttribute('hidden') }
});