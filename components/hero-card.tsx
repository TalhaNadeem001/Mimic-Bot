import Image from "next/image"

type HeroCardProps = {
    cardWidth: number,
    cardHeight: number,
    backgroundColor: string,
    complimentaryColor: string,
    imageSrc: string,
    imageAlt: string,
    cardDescription: string
}

export default function HeroCard (
    {
        cardWidth,
        cardHeight,
        backgroundColor,
        complimentaryColor,
        imageSrc,
        imageAlt,
        cardDescription
    } : HeroCardProps
) {
    return (
        <div 
            className="rounded-lg flex flex-col justify center" 
            style={{width: cardWidth, height: cardHeight, backgroundColor: backgroundColor}}
        >
            <Image
                src={imageSrc}
                alt= {imageAlt}>
            </Image>
        </div>
    )
}