"use client"

import { animate, easeInOut, motion, useMotionValue, useTransform } from "motion/react"
import { useEffect } from "react"

export default function CounterAnimation () {

    const count = useMotionValue(50)
    const transformedCount = useTransform(() => Math.round(count.get()))

     useEffect(() => {
        const controls = animate(count, 0, { duration: 4, ease: easeInOut})
        return () => controls.stop()
    }, [])

    return (
        <motion.div className="text-[80px] text-[var(--alabaster)] text-center">
            {transformedCount}
        </motion.div>
    )
}