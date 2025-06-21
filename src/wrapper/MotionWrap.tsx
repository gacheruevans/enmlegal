import React from 'react';
import { motion } from 'motion/react'

const MotionWrap = <P extends object>(Component: React.ComponentType<P>, classNames: string) => function HOC(props: P) {
  return (
    <motion.div
        whileInView={{ y: [100, 50, 0], opacity: [0, 0, 1]}}
        transition={{ duration:0.5 }}
        className={`${classNames}`}
    >
       <Component {...props} /> 
    </motion.div>
  )
}

export default MotionWrap