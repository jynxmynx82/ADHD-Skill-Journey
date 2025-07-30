import { onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { SpeechClient } from '@google-cloud/speech';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

const speechClient = new SpeechClient();
const db = getFirestore();

export const transcribeAudio = onCall({
  maxInstances: 10,
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (request: any) => {
  const { audioData, audioFormat, languageCode = 'en-US', userId } = request.data;

  if (!audioData || !audioFormat || !userId) {
    logger.error('Missing required parameters', { userId, hasAudioData: !!audioData, audioFormat });
    return {
      success: false,
      error: 'Missing required parameters'
    };
  }

  try {
    logger.info('Starting transcription', { userId, audioFormat, languageCode });

    // Configure the request
    const audio = {
      content: audioData,
    };

    const config = {
      encoding: getEncodingFromFormat(audioFormat) as any,
      sampleRateHertz: 16000,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
      model: 'latest_long',
    };

    const transcriptionRequest = {
      audio: audio,
      config: config,
    };

    // Perform the transcription
    const [response] = await speechClient.recognize(transcriptionRequest);
    
    if (!response.results || response.results.length === 0) {
      logger.warn('No transcription results', { userId });
      return {
        success: false,
        error: 'No speech detected'
      };
    }

    // Extract the transcription
    const transcription = response.results
      .map((result: any) => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(' ');

    const confidence = response.results[0]?.alternatives?.[0]?.confidence || 0;
    const detectedLanguage = response.results[0]?.languageCode || languageCode;

    // Calculate duration (approximate)
    const duration = response.results.reduce((total: number, result: any) => {
      const words = result.alternatives?.[0]?.words || [];
      if (words.length > 0) {
        const lastWord = words[words.length - 1];
        return Math.max(total, lastWord.endTime?.seconds || 0);
      }
      return total;
    }, 0);

    // Store in Firestore
    const transcriptionDoc = {
      userId,
      transcription,
      confidence,
      language: detectedLanguage,
      duration,
      audioFormat,
      timestamp: new Date(),
      status: 'completed'
    };

    const docRef = await db.collection('transcriptions').add(transcriptionDoc);

    logger.info('Transcription completed successfully', {
      userId,
      transcriptionId: docRef.id,
      confidence,
      duration
    });

    return {
      success: true,
      text: transcription,
      confidence,
      language: detectedLanguage,
      duration,
      transcriptionId: docRef.id
    };

  } catch (error) {
    logger.error('Transcription failed', {
      userId,
      error: error instanceof Error ? error.message : String(error)
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transcription failed'
    };
  }
});

function getEncodingFromFormat(format: string): string {
  switch (format.toLowerCase()) {
    case 'wav':
      return 'LINEAR16';
    case 'flac':
      return 'FLAC';
    case 'mp3':
    case 'm4a':
    case 'aac':
      return 'MP3';
    default:
      return 'LINEAR16';
  }
} 