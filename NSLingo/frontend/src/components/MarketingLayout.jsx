import { Outlet } from 'react-router-dom'
import MarketingNavbar from './MarketingNavbar.jsx'

// Shell for the public landing page (light navbar, full-width content).
export default function MarketingLayout() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <Outlet />
      </main>
    </>
  )
}
