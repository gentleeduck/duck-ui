import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace IPagination {
  export type IScoped<TProps> = TProps & { __scopePagination?: Scope }

  export type IRangeItem = number | 'start-ellipsis' | 'end-ellipsis'

  export interface IContext {
    page: number
    pageCount: number
    siblingCount: number
    boundaryCount: number
    setPage: (page: number) => void
    getPageHref: ((page: number) => string) | undefined
  }

  type PrimitiveNavProps = React.ComponentPropsWithoutRef<typeof Primitive.nav>
  type PrimitiveUlProps = React.ComponentPropsWithoutRef<typeof Primitive.ul>
  type PrimitiveLiProps = React.ComponentPropsWithoutRef<typeof Primitive.li>
  type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>

  export interface IProps extends PrimitiveNavProps {
    dir?: IDirection.Kind
    /** Number of pages. Until it is set there is one, so the triggers stay disabled. */
    pageCount?: number
    page?: number
    defaultPage?: number
    onPageChange?(page: number): void
    /** Pages shown either side of the current one. */
    siblingCount?: number
    /** Pages always shown at each end. */
    boundaryCount?: number
    /** Renders every page and trigger as a link to this address instead of a button. */
    getPageHref?(page: number): string
  }

  export interface IContentProps extends PrimitiveUlProps {}
  export interface IItemProps extends PrimitiveLiProps {}

  /** A page or trigger renders a button, or a link under `getPageHref`, so it takes the props both share. */
  export interface IControlProps extends React.HTMLAttributes<HTMLElement> {
    asChild?: boolean
    disabled?: boolean
  }

  export interface IPageProps extends IControlProps {
    value: number
  }

  export interface ITriggerProps extends IControlProps {}

  export interface IControlImplProps extends IControlProps {
    name: string
    target: number
  }
  export interface IEllipsisProps extends PrimitiveSpanProps {}

  export interface IPagesProps {
    /** Draws the range; without it each entry is an `Item` holding a `Page` or an `Ellipsis`. */
    children?: (items: IRangeItem[]) => React.ReactNode
  }
}
