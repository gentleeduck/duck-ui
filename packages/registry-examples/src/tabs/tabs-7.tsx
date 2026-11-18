import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gentleduck/registry-ui/tabs'
import { Bell, CreditCard, User } from 'lucide-react'

export default function Demo() {
  return (
    <Tabs className="flex w-full max-w-md gap-4" defaultValue="profile" orientation="vertical">
      <TabsList aria-label="Settings">
        <TabsTrigger className="justify-start" value="profile">
          <User aria-hidden="true" />
          Profile
        </TabsTrigger>
        <TabsTrigger className="justify-start" value="notifications">
          <Bell aria-hidden="true" />
          Notifications
        </TabsTrigger>
        <TabsTrigger
          className="justify-start"
          disabled
          title="Only the workspace owner can change billing"
          value="billing">
          <CreditCard aria-hidden="true" />
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent className="flex-1 space-y-1 rounded-lg border p-4 text-sm" value="profile">
        <p className="font-medium">Profile</p>
        <p className="text-muted-foreground">Your name and photo, as other members see them.</p>
      </TabsContent>
      <TabsContent className="flex-1 space-y-3 rounded-lg border p-4 text-sm" value="notifications">
        <p className="font-medium">Notifications</p>
        <div className="flex items-center gap-2">
          <Switch defaultChecked id="tabs-vertical-mentions" />
          <Label htmlFor="tabs-vertical-mentions">Email me when I am mentioned</Label>
        </div>
      </TabsContent>
      <TabsContent className="flex-1 rounded-lg border p-4 text-sm" value="billing">
        Billing
      </TabsContent>
    </Tabs>
  )
}
