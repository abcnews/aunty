import type { PackageJson as BasePackageJson } from "type-fest";

/**
 * Configuration specific to Aunty.
 */
export interface AuntyConfig {
  type?: "svelte" | string;
  [key: string]: unknown;
}

/**
 * Standard package.json structure with Aunty extensions.
 */
export type PackageJson = BasePackageJson & {
  aunty?: AuntyConfig;
};
