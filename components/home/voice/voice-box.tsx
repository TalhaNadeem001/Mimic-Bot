"use client";

import { motion } from "motion/react";
import Image from "next/image";

type VoiceBoxProps = {
    backgroundColor: string
    complimentaryColor: string,
    playSrc: string,
    playAlt: string,
    pauseSrc: string,
    pauseAlt: string
}

export default function VoiceBox ( {backgroundColor, complimentaryColor, playSrc, playAlt, pauseSrc, pauseAlt} : VoiceBoxProps) {
    return (
        <motion.div 
            className="flex border border-2 rounded-lg w-[450px] h-[70px] p-3 m-10"
            style={{backgroundColor: backgroundColor, borderColor: complimentaryColor}}
            whileHover={{scale: 1.2}}>
            <div className="flex w-full">
                 <Image
                className="object-contain mx-2"
                src = {playSrc}
                alt = {playAlt}
                width={35}
                height={35}>
            </Image>
            <Image
                className="object-contain mx-2"
                src = {pauseSrc}
                alt = {pauseAlt}
                width={35}
                height={35}>
            </Image>
            </div>
           
        </motion.div>
    )
}