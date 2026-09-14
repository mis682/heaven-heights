const listeners = new Set();
let pendingCount = 0;
let slowTimer = null;

function notify(isSlow) {
  listeners.forEach((fn) => fn(isSlow));
}

export function subscribeWakeup(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function trackRequestStart() {
  pendingCount += 1;
  if (!slowTimer) {
    slowTimer = setTimeout(() => {
      if (pendingCount > 0) notify(true);
    }, 2500);
  }
}

export function trackRequestEnd() {
  pendingCount = Math.max(0, pendingCount - 1);
  if (pendingCount === 0) {
    clearTimeout(slowTimer);
    slowTimer = null;
    notify(false);
  }
}
