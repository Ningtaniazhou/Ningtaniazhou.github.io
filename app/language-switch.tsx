import { BASE_PATH } from "./asset-path";
import "./language-switch.css";

/** Cover-only navigation keeps each edition's logic and CSS isolated. */
export default function LanguageSwitch({ locale }: { locale: "zh" | "pt" }) {
  return <a className="language-switch" href={locale === "zh" ? `${BASE_PATH}pt/` : BASE_PATH}
    aria-label={locale === "zh" ? "切换到葡萄牙语" : "Mudar para chinês"}>
    <span lang="zh-CN" className={locale === "zh" ? "active-language" : undefined}>中文</span>
    <span aria-hidden="true">/</span>
    <span lang="pt-PT" className={locale === "pt" ? "active-language" : undefined}>Português</span>
  </a>;
}
