"use client";

import Image from "next/image"
import CounterAnimation from "./hero-animation"
import { motion } from "motion/react"

type HeroCardProps = {
    cardWidth: number,
    cardHeight: number,
    backgroundColor: string,
    complimentaryColor: string,
    imageSrc: string,
    imageAlt: string,
    cardDescription: string,
    middleCard?: boolean
}

export default function HeroCard (
    {
        cardWidth,
        cardHeight,
        backgroundColor,
        complimentaryColor,
        imageSrc,
        imageAlt,
        cardDescription,
        middleCard = false
    } : HeroCardProps
) {
    return (
        <motion.div 
            className="border border-3 drop-shadow-sm rounded-lg flex flex-col items-center justify-center mx-5" 
            style={{width: cardWidth, height: cardHeight, backgroundColor: backgroundColor, borderColor: complimentaryColor}}
            whileHover={{y: -15}}
            transition={{duration: 0.5}}
        >
           { middleCard ? 
           <CounterAnimation/> 
           : 
           <Image
                src={imageSrc}
                alt= {imageAlt}
                width={80}
                height={80}>
            </Image>}
            <div className="text-center w-5/8 text-[28px]" style={{color: middleCard ? "var(--alabaster)" : complimentaryColor}}>{cardDescription}</div>
            <div className="mt-5 border-t-3 w-full" style={{borderColor: middleCard ? "var(--alabaster)" : complimentaryColor}} />
        </motion.div>
    )
}