'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gentleduck/registry-ui/tabs'
import * as React from 'react'

function Draft() {
  const [text, setText] = React.useState('')
  return (
    <textarea
      className="w-full rounded-md border p-2 text-sm"
      onChange={(event) => setText(event.target.value)}
      placeholder="Type, switch tabs and come back"
      rows={3}
      value={text}
    />
  )
}

export default function Demo() {
  return (
    <Tabs className="w-[360px]" defaultValue="write">
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent forceMount value="write">
        <Draft />
      </TabsContent>
      <TabsContent value="preview">
        <p className="text-muted-foreground text-sm">forceMount keeps the draft mounted, so its text survives.</p>
      </TabsContent>
    </Tabs>
  )
}
