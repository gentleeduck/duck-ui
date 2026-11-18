import { TypographyTable, TypographyTd, TypographyTh, TypographyTr } from '@gentleduck/registry-ui/typography'

const PLANS = [
  { name: 'Starter', price: '$0', seats: '1' },
  { name: 'Team', price: '$24', seats: '10' },
  { name: 'Business', price: '$96', seats: '50' },
]

export default function Demo() {
  return (
    <TypographyTable aria-label="Plans" wrapperClassName="max-w-md">
      <thead>
        <TypographyTr>
          <TypographyTh>Plan</TypographyTh>
          <TypographyTh align="center">Seats</TypographyTh>
          <TypographyTh align="right">Price a month</TypographyTh>
        </TypographyTr>
      </thead>
      <tbody>
        {PLANS.map((plan) => (
          <TypographyTr key={plan.name}>
            <TypographyTd>{plan.name}</TypographyTd>
            <TypographyTd align="center">{plan.seats}</TypographyTd>
            <TypographyTd align="right">{plan.price}</TypographyTd>
          </TypographyTr>
        ))}
      </tbody>
    </TypographyTable>
  )
}
