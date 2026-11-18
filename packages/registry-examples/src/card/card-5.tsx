import { Button } from '@gentleduck/registry-ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@gentleduck/registry-ui/card'

export default function Demo() {
  return (
    <Card className="w-[350px]">
      <CardHeader className="border-b">
        <CardTitle>Mill pond</CardTitle>
        <CardDescription>Twelve ducks, open all year.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Follow
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">The ducks are fed at nine and at four. Bring oats, never bread.</p>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="ghost">Share</Button>
        <Button>Visit</Button>
      </CardFooter>
    </Card>
  )
}
