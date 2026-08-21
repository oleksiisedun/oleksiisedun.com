/**
 * Invokes `callback` when `element` receives three touchstart taps within `windowMs` of each other.
 * Calls preventDefault on each tap to suppress the emulated click (avoids stray focus/scroll side effects).
 * @param {Element} element - The element to listen for taps on.
 * @param {() => void} callback - Called once three taps land within the window.
 * @param {number} windowMs - Maximum gap in ms between consecutive taps for them to count together.
 * @returns {() => void} Unbind function that removes the listener.
 */
export const onTripleTap = (element, callback, windowMs) => {
  let tapTimes = [];

  const onTouchStart = (e) => {
    e.preventDefault();
    const now = Date.now();
    tapTimes = tapTimes.filter(t => now - t < windowMs);
    tapTimes.push(now);
    if (tapTimes.length >= 3) {
      tapTimes = [];
      callback();
    }
  };

  element.addEventListener('touchstart', onTouchStart, { passive: false });
  return () => element.removeEventListener('touchstart', onTouchStart);
};
