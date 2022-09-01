/// <reference types="vite/client" />

// JSX intrinsic elements support (for preact)

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Module declarations for dsv files
declare module '*.csv' {
  const data: Record<string, unknown>[];
  export default data;
}

declare module '*.tsv' {
  const data: Record<string, unknown>[];
  export default data;
}

// Webpack loaders module declarations
// TODO: Many of these could be removed because they're included in vite/client. Do we still need the others?

declare module '*.svelte' {
  const component: any;
  export default component;
}

declare module '*.m4v' {
  const url: string;
  export default url;
}

declare module '*.flv' {
  const url: string;
  export default url;
}

declare module '*.m4a' {
  const url: string;
  export default url;
}

declare module '*.html' {
  const html: string;
  export default html;
}
