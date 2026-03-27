/**
 * Options passed to a template's init function.
 */
export interface InitOptions {
  projectName: string;
  baseDir: string;
}

/**
 * A patch that can be applied to a template.
 */
export interface Patch {
  name: string;
  init: (options: InitOptions) => Promise<void>;
}

/**
 * A question asked during project creation to determine if a patch should be applied.
 */
export interface Question {
  question: string;
  action: string;
}

/**
 * A project template.
 */
export interface ProjectTemplate {
  name: string;
  baseInit: (options: InitOptions) => Promise<void>;
  patches: Patch[];
  questions?: Question[];
}
