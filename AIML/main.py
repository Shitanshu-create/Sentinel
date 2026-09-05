import os 
from datetime import datetime

import sounddevice as sd
from scipy.io.wavfile import write
from faster_whisper import WhisperModel

# configurations

SAMPLE_RATE = 16000
RECORD_SECONDS = 10

AUDIO_DIR = "audio/recordings"
LOG_DIR = "logs"

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# generating timestamp for file naming

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

audio_file = os.path.join(AUDIO_DIR, f"recording_{timestamp}.wav")

log_file = os.path.join(
    LOG_DIR,
    f"transcript_{timestamp}.txt"
)

# Record audio
print("=" * 50)
print("SENTINEL - AUDIO INPUT")
print("=" * 50)

print(f"\nRecording for {RECORD_SECONDS} seconds...")
print("Speak now.\n")

audio = sd.rec(
    int(RECORD_SECONDS * SAMPLE_RATE),
    samplerate=SAMPLE_RATE,
    channels=1,
    dtype="int16"
)

sd.wait()

write(audio_file, SAMPLE_RATE, audio)

print("Recording complete.")
print(f"Audio saved: {audio_file}")



# Load Whisper


print("\nLoading Whisper model...")

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)


# Speech → Text


print("Transcribing...\n")

segments, info = model.transcribe(
    audio_file,
    beam_size=5
)


# ==============================
# Collect transcript
# ==============================

transcript_parts = []

for segment in segments:
    transcript_parts.append(segment.text.strip())

transcript = " ".join(transcript_parts)



# Save transcript


with open(log_file, "w", encoding="utf-8") as file:
    file.write(transcript)



# Display result

print("=" * 50)
print("TRANSCRIPT")
print("=" * 50)

print(transcript)

print("\n" + "=" * 50)
print(f"Transcript saved: {log_file}")
print("=" * 50)
