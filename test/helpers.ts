process.env.npm_config_offline = "true";

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert";
import { $ } from "zx";
import { mock } from "node:test";

export const testTempDir = path.resolve(import.meta.dirname, "../.test-temp");

// Clean up previous test runs and recreate the temp directory
try {
  await fs.rm(testTempDir, { recursive: true, force: true });
} catch (err: any) {
  console.warn(
    `Warning: Could not clear .test-temp folder at startup (files might be locked by another process): ${err.message}`,
  );
}
await fs.mkdir(testTempDir, { recursive: true });

interface MockAnswers {
  prompts: Record<string, any>;
}

let activeAnswers: MockAnswers;

let transcript: string[] = [];

function clearTranscript() {
  transcript.length = 0;
}

function stripAnsi(str: string): string {
  return str.replace(/\u001b\[[0-9;]*m/g, "");
}

function setMockAnswers(prompts: Record<string, any>) {
  activeAnswers = { prompts };
}

function resolvePrompt(type: "text" | "select" | "confirm" | "multiselect", options: any): any {
  const message = stripAnsi(options?.message || "");

  const match = Object.entries(activeAnswers.prompts).find(([pattern]) =>
    message.includes(pattern)
  );

  if (!match) {
    throw new Error(
      `Unexpected clack prompt (${type}) with message: "${message}". Please specify a mock answer for this prompt pattern in your test.`,
    );
  }

  const [pattern, value] = match;
  let resolvedValue = value;

  if (type === "select" && Array.isArray(options.options)) {
    const foundOption = options.options.find(
      (opt: any) =>
        opt.label === value ||
        opt.value === value ||
        (opt.value && typeof opt.value === "object" && opt.value.name === value),
    );
    if (foundOption) {
      resolvedValue = foundOption.value;
    }
  }

  if (type === "multiselect" && Array.isArray(options.options)) {
    const selectedValues = Array.isArray(value) ? value : [value];
    resolvedValue = selectedValues.map((val: any) => {
      const foundOption = options.options.find(
        (opt: any) => opt.label === val || opt.value === val
      );
      return foundOption ? foundOption.value : val;
    });
  }

  transcript.push(`prompt.${type}: ${pattern} -> ${value}`);
  return resolvedValue;
}

// Mock @clack/prompts
mock.module("@clack/prompts", {
  namedExports: {
    intro: (msg: string) => {
      transcript.push(`intro: ${stripAnsi(msg).trim()}`);
    },
    outro: (msg: string) => {
      transcript.push(`outro: ${stripAnsi(msg).trim()}`);
    },
    cancel: (msg: string) => {
      transcript.push(`cancel: ${stripAnsi(msg).trim()}`);
    },
    isCancel: () => false,
    log: {
      step: (msg: string) => {
        transcript.push(`log.step: ${stripAnsi(msg).trim()}`);
      },
      message: (msg: string) => {
        transcript.push(`log.message: ${stripAnsi(msg).trim()}`);
      },
      error: (msg: string) => {
        transcript.push(`log.error: ${stripAnsi(msg).trim()}`);
      },
    },
    spinner: () => ({
      start: (msg?: string) => {
        if (msg) transcript.push(`spinner.start: ${stripAnsi(msg).trim()}`);
      },
      message: (msg: string) => {
        transcript.push(`spinner.message: ${stripAnsi(msg).trim()}`);
      },
      stop: (msg?: string) => {
        if (msg) transcript.push(`spinner.stop: ${stripAnsi(msg).trim()}`);
      },
      cancel: (msg?: string) => {
        if (msg) transcript.push(`spinner.cancel: ${stripAnsi(msg).trim()}`);
      },
    }),
    text: async (options: any) => resolvePrompt("text", options),
    select: async (options: any) => resolvePrompt("select", options),
    confirm: async (options: any) => resolvePrompt("confirm", options),
    multiselect: async (options: any) => resolvePrompt("multiselect", options),
  },
});

// Mock ftp to avoid real network calls
const ftpModulePath = path.resolve(import.meta.dirname, "../src/lib/ftp.ts");
mock.module(ftpModulePath, {
  namedExports: {
    isProjectNameAndVersionAvailable: async () => "error",
    testFtpConnection: async () => ({ success: false, error: "Mocked" }),
  },
});

// Import runCreate after mocking @clack/prompts
const { run: runCreate } = await import("../src/commands/create/index.ts");

/**
 * Helper to create a project using the CLI creator.
 */
export async function createProject(
  projectName: string,
  prompts: Record<string, any>,
): Promise<{ projectDir: string; transcript: string[] }> {
  const projectDir = path.join(testTempDir, projectName);

  clearTranscript();
  setMockAnswers(prompts);

  const originalCwd = process.cwd;
  process.cwd = () => testTempDir;

  try {
    const exitCode = await runCreate();
    assert.strictEqual(
      exitCode,
      0,
      `Failed to create project with exit code ${exitCode}`,
    );
  } finally {
    process.cwd = originalCwd;
  }

  return { projectDir, transcript: [...transcript] };
}

/**
 * Helper to run the build command inside the project directory.
 */
export async function buildProject(projectDir: string): Promise<void> {
  await $({ cwd: projectDir })`npm run build`.quiet();
}

/**
 * Helper to assert that expected build outputs are generated.
 */
export async function assertBuildOutputsExist(
  projectDir: string,
): Promise<void> {
  const distDir = path.join(projectDir, "dist");
  const files = [
    path.join(distDir, "index.html"),
    path.join(distDir, "es5entry.js"),
    path.join(distDir, "modules/indexEntry.js"),
  ];

  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.access(file);
      } catch {
        assert.fail(`Expected build output file to exist: ${file}`);
      }
    }),
  );
}
