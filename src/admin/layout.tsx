import React, { type ReactNode} from 'react'

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>Admin Layout
        {children}
    </div>
  )
}
 
export default AdminLayout