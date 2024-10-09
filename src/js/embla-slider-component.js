const EMBLA_SLIDE_NAME = "embla-slide";
const EMBLA_CONTAINER_NAME = "embla-slides";
const EMBLA_VIEWPORT_NAME = "embla-viewport";
const EMBLA_NEXT_NAME = "embla-next";
const EMBLA_PREV_NAME = "embla-prev";
const EMBLA_SLIDER_NAME = "embla-slider";
const EMBLA_PROGRESS_NAME = "embla-progress";
const EMBLA_THUMBNAIL_NAME = "embla-thumbnail";

const camelize = (s) => s.replace(/-./g, (x) => x[1].toUpperCase());

customElements.define(EMBLA_CONTAINER_NAME, class extends HTMLElement {});
customElements.define(EMBLA_SLIDE_NAME, class extends HTMLElement {});
customElements.define(EMBLA_VIEWPORT_NAME, class extends HTMLElement {});
class EmblaThumbnail extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("click", () => {
      const slider = this.closest(EMBLA_SLIDER_NAME) || document.getElementById(this.for);
      slider.api.scrollTo(this.index);
    });
  }
  static get observedAttributes() {
    return ["for", "index"];
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }
}
customElements.define(EMBLA_THUMBNAIL_NAME, EmblaThumbnail);
class EmblaNext extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("click", () => {
      const slider = this.closest(EMBLA_SLIDER_NAME) || document.getElementById(this.for);
      console.log(slider);
      slider.api?.scrollNext();
    });
  }
  disable() {
    this.setAttribute("disabled", true);
  }
  enable() {
    this.removeAttribute("disabled");
  }
  static get observedAttributes() {
    return ["for"];
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }
}
customElements.define(EMBLA_NEXT_NAME, EmblaNext);
class EmblaPrev extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("click", () => {
      const slider = this.closest(EMBLA_SLIDER_NAME) || document.getElementById(this.for);
      console.log(slider);
      slider.api?.scrollPrev();
    });
  }
  disable() {
    this.setAttribute("disabled", true);
  }
  enable() {
    this.removeAttribute("disabled");
  }
  static get observedAttributes() {
    return ["for"];
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }
}
customElements.define(EMBLA_PREV_NAME, EmblaPrev);
class EmblaProgress extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {}
  update() {
    const slider = this.closest(EMBLA_SLIDER_NAME) || document.getElementById(this.for);
    const progress = Math.max(0, Math.min(1, slider.api?.scrollProgress() ?? 0));
    this.style.setProperty("--progress", `${progress * 100}%`);
  }
  static get observedAttributes() {
    return ["for"];
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }
}
customElements.define(EMBLA_PROGRESS_NAME, EmblaProgress);
class EmblaSlider extends HTMLElement {
  static VERSION = "1.0.0";
  static BREAKPOINT_SMALL = "(max-width: 576px)";
  static BREAKPOINT_MEDIUM = "(max-width: 992px)";
  static OPTIONS_PROPERTIES = ["options", "options-medium", "options-small"];

  constructor() {
    super();
  }
  connectedCallback() {
    this.autoplay = this.getAttribute("autoplay") || 0;
    this.style.setProperty("--autoplay-speed", `${this.autoplay}ms`);
    this.autoHeight = this.hasAttribute("auto-height") || false;
    this.autoScroll = this.hasAttribute("auto-scroll") || false;
    this.fade = this.hasAttribute("fade") || false;
    this.pauseOnHover = this.hasAttribute("pause-on-hover");
    this.plugins = [EmblaCarouselClassNames(), EmblaCarouselWheelGestures()];
    if (this.autoHeight) {
      this.plugins.push(EmblaCarouselAutoScroll({ playOnInit: false }));
    }
    if (this.autoScroll) {
      this.plugins.push(EmblaCarouselAutoHeight());
    }
    if (this.fade) {
      this.plugins.push(EmblaCarouselFade());
    }
    if (this.autoplay != 0) {
      this.plugins.push(
        EmblaCarouselAutoplay({
          stopOnMouseEnter: this.pauseOnHover,
          delay: this.autoplay,
          playOnInit: true,
        }),
      );
    }

    this.buildOptions();
    this.updateAttributeByResponsiveOptions("loop");

    this.viewport = this.querySelector(EMBLA_VIEWPORT_NAME);

    this.api = EmblaCarousel(this.viewport, this.options, this.plugins);

    window.addEventListener("resize", () => {
      this.updateAttributeByResponsiveOptions("loop");
    });

    window.addEventListener("shopify:block:select", (e) => {
      const blockId = e.detail.blockId;
      const blockIndex = Array.from(this.api.slideNodes()).findIndex(
        (slide) =>
          slide.hasAttribute("data-shopify-editor-block") &&
          JSON.parse(slide.getAttribute("data-shopify-editor-block")).id == blockId,
      );
      if (blockIndex != -1) this.api.scrollTo(Number(blockIndex));
    });

    this.api.on("select", () => {
      this.updateControls();
      this.updateThumbnails();
    });
    this.api.on("init", () => {
      console.log("Init");
      this.updateControls();
      this.updateProgress();
      this.updateThumbnails();
    });
    this.api.on("reInit", () => {
      this.updateControls();
      this.updateProgress();
      this.updateThumbnails();
    });
    this.api.on("scroll", () => {
      this.updateProgress();
    });
    this.api.on("slideFocus", () => {
      this.updateProgress();
    });
    this.api.on("destroy", () => {});
  }
  updateAttributeByResponsiveOptions(attribute) {
    if (window.matchMedia(EmblaSlider.BREAKPOINT_SMALL).matches) {
      const optionValue = this.options.breakpoints[EmblaSlider.BREAKPOINT_SMALL][camelize(attribute)];
      optionValue ? this.setAttribute(attribute, true) : this.removeAttribute(attribute);
    } else {
      const optionValue = this.options[camelize(attribute)];
      optionValue ? this.setAttribute(attribute, true) : this.removeAttribute(attribute);
    }
  }
  buildOptions() {
    this.options = {
      ...this.options,
      container: EMBLA_CONTAINER_NAME,
      breakpoints: {
        [EmblaSlider.BREAKPOINT_MEDIUM]: {
          ...this.options,
          ...this.optionsMedium,
        },
        [EmblaSlider.BREAKPOINT_SMALL]: {
          ...this.options,
          ...this.optionsSmall,
        },
      },
    };
  }
  parseOptions(options) {
    return Object.fromEntries(
      options.split(",").map((option) => {
        const [key, value] = option.split(":");
        if (value.match(/true|false/g)) {
          // is boolean value
          return [key.trim(), value.trim() == "true"];
        }
        if (value.match(/[0-9]+/g)) {
          // is number
          return [key.trim(), Number(value.trim())];
        }
        return [key.trim(), value.trim()];
      }),
    );
  }
  updateControls() {
    const nexts = [
      ...document.querySelectorAll(`${EMBLA_NEXT_NAME}[for="${this.id}"]`),
      ...this.querySelectorAll(`${EMBLA_NEXT_NAME}`),
    ];
    nexts.forEach((n) => (this.api.canScrollNext() ? n.enable() : n.disable()));
    const prevs = [
      ...document.querySelectorAll(`${EMBLA_PREV_NAME}[for="${this.id}"]`),
      ...this.querySelectorAll(`${EMBLA_PREV_NAME}`),
    ];
    prevs.forEach((n) => (this.api.canScrollPrev() ? n.enable() : n.disable()));
  }
  updateProgress() {
    const progress = [
      ...document.querySelectorAll(`${EMBLA_PROGRESS_NAME}[for="${this.id}"]`),
      ...this.querySelectorAll(`${EMBLA_PROGRESS_NAME}`),
    ];
    progress.forEach((n) => n.update());
  }
  updateThumbnails() {
    const thumbnails = [
      ...document.querySelectorAll(`${EMBLA_THUMBNAIL_NAME}[for="${this.id}"]`),
      ...this.querySelectorAll(`${EMBLA_THUMBNAIL_NAME}`),
    ];
    thumbnails.forEach((t) => t.classList.remove("is-selected"));
    thumbnails.filter((t) => t.index == this.api.selectedScrollSnap()).forEach((t) => t.classList.add("is-selected"));
  }
  static get observedAttributes() {
    return ["id", ...EmblaSlider.OPTIONS_PROPERTIES];
  }
  attributeChangedCallback(property, oldValue, newValue) {
    if (oldValue === newValue) return;
    const jsProperty = camelize(property);
    if (EmblaSlider.OPTIONS_PROPERTIES.includes(property)) {
      // parse string before assignment
      this[jsProperty] = this.parseOptions(newValue);
      this.buildOptions();
      return;
    }
    this[jsProperty] = newValue;
  }
}

customElements.define(EMBLA_SLIDER_NAME, EmblaSlider);
