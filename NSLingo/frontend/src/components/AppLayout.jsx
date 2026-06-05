import { Outlet } from 'react-router-dom'
import AppNavbar from './AppNavbar.jsx'
import Sidebar from './Sidebar.jsx'

// Shell for all in-app screens: dark navbar + left rail + content.
export default function AppLayout() {
  return (
    <>
      <AppNavbar />
      <div className="ns-shell">
        <div className="ns-shell__rail">
          <Sidebar />
        </div>
        <main className="ns-shell__main">
          <Outlet />
        </main>
      </div>
    </>
  )
}
