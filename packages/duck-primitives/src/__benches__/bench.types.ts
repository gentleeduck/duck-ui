import type * as React from 'react'

export namespace IBench {
  export type Library =
    | 'duck'
    | 'radix'
    | 'baseui'
    | 'react-aria'
    | 'ark'
    | 'headless'
    | 'cmdk'
    | 'input-otp'
    | 'vaul'
    | 'react-day-picker'

  export type Rival = Exclude<Library, 'duck'>

  /** A whole module, or named exports of one. */
  export type Part = string | { names: string[]; from: string }
  export type Entry = Part | Part[]

  /** The parts a tree draws, so one tree takes any library whose parts share the names. */
  export type Parts<Name extends string> = Record<Name, React.ElementType>

  /** Drawn closed or as it starts with `false`, open or changed with `true`. */
  export type View = (on: boolean) => React.ReactElement

  export interface IRuntime {
    /** Timed opening and closing one, rather than redrawing a hundred. */
    overlay: boolean
    view: Partial<Record<Library, View>>
    /** Overlays with no controlled open state: their views ignore `on`, and only their closed mount and unmount are timed. */
    closedOnly?: Rival[]
    /** Changes the hundred copies through the DOM, as a user would, in place of redrawing them with `true`. */
    input?: {
      name: string
      run(host: HTMLElement): void
      /** Holds once every copy shows the change; the timer runs until it does. */
      done(host: HTMLElement): boolean
    }
  }

  export interface ICase {
    name: string
    /** What a reader needs to read the numbers right, printed under them. */
    note?: string
    /** gentleduck's bundle, when its module alone cannot run. */
    duck?: Entry
    size: Partial<Record<Rival, Entry>>
    runtime?: IRuntime
  }

  export interface IModuleCase extends ICase {
    module: string
  }

  export interface ISizeResult {
    name: string
    module: string
    bytes: Partial<Record<Library, number>>
    versions: Partial<Record<Rival, string>>
    note?: string
  }

  export interface IMetric {
    metric: string
    ms: Partial<Record<Library, number>>
    duckVs: Partial<Record<Rival, number>>
    samples: number
  }

  export interface ITotal {
    name: string
    sizeKB: number
    /** gentleduck over the same components, on every row but its own. */
    gentleduckKB?: number
    components: number
    verified: boolean
  }

  export interface IEnvironment {
    browser: string
    react: string
    cpu: string
    os: string
    copies: number
    rounds: number
    toggleReps: number
  }

  export interface IRuntimeResult {
    name: string
    module: string
    overlay: boolean
    metrics: IMetric[]
  }
}
