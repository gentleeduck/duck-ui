import * as dialog from '@gentleduck/registry-ui-duckui/dialog'
import { Input } from '@gentleduck/registry-ui-duckui/input'
import { Label } from '@gentleduck/registry-ui-duckui/label'

export default function DialogDemo() {
  return (
    <dialog.Dialog open>
      <dialog.DialogTrigger variant="outline">Edit Profile</dialog.DialogTrigger>
      <dialog.DialogContent renderOnce className="sm:max-w-[425px]">
        <dialog.DialogHeader>
          <dialog.DialogTitle>Edit profile</dialog.DialogTitle>
          <dialog.DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </dialog.DialogDescription>
        </dialog.DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" defaultValue="@peduarte" className="col-span-3" />
          </div>
        </div>
        <dialog.DialogFooter>
          <dialog.DialogTrigger>Save changes</dialog.DialogTrigger>
        </dialog.DialogFooter>
      </dialog.DialogContent>
    </dialog.Dialog>
  )
}
