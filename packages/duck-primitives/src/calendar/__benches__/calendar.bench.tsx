import { DatePicker as Ark, parseDate } from '@ark-ui/react/date-picker'
import { NativeAdapter } from '@gentleduck/calendar'
import * as Duck from '@gentleduck/primitives/calendar'
import { CalendarDate } from '@internationalized/date'
import { Button as AriaButton, Calendar, CalendarCell, CalendarGrid, Heading } from 'react-aria-components'
import { DayPicker } from 'react-day-picker'
import type { IBench } from '../../__benches__/bench.types'
import { noop } from '../../__benches__/fixtures'

// One single-month calendar per copy, its selection moving from March 10 to March 12. Each value is made once, so an
// update hands a library one new value, as a parent holding the selection in state would.
const adapter = new NativeAdapter()
const march = new Date(2026, 2, 1)
const days = [new Date(2026, 2, 10), new Date(2026, 2, 12)]
const ariaDays = [new CalendarDate(2026, 3, 10), new CalendarDate(2026, 3, 12)]
const arkDays = [[parseDate('2026-03-10')], [parseDate('2026-03-12')]]

export default {
  name: 'Calendar',
  note: "gentleduck's figure includes the `NativeAdapter` it needs. Ark UI has no calendar of its own, so it is its DatePicker drawn inline; React Aria and Ark UI are the parts a single-month calendar draws, react-day-picker its whole `DayPicker` with the date-fns it requires.",
  duck: ['@gentleduck/primitives/calendar', { names: ['NativeAdapter'], from: '@gentleduck/calendar' }],
  size: {
    'react-aria': {
      names: [
        'Calendar',
        'CalendarGrid',
        'CalendarGridHeader',
        'CalendarHeaderCell',
        'CalendarGridBody',
        'CalendarCell',
        'Heading',
        'Button',
      ],
      from: 'react-aria-components',
    },
    ark: {
      names: [
        'DatePickerRoot',
        'DatePickerView',
        'DatePickerContext',
        'DatePickerViewControl',
        'DatePickerPrevTrigger',
        'DatePickerViewTrigger',
        'DatePickerRangeText',
        'DatePickerNextTrigger',
        'DatePickerTable',
        'DatePickerTableHead',
        'DatePickerTableHeader',
        'DatePickerTableBody',
        'DatePickerTableRow',
        'DatePickerTableCell',
        'DatePickerTableCellTrigger',
      ],
      from: '@ark-ui/react/date-picker',
    },
    'react-day-picker': { names: ['DayPicker'], from: 'react-day-picker' },
  },
  runtime: {
    overlay: false,
    view: {
      duck: (on) => (
        <Duck.Root adapter={adapter} mode="single" defaultMonth={march} selected={days[+on]} onSelect={noop}>
          <Duck.Header />
          <Duck.Nav />
          <Duck.Grid />
        </Duck.Root>
      ),
      'react-aria': (on) => (
        <Calendar aria-label="Calendar" value={ariaDays[+on]} onChange={noop}>
          <header>
            <AriaButton slot="previous">prev</AriaButton>
            <Heading />
            <AriaButton slot="next">next</AriaButton>
          </header>
          <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
        </Calendar>
      ),
      ark: (on) => (
        <Ark.Root inline value={arkDays[+on]} onValueChange={noop}>
          <Ark.View view="day">
            <Ark.Context>
              {(picker) => (
                <>
                  <Ark.ViewControl>
                    <Ark.PrevTrigger>prev</Ark.PrevTrigger>
                    <Ark.ViewTrigger>
                      <Ark.RangeText />
                    </Ark.ViewTrigger>
                    <Ark.NextTrigger>next</Ark.NextTrigger>
                  </Ark.ViewControl>
                  <Ark.Table>
                    <Ark.TableHead>
                      <Ark.TableRow>
                        {picker.weekDays.map((weekDay) => (
                          <Ark.TableHeader key={weekDay.long}>{weekDay.narrow}</Ark.TableHeader>
                        ))}
                      </Ark.TableRow>
                    </Ark.TableHead>
                    <Ark.TableBody>
                      {picker.weeks.map((week) => (
                        <Ark.TableRow key={week[0]?.toString()}>
                          {week.map((day) => (
                            <Ark.TableCell key={day.toString()} value={day}>
                              <Ark.TableCellTrigger>{day.day}</Ark.TableCellTrigger>
                            </Ark.TableCell>
                          ))}
                        </Ark.TableRow>
                      ))}
                    </Ark.TableBody>
                  </Ark.Table>
                </>
              )}
            </Ark.Context>
          </Ark.View>
        </Ark.Root>
      ),
      'react-day-picker': (on) => <DayPicker mode="single" defaultMonth={march} selected={days[+on]} onSelect={noop} />,
    },
  },
} satisfies IBench.ICase
