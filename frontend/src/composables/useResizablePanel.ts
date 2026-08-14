import { onBeforeUnmount, ref } from 'vue'

export interface UseResizablePanelOptions {
  /** localStorage key used to remember the user's chosen width. */
  storageKey: string
  defaultWidth: number
  minWidth: number
  maxWidth: number
}

/**
 * Drag-to-resize behavior for a side panel, similar to an HTML `<textarea>`
 * resize handle: the user can grab an edge and drag it, the width is
 * clamped between `minWidth` and `maxWidth` so the panel never loses its
 * layout, and the chosen width is remembered across sessions.
 */
export function useResizablePanel(options: UseResizablePanelOptions) {
  const { storageKey, defaultWidth, minWidth, maxWidth } = options

  function clampWidth(value: number): number {
    return Math.min(maxWidth, Math.max(minWidth, value))
  }

  function getStoredWidth(): number {
    const stored = localStorage.getItem(storageKey)
    const parsed = stored ? Number(stored) : NaN

    return Number.isFinite(parsed) ? clampWidth(parsed) : defaultWidth
  }

  const width = ref(getStoredWidth())
  const isResizing = ref(false)

  let startX = 0
  let startWidth = 0

  function handlePointerMove(event: PointerEvent): void {
    width.value = clampWidth(startWidth + (event.clientX - startX))
  }

  function stopResize(): void {
    if (!isResizing.value) {
      return
    }

    isResizing.value = false
    localStorage.setItem(storageKey, String(width.value))
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopResize)
  }

  function startResize(event: PointerEvent): void {
    isResizing.value = true
    startX = event.clientX
    startWidth = width.value

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopResize)
    event.preventDefault()
  }

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopResize)
  })

  return { width, isResizing, startResize }
}
