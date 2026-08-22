/// <reference types="vite/client" />

declare module "*?url" {
  const src: string;
  export default src;
}

declare module "*.css" {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
