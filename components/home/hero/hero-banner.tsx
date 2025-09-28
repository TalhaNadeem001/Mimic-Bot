import HeroCard from "./hero-card";
import { iconImages } from "@/data/icons";

export default function HeroBanner () {
    return (
        <div className="flex w-full justify-center items-center h-auto mt-15">

            <HeroCard
                cardWidth={350}
                cardHeight={250}
                backgroundColor={"var(--timber)"}
                complimentaryColor={"var(--hook-green)"}
                imageSrc= {iconImages.digitalTwinGreen.src}
                imageAlt= {iconImages.digitalTwinGreen.alt}
                cardDescription="An agent who's trained on you">
            </HeroCard>

             <HeroCard
                cardWidth={400}
                cardHeight={320}
                backgroundColor={"var(--hook-green)"}
                complimentaryColor={"var(--forest-green)"}
                imageSrc= {iconImages.digitalTwinGreen.src}
                imageAlt= {iconImages.digitalTwinGreen.alt}
                cardDescription="redundant, nonessential, daily calls"
                middleCard = {true}>
            </HeroCard>

             <HeroCard
                cardWidth={350}
                cardHeight={250}
                backgroundColor={"var(--timber)"}
                complimentaryColor={"var(--hook-green)"}
                imageSrc= {iconImages.voiceGreen.src}
                imageAlt= {iconImages.voiceGreen.alt}
                cardDescription="Mimics tone and personality">
            </HeroCard>
        </div>
    )
}