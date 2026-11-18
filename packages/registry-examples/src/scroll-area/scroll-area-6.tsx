import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const regions = ['North', 'South', 'East', 'West', 'Central', 'Coastal', 'Highlands', 'Islands', 'Metro', 'Rural']

export default function Demo() {
  return (
    <ScrollArea className="h-64 w-80 rounded-md border">
      <table className="w-max border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky top-0 bg-background px-3 py-2 text-start font-medium">Region</th>
            {months.map((month) => (
              <th className="sticky top-0 bg-background px-3 py-2 text-end font-medium" key={month}>
                {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region, row) => (
            <tr className="border-t" key={region}>
              <td className="px-3 py-2">{region}</td>
              {months.map((month, column) => (
                <td className="px-3 py-2 text-end tabular-nums" key={month}>
                  {((row + 3) * (column + 7) * 37) % 900}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}
