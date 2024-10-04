
Object.defineProperty(Array.prototype, 'uniq', {
  value: function() { return Array.from(new Set(this)); }
});