import ActionSection from "@/components/home/action/action-section";
import HeroBanner from "@/components/home/hero/hero-banner";
import VoiceSection from "@/components/home/voice/voice-section";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col mt-15 items-center">
        <h1 className="text-[50px] font-thin text-[var(--forest-green)]">Mimic Bot</h1>
        <HeroBanner></HeroBanner>
        <VoiceSection></VoiceSection>
        <ActionSection></ActionSection>
    </div>
  );
}
