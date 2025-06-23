import { cn } from '@gentleduck/libs/cn'
import { groupArrays } from '@gentleduck/libs/group-array'
import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './_dropdown-menu/dropdown-menu'
import { Button, ButtonProps, buttonVariants, CommandType } from '../button'

export interface DropdownMenuOptionsDataType
  extends Partial<
    React.ComponentPropsWithoutRef<typeof DropdownMenuCheckboxItem> &
      React.ComponentPropsWithoutRef<typeof DropdownMenuItem> &
      React.ComponentPropsWithoutRef<typeof DropdownMenuRadioItem>
  > {
  actionType: 'drawer' | 'dialog' | 'sheet' | 'item'
  command?: React.ComponentPropsWithoutRef<typeof DropdownMenuShortcut> & CommandType
  icon?: React.ReactNode
  nestedData?: React.ComponentPropsWithoutRef<typeof DropdownMenuSubContent> & DropdownMenuOptionsType
}

export interface DropdownMenuOptionsType {
  itemType: 'checkbox' | 'radio' | 'label'
  optionsData: DropdownMenuOptionsDataType[]
  group?: number[]
}

export interface DropdownMenuViewProps extends React.ComponentPropsWithoutRef<typeof DropdownMenu> {
  trigger: React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger> & ButtonProps
  content: {
    label?: React.ComponentPropsWithoutRef<typeof DropdownMenuLabel>
    options: DropdownMenuOptionsType
  } & React.ComponentPropsWithoutRef<typeof DropdownMenuContent>
}

export type ItemActionOpenState = {
  id: `${DropdownMenuOptionsDataType['actionType']}-${number}`
  value: boolean
}
export interface DropdownMenuContextType {
  open: ItemActionOpenState | null
  setOpen: React.Dispatch<React.SetStateAction<ItemActionOpenState | null>>
}

export const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null)

export const useDropdownMenuContext = () => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('useDropdownMenuContext must be used within a DropdownMenuContextProvider')
  }
  return context
}

export const DropdownMenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState<ItemActionOpenState | null>(null)
  return <DropdownMenuContext.Provider value={{ open, setOpen }}>{children}</DropdownMenuContext.Provider>
}

export function DropdownMenuView({ content, trigger, ...props }: DropdownMenuViewProps) {
  const { className: optionsClassName, options, label, align = 'end', ...contentProps } = content ?? {}

  const groupedOption = groupArrays(options?.group ?? [options?.optionsData?.length || 1], options?.optionsData ?? [])

  return (
    <DropdownMenu {...props}>
      <DropdownWrapperTrigger trigger={trigger} />

      <DropdownMenuContent align={align} className={cn('w-[200px]', optionsClassName)} {...contentProps}>
        <DropdownWrapperLabel label={label} />

        {groupedOption.map((group, idx) => {
          return (
            <React.Fragment key={`group-${idx}`}>
              {group.map((item, idx) => {
                const { nestedData, key: _key } = item

                const {
                  className: nestedClassName,
                  group: nestedGroup,
                  optionsData: nestedOptions,
                  ...nestedProps
                } = nestedData ?? {}

                const groupedNestedOption =
                  groupArrays(
                    nestedData?.group ?? [nestedData?.optionsData?.length || 1],
                    nestedData?.optionsData ?? [],
                  ) ?? []

                return (
                  <React.Fragment key={`item-${idx}`}>
                    {nestedData?.optionsData?.length ? (
                      <DropdownMenuSub key={`sub-item-${idx}`}>
                        <DropdownWrapperSubTrigger trigger={item} />
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className={cn('w-[200px]', nestedClassName)} {...nestedProps}>
                            {groupedNestedOption?.map((nestedItem, idx) => {
                              return (
                                <React.Fragment key={`nested-${idx}`}>
                                  <DropdownWrapperSubContent itemType={nestedData?.itemType} nestedData={nestedItem} />
                                  {idx !== groupedNestedOption?.length - 1 && (
                                    <DropdownMenuSeparator key={`separator-${idx}`} />
                                  )}
                                </React.Fragment>
                              )
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    ) : (
                      <DropdownWrapperContentItem idx={idx} item={item} itemType={options.itemType} />
                    )}
                  </React.Fragment>
                )
              })}
              {idx !== groupedOption.length - 1 && <DropdownMenuSeparator />}
            </React.Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DropdownWrapperTrigger({
  trigger,
}: {
  trigger: React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger> & ButtonProps
}) {
  return (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" {...trigger} />
    </DropdownMenuTrigger>
  )
}

export function DropdownWrapperLabel({ label }: { label?: React.ComponentProps<typeof DropdownMenuLabel> }) {
  const { className, ...props } = label ?? {}
  return (
    label && (
      <>
        <DropdownMenuLabel className={cn('text-sm', className)} {...props} />
        <DropdownMenuSeparator />
      </>
    )
  )
}

export function DropdownWrapperContentItem({
  item,
  itemType,
  idx,
}: {
  item: DropdownMenuOptionsDataType
  itemType: 'checkbox' | 'radio' | 'label'
  idx: number
}) {
  const {
    children,
    className,
    value,
    nestedData,
    actionType,
    key: _key,
    onClick,
    //FIX: removed this hence when i clicked on the item it is always focusing.
    autoFocus,
    ...props
  } = item

  const { setOpen } = useDropdownMenuContext()

  const Component =
    itemType === 'checkbox' ? DropdownMenuCheckboxItem : itemType === 'radio' ? DropdownMenuRadioItem : DropdownMenuItem

  return (
    <Component
      value={value as string}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          size: 'sm',
          className: 'flex gap-2 items-center justify-start px-2',
        }),
        itemType === 'checkbox' && 'pl-8',
        itemType === 'radio' && '[&_span_svg]:w-[.5rem] pl-8',
        className,
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen({
          id: `${actionType}-${idx}`,
          value: true,
        })
      }}
      {...props}>
      {item.icon && item.icon}
      {children}
      {item.command?.label && (
        <>
          <DropdownMenuShortcut {...item.command} children={item.command.children} />
          <Button
            className="sr-only hidden"
            command={{
              ...item.command,
              action: () => {
                setOpen({
                  id: `${actionType}-${idx}`,
                  value: true,
                })
                item.command?.action?.()
              },
            }}
          />
        </>
      )}
    </Component>
  )
}

export function DropdownWrapperSubTrigger({ trigger }: { trigger: DropdownMenuOptionsDataType }) {
  const { children, className, icon, ...props } = trigger
  return (
    // @ts-ignore
    <DropdownMenuSubTrigger
      className={cn(
        buttonVariants({
          variant: 'ghost',
          size: 'sm',
          className: 'w-full gap-2 px-2',
        }),
      )}
      {...props}>
      {icon}
      <span>{children}</span>
    </DropdownMenuSubTrigger>
  )
}

export function DropdownWrapperSubContent({
  nestedData,
  itemType,
}: {
  nestedData: DropdownMenuOptionsDataType[]
  itemType: 'checkbox' | 'radio' | 'label'
}) {
  const Children = nestedData.map((item, idx) => {
    const { children, value, icon: Icon, className, ...props } = item
    const { children: commandChildren, ...commandProps } = item.command ?? {}

    const Component =
      itemType === 'checkbox'
        ? DropdownMenuCheckboxItem
        : itemType === 'radio'
          ? DropdownMenuRadioItem
          : DropdownMenuItem
    console.log(value)

    return (
      <Component
        value={value as string}
        checked={true}
        key={`nested-item-${idx}`}
        className={cn(
          buttonVariants({
            variant: 'ghost',
            size: 'sm',
          }),
          'flex gap-2 items-center justify-start',
          itemType !== 'label' && 'pl-8',
          itemType === 'radio' && '[&_span_svg]:w-[.5rem]',
          className,
        )}
        {...props}>
        {Icon && Icon}
        {children}
        {item.command && (
          <>
            <DropdownMenuShortcut children={commandChildren} {...commandProps} key={`nested-item-shortcut-${idx}`} />
            <Button command={item.command} className="sr-only hidden" />
          </>
        )}
      </Component>
    )
  })

  return itemType === 'radio' ? <DropdownMenuRadioGroup value="date">{Children}</DropdownMenuRadioGroup> : Children
}
