import {
  computePosition,
  autoUpdate,
  shift,
  offset,
  arrow,
} from '@floating-ui/dom';

class ShareLinks extends HTMLElement {
  constructor() {
    super();
    this.togglePanel = this.togglePanel.bind(this);
    this.updatePosition = this.updatePosition.bind(this);

    const self = this;

    this.state = new Proxy(
      { tooltip: false },
      {
        set(state, key, value) {
          const oldValue = state[key];

          state[key] = value;
          if (oldValue !== value) {
            // Shift layout
            if (value) {
              self.cleanup = autoUpdate(
                self.shareBtn,
                self.sharePanel,
                self.updatePosition,
              );
            } else {
              self.cleanup();
              Object.assign(self.sharePanel.style, {
                top: '',
                left: '',
              });
            }
          }
          return state;
        },
      },
    );
  }

  connectedCallback() {
    this.shareBtn = this.querySelector('.share-btn');
    this.sharePanel = this.querySelector('.share-panel');
    this.arrowElement = this.querySelector('.arrow');

    this.focusableLinks = this.querySelectorAll('.share-panel a');
    this.firstShareLink = this.focusableLinks[0];
    this.lastShareLink = this.focusableLinks[this.focusableLinks.length - 1];

    this.shareBtn.addEventListener('click', this.togglePanel);

    // Focus management
    this.lastShareLink.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        this.shareBtn.focus();
      }
    });

    this.shareBtn.addEventListener('keydown', (event) => {
      const ariaPressed = this.shareBtn.getAttribute('aria-pressed');
      const isPressed = ariaPressed === 'true';

      if (!isPressed) return;

      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        this.lastShareLink.focus();
      }

      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        this.firstShareLink.focus();
      }
    });

    // Update state based on width of article preview component
    const ro = new ResizeObserver((entries) => {
      const { inlineSize } = entries[0].borderBoxSize[0];
      this.state.tooltip = inlineSize > 445;
    });

    ro.observe(this.parentElement.parentElement.parentElement);
  }

  togglePanel() {
    const ariaPressed = this.shareBtn.getAttribute('aria-pressed');
    const isPressed = ariaPressed === 'true';
    if (isPressed) {
      this.shareBtn.setAttribute('aria-pressed', 'false');
      this.shareBtn.focus();
    } else {
      this.shareBtn.setAttribute('aria-pressed', 'true');
      this.firstShareLink.focus();
    }
  }

  async updatePosition() {
    const { x, y, placement, middlewareData } = await computePosition(
      this.shareBtn,
      this.sharePanel,
      {
        placement: 'top',
        middleware: [
          offset(16),
          shift({ padding: 8 }),
          arrow({ element: this.arrowElement }),
        ],
      },
    );

    Object.assign(this.sharePanel.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    const { x: arrowX, y: arrowY } = middlewareData.arrow;

    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[placement.split('-')[0]];

    Object.assign(this.arrowElement.style, {
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : '',
      right: '',
      bottom: '',
      [staticSide]: '-4px',
    });
  }
}

if (!customElements.get('share-links')) {
  customElements.define('share-links', ShareLinks);
}
