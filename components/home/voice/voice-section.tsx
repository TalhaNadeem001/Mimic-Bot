import { iconImages } from "@/data/icons";
import VoiceBox from "./voice-box";

export default function VoiceSection () {
    return (
        <div className="w-full min-h-[60vh] flex flex-col justify-center items-center mt-10">
            <div className="text-[45px] font-thin text-[var(--forest-green)]"> Capture your voice in one call.</div>
            <div className="w-full flex items-center justify-center mt-10">
                 <VoiceBox
                backgroundColor= {"var(--alabaster)"}
                complimentaryColor={"var(--hook-green)"}
                playSrc= {iconImages.playGreen.src}
                playAlt= {iconImages.playGreen.alt}
                pauseSrc= {iconImages.pauseGreen.src}
                pauseAlt= {iconImages.pauseGreen.alt}>
           </VoiceBox>
            <VoiceBox
                backgroundColor= {"var(--alabaster)"}
                complimentaryColor={"var(--hook-green)"}
                playSrc= {iconImages.playGreen.src}
                playAlt= {iconImages.playGreen.alt}
                pauseSrc= {iconImages.pauseGreen.src}
                pauseAlt= {iconImages.pauseGreen.alt}>
           </VoiceBox>
            </div>
           
        </div>
    )
}