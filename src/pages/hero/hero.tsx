'use client'

import  { NavBar }  from '../../components/navbar'
import { motion } from 'motion/react'

const Hero = () => {

  return (
    <div id="home" className="relative py-24 overflow-hidden border-b isolate sm:py-32 bg-slate-900 border-b-royal">
      <img
        alt=""
        src="/office-lobby.jpg"
        className="absolute inset-0 object-cover object-right opacity-40 -z-10 size-full md:object-center saturation-200"
      />
      <NavBar />
      <div className="relative px-6 lg:px-8 sm:mt-32">
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: 'easeIn' }}
          className="mx-auto text-center max-w-8xl py-20 sm:py-48 lg:py-56"
        >
          <h1 className="text-5xl font-semibold tracking-tight text-white text-shadow-lg text-shadow-sky-300 text-balance sm:text-7xl">
            A Personal Legal Practice You Can Trust- In Kenya and from Abroad!
          </h1>
          <p className="mt-8 text-lg font-medium text-royal text-pretty sm:text-xl/8">
            Providing high-quality legal services with a focus on exceptional client care.
          </p>
          <div className="flex items-center justify-center mt-10 gap-x-6">
            <a
              href="#"
              className="text-white rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-g shadow-xs hover:bg-royal hover:text-greenroyal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
            >
              Book a Consultation
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Hero;
