export type SiteContentKind = "IMAGE" | "TEXT";

export interface SiteContentKeyDef {
  kind: SiteContentKind;
  /**
   * Default value displayed when there is no entry in the DB yet.
   * For IMAGE keys this should be a public URL path (e.g. "/fallback.png")
   * or empty string; for TEXT keys this is the default copy.
   */
  fallback: string;
}

export const DEFAULT_ABOUT_TEXT =
  " is changing the way we define healthcare for our children. As the first nonprofit pediatric private practice in the Commonwealth, and one of the first in the nation, BCP is bringing income and racial equity to pediatrics by providing all families\u2013but especially those with low-income\u2013with comprehensive, high-quality, culturally competent care, regardless of their ability to pay. BCP cares for its patients at the intersection of physical health, mental health, and the social determinants of health that keep children with low-income from reaching their full health potential. That\u2019s why BCP treats the whole patient. At BCP, patients receive, providing fully-integrated, onsite medical and mental health care, as well as robust care navigation and wellness programming to address housing, food insecurity, early childcare, education needs, and more.";

export const SITE_CONTENT_KEYS = {
  "navbar.logo": { kind: "IMAGE", fallback: "" },
  "home.hero": { kind: "IMAGE", fallback: "" },
  "home.about.image": { kind: "IMAGE", fallback: "" },
  "home.about.text": { kind: "TEXT", fallback: DEFAULT_ABOUT_TEXT },
  "event.hero": { kind: "IMAGE", fallback: "" },
} as const satisfies Record<string, SiteContentKeyDef>;

export type SiteContentKey = keyof typeof SITE_CONTENT_KEYS;

export function isSiteContentKey(key: string): key is SiteContentKey {
  return Object.prototype.hasOwnProperty.call(SITE_CONTENT_KEYS, key);
}

export interface SiteContentEntry {
  key: SiteContentKey;
  type: SiteContentKind;
  value: string;
  url: string | null;
}

export type SiteContentMap = Partial<Record<SiteContentKey, SiteContentEntry>>;
