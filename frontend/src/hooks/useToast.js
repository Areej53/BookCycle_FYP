import { useState, useRef } from 'react'

export const useToast = () => {
  const [toast, setToast] = useState({ msg: '', show: false, err: false })
  const timer = useRef(null)
  const showToast = (msg, err = false) => {
    clearTimeout(timer.current)
    setToast({ msg, show: true, err })
    timer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2200)
  }
  return [toast, showToast]
}
