import { describe, expect, it } from 'bun:test'
import * as Dialog from '../../dialog'
import * as Sheet from '../index'

describe('Sheet', () => {
  it('is Dialog under both its short and its sheet names', () => {
    expect([
      [Sheet.Root, Sheet.Sheet],
      [Sheet.Trigger, Sheet.SheetTrigger],
      [Sheet.Close, Sheet.SheetClose],
      [Sheet.Portal, Sheet.SheetPortal],
      [Sheet.Overlay, Sheet.SheetOverlay],
      [Sheet.Content, Sheet.SheetContent],
      [Sheet.Title, Sheet.SheetTitle],
      [Sheet.Description, Sheet.SheetDescription],
      [Sheet.createSheetScope],
    ]).toEqual([
      [Dialog.Root, Dialog.Root],
      [Dialog.Trigger, Dialog.Trigger],
      [Dialog.Close, Dialog.Close],
      [Dialog.Portal, Dialog.Portal],
      [Dialog.Overlay, Dialog.Overlay],
      [Dialog.Content, Dialog.Content],
      [Dialog.Title, Dialog.Title],
      [Dialog.Description, Dialog.Description],
      [Dialog.createDialogScope],
    ])
  })
})
