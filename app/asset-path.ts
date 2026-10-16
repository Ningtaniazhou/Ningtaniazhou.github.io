// Production: Chinese at / and Portuguese at /pt/, with shared public assets.
export const BASE_PATH = "/";
export function asset(file: string) {
  return `${BASE_PATH}${file.replace(/^\/+/, "")}`;
}
