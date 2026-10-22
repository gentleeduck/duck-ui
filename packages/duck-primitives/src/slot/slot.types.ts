import type * as React from 'react'

export namespace ISlot {
  export interface IProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode
  }

  export interface ISlottableChildrenProps {
    children: React.ReactNode
  }

  /** `child` is the element the Slot lands on, and `children` renders what goes inside it from its own children. */
  export interface ISlottableRenderProps {
    child: React.ReactNode
    children: (slottable: React.ReactNode) => React.ReactNode
  }

  export type ISlottableProps = ISlottableChildrenProps | ISlottableRenderProps

  export interface ISlottableComponent extends React.FC<ISlottableProps> {
    __radixId: symbol
  }
}
