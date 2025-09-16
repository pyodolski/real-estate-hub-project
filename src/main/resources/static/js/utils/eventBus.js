const listeners = new Map();
export function on(type, handler){ (listeners.get(type) ?? listeners.set(type, []).get(type)).push(handler); }
export function emit(type, payload){ (listeners.get(type) || []).forEach(h => h(payload)); }
