import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@gentleduck/registry-ui/table'

const invoices = [
  {
    invoice: 'INV101',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Unpaid',
    totalAmount: '$180.00',
  },
  {
    invoice: 'INV102',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    totalAmount: '$720.00',
  },
  {
    invoice: 'INV103',
    paymentMethod: 'PayPal',
    paymentStatus: 'Pending',
    totalAmount: '$95.00',
  },
  {
    invoice: 'INV104',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    totalAmount: '$1,250.00',
  },
  {
    invoice: 'INV105',
    paymentMethod: 'Debit Card',
    paymentStatus: 'Unpaid',
    totalAmount: '$430.00',
  },
  {
    invoice: 'INV106',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Pending',
    totalAmount: '$610.00',
  },
  {
    invoice: 'INV107',
    paymentMethod: 'Google Pay',
    paymentStatus: 'Paid',
    totalAmount: '$390.00',
  },
]

export default function Demo() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice} className="[&_td]:py-2">
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-end">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="[&_td]:py-2">
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-end">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
