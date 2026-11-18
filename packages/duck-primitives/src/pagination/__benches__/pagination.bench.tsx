import { Pagination as Ark } from '@ark-ui/react/pagination'
import * as Duck from '@gentleduck/primitives/pagination'
import type { IBench } from '../../__benches__/bench.types'

const PAGES = [3, 5]

export default {
  name: 'Pagination',
  note: 'Page 3 to page 5 of 10, with first, previous, the page range, next and last.',
  size: {
    ark: {
      names: [
        'PaginationRoot',
        'PaginationContext',
        'PaginationFirstTrigger',
        'PaginationPrevTrigger',
        'PaginationItem',
        'PaginationEllipsis',
        'PaginationNextTrigger',
        'PaginationLastTrigger',
      ],
      from: '@ark-ui/react/pagination',
    },
  },
  runtime: {
    overlay: false,
    view: {
      duck: (on) => (
        <Duck.Root pageCount={10} page={PAGES[+on]}>
          <Duck.Content>
            <Duck.Item>
              <Duck.First />
            </Duck.Item>
            <Duck.Item>
              <Duck.Previous />
            </Duck.Item>
            <Duck.Pages />
            <Duck.Item>
              <Duck.Next />
            </Duck.Item>
            <Duck.Item>
              <Duck.Last />
            </Duck.Item>
          </Duck.Content>
        </Duck.Root>
      ),
      ark: (on) => (
        <Ark.Root count={100} pageSize={10} page={PAGES[+on]}>
          <Ark.FirstTrigger>first</Ark.FirstTrigger>
          <Ark.PrevTrigger>previous</Ark.PrevTrigger>
          <Ark.Context>
            {(pagination) =>
              pagination.pages.map((page, index) =>
                page.type === 'page' ? (
                  <Ark.Item key={`page-${page.value}`} {...page}>
                    {page.value}
                  </Ark.Item>
                ) : (
                  <Ark.Ellipsis key={`ellipsis-${index}`} index={index}>
                    ...
                  </Ark.Ellipsis>
                ),
              )
            }
          </Ark.Context>
          <Ark.NextTrigger>next</Ark.NextTrigger>
          <Ark.LastTrigger>last</Ark.LastTrigger>
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
