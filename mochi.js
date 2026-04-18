export class MochiRobot {
  constructor() {
    this.eyes = document.querySelectorAll('.eye');
    if (!this.eyes.length) return;

    this._blinkTimeout = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.startBlinking();
  }

  handleMove(clientX, clientY) {
    this.eyes.forEach(eye => {
      const rect = eye.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = clientX - eyeCenterX;
      const deltaY = clientY - eyeCenterY;

      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(15, Math.hypot(deltaX, deltaY) / 10);

      eye.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
    });
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.handleMove(e.clientX, e.clientY);
    });

    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.handleMove(touch.clientX, touch.clientY);
    }, { passive: true });
  }

  triggerBlink = () => {
    this.eyes.forEach(eye => {
      eye.classList.add('blink');
      setTimeout(() => eye.classList.remove('blink'), 200);
    });
    const nextBlink = Math.random() * 4000 + 2000;
    this._blinkTimeout = setTimeout(this.triggerBlink, nextBlink);
  };

  startBlinking() {
    this._blinkTimeout = setTimeout(this.triggerBlink, 2000);
  }

  destroy() {
    clearTimeout(this._blinkTimeout);
  }
}
