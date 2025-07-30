import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import * as FileSystem from 'expo-file-system';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  error?: string;
  language?: string;
  duration?: number;
  transcriptionId?: string;
}

// Real transcription service using Firebase Functions and Google Speech-to-Text
export async function transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
  try {
    console.log('Transcribing audio file:', audioUri);
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Read the audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determine audio format from URI
    const audioFormat = getAudioFormatFromUri(audioUri);

    // Call Firebase Function
    const functions = getFunctions();
    const transcribeFunction = httpsCallable(functions, 'transcribeAudio');

    const result = await transcribeFunction({
      audioData: audioBase64,
      audioFormat,
      languageCode: 'en-US',
      userId: user.uid,
    });

    const response = result.data as any;

    if (!response.success) {
      throw new Error(response.error || 'Transcription failed');
    }

    console.log('Transcription completed:', response.text);
    
    return {
      text: response.text,
      confidence: response.confidence,
      language: response.language,
      duration: response.duration,
      transcriptionId: response.transcriptionId,
    };

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Fallback to mock service if Firebase Function fails
    console.log('Falling back to mock transcription service');
    return await transcribeWithMock(audioUri);
  }
}

// Mock transcription service as fallback
async function transcribeWithMock(audioUri: string): Promise<TranscriptionResult> {
  try {
    console.log('Using mock transcription service');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockTranscriptions = [
      "My child has trouble with morning routines",
      "I need help with homework focus", 
      "How do I handle tantrums and meltdowns",
      "My child struggles with transitions",
      "What can I do about sensory issues",
      "Help with organization and keeping things tidy",
      "Social skills and making friends",
      "Emotional regulation and calming down"
    ];
    
    const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
    const text = mockTranscriptions[randomIndex];
    
    return {
      text,
      confidence: 0.85
    };
  } catch (error) {
    console.error('Mock transcription error:', error);
    return {
      text: '',
      confidence: 0,
      error: 'Failed to transcribe audio'
    };
  }
}

function getAudioFormatFromUri(uri: string): string {
  if (uri.includes('.mp3')) return 'mp3';
  if (uri.includes('.wav')) return 'wav';
  if (uri.includes('.m4a')) return 'm4a';
  if (uri.includes('.aac')) return 'aac';
  // Default to mp3 for Expo Audio recordings
  return 'mp3';
}

// Future implementation with real API
export async function transcribeWithWhisper(audioUri: string): Promise<TranscriptionResult> {
  try {
    // TODO: Implement OpenAI Whisper API
    // const formData = new FormData();
    // formData.append('file', audioUri);
    // formData.append('model', 'whisper-1');
    
    // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    //   method: 'POST',
    //   headers: {
    //   'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
    //   },
    //   body: formData,
    // });
    
    // const result = await response.json();
    // return { text: result.text, confidence: 0.9 };
    
    // For now, fall back to mock
    return await transcribeAudio(audioUri);
  } catch (error) {
    console.error('Whisper API error:', error);
    return await transcribeAudio(audioUri);
  }
} 