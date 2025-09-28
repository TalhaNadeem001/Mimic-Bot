"use client";

import { iconImages } from "@/data/icons";
import VoiceBox from "./voice-box";
import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
import { Pinecone } from "@pinecone-database/pinecone";
import { useAudioPlayer } from "react-use-audio-player"
import { useState } from "react";


export default function VoiceSection() {

  const [userInput, setUserInput] = useState("");

  const {togglePlayPause, isPlaying} = useAudioPlayer("/musa.mp3", {
    autoplay: false, loop: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const res = await fetch("/api/search", {
    method: "POST",
    body: JSON.stringify({ query: userInput }),
    headers: { "Content-Type": "application/json" },
  });

  const hits = await res.json();
  console.log("Pinecone hits:", hits);
};




  return (
    <div className="w-full min-h-[60vh] flex flex-col justify-center items-center mt-10">
      <div className="text-[45px] font-thin text-[var(--forest-green)]">
        Capture your voice in one call.
      </div>

      <div className="w-full flex items-center justify-center mt-10">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask an Agent Something..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-80"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--hook-green)] text-white rounded"
          >
            Search
          </button>
        </form>

        <VoiceBox
          onClick={togglePlayPause}
          backgroundColor={"var(--alabaster)"}
          complimentaryColor={"var(--hook-green)"}
          playSrc={iconImages.playGreen.src}
          playAlt={iconImages.playGreen.alt}
          pauseSrc={iconImages.pauseGreen.src}
          pauseAlt={iconImages.pauseGreen.alt}
        />
      </div>
    </div>
  );
}
