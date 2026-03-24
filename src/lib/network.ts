import { $ } from "zx";

/**
 * Get the DNS search domains for the current machine on macOS.
 */
export async function getSearchDomains(): Promise<string[]> {
  if (process.platform !== "darwin") return [];
  try {
    const { stdout } = await $`scutil --dns`.quiet();
    const domains = stdout
      .split("\n")
      .filter((line) => line.includes("search domain"))
      .map((line) => line.split(":")[1].trim());
    return [...new Set(domains)];
  } catch {
    return [];
  }
}

/**
 * Check if the machine appears to be on the internal ABC network.
 */
export async function isInternalNetwork(): Promise<boolean> {
  const domains = await getSearchDomains();
  return domains.some(
    (d) => d === "aus.aunty.abc.net.au" || d === "abc.net.au",
  );
}
