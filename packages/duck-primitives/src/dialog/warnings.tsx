import * as React from 'react'
import type { IDialog } from './dialog.types'

const WarningContext = React.createContext<IDialog.IWarningNames>({
  contentName: 'DialogContent',
  titleName: 'DialogTitle',
  descriptionName: 'DialogDescription',
})

/** Names the parts the dev warnings speak of, for a component built on the dialog. Production renders the children alone. */
export const WarningProvider = ({ children, ...names }: React.PropsWithChildren<IDialog.IWarningNames>) =>
  process.env.NODE_ENV !== 'production' ? (
    <WarningContext.Provider value={names}>{children}</WarningContext.Provider>
  ) : (
    children
  )

/** Dev-only: errors when the content mounts with no title and no name of its own. */
export const TitleWarning: React.FC<IDialog.ITitleWarningProps> = ({ titles, named }) => {
  const { contentName, titleName } = React.useContext(WarningContext)

  const MESSAGE = `\`${contentName}\` requires a \`${titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleName}\`, you can wrap it with our VisuallyHidden component.`

  React.useEffect(() => {
    if (!named && !titles.size) console.error(MESSAGE)
  }, [MESSAGE, titles, named])

  return null
}

/** Dev-only: warns when the content mounts with no description and no `aria-describedby` of its own. */
export const DescriptionWarning: React.FC<IDialog.IDescriptionWarningProps> = ({ descriptions, described }) => {
  const { contentName, descriptionName } = React.useContext(WarningContext)

  const MESSAGE = `\`${contentName}\` requires a description for the component to be accessible for screen reader users.

Render \`${descriptionName}\` inside it, pass \`aria-describedby\` the id of a description of your own, or pass \`aria-describedby={undefined}\` when it needs none.`

  React.useEffect(() => {
    if (!described && !descriptions.size) console.warn(MESSAGE)
  }, [MESSAGE, descriptions, described])

  return null
}
