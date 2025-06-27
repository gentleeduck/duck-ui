import DuckDialog from '../duck/dialog/duck'
import ShadcnDialog from '../duck/dialog/dialog'
import DuckAlertDialog from '../duck/alert-dialog/duck'
import ShadcnAlertDialog from '../duck/alert-dialog/alert-dialog'
import DuckSheet from '../duck/sheet/duck'
import ShadcnSheet from '../duck/sheet/sheet'
// import DuckDrawer from '../duck/drawer/duck'
// import ShadcnDrawer from '../duck/drawer/drawer'
// import DrawerExample from './drawer'

function Dialog() {
  return (
    <>
      <DuckDialog />
      <ShadcnDialog />
      {/* <DuckDrawer side='bottom' /> */}
      {/* <DuckDrawer side='left' /> */}
      {/* <DuckDrawer side='right' /> */}
      {/* <DuckDrawer side="top" /> */}
      {/* <ShadcnDrawer /> */}
      {/* <DrawerExample /> */}
    </>
  )
}

export default Dialog
