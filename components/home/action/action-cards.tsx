"use client";

import { motion} from 'motion/react'
import { useState } from 'react'
import Image from 'next/image'
import { iconImages } from '@/data/icons'

import { useRouter } from 'next/navigation'


type ActionCardsProps = {
    cardColor: string,
    imageSrc: string,
    imageAlt: string,
    middleCard?: boolean,
}

const animationVariants = {

  web:{
    y: ["0vh", "-8vh", "10vh", "10vh", "10vh", "10vh", "10vh", "10vh", "10vh"],
    x: ["0vw", "0vw", "0vw", "0vw", "0vw", "0vw", "0vw", "0vw", "0vw"],
    rotate: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },

 webMiddle: {
    y: ["0vh", "-8vh", "10vh", "10vh", "10vh", "10vh", "10vh", "10vh", "10vh"],
    x: ["0vw", "0vw", "0vw", "10vw", "10vw", "10vw", "10vw", "10vw", "0vw"],
    rotate: [0, 0, 0, 0, 1, 0, 1, 0, 0]
  },

 
  agent:{
    backgroundColor: ["#ffffff00", "#ffffff00", "#ffffff00", "#ffffff00", "var(--timber)", "var(--timber)", "var(--timber)", "var(--timber)", "#ffffff00"],
    rotate: [0, 0, 0, 0, -1, 0, -1, 0, 0]
  },

  hover: {
    rotate: [3, -3, 3, -3, 1, -1, 1, -1, 0]
  }

}
export const ActionCards = ({cardColor, imageSrc, imageAlt, middleCard = false} : ActionCardsProps) => {

   const [canHover, setCanHover] = useState(false);
   const router = useRouter();
  
    return (
         <motion.div
          className="flex justify-around w-[300px] h-[80px] rounded-lg border-3 my-5"
          whileHover={canHover? "hover" : "" }
          onClick={() => {router.push('/')}}
          style={{borderColor: cardColor}}
          variants={animationVariants}
          whileInView={
               middleCard
                  ? "webMiddle"  
                : "web"
          }
          transition = {{
            duration: 6, 
            times: [0, .22, .44, .66, .70, .75, .82, .91, 1 ]}}
          viewport={{once: false, amount: .6}}
          onAnimationComplete={() => {setCanHover(true)}}
          >
          <Image
            src = {imageSrc}
            alt= {imageAlt}
            width={40}
            height={40}
            className="m-3">
          </Image>
          <div className="flex flex-col">
            <span className="border-t-3 w-[150px] mt-3 m-2" style={{borderColor: cardColor}}></span>
            <span className="border-t-3 w-[75px] m-2"  style={{borderColor: cardColor}}></span>
            <span className="border-t-3 w-[200px] m-2"  style={{borderColor: cardColor}}></span>
          </div>
        </motion.div>
    )
}

export const ActionCardSchool = () => {

  const [canHover, setCanHover] = useState(false);
  const router = useRouter();

  return (
    <motion.div 
         className='rounded-lg border-4 border-[var(--forest-green)] w-[300px] h-[200px]'
         onClick={() => {router.push('/auth')}}
         whileHover={canHover? "hover" : "" }
         variants={animationVariants}
         initial = {{y: "10vh"}}
         whileInView = {"agent"}
         transition = {{ duration: 6, times: [0, .22, .44, .66, .70, .75, .82, .91, 1 ]}}
         viewport={{once: false, amount: .6}}
         onAnimationComplete={() => {setCanHover(true)}}
    >
          <div className='flex flex-col justify-center items-center'>
           <Image
            src = {iconImages.digitalTwinGreen.src}
            alt= {iconImages.digitalTwinGreen.alt}
            width={80}
            height={80}
            className="m-3">
          </Image>
            <div className='flex flex-col'>
            <span className="border-t-3 border-[var(--forest-green)] w-[200px] mt-3" ></span>
            <span className="border-t-3 border-[var(--forest-green)] w-[175px] mt-4"></span>
            <span className="border-t-3 border-[var(--forest-green)]  w-[300px] mt-4"></span>
           </div>
          </div>
          
    </motion.div>
  )
}