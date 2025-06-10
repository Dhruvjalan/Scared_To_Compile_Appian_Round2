'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, StopCircle, Repeat } from 'lucide-react'
import { Button } from "@/components/ui/button"

function Recorder({onTranscription, onAudioReady, customButton,displayrecording }) {
  const [isClient, setIsClient] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const startRecording = async () => {
    if (!isClient) return
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support audio recording.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const url = URL.createObjectURL(blob)
      const formData = new FormData()
      formData.append("audio", blob, "recording.webm")

      try {
        const res = await fetch("http://127.0.0.1:5000/transcribe", {
          method: "POST",
          body: formData
        })

        const data = await res.json()
        const transcription = data.transcription || data.text || ''

        console.log("Transcription:", transcription)
        onTranscription(transcription)
      } catch (error) {
        console.error("Error uploading audio:", error)
        onTranscription('')
      }

      setAudioURL(url)
      onAudioReady && onAudioReady(url)
    }


      mediaRecorder.start()
      setRecording(true)
    } catch {
      alert('Could not start recording. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }

  if (!isClient) return null

  return (
    <>
      {customButton
        ? customButton({ recording, startRecording, stopRecording })
        : (
          <button onClick={recording ? stopRecording : startRecording} className="col-span-1 p-2 hover:bg-gray-200 rounded flex align-start">
            {recording ? <StopCircle /> : <Mic /> }
          </button>
        )
      }
      {audioURL && displayrecording && (
        <div style={{ marginTop: '20px' }}>
          <audio src={audioURL} controls />
          <Button onClick={() => setAudioURL('')}><Repeat /> Record Again</Button>
        </div>
      )}
    </>
  )
}

export default Recorder
