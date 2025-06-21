export function retry(callback: () => void, interval: number = 1000): void {
  try {
    callback();
  } catch {
    setTimeout(() => {
      retry(callback, interval);
    }, interval);
  }
}

export function getProperty(obj: object, key: string) {
  // @ts-expect-error: TypeScript doesn't like not knowing whether the key exists
  return obj[key];
}

export function setProperty(obj: object, key: string, value: unknown) {
  // @ts-expect-error: TypeScript doesn't like not knowing whether the key exists
  obj[key] = value;
}
