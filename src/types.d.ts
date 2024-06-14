export interface Config {
  rules: Record<string, Array<Target>>;
}

export interface Target {
  host: string,
  activated: boolean
}

declare module 'clipboard' {
  function Copy(text: string): void

  export = Copy
}
