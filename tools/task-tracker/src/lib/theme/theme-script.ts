/**
 * Runs before first paint (injected into <head>) so the correct theme class is
 * on <html> before React hydrates — preventing a light/dark flash. Reads the
 * saved choice, falling back to the OS preference.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
