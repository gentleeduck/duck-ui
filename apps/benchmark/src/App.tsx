// import NativeButton from './duck/button/native'
// import NativeTextarea from './duck/textarea/native'
// import DuckButton from './duck/button/duck'
// import ShadcnButton from './duck/button/button'
// import DuckTextarea from './duck/textarea/duck'
// import ShadcnTextarea from './duck/textarea/textarea'
// import DuckTabs from './duck/tabs/duck'
// import ShadcnTabs from './duck/tabs/tabs'
// import DuckToggleGroup from './duck/toggle-group/duck'
// import ShadcnToggleGroup from './duck/toggle-group/toggle-group'
// import DuckToggle from './duck/toggle/duck'
// import ShadcnToggle from './duck/toggle/toggle'
// import DuckBadge from './duck/badge/duck'
// import ShadcnBadge from './duck/badge/badge'

// import { lazy } from 'react'

// import DuckLabel from './duck/label/duck'
// import ShadcnLabel from './duck/label/label'
// import DuckCheckbox from './duck/checkbox/duck'
// import ShadcnCheckbox from './duck/checkbox/checkbox'
// import DuckSwitch from './duck/switch/duck'
// import ShadcnSwitch from './duck/switch/switch'
// import DuckRadioGroup from './duck/radio-group/duck'
// import ShadcnRadioGroup from './duck/radio-group/radio-group'
// import DuckInput from './duck/input/duck'
// import ShadcnInput from './duck/input/input'
// import DuckScrollAreaExp from './duck/scroll-area/experimental'
// import DuckScrollArea from './duck/scroll-area/duck'
// import ShadcnScrollArea from './duck/scroll-area/scroll-area'
// import DuckHoverCard from './duck/hover-card/duck'
// import ShadcnHoverCard from './duck/hover-card/hover-card'
// import DuckSlider from './duck/slider/duck'
// import ShadcnSlider from './duck/slider/slider'
// import DuckAccordion from './duck/accordion/duck'
// import ShadcnAccordion from './duck/accordion/accordion'
// import DuckProgress from './duck/progress/duck'
// import ShadcnProgress from './duck/progress/progress'
// import DuckSelect from './duck/select/duck'
// import ShadcnSelect from './duck/select/select'
// import DuckSeparator from './duck/separator/duck'
// import DuckSeparatorExp from './duck/separator/experimental'
// import ShadcnSeparator from './duck/separator/separator'

// import Sandbox from './sandbox'

// import DuckSeparator from './duck/separator/duck'
// import DuckSeparatorExp from './duck/separator/experimental'
// import ShadcnSeparator from './duck/separator/separator'

import { KeyProvider } from '../../../packages/duck-vim/src/react/command'
import Dialog from './example/dialog'
import Dropdown from './example/dropdown'
import HoverCard from './example/hover-card'
import Popover from './example/popover'
import Select from './example/select'
import Tooltip from './example/tooltip'

// import Command from './example/command'

// import Command from "./example/command/duck"
// import CmdK from './example/command/cmdk'
// import CommandShadcn from "./example/command/shadcn"
// import DrawerExample from './example/drawer'
// import DuckSkeleton from './duck/skeleton/duck'
// import ShadcnSkeleton from './duck/skeleton/skeleton'

// import DuckSonner from './duck/sonner/duck'
// import ShadcnSonner from './duck/sonner/sonner'
// function Ui() {
//   return (<>
//     {/* <div className='flex flex-col gap-4 p-4'>
//       <NativeButton />
//       <NativeTextarea />
//     </div> */}

//     {/* <div className='flex flex-col gap-4 p-4'>
//       <DuckButton />
//       <DuckTextarea />
//       <DuckTabs />
//       <DuckToggleGroup />
//       <DuckToggle />
//       <DuckBadge />
//       <DuckLabel />
//       <DuckCheckbox />
//       <DuckSwitch />
//     </div>

//     <div className='flex flex-col gap-4 p-4'>
//       <ShadcnButton />
//       <ShadcnTextarea />
//       <ShadcnTabs />

//       <ShadcnToggleGroup />
//       <ShadcnToggle />
//       <ShadcnBadge />
//       <ShadcnLabel />
//       <ShadcnCheckbox />
//       <ShadcnSwitch />
//     </div> */}
//   </>

//   )
// }

function App() {
  return (
    <KeyProvider timeoutMs={100}>
      <div className="mx-10 flex h-screen flex-col items-center justify-center gap-4 my-[0vh]">
        <Select />
      </div>
    </KeyProvider>
  )
}

export default App
