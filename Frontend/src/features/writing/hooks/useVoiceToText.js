import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../../ai-chat/services/journal.api.js';
import { blobToBase64 } from '../../../shared/utils/blobToBase64.js';

export function useVoiceToText({ onTranscribed }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const isSupported = typeof window !== 'undefined'
    && !!(navigator.mediaDevices?.getUserMedia)
    && typeof window.MediaRecorder !== 'undefined';

  const handleStop = useCallback(async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    if (blob.size === 0) return;

    setIsTranscribing(true);
    setError(null);
    try {
      const base64Data = await blobToBase64(blob);
      const res = await transcribeAudio({ audioData: base64Data, mimeType });
      if (res.text) onTranscribed?.(res.text);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  }, [onTranscribed]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredType = ['audio/webm', 'audio/mp4', 'audio/ogg']
        .find((type) => window.MediaRecorder.isTypeSupported?.(type));

      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = handleStop;
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access was denied or is unavailable.');
    }
  }, [handleStop]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return { isRecording, isTranscribing, isSupported, error, toggleRecording };
}
