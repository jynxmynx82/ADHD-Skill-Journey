# AI Interactive Agent Specification

## Overview
The AI Interactive Agent (Quick Advice) provides immediate, personalized guidance for challenging moments through voice input and AI-powered responses.

## Core Value Proposition
- **Immediate Support**: Get personalized advice in crisis moments
- **Voice-First**: Speak naturally, get contextual responses
- **Family-Level Personalization**: Uses provisional family profile data
- **Adaptive Learning**: Improves responses based on feedback
- **No Child Profile Required**: Works immediately after signup

## Technical Architecture

### Data Models

```typescript
// Provisional Family Profile (created during signup questionnaire)
interface ProvisionalProfile {
  id: string;
  userId: string;
  isPlaceholder: true;
  primaryChallenge: string;      // "mornings", "homework", "emotions", etc.
  familyStrength: string;        // "creative", "energy", "kind", etc.
  supportNetwork: string[];      // ["therapist", "teacher", "family"]
  currentStrategies: string[];   // ["routines", "rewards", "calming"]
  createdAt: Date;
  updatedAt: Date;
}

// Right Now Request (voice input processing)
interface RightNowRequest {
  id: string;
  userId: string;
  audioUrl?: string;
  transcript: string;
  timestamp: Date;
  context: {
    primaryChallenge: string;     // From provisional profile
    familyStrength: string;       // From provisional profile
    supportNetwork: string[];     // From provisional profile
    currentStrategies: string[];  // From provisional profile
  };
}

// AI Response (personalized advice)
interface AIResponse {
  id: string;
  requestId: string;
  userId: string;
  response: string;
  timestamp: Date;
  userFeedback?: 'thumbs_up' | 'thumbs_down';
  playbookCandidate?: boolean;
}
```

### Service Layer

```typescript
// QuickAdviceService.ts
export class QuickAdviceService {
  async processVoiceRequest(audioBlob: Blob, userId: string): Promise<AIResponse> {
    // 1. Upload audio to storage
    const audioUrl = await this.uploadAudio(audioBlob);
    
    // 2. Transcribe with Whisper
    const transcript = await this.transcribeAudio(audioUrl);
    
    // 3. Get provisional profile for context
    const provisionalProfile = await getProvisionalProfile(userId);
    
    // 4. Generate personalized response
    const response = await this.generateResponse(transcript, provisionalProfile);
    
    // 5. Store request and response
    const requestId = await this.storeRequest(transcript, provisionalProfile);
    const aiResponse = await this.storeResponse(requestId, response);
    
    return aiResponse;
  }
}
```

## User Experience Flow

### 1. Voice Input
- Floating action button with microphone icon
- Tap to start recording
- Visual feedback during recording
- Auto-stop after 30 seconds or manual stop

### 2. Processing
- Loading animation with "Processing your request..."
- Real-time transcription display
- Context-aware response generation

### 3. Response Display
- Modal with personalized advice
- Thumbs up/down feedback
- Option to save to "Playbook"
- Quick action buttons

## Integration with Provisional Family Profile

### Context Mapping
```typescript
// How questionnaire answers inform AI responses
const contextMapping = {
  primaryChallenge: {
    'mornings': 'Focus on morning routine strategies',
    'homework': 'Emphasize homework organization',
    'emotions': 'Prioritize emotional regulation',
    'bedtime': 'Highlight bedtime routine support'
  },
  familyStrength: {
    'creative': 'Suggest creative problem-solving',
    'energy': 'Channel energy positively',
    'kind': 'Emphasize empathy and patience',
    'curious': 'Encourage exploration and learning'
  }
};
```

### Response Personalization
- **Challenge-Aware**: Tailor advice to family's biggest struggle
- **Strength-Based**: Build on family's core strengths
- **Support-Network Aware**: Reference available resources
- **Strategy-Respectful**: Acknowledge what's already working

## Monetization Integration

### Free Tier (3 sessions/month)
- ✅ Access to AI Quick Advice
- ✅ Provisional profile included
- ✅ Basic personalization

### Supporter Tier (Unlimited)
- ✅ Unlimited AI Quick Advice sessions
- ✅ Access to curated Playbooks
- ✅ Advanced personalization features

## Implementation Priority

### Phase 1: Core Functionality
1. ✅ Provisional Family Profile creation (COMPLETED)
2. Voice recording and transcription
3. Basic AI response generation
4. Response display modal

### Phase 2: Enhanced Features
1. Feedback system (thumbs up/down)
2. Playbook creation
3. Advanced personalization
4. Usage tracking and limits

### Phase 3: Advanced Features
1. Multi-modal input (text + voice)
2. Response history
3. Family-specific playbooks
4. Integration with child profiles (when created) 