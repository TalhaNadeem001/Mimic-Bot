"use client";

import { ActionCards, ActionCardSchool } from "./action-cards"
import { iconImages } from "@/data/icons"

export default function ActionSection () {
    return (
        <div className="w-full min-h-[85vh] flex flex-col justify-center items-center mt-10">
            <div className="text-[45px] font-thin text-[var(--forest-green)]"> Create your digital twin today.</div>
    
            <div className="flex w-full mt-15 justify-evenly">
            <div className="flex flex-col">
                <ActionCards
            cardColor= {"var(--hook-green)"}
            imageSrc= {iconImages.phoneGreen.src}
            imageAlt= {iconImages.phoneGreen.alt}
        ></ActionCards>

        <ActionCards
            cardColor= {"var(--hook-green)"}
            imageSrc= {iconImages.phoneGreen.src}
            imageAlt= {iconImages.phoneGreen.alt}
            middleCard = {true}
        ></ActionCards>

        <ActionCards
            cardColor= {"var(--hook-green)"}
            imageSrc= {iconImages.phoneGreen.src}
            imageAlt= {iconImages.phoneGreen.alt}
        ></ActionCards>
                </div>
               <div className="mt-10">
                <ActionCardSchool></ActionCardSchool>
                </div>
            </div>
        
     
   
  
         
      </div>
        
    )
}