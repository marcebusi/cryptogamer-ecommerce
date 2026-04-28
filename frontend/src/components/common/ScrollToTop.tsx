import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls window to (0,0) instantly on every route/search-param change */
export default function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, search])
  return null
}
