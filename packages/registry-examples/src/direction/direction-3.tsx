'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gentleduck/registry-ui/tabs'

const COMMANDS = [
  ['npm', 'npm install @gentleduck/primitives'],
  ['bun', 'bun add @gentleduck/primitives'],
  ['pnpm', 'pnpm add @gentleduck/primitives'],
] as const

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>التثبيت</CardTitle>
          <CardDescription>
            ثبّت الحزمة باستخدام مدير الحزم الذي تفضّله. تبقى الأوامر وتبويباتها من اليسار إلى اليمين.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DirectionProvider dir="ltr">
            <Tabs defaultValue="npm">
              <TabsList>
                {COMMANDS.map(([name]) => (
                  <TabsTrigger key={name} value={name}>
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {COMMANDS.map(([name, command]) => (
                <TabsContent key={name} value={name}>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm">
                    <code>{command}</code>
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </DirectionProvider>
        </CardContent>
      </Card>
    </DirectionProvider>
  )
}
