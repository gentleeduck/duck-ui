import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'

export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-3 text-muted-foreground text-sm">
      <p className="flex items-center gap-2">
        Search <Kbd keys="mod+k" />
      </p>
      <p className="flex items-center gap-2">
        Command palette <Kbd keys="mod+shift+p" />
      </p>
      <p className="flex items-center gap-2">
        New line{' '}
        <KbdGroup>
          <Kbd keys="shift+enter" />
          <span>or</span>
          <Kbd keys="alt+enter" />
        </KbdGroup>
      </p>
    </div>
  )
}
