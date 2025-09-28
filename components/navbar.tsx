"use client";

import Link from "next/link"
import { motion } from "motion/react"

export default function NavBar() {
    return (
        <div className="flex justify-end w-full">
            <motion.div
            whileHover={{backgroundColor: "var(--hook-green)"}}
            transition={{duration: .5}}
            className = "group rounded-xl border-2 border-[var(--hook-green)] flex justify-center items-center w-[120px] h-[40px] p-[5px] m-5">
               <Link href = "/auth" className="group-hover:text-white text-[var(--hook-green)]">Get Started</Link>
          </motion.div>
        </div>
        
    )
}