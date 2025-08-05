import React, { type ReactNode} from 'react'
import SideBar from '../components/sidebar'

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      Admin Layout
      <SideBar />
      {children}
    </div>
  )
}
 
export default AdminLayout