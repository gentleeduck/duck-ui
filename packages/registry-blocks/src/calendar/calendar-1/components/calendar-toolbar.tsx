'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react'
import type { CalendarView, FilterMode } from '../calendar-data'
import { formatViewHeading, formatViewSubheading } from '../calendar-utils'

interface ICalendarToolbarProps {
  viewedDate: Date
  calendarView: CalendarView
  filterMode: FilterMode
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: CalendarView) => void
  onFilterChange: (filter: FilterMode) => void
  onSearchOpen: () => void
  onAddEvent: () => void
}

const VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Month view',
  week: 'Week view',
  day: 'Day view',
  year: 'Year view',
}
const FILTER_LABELS: Record<FilterMode, string> = {
  all: 'All events',
  shared: 'Shared',
  public: 'Public',
  archived: 'Archived',
}

export function CalendarToolbar({
  viewedDate,
  calendarView,
  filterMode,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onFilterChange,
  onSearchOpen,
  onAddEvent,
}: ICalendarToolbarProps) {
  const today = new Date()
  const todayMonth = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const todayDay = today.getDate()
  const sub = formatViewSubheading(viewedDate, calendarView)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Left: date badge + heading */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center rounded-lg border px-3 py-1.5">
          <span className="font-bold text-[10px] text-primary leading-tight">{todayMonth}</span>
          <span className="font-bold text-lg leading-tight">{todayDay}</span>
        </div>
        <div>
          <h2 className="font-semibold text-lg">{formatViewHeading(viewedDate, calendarView)}</h2>
          {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
        </div>
      </div>

      {/* Right: filter + search + nav + view + add */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterIcon className="me-1.5 size-3.5" />
              {FILTER_LABELS[filterMode]}
              <ChevronDownIcon className="ms-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange('all')}>All events</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('shared')}>Shared</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('public')}>Public</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('archived')}>Archived</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="size-8" onClick={onSearchOpen}>
          <SearchIcon className="size-4" />
        </Button>

        <ButtonGroup>
          <Button variant="outline" size="icon" className="size-8" onClick={onPrev} aria-label="Previous">
            <ChevronLeftIcon className="size-4 rtl:rotate-180" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday} aria-label="Go to today">
            Today
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={onNext} aria-label="Next">
            <ChevronRightIcon className="size-4 rtl:rotate-180" />
          </Button>
        </ButtonGroup>

        {/* View switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarIcon className="me-1.5 size-3.5" />
              {VIEW_LABELS[calendarView]}
              <ChevronDownIcon className="ms-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewChange('day')}>Day view</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewChange('week')}>Week view</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewChange('month')}>Month view</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewChange('year')}>Year view</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={onAddEvent}>
          <PlusIcon className="me-1.5 size-3.5" />
          Add event
        </Button>
      </div>
    </div>
  )
}
