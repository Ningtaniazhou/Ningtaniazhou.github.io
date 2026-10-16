import { BASE_PATH } from "../../../app/asset-path";
export function asset(file: string) { const clean=file.replace(/^\/+/, ""); return BASE_PATH + (clean.startsWith("tienho-prototype/") ? "zh/" : "") + clean; }
