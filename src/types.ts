import type { PackageJson as BasePackageJson } from "type-fest";

/**
 * Configuration specific to Aunty.
 */
export interface AuntyConfig {
  type?: "svelte" | string;
  /** On stable releases, also publish a `<major>.x.x-latest.html` redirect for CMS iframes */
  useEvergreenIndex?: boolean;
  [key: string]: unknown;
}

/**
 * Standard package.json structure with Aunty extensions.
 */
export type PackageJson = BasePackageJson & {
  aunty?: AuntyConfig;
};
