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
  const speechRecognitionRef = useRef(null);

  const SpeechRecognitionClass = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  const isMediaRecorderSupported = typeof window !== 'undefined'
    && !!(navigator.mediaDevices?.getUserMedia)
    && typeof window.MediaRecorder !== 'undefined';

  const isSpeechRecognitionSupported = !!SpeechRecognitionClass;

  const isSupported = isMediaRecorderSupported || isSpeechRecognitionSupported;

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

  const startMediaRecorder = useCallback(async () => {
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

  const startSpeechRecognition = useCallback(() => {
    setError(null);
    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript.trim()) {
          onTranscribed?.(transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permissions.');
        } else if (event.error !== 'no-speech') {
          setError(`Speech recognition: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      setError('Could not start speech recognition: ' + err.message);
      setIsRecording(false);
    }
  }, [SpeechRecognitionClass, onTranscribed]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
      speechRecognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (isMediaRecorderSupported) {
      startMediaRecorder();
    } else if (isSpeechRecognitionSupported) {
      startSpeechRecognition();
    } else {
      const isHttp = typeof window !== 'undefined'
        && window.location.protocol === 'http:'
        && window.location.hostname !== 'localhost'
        && window.location.hostname !== '127.0.0.1';

      if (isHttp) {
        setError(`Microphone on mobile requires HTTPS or localhost. On Android Chrome: visit chrome://flags/#unsafely-treat-insecure-origin-as-secure, add ${window.location.origin}, and enable.`);
      } else {
        setError('Microphone is not supported by your browser.');
      }
    }
  }, [isMediaRecorderSupported, isSpeechRecognitionSupported, startMediaRecorder, startSpeechRecognition]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return { isRecording, isTranscribing, isSupported, error, toggleRecording };
}
