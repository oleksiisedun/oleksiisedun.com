import {
  MOCHI_EYE_MAX_DISTANCE,
  MOCHI_EYE_DISTANCE_DIVISOR,
  MOCHI_BLINK_DURATION,
  MOCHI_BLINK_MIN_INTERVAL,
  MOCHI_BLINK_MAX_INTERVAL,
  MOCHI_INITIAL_BLINK_DELAY,
} from './config.js';

export class MochiRobot {
  /**
   * Finds the avatar's eye elements and starts the eye-tracking and blinking
   * behaviour. Does nothing if no `.eye` elements are present in the DOM.
   */
  constructor() {
    this.eyes = document.querySelectorAll('.eye');
    if (!this.eyes.length) return;

    this._blinkTimeout = null;
    this.init();
  }

  /**
   * Binds movement events and starts the blink loop.
   * @returns {void}
   */
  init() {
    this.bindEvents();
    this.startBlinking();
  }

  /**
   * Moves each eye toward the given pointer position, clamped to a max distance.
   * @param {number} clientX - The pointer's X coordinate in viewport space.
   * @param {number} clientY - The pointer's Y coordinate in viewport space.
   * @returns {void}
   */
  handleMove(clientX, clientY) {
    this.eyes.forEach(eye => {
      const rect = eye.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = clientX - eyeCenterX;
      const deltaY = clientY - eyeCenterY;

      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(MOCHI_EYE_MAX_DISTANCE, Math.hypot(deltaX, deltaY) / MOCHI_EYE_DISTANCE_DIVISOR);

      eye.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
    });
  }

  /**
   * Listens for mouse and touch movement to drive eye tracking.
   * @returns {void}
   */
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

  /**
   * Plays a blink animation on each eye, then schedules the next blink
   * after a random interval.
   * @returns {void}
   */
  triggerBlink = () => {
    this.eyes.forEach(eye => {
      eye.classList.add('blink');
      setTimeout(() => eye.classList.remove('blink'), MOCHI_BLINK_DURATION);
    });
    const nextBlink = Math.random() * (MOCHI_BLINK_MAX_INTERVAL - MOCHI_BLINK_MIN_INTERVAL) + MOCHI_BLINK_MIN_INTERVAL;
    this._blinkTimeout = setTimeout(this.triggerBlink, nextBlink);
  };

  /**
   * Schedules the first blink.
   * @returns {void}
   */
  startBlinking() {
    this._blinkTimeout = setTimeout(this.triggerBlink, MOCHI_INITIAL_BLINK_DELAY);
  }

  /**
   * Cancels the pending blink timeout.
   * @returns {void}
   */
  destroy() {
    clearTimeout(this._blinkTimeout);
  }
}
