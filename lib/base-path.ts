/**
 * GitHub Pages yayın yolu desteği.
 *
 * Site proje sitesi olarak (https://<org>.github.io/<repo>/) yayınlandığında tüm yerel
 * yolların başına "/<repo>" eklenmelidir. next/link ve /_next varlıkları bunu otomatik
 * yapar; ancak ham "/..." görsel yolları (next/image unoptimized, <img>, metadata ikonları)
 * ve içerikteki (markdown/HTML) iç linkler için bu yardımcılar kullanılır.
 *
 * Değer next.config.ts'de PAGES_BASE_PATH'ten NEXT_PUBLIC_BASE_PATH olarak aktarılır.
 * Özel domainde boş olduğu için tüm fonksiyonlar girdiyi aynen döndürür.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** "/logo.png" -> "/gul-tekin-neon-app/logo.png". Mutlak URL'lere ve "//" adreslerine dokunmaz. */
export function withBasePath<T extends string | null | undefined>(value: T): T {
  if (!BASE_PATH || !value) return value;
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  if (value === BASE_PATH || value.startsWith(`${BASE_PATH}/`)) return value;
  return `${BASE_PATH}${value}` as T;
}

/** Markdown `](/yol)` ve HTML `href="/yol"` / `src="/yol"` iç linklerine yayın yolunu ekler. */
export function prefixInternalLinks<T extends string | null | undefined>(text: T): T {
  if (!BASE_PATH || !text) return text;
  const notPrefixed = `(?!/|${BASE_PATH.slice(1)}(?:/|\\b))`;
  return text
    .replace(new RegExp(`\\]\\(/${notPrefixed}`, "g"), `](${BASE_PATH}/`)
    .replace(new RegExp(`(href|src)=(["'])/${notPrefixed}`, "g"), `$1=$2${BASE_PATH}/`) as T;
}
