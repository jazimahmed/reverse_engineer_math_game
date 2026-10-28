module.exports = function fakeClock() {
  let now = 0;
  let id = 0;
  const tasks = new Map();
  const add = (callback, ms, repeat) => { const key = ++id; tasks.set(key, { callback, ms, due: now + ms, repeat }); return key; };
  return {
    now: () => now,
    setTimeout: (fn, ms) => add(fn, ms, false), clearTimeout: (key) => tasks.delete(key),
    setInterval: (fn, ms) => add(fn, ms, true), clearInterval: (key) => tasks.delete(key),
    pending: () => tasks.size,
    advance(ms) {
      const end = now + ms;
      while (true) {
        const next = [...tasks].filter(([, task]) => task.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) break;
        const [key, task] = next;
        now = task.due;
        if (task.repeat) task.due += task.ms;
        else tasks.delete(key);
        task.callback();
      }
      now = end;
    },
  };
};
