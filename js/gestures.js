/**
 * Invokes `callback` when `element` receives three taps or clicks within `windowMs` of each other.
 * Listens on `pointerdown` so a single handler covers both touch taps and mouse clicks.
 * Calls preventDefault on each tap to suppress the emulated click (avoids stray focus/scroll side effects).
 * @param {Element} element - The element to listen for taps/clicks on.
 * @param {() => void} callback - Called once three taps/clicks land within the window.
 * @param {number} windowMs - Maximum gap in ms between consecutive taps/clicks for them to count together.
 * @returns {() => void} Unbind function that removes the listener.
 */
export const onTripleTap = (element, callback, windowMs) => {
  let tapTimes = [];

  const onPointerDown = (e) => {
    e.preventDefault();
    const now = Date.now();
    tapTimes = tapTimes.filter(t => now - t < windowMs);
    tapTimes.push(now);
    if (tapTimes.length >= 3) {
      tapTimes = [];
      callback();
    }
  };

  element.addEventListener('pointerdown', onPointerDown);
  return () => element.removeEventListener('pointerdown', onPointerDown);
};
