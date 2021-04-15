// JSX intrinsic elements support (for preact)

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Webpack loaders module declarations

declare module '*.svelte' {
  const component: any;
  export default component;
}

type CSSModule = {
  [className: string]: string;
};

type OptionalCSSModule = void | CSSModule;

declare module '*.css' {
  const optionalCSSModule: CSSModule;
  export default optionalCSSModule;
}

declare module '*.scss' {
  const optionalCSSModule: CSSModule;
  export default optionalCSSModule;
}

declare module '*.jpg' {
  const url: string;
  export default url;
}

declare module '*.png' {
  const url: string;
  export default url;
}

declare module '*.gif' {
  const url: string;
  export default url;
}

declare module '*.mp4' {
  const url: string;
  export default url;
}

declare module '*.m4v' {
  const url: string;
  export default url;
}

declare module '*.flv' {
  const url: string;
  export default url;
}

declare module '*.mp3' {
  const url: string;
  export default url;
}

declare module '*.wav' {
  const url: string;
  export default url;
}

declare module '*.m4a' {
  const url: string;
  export default url;
}

declare module '*.woff' {
  const url: string;
  export default url;
}

declare module '*.woff2' {
  const url: string;
  export default url;
}

declare module '*.ttf' {
  const url: string;
  export default url;
}

declare module '*.eot' {
  const url: string;
  export default url;
}

declare module '*.svg' {
  const url: string;
  export default url;
}

declare module '*.html' {
  const html: string;
  export default html;
}
