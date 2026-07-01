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
  console.warn(`Warning: Could not clear .test-temp folder at startup (files might be locked by another process): ${err.message}`);
}
await fs.mkdir(testTempDir, { recursive: true });

interface MockAnswers {
  projectName: string;
  projectType: "base" | "odyssey" | "scrollyteller";
  useTypescript: boolean;
}

let activeAnswers: MockAnswers;

let transcript: string[] = [];

function clearTranscript() {
  transcript.length = 0;
}

function stripAnsi(str: string): string {
  return str.replace(/\u001b\[[0-9;]*m/g, "");
}

function setMockAnswers(answers: MockAnswers) {
  activeAnswers = answers;
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
    text: async () => {
      transcript.push(`prompt.text: project name requested`);
      return activeAnswers.projectName;
    },
    select: async (options: any) => {
      if (options.options[0]?.value?.run) {
        transcript.push(`prompt.select: root template selected`);
        return options.options[0].value;
      }
      transcript.push(`prompt.select: project type selected -> ${activeAnswers.projectType}`);
      return activeAnswers.projectType;
    },
    confirm: async ({ message }: { message: string }) => {
      if (message.includes("Continue anyway?")) {
        transcript.push("prompt.confirm: continue on FTP warning -> true");
        return true;
      }
      transcript.push(`prompt.confirm: use typescript -> ${activeAnswers.useTypescript}`);
      return activeAnswers.useTypescript;
    },
  },
});

// Mock ftp to avoid real network calls
const ftpModulePath = path.resolve(import.meta.dirname, "../src/lib/ftp.ts");
mock.module(ftpModulePath, {
  namedExports: {
    isProjectNameAvailable: async () => "error",
    testFtpConnection: async () => ({ success: false, error: "Mocked" }),
  }
});

// Import runCreate after mocking @clack/prompts
const { run: runCreate } = await import("../src/commands/create/index.ts");

/**
 * Helper to create a project using the CLI creator.
 */
export async function createProject(options: {
  projectName: string;
  projectType: "base" | "odyssey" | "scrollyteller";
  useTypescript: boolean;
}): Promise<{ projectDir: string; transcript: string[] }> {
  const projectDir = path.join(testTempDir, options.projectName);

  clearTranscript();
  setMockAnswers(options);

  const originalCwd = process.cwd;
  process.cwd = () => testTempDir;

  try {
    const exitCode = await runCreate(options.projectName);
    assert.strictEqual(exitCode, 0, `Failed to create project with exit code ${exitCode}`);
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
export async function assertBuildOutputsExist(projectDir: string): Promise<void> {
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
    })
  );
}
