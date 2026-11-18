'use client'

import {
  MotionTypographyH3,
  MotionTypographyInlineCode,
  MotionTypographyLead,
  MotionTypographyList,
  MotionTypographyMuted,
  MotionTypographyTable,
  TypographyTd,
  TypographyTh,
  TypographyTr,
} from '@gentleduck/registry-ui/typography'

export default function Demo() {
  return (
    <div className="w-full max-w-lg">
      <MotionTypographyH3 index={0}>Version 2.4</MotionTypographyH3>
      <MotionTypographyLead index={1}>The calendar selects ranges.</MotionTypographyLead>
      <MotionTypographyMuted index={2}>
        Pass <MotionTypographyInlineCode index={3}>mode="range"</MotionTypographyInlineCode> to turn it on.
      </MotionTypographyMuted>
      <MotionTypographyList index={3}>
        <li>A first click sets the start</li>
        <li className="font-medium">A second click sets the end</li>
      </MotionTypographyList>
      <MotionTypographyTable index={6}>
        <thead>
          <TypographyTr>
            <TypographyTh>Prop</TypographyTh>
            <TypographyTh>Value</TypographyTh>
          </TypographyTr>
        </thead>
        <tbody>
          <TypographyTr>
            <TypographyTd>mode</TypographyTd>
            <TypographyTd>"range"</TypographyTd>
          </TypographyTr>
        </tbody>
      </MotionTypographyTable>
    </div>
  )
}
