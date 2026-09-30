'use client'
import { motion } from 'motion/react';
import { useState } from "react";
import ConsultationModal from "../../components/consultationmodal";
import { NavBar } from '../../components/navbar';
import { useSiteContent } from '../../context/SiteContentContext';

const Hero = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { content } = useSiteContent();
  const home = content.home;

  return (
  <div id="home" className="relative py-24 overflow-hidden border-b isolate sm:py-32 bg-slate-900 border-b-royal">
      <img
        alt="Office lobby"
        src={`https://github.com/gacheruevans/enmlegal/blob/main/dist/office-lobby.jpg?raw=true`}
        className="absolute inset-0 object-cover object-right opacity-40 -z-10 size-full md:object-center saturation-200"
      />
      <NavBar />
      <div className="relative px-6 lg:px-8 sm:mt-32">
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: 'easeIn' }}
          className="py-20 mx-auto text-center max-w-8xl sm:py-48 lg:py-56"
        >
          {home?.title && (
            <h1 className="text-5xl font-semibold tracking-tight text-white text-shadow-lg text-shadow-sky-300 text-balance sm:text-7xl">
              {home.title}
            </h1>
          )}
          {home?.subtitle && (
            <p className="mt-8 text-lg font-medium text-royal text-pretty sm:text-xl/8">
              {home.subtitle}
            </p>
          )}
          <div className="flex items-center justify-center mt-10 gap-x-6">
            <a
              onClick={() => setModalOpen(true)}
              href="#"
              className="text-white rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-g shadow-xs hover:bg-royal hover:text-greenroyal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral"
            >
              Book a Consultation
            </a>
          </div>
        </motion.div>
      </div>
      <ConsultationModal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} />
    </div>
  )
}

export default Hero;
