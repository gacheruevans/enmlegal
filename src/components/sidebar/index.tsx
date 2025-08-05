import React from 'react'
import { Link } from 'react-router'

const navigation = [
    { href: "posts", label: "Blog Posts" },
    { href: "views", label: "views" },
    { href: "users", label: "Users" },
];

const DashboardSidebar = () => {
  return (
    <nav className="absolute h-full text-white bg-slate-800 w-62 ">
        <div>
            {
                navigation.map(({ href, label }) => {
                    // const isActive = pathname.includes(href);
                    // ${isActive ? "bg-slate-600 border-r-4 border-blue-300" : ""}
                    return (
                        <div
                            key={href}
                            className={`border-b-1 border-b-slate-400 p-6 hover:bg-slate-400 `}
                        >
                            <Link to={href}>
                                {label}
                            </Link>
                        </div>
                    );
                })
            }
        </div>
    </nav>
  )
}

export default DashboardSidebar