import { describe, it } from "node:test";
import assert from "node:assert";
import { getVersionOptions } from "../src/lib/semver.ts";

describe("getVersionOptions", () => {
  it("should return 6 options for standard version (no prerelease suffix)", () => {
    const options = getVersionOptions("1.2.3");
    assert.strictEqual(options.length, 6);
    assert.deepEqual(options, [
      { value: "1.2.4", label: "Patch (1.2.4)" },
      { value: "1.3.0", label: "Minor (1.3.0)" },
      { value: "2.0.0", label: "Major (2.0.0)" },
      { value: "1.2.4-prerelease.0", label: "Prerelease Patch (1.2.4-prerelease.0)" },
      { value: "1.3.0-prerelease.0", label: "Prerelease Minor (1.3.0-prerelease.0)" },
      { value: "2.0.0-prerelease.0", label: "Prerelease Major (2.0.0-prerelease.0)" },
    ]);
  });

  it("should return 2 options for prerelease version with default preid", () => {
    const options = getVersionOptions("1.2.4-prerelease.0");
    assert.strictEqual(options.length, 2);
    assert.deepEqual(options, [
      { value: "1.2.4", label: "Release (1.2.4)" },
      { value: "1.2.4-prerelease.1", label: "Prerelease (1.2.4-prerelease.1)" },
    ]);
  });

  it("should preserve existing preid on a prerelease version", () => {
    const options = getVersionOptions("17.0.0-next.0");
    assert.strictEqual(options.length, 2);
    assert.deepEqual(options, [
      { value: "17.0.0", label: "Release (17.0.0)" },
      { value: "17.0.0-next.1", label: "Prerelease (17.0.0-next.1)" },
    ]);
  });

  it("should handle prerelease with hyphenated tag like 17.0.0-next-32", () => {
    const options = getVersionOptions("17.0.0-next-32");
    assert.strictEqual(options.length, 2);
    assert.deepEqual(options, [
      { value: "17.0.0", label: "Release (17.0.0)" },
      { value: "17.0.0-next-32.0", label: "Prerelease (17.0.0-next-32.0)" },
    ]);
  });
});
