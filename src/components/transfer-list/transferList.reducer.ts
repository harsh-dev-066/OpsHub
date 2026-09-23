import type { TransferSide } from '@/components/transfer-list/types'

export type TransferListState = {
  filters: Record<TransferSide, string>
  selected: Record<TransferSide, ReadonlySet<string>>
  active: Record<TransferSide, string | null>
}

export type TransferListAction =
  | { type: 'setFilter'; side: TransferSide; value: string }
  | {
      type: 'pointerSelect'
      side: TransferSide
      id: string
    }
  | { type: 'clear' }

const EMPTY: ReadonlySet<string> = new Set()

export const initialTransferListState: TransferListState = {
  filters: { available: '', chosen: '' },
  selected: { available: EMPTY, chosen: EMPTY },
  active: { available: null, chosen: null },
}

export function transferListReducer(
  state: TransferListState,
  action: TransferListAction,
): TransferListState {
  switch (action.type) {
    case 'setFilter':
      return {
        ...state,
        filters: { ...state.filters, [action.side]: action.value },
        selected: { ...state.selected, [action.side]: EMPTY },
        active: { ...state.active, [action.side]: null },
      }
    case 'pointerSelect': {
      const next = new Set(state.selected[action.side])
      if (next.has(action.id)) next.delete(action.id)
      else next.add(action.id)
      return {
        ...state,
        selected: { ...state.selected, [action.side]: next },
        active: { ...state.active, [action.side]: action.id },
      }
    }
    case 'clear':
      return {
        ...state,
        selected: { available: EMPTY, chosen: EMPTY },
        active: { available: null, chosen: null },
      }
    default:
      return state
  }
}
