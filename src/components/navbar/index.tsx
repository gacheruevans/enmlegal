import React, { useState } from 'react'
import { motion } from 'motion/react'
import {HiMenuAlt4, HiX} from 'react-icons/hi'

export const NavBar = () => {

    const [activeFilter, setActiveFilter] = useState('home');
    const [toggle, setToggle] = useState(false);

  return (
    <nav className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto">
        <a href="/" className="">
            <img src="" className="h-72" alt="ENMLegal Logo" />
        </a>
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="flex flex-col p-4 mt-4 font-medium list-none text-secondary md:p-0 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white">
                {['home', 'about', 'practice Areas', 'blog', 'contacts'].map((item)=> (
                    <li 
                        className={`capitalize nav-item ${activeFilter === item ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveFilter(item);
                        }}
                        key={`link-${item}`} 
                        >
                        <a 
                        href={`/${item}`} 
                        className={`${activeFilter === item ? 'item-active' : 'no-underline'}`}>{item}</a>
                    </li>))
                }
            </ul>
        </div>
        <div className='app__navbar-menu'>
        <HiMenuAlt4 onClick={() => setToggle(true)} />

        {toggle && (
            <motion.div
            whileInView={{ x: [300, 0] }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            >
            <HiX onClick={() => setToggle(false)} />
            <ul>
                {['home', 'about', 'practice Areas', 'blog', 'contacts'].map((item)=>(
                <li key={item} >
                    <a 
                    href={`/${item}`} 
                    onClick={(e) => { 
                        e.preventDefault();
                        setToggle(false); 
                        setActiveFilter(item); 
                    }}
                    className={`${activeFilter === item ? 'item-active' : ''}`} 
                    >
                    {item}
                    </a>
                </li>
                ))}
            </ul>
            </motion.div>
        )}
    </div>
    </nav>
    
  )
};
