import {
  MOCHI_EYE_MAX_DISTANCE,
  MOCHI_EYE_DISTANCE_DIVISOR,
  MOCHI_BLINK_DURATION,
  MOCHI_BLINK_MIN_INTERVAL,
  MOCHI_BLINK_MAX_INTERVAL,
  MOCHI_INITIAL_BLINK_DELAY,
  MATRIX_TRIPLE_TAP_WINDOW_MS,
} from './config.js';
import { onTripleTap } from './gestures.js';
import { openMatrixRain } from './matrix.js';

export class MochiRobot {
  /**
   * Finds the avatar's eye elements and starts the eye-tracking and blinking
   * behaviour. Does nothing if no `.eye` elements are present in the DOM.
   */
  constructor() {
    this.eyes = document.querySelectorAll('.eye');
    if (!this.eyes.length) return;

    this._blinkTimeout = null;
    this._unbindTripleTap = null;
    this.init();
  }

  /**
   * Binds movement events, starts the blink loop, and wires up the
   * triple-tap/triple-click easter egg on the robot's head.
   * @returns {void}
   */
  init() {
    this.bindEvents();
    this.startBlinking();
    this.bindMatrixEasterEgg();
  }

  /**
   * Triple-tapping (touch) or triple-clicking (mouse) the robot's head opens the Matrix rain overlay.
   * @returns {void}
   */
  bindMatrixEasterEgg() {
    const head = document.querySelector('.mochi-head');
    if (!head) return;
    this._unbindTripleTap = onTripleTap(head, openMatrixRain, MATRIX_TRIPLE_TAP_WINDOW_MS);
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

    const onTouch = (e) => {
      const touch = e.touches[0];
      this.handleMove(touch.clientX, touch.clientY);
    };
    document.addEventListener('touchmove', onTouch, { passive: true });
    document.addEventListener('touchstart', onTouch, { passive: true });
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
   * Cancels the pending blink timeout and unbinds the triple-tap easter egg.
   * @returns {void}
   */
  destroy() {
    clearTimeout(this._blinkTimeout);
    this._unbindTripleTap?.();
  }
}
