import { DirectionProvider } from '@gentleduck/registry-ui/direction'
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
    paymentStatus: 'غير مدفوع',
    totalAmount: '$180.00',
  },
  {
    invoice: 'INV102',
    paymentMethod: 'بطاقة ائتمان',
    paymentStatus: 'مدفوع',
    totalAmount: '$720.00',
  },
  {
    invoice: 'INV103',
    paymentMethod: 'PayPal',
    paymentStatus: 'قيد الانتظار',
    totalAmount: '$95.00',
  },
  {
    invoice: 'INV104',
    paymentMethod: 'تحويل بنكي',
    paymentStatus: 'مدفوع',
    totalAmount: '$1,250.00',
  },
  {
    invoice: 'INV105',
    paymentMethod: 'بطاقة خصم',
    paymentStatus: 'غير مدفوع',
    totalAmount: '$430.00',
  },
  {
    invoice: 'INV106',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'قيد الانتظار',
    totalAmount: '$610.00',
  },
  {
    invoice: 'INV107',
    paymentMethod: 'Google Pay',
    paymentStatus: 'مدفوع',
    totalAmount: '$390.00',
  },
]

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Table>
        <TableCaption>{'قائمة بأحدث فواتيرك.'}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{'الفاتورة'}</TableHead>
            <TableHead>{'الحالة'}</TableHead>
            <TableHead>{'طريقة الدفع'}</TableHead>
            <TableHead className="text-end">{'المبلغ'}</TableHead>
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
            <TableCell colSpan={3}>{'الإجمالي'}</TableCell>
            <TableCell className="text-end">$3,675.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </DirectionProvider>
  )
}
