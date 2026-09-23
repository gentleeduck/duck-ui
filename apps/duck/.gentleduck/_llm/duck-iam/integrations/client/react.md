`@gentleduck/iam/client/react` builds a React access-control surface from a permission map. Everything except two factories and three re-exported key helpers comes out of `createIamAccessControl(React)` - the module never imports React itself, so there is no bundled copy and no peer-version conflict.

This module contains no evaluator. `can()` reads a snapshot of decisions a server already made, serialised over the wire, sitting in a browser the user controls - every value in it can be edited from a devtools console. It decides what to render, nothing more. The request the button fires must be authorized again on the server, by the engine, against the live policy set.

## Install

React is an **optional** peer dependency at `^19.2.6`. It is optional because the rest of the package works without it; if you use this entry point, React must be installed in your app.

```ts
import {
  createIamAccessControl,
  createIamPermissionChecker,
  iamAllowedActions,
  iamBuildPermissionKey,
  iamHasAnyOn,
} from '@gentleduck/iam/client/react'
```

Those five are the runtime exports of the module; the last three are re-exports of the shared helpers, so a React-only app never imports from `@gentleduck/iam/core` for them. `AccessProvider`, `useAccess`, `usePermissions`, `Can`, `Cannot`, and `AccessContext` are produced by calling the factory - they are not importable directly.

## Setup

Call the factory once, at app init, and export the result. Every consumer must share one context object, so a second call creates a second, unrelated context whose provider will not satisfy the first one's hook.

```tsx
// lib/access.tsx
import React from 'react'
import { createIamAccessControl } from '@gentleduck/iam/client/react'

type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Resource = 'post' | 'comment' | 'team' | 'analytics'
type Scope = 'org-1' | 'admin'

export const { AccessContext, AccessProvider, useAccess, usePermissions, Can, Cannot } =
  createIamAccessControl<Action, Resource, Scope>(React)
```

The generics are, in order, `TAction`, `TResource`, `TScope`, all constrained to `string` and all defaulting to `string`. Fixing them makes `can('mange', 'post')` a type error instead of a silently hidden button.

## Request path

Steps 3 and 4 are the only asynchronous work. Step 6 is the whole cost of the provider: one `useMemo` over the map identity. Step 10 is a property read. The note is described under [outside the provider](#behaviour-outside-the-provider).

## createIamAccessControl

```ts
function createIamAccessControl<
  TAction extends string = string,
  TResource extends string = string,
  TScope extends string = string,
>(React: ReactLike): {
  AccessContext: ReactContext<IamReactClient.IContextValue<TAction, TResource, TScope>>
  AccessProvider: (props: {
    permissions: IamClient.PartialPermissionMap<TAction, TResource, TScope>
    children: ReactNode
  }) => ReactNode
  useAccess: () => IamReactClient.IContextValue<TAction, TResource, TScope>
  usePermissions: (
    fetchFn: () => Promise<IamClient.PartialPermissionMap<TAction, TResource, TScope>>,
    deps?: readonly unknown[],
  ) => {
    permissions: IamClient.PartialPermissionMap<TAction, TResource, TScope>
    can: (action: TAction, resource: TResource, resourceId?: string, scope?: TScope) => boolean
    cannot: (action: TAction, resource: TResource, resourceId?: string, scope?: TScope) => boolean
    allowedActions: (resource: TResource) => string[]
    hasAnyOn: (resource: TResource) => boolean
    loading: boolean
    error: Error | null
    refetch: () => Promise<void>
  }
  Can: (props: CanProps) => ReactNode
  Cannot: (props: CannotProps) => ReactNode
}
```

The `React` parameter is structurally typed as `ReactLike`, so anything providing these seven members satisfies it - the real React module, a preact/compat shim, or a test double:

| Member | Used for |
| --- | --- |
| `createContext` | The shared access context |
| `useContext` | `useAccess` |
| `useMemo` | Memoising `can`/`cannot` in `AccessProvider` |
| `useCallback` | Memoising `can` in `usePermissions` |
| `createElement` | Rendering the context provider element |
| `useState` | `usePermissions` state |
| `useEffect` | `usePermissions` fetch effect |

Returns six members; there are no others.

## AccessProvider

| Prop | Type | Required | Meaning |
| --- | --- | --- | --- |
| `permissions` | `IamClient.PartialPermissionMap` renders nothing during load and after a failed load. Two UI hazards follow, neither of them a bug in the hook:

1. **`` will not match a key the server built with a `scope`.

## See also

* [PermissionMap reference](/duck-iam/integrations/client/permission-map) - key formats and partial maps
* [Client overview](/duck-iam/integrations/client) - server-to-client sync and refresh
* [Next.js integration](/duck-iam/integrations/server/next) - `getIamPermissions` and server-side checks
* [Vue client](/duck-iam/integrations/client/vue) - the same model, different reactivity
* [Vanilla JS client](/duck-iam/integrations/client/vanilla) - for non-React subtrees