import os
import requests
from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import Response,JSONResponse
from twilio.twiml.voice_response import VoiceResponse, Dial, Conference
from twilio.rest import Client
import psycopg2
import openai
import whisper
import soundfile as sf
from pinecone import Pinecone, ServerlessSpec
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from io import BytesIO
from elevenlabs.client import ElevenLabs

load_dotenv()

# Load API keys from env vars
TWILIO_URL = os.getenv("NGROK_URL", "https://95459d92eb6d.ngrok-free.app")  # <-- replace with your ngrok URL
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_NUMBER")


elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)

openai.api_key = OPENAI_API_KEY

app = FastAPI()
model = whisper.load_model("medium")
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

ai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

conn = psycopg2.connect(
    dbname="Mimic",
    user="postgres",
    password="talha2468",
    host="localhost",
    port="5432"
)

@app.post("/")
async def voice(From: str = Form(...)):
    response = VoiceResponse()

    dial = Dial(record="record-from-answer-dual")
    dial.number("+12488918273")  # number to connect
    response.append(dial)

    return Response(content=str(response), media_type="application/xml")


@app.post("/2")
async def call2(From: str = Form(...)):
    response = VoiceResponse()

    # Dial + Conference with recording
    dial = Dial()
    dial.conference(
        "My conference",
        start_conference_on_enter=True,
        end_conference_on_exit=True,
        record="record-from-answer-start",
    )

    conferences = client.conferences.list(limit=20)
    for conference in conferences:
        recordings = client.recordings.list(conference_sid=conference.sid)
        for rec in recordings:
            if rec.status != "completed":
                print(f"Recording {rec.sid} is not completed yet. Skipping.")
                continue

            print(f"Downloading Recording SID: {rec.sid}")
            # Download the recording
            respons = requests.get(rec.media_url, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN))
            filename = f"{rec.sid}.mp3"
            with open(filename, "wb") as f:
                f.write(respons.content)
            print(f"Saved recording as {filename}")

            # Transcribe with local Whisper
            print("Transcribing...")
            result = model.transcribe(filename)
            print(f"Transcription for Recording {rec.sid}:\n{result['text']}\n")

    response.append(dial)
    return Response(content=str(response), media_type="application/xml")

def conversation_summary(merged_transcript):
    conversation_text = ""
    for message in merged_transcript:
        if message["text"].strip():
            conversation_text += f"{message['speaker']}: {message['text']}\n"

    prompt = (
        "Summarize this conversation in 2-3 words only. "
        "Do NOT add any extra text. Only return the concise phrase. "
        "Example output: 'Learning motivation'\n\n"
        f"{conversation_text}"
    )

    response = ai_client.responses.create(
        model="gpt-4o-mini",
        input=prompt,
    )

    ai_response = response.output_text.strip()
    print(ai_response)  # only the concise output
    return ai_response

@app.get("/fetch-dial-recordings")
async def fetch_dial_recordings():
    # Get last 20 calls (adjust limit as needed)
    calls = client.calls.list(limit=20)
    results = []

    for call in calls:
        recordings = client.recordings.list(call_sid=call.sid)
        for rec in recordings:
            if rec.status != "completed":
                results.append({
                    "call_sid": call.sid,
                    "recording_sid": rec.sid,
                    "status": rec.status,
                    "note": "Skipping, not completed yet"
                })
                continue

            # Download recording
            url = f"{rec.media_url}.wav"
            filename = f"{rec.sid}.wav"
            with requests.get(url, stream=True, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)) as r:
                with open(filename, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)

            # Split channels
            data, samplerate = sf.read(filename)
            caller = data[:, 0]
            agent = data[:, 1]

            caller_file = f"{rec.sid}_caller.wav"
            agent_file = f"{rec.sid}_agent.wav"

            sf.write(caller_file, caller, samplerate)
            sf.write(agent_file, agent, samplerate)

            # Transcribe each with timestamps
            caller_result = model.transcribe(caller_file, word_timestamps=True)
            agent_result = model.transcribe(agent_file, word_timestamps=True)

            caller_segments = caller_result["segments"]
            agent_segments = agent_result["segments"]

            # Interleave segments by start time
            merged_transcript = []
            c_idx, a_idx = 0, 0

            while c_idx < len(caller_segments) or a_idx < len(agent_segments):
                if c_idx >= len(caller_segments):
                    merged_transcript.append({
                        "speaker": "Agent",
                        "text": agent_segments[a_idx]["text"]
                    })
                    a_idx += 1
                    continue
                if a_idx >= len(agent_segments):
                    merged_transcript.append({
                        "speaker": "Caller",
                        "text": caller_segments[c_idx]["text"]
                    })
                    c_idx += 1
                    continue

                if caller_segments[c_idx]["start"] <= agent_segments[a_idx]["start"]:
                    merged_transcript.append({
                        "speaker": "Caller",
                        "text": caller_segments[c_idx]["text"]
                    })
                    c_idx += 1
                else:
                    merged_transcript.append({
                        "speaker": "Agent",
                        "text": agent_segments[a_idx]["text"]
                    })
                    a_idx += 1

            summary = conversation_summary(merged_transcript)
            
            embedding = ai_client.embeddings.create(
                model="text-embedding-3-small",
                input=summary,
                dimensions=1024
            ).data[0].embedding

            pc.Index("conversations").upsert([
                {
                    "id": rec.sid,
                    "values": embedding,
                    "metadata": {
                        "call_sid": call.sid,
                        "recording_sid": rec.sid,
                        "topic": summary,
                        "transcript": " ".join([seg["speaker"] + ": " + seg["text"] for seg in merged_transcript])
                    }
                }
            ])

            results.append({
                "call_sid": call.sid,
                "recording_sid": rec.sid,
                "status": rec.status,
                "topic": summary,
                "merged_transcript": merged_transcript,
                "caller_file": caller_file,
                "agent_file": agent_file
            })

            # Optional: clean up downloaded files
            os.remove(filename)
            os.remove(caller_file)
            os.remove(agent_file)

    return results

@app.get("/search-topic")
async def search_topic_endpoint(query: str):
    query_embedding = ai_client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding

    results = pc.Index("conversations").query(
        vector=query_embedding,
        top_k=5,
        include_metadata=True
    )
    return results


@app.post("/handle-recording")
async def handle_recording(RecordingUrl: str = Form(...)):
    """Called when recording is completed"""
    print("Recording available at:", RecordingUrl)

    # Download the audio file from Twilio
    audio_url = f"{RecordingUrl}.mp3"
    response = requests.get(audio_url, auth=(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN")), stream=True)
    
    local_file = "call.mp3"
    with open(local_file, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

    result = model.transcribe(local_file)

    print("Transcript:", result["text"])

    # Return the transcript
    return JSONResponse(content={"transcript": result["text"]})


@app.post("/conference-ended")
async def conference_ended():
    print('hi')
    return "OK"

@app.post("/save-conversations")
async def save_conversations():
    
    conferences = client.conferences.list(limit=20)
    for record in conferences:
        print(record)
    



@app.post("/recording-status")
async def recording_status(
    CallSid: str = Form(...),
    RecordingSid: str = Form(...),
    RecordingUrl: str = Form(...),
    RecordingStatus: str = Form(...)
):
    if RecordingStatus == "completed":
        # 1️⃣ Download the audio
        audio_file_path = f"{RecordingSid}.mp3"
        r = requests.get(f"{RecordingUrl}.mp3")
        with open(audio_file_path, "wb") as f:
            f.write(r.content)

        # 2️⃣ Transcribe using Whisper
        result = model.transcribe(audio_file_path)
        transcript_text = result["text"]
        print(f"Transcript for {RecordingSid}:\n{transcript_text}")

        # 3️⃣ Save transcript to Postgres
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO call_transcripts (call_sid, recording_sid, transcript)
            VALUES (%s, %s, %s)
        """, (CallSid, RecordingSid, transcript_text))
        conn.commit()
        cur.close()

    return "OK"

class TranscriptSegment(BaseModel):
    speaker: str
    text: str

class Conversation(BaseModel):
    call_sid: str
    recording_sid: str
    status: str
    topic: str
    merged_transcript: List[TranscriptSegment]


@app.post("/upload")
async def upload_conversation(convo: Conversation):
    try:
            
        # Flatten transcript
        transcript_text = " ".join([
            seg.speaker + ": " + seg.text for seg in convo.merged_transcript
        ])

        # Create embedding
        embedding = ai_client.embeddings.create(
            model="text-embedding-3-small",
            input=convo.topic,
            dimensions=1024
        ).data[0].embedding

        # Upsert into Pinecone
        pc.Index("conversations").upsert([
            {
                "id": convo.recording_sid,
                "values": embedding,
                "metadata": {
                    "call_sid": convo.call_sid,
                    "recording_sid": convo.recording_sid,
                    "topic": convo.topic,
                    "transcript": transcript_text
                }
            }
        ])

        return {"status": "success", "recording_sid": convo.recording_sid}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class SearchQuery(BaseModel):
    query: str
    top_k: int = 5  # number of results to return

@app.post("/search2")
def search_conversations(search: SearchQuery):
    try:
        # Convert user query to embedding
        query_embedding = ai_client.embeddings.create(
            model="text-embedding-3-small",
            input=search.query,
            dimensions=1024
        ).data[0].embedding

        # Query Pinecone vector DB
        results = pc.Index("conversations").query(
            vector=query_embedding,
            top_k=search.top_k,
            include_metadata=True
        )

        # Format results
        formatted_results = []
        for match in results.matches:
            formatted_results.append({
                "call_sid": match.metadata.get("call_sid"),
                "recording_sid": match.metadata.get("recording_sid"),
                "topic": match.metadata.get("topic"),
                "transcript": match.metadata.get("transcript"),
                "score": match.score
            })

        return {"results": formatted_results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/search")
def search_conversations(search: SearchQuery):
    try:
        # 1️⃣ Convert user query to embedding
        query_embedding = ai_client.embeddings.create(
            model="text-embedding-3-small",
            input=search.query,
            dimensions=1024
        ).data[0].embedding

        # 2️⃣ Query Pinecone vector DB
        results = pc.Index("conversations").query(
            vector=query_embedding,
            top_k=search.top_k,
            include_metadata=True
        )

        # 3️⃣ Collect transcripts
        transcripts = [match.metadata.get("transcript") for match in results.matches]

        flattened_transcripts = "\n\n".join(transcripts)

        prompt_messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful customer support agent. "
                    "A user will ask a question, and you should provide a response "
                    "based only on the conversation transcripts provided. "
                    "Do not add information that is not present in the transcripts."
                )
            },
            {
                "role": "user",
                "content": (
                    f"Relevant transcripts:\n{flattened_transcripts}\n\n"
                    f"User query: {search.query}"
                )
            }
        ]

        response = ai_client.responses.create(
            model="gpt-5-mini",
            input=prompt_messages
        )
        ai_response = response.output_text.strip()

        # 5️⃣ Convert reworded text to speech via ElevenLabs
        audio = elevenlabs.text_to_speech.convert(
            text=ai_response,
            voice_id="pqTS5aah2BVZwcKU6Dgc",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )

        # Save audio to file
        with open("output.mp3", "wb") as f:
            for chunk in audio:  # iterate generator
                f.write(chunk)

        return {
            "reworded_text": ai_response,
            "audio_file": "output.mp3",
            "results": [
                {
                    "call_sid": match.metadata.get("call_sid"),
                    "recording_sid": match.metadata.get("recording_sid"),
                    "topic": match.metadata.get("topic"),
                    "score": match.score
                }
                for match in results.matches
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))