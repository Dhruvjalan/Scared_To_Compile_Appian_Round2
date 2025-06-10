import sounddevice as sd
import numpy as np
import threading
import queue
import sys
import whisper
import tempfile
from scipy.io.wavfile import write
import os

samplerate = 16000
channels = 1
q = queue.Queue()

def callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    q.put(indata.copy())

def record_until_enter():
    print("Recording... Press Enter to stop.")
    with sd.InputStream(samplerate=samplerate, channels=channels, callback=callback):
        input()  # Wait for Enter

def save_recording(filename):
    frames = []
    while not q.empty():
        frames.append(q.get())
    audio = np.concatenate(frames, axis=0)
    write(filename, samplerate, audio)  # Closes file automatically after writing

def transcribe(file_path):
    model = whisper.load_model("base")
    result = model.transcribe(file_path, fp16=False)
    print("\n Transcription:\n", result["text"])

if __name__ == '__main__':
    record_thread = threading.Thread(target=record_until_enter)
    record_thread.start()
    record_thread.join()

    # Use context manager to ensure file closure
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
        temp_wav.close()  # Close immediately after creation
        save_recording(temp_wav.name)
        transcribe(temp_wav.name)
    
    # Explicitly delete after transcription
    os.remove(temp_wav.name)

