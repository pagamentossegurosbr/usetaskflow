// Sistema de debug condicional
// Para ativar logs de debug, defina DEBUG_MODE = true
const DEBUG_MODE = false;

export const debug = {
  log: (...args: any[]) => {
    if (DEBUG_MODE) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Sempre logar erros, independente do modo debug
    console.error(...args);
  },
  warn: (...args: any[]) => {
    // Sempre logar warnings, independente do modo debug
    console.warn(...args);
  }
}; 