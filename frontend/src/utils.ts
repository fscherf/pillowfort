export function retry(callback: () => void, interval: number = 1000): void {
  try {
    callback();
  } catch {
    setTimeout(() => {
      retry(callback, interval);
    }, interval);
  }
}
