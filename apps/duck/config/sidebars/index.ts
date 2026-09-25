import { duckAuthSidebar } from './duck-auth'
import { duckCalendarSidebar } from './duck-calendar'
import { duckCliSidebar } from './duck-cli'
import { duckErrorSidebar } from './duck-error'
import { duckGenSidebar } from './duck-gen'
import { duckHooksSidebar } from './duck-hooks'
import { duckIamSidebar } from './duck-iam'
import { duckLazySidebar } from './duck-lazy'
import { duckLibsSidebar } from './duck-libs'
import { duckMotionSidebar } from './duck-motion'
import { duckPrimitivesSidebar } from './duck-primitives'
import { duckQuerySidebar } from './duck-query'
import { duckRegistryBuildSidebar } from './duck-registry-build'
import { duckShortcutSidebar } from './duck-shortcut'
import { duckStateSidebar } from './duck-state'
import { duckTemplateSidebar } from './duck-template'
import { duckTtestSidebar } from './duck-ttest'
import { duckTtlogSidebar } from './duck-ttlog'
import { duckUiSidebar } from './duck-ui'
import { duckUploadSidebar } from './duck-upload'
import { duckVariantsSidebar } from './duck-variants'
import { duckVimSidebar } from './duck-vim'

export { duckAuthSidebar } from './duck-auth'
export { duckCalendarSidebar } from './duck-calendar'
export { duckCliSidebar } from './duck-cli'
export { duckErrorSidebar } from './duck-error'
export { duckGenSidebar } from './duck-gen'
export { duckHooksSidebar } from './duck-hooks'
export { duckIamSidebar } from './duck-iam'
export { duckLazySidebar } from './duck-lazy'
export { duckLibsSidebar } from './duck-libs'
export { duckMotionSidebar } from './duck-motion'
export { duckPrimitivesSidebar } from './duck-primitives'
export { duckQuerySidebar } from './duck-query'
export { duckRegistryBuildSidebar } from './duck-registry-build'
export { duckShortcutSidebar } from './duck-shortcut'
export { duckStateSidebar } from './duck-state'
export { duckTemplateSidebar } from './duck-template'
export { duckTtestSidebar } from './duck-ttest'
export { duckTtlogSidebar } from './duck-ttlog'
export { duckUiSidebar } from './duck-ui'
export { duckUploadSidebar } from './duck-upload'
export { duckVariantsSidebar } from './duck-variants'
export { duckVimSidebar } from './duck-vim'
export type { ITypedSidebarItem, ITypedSidebarSection } from './types'
export { defineSidebar } from './types'
export { wwwSidebar } from './www'

export const packageSidebars = {
  'duck-auth': duckAuthSidebar,
  'duck-calendar': duckCalendarSidebar,
  'duck-cli': duckCliSidebar,
  'duck-error': duckErrorSidebar,
  'duck-gen': duckGenSidebar,
  'duck-hooks': duckHooksSidebar,
  'duck-iam': duckIamSidebar,
  'duck-lazy': duckLazySidebar,
  'duck-libs': duckLibsSidebar,
  'duck-motion': duckMotionSidebar,
  'duck-primitives': duckPrimitivesSidebar,
  'duck-query': duckQuerySidebar,
  'duck-registry-build': duckRegistryBuildSidebar,
  'duck-shortcut': duckShortcutSidebar,
  'duck-state': duckStateSidebar,
  'duck-template': duckTemplateSidebar,
  'duck-ttest': duckTtestSidebar,
  'duck-ttlog': duckTtlogSidebar,
  'duck-ui': duckUiSidebar,
  'duck-upload': duckUploadSidebar,
  'duck-variants': duckVariantsSidebar,
  'duck-vim': duckVimSidebar,
} as const
