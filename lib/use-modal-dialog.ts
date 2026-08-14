'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'summary:not([tabindex="-1"])',
  '[contenteditable="true"]:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

type UseModalDialogOptions = {
  isOpen: boolean
  onClose: () => void
}

function getFocusableElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => !element.closest('[aria-hidden="true"], [inert]'))
}

export function useModalDialog({ isOpen, onClose }: UseModalDialogOptions) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const initialFocusRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return

    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    returnFocusRef.current = triggerRef.current
      ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)

    document.body.style.overflow = 'hidden'

    const focusInitialElement = () => {
      const firstFocusable = getFocusableElements(dialog)[0]
      const initialElement = initialFocusRef.current ?? firstFocusable ?? dialog
      initialElement.focus()
    }

    const animationFrame = window.requestAnimationFrame(focusInitialElement)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusableElements(dialog)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) {
        event.preventDefault()
        dialog.focus()
        return
      }

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault()
        const nextFocus = event.shiftKey ? last : first
        nextFocus.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        focusInitialElement()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)

      const returnTarget = returnFocusRef.current
      if (returnTarget?.isConnected) returnTarget.focus()
      returnFocusRef.current = null
    }
  }, [isOpen])

  return {
    dialogRef,
    triggerRef,
    initialFocusRef,
  }
}
