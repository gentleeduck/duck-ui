import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'

export default function Demo() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-12">
      <Avatar>
        <AvatarImage
          alt="gentleduck"
          src="https://github.com/gentleeduck/gentleduck/blob/master/apps/duck-ui-docs/public/static/LOGO.png?raw=true"
        />
        <AvatarFallback>GD</AvatarFallback>
      </Avatar>
      <Avatar className="rounded-lg">
        <AvatarImage alt="wildduck" src="https://avatars.githubusercontent.com/u/108896341?v=4" />
        <AvatarFallback className="rounded-lg">WD</AvatarFallback>
      </Avatar>
      <div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
        <Avatar>
          <AvatarImage
            alt="gentleduck"
            src="https://github.com/gentleeduck/gentleduck/blob/master/apps/duck-ui-docs/public/static/LOGO.png?raw=true"
          />
          <AvatarFallback>GD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage alt="wildduck" src="https://avatars.githubusercontent.com/u/108896341?v=4" />
          <AvatarFallback>WD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage
            alt="Guest"
            src="https://raw.githubusercontent.com/wildduck2/duck-starter-kit/15fbc61fb02cd21a873108b380ca12fe31f50099/apps/document-client/public/placeholder2.webp"
          />
          <AvatarFallback>GD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
