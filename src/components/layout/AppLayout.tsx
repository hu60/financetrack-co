import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="min-h-svh bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="md:ml-64 pb-20 md:pb-0 min-h-svh">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
