import { getProvisionalProfile } from './provisionalProfileService';
import { personalLearningHub } from './personalLearningHubService';
import { AuditLoggingService } from './auditLoggingService';

export interface AIAdviceResponse {
  advice: string;
  category: string;
  confidence: number;
  followUpQuestions?: string[];
  resources?: string[];
  sessionId?: string; // ID of the saved advice session
}

// Use the existing ProvisionalProfile interface from the service
import type { ProvisionalProfile } from './provisionalProfileService';

const ADVICE_CATEGORIES = {
  MORNING_ROUTINE: 'morning_routine',
  HOMEWORK_FOCUS: 'homework_focus',
  BEHAVIOR_MANAGEMENT: 'behavior_management',
  EMOTIONAL_REGULATION: 'emotional_regulation',
  SOCIAL_SKILLS: 'social_skills',
  ORGANIZATION: 'organization',
  TRANSITIONS: 'transitions',
  SENSORY_NEEDS: 'sensory_needs',
  GENERAL: 'general'
} as const;

type AdviceCategory = typeof ADVICE_CATEGORIES[keyof typeof ADVICE_CATEGORIES];

const ADVICE_TEMPLATES: Record<AdviceCategory, {
  high: string[];
  medium: string[];
  low: string[];
}> = {
  [ADVICE_CATEGORIES.MORNING_ROUTINE]: {
    high: [
      "Create a visual morning checklist with pictures for each step. Use a timer for each task (5-10 minutes) and celebrate small wins. Consider a reward system for completing the routine on time.",
      "Break down the morning into 3-4 simple steps with visual cues. Use a countdown timer and provide immediate positive feedback. Try 'first-then' language: 'First we get dressed, then we have breakfast.'",
      "Set up everything the night before - clothes, backpack, lunch. Use a visual timer and give 5-minute warnings. Create a morning playlist to make it fun and keep them moving."
    ],
    medium: [
      "Try a visual schedule with pictures. Use timers for each task and give lots of praise for completing steps.",
      "Prepare everything the night before. Use simple language and avoid overwhelming choices in the morning."
    ],
    low: [
      "Consider creating a simple morning routine with visual supports.",
      "Try breaking down morning tasks into smaller steps."
    ]
  },
  [ADVICE_CATEGORIES.HOMEWORK_FOCUS]: {
    high: [
      "Set up a dedicated homework space with minimal distractions. Use the Pomodoro technique: 25 minutes of focused work followed by 5-minute breaks. Consider noise-canceling headphones or white noise.",
      "Create a homework routine with a specific time and place. Break assignments into smaller chunks and use visual timers. Provide frequent positive reinforcement and movement breaks.",
      "Designate a quiet homework zone with all supplies ready. Use a timer for focused work periods and allow fidget toys. Consider background music if it helps focus."
    ],
    medium: [
      "Find a quiet space for homework. Use timers and take short breaks. Give lots of encouragement.",
      "Set up a regular homework time and place. Break work into smaller parts."
    ],
    low: [
      "Try creating a dedicated homework space.",
      "Consider using timers to help with focus."
    ]
  },
  [ADVICE_CATEGORIES.BEHAVIOR_MANAGEMENT]: {
    high: [
      "Stay calm and use simple, clear language. Provide a safe space and avoid overwhelming choices. After the episode, discuss what happened when they're calm. Use positive reinforcement for good behavior.",
      "Use 'first-then' language and visual schedules. Provide immediate positive feedback for desired behaviors. Create a calm-down corner with sensory tools. Remember to model the behavior you want to see.",
      "Set clear, consistent expectations with visual supports. Use positive reinforcement and ignore minor misbehaviors. Create a reward system for good behavior and provide regular breaks."
    ],
    medium: [
      "Stay calm and use simple language. Give positive attention for good behavior.",
      "Set clear expectations and use visual supports when possible."
    ],
    low: [
      "Try staying calm and using simple, clear language.",
      "Consider setting clear expectations."
    ]
  },
  [ADVICE_CATEGORIES.EMOTIONAL_REGULATION]: {
    high: [
      "Teach deep breathing techniques and create a calm-down kit with sensory tools. Use emotion cards to help identify feelings. Practice mindfulness exercises together and validate their emotions.",
      "Create a 'calm corner' with soft items and sensory tools. Teach simple breathing exercises and use emotion charts. Help them identify triggers and develop coping strategies.",
      "Use visual emotion charts and teach simple breathing techniques. Create a calm-down routine and validate their feelings. Practice emotional regulation skills during calm times."
    ],
    medium: [
      "Try deep breathing exercises together. Create a calm space with soft items.",
      "Use emotion charts and teach simple breathing techniques."
    ],
    low: [
      "Consider teaching simple breathing exercises.",
      "Try creating a calm space for difficult moments."
    ]
  },
  [ADVICE_CATEGORIES.SOCIAL_SKILLS]: {
    high: [
      "Practice social scenarios through role-playing games. Use social stories to explain expected behaviors. Provide specific praise for good social interactions and model appropriate responses.",
      "Create social stories for common situations and practice through play. Give specific feedback on positive social interactions and help them understand others' perspectives.",
      "Use visual social stories and practice through role-playing. Provide immediate positive feedback for good social skills and help them read social cues."
    ],
    medium: [
      "Practice social skills through play. Give specific praise for good interactions.",
      "Use social stories to explain expected behaviors."
    ],
    low: [
      "Consider practicing social skills through play.",
      "Try using social stories for common situations."
    ]
  },
  [ADVICE_CATEGORIES.ORGANIZATION]: {
    high: [
      "Create visual organization systems with color coding and labels. Use checklists and timers for tasks. Break down complex activities into simple steps and provide immediate feedback.",
      "Set up clear organization systems with visual supports. Use checklists and timers, and break tasks into smaller steps. Provide lots of positive reinforcement for staying organized.",
      "Create visual schedules and organization systems. Use color coding and checklists. Break down tasks and provide immediate positive feedback."
    ],
    medium: [
      "Use visual schedules and checklists. Break tasks into smaller steps.",
      "Create simple organization systems with visual supports."
    ],
    low: [
      "Try using visual schedules and checklists.",
      "Consider breaking tasks into smaller steps."
    ]
  },
  [ADVICE_CATEGORIES.TRANSITIONS]: {
    high: [
      "Use visual timers and give multiple warnings before transitions. Create transition songs or routines and use 'first-then' language. Provide positive reinforcement for smooth transitions.",
      "Give 5-minute warnings and use visual timers. Create transition routines and use simple, clear language. Celebrate successful transitions with immediate positive feedback.",
      "Use countdown timers and visual schedules for transitions. Create transition songs or routines and provide lots of praise for smooth transitions."
    ],
    medium: [
      "Use timers and give warnings before changes. Create simple transition routines.",
      "Give advance warnings and use visual timers for transitions."
    ],
    low: [
      "Try using timers and giving warnings before changes.",
      "Consider creating simple transition routines."
    ]
  },
  [ADVICE_CATEGORIES.SENSORY_NEEDS]: {
    high: [
      "Create a sensory toolkit with fidget toys, noise-canceling headphones, and weighted items. Identify sensory triggers and develop coping strategies. Provide sensory breaks throughout the day.",
      "Develop a sensory diet with regular sensory input. Create a calm space with sensory tools and identify what helps them feel regulated. Provide regular sensory breaks.",
      "Create a sensory toolkit and identify triggers. Provide regular sensory breaks and develop coping strategies. Use sensory tools to help with regulation."
    ],
    medium: [
      "Create a sensory toolkit with fidget toys and headphones. Provide regular breaks.",
      "Identify sensory triggers and create coping strategies."
    ],
    low: [
      "Consider creating a sensory toolkit with fidget toys.",
      "Try identifying what helps them feel calm."
    ]
  },
  [ADVICE_CATEGORIES.GENERAL]: {
    high: [
      "Every child is unique, and what works for one may not work for another. Consider consulting with your child's healthcare provider or a behavioral specialist for personalized strategies. Remember to celebrate small victories and be patient with the process.",
      "ADHD strategies work best when tailored to your child's specific needs. Consider working with professionals to develop a personalized approach. Focus on progress, not perfection.",
      "Remember that every child with ADHD is different. Consider professional guidance for personalized strategies and celebrate every small success along the way."
    ],
    medium: [
      "Every child is unique. Consider professional guidance for personalized strategies.",
      "What works for one child may not work for another. Focus on progress, not perfection."
    ],
    low: [
      "Every child is unique. Consider professional guidance for personalized strategies.",
      "Remember to celebrate small victories and be patient with the process."
    ]
  }
};

const FOLLOW_UP_QUESTIONS: Record<AdviceCategory, string[]> = {
  [ADVICE_CATEGORIES.MORNING_ROUTINE]: [
    "What time does your child need to leave for school?",
    "What are the biggest morning challenges?",
    "Does your child respond better to visual or verbal cues?"
  ],
  [ADVICE_CATEGORIES.HOMEWORK_FOCUS]: [
    "How long can your child focus on homework currently?",
    "What distracts them most during homework time?",
    "Do they prefer quiet or some background noise?"
  ],
  [ADVICE_CATEGORIES.BEHAVIOR_MANAGEMENT]: [
    "What triggers difficult behaviors most often?",
    "How do you currently respond to challenging behaviors?",
    "What positive behaviors do you want to encourage?"
  ],
  [ADVICE_CATEGORIES.EMOTIONAL_REGULATION]: [
    "What situations cause the most emotional distress?",
    "How does your child currently calm down?",
    "What sensory input helps them feel regulated?"
  ],
  [ADVICE_CATEGORIES.SOCIAL_SKILLS]: [
    "What social situations are most challenging?",
    "How does your child interact with peers?",
    "What social skills would you like to focus on?"
  ],
  [ADVICE_CATEGORIES.ORGANIZATION]: [
    "What organizational tasks are most difficult?",
    "How does your child currently keep track of things?",
    "What organizational systems have you tried?"
  ],
  [ADVICE_CATEGORIES.TRANSITIONS]: [
    "What transitions are most difficult?",
    "How much warning does your child need?",
    "What helps them transition smoothly?"
  ],
  [ADVICE_CATEGORIES.SENSORY_NEEDS]: [
    "What sensory input does your child seek or avoid?",
    "How do they respond to different textures, sounds, or lights?",
    "What helps them feel calm and regulated?"
  ],
  [ADVICE_CATEGORIES.GENERAL]: [
    "What specific challenges are you facing?",
    "What strategies have you already tried?",
    "What would be most helpful for your family right now?"
  ]
};

export async function generateAIAdvice(question: string, userId?: string): Promise<AIAdviceResponse> {
  try {
    // Check usage limits if userId is provided
    if (userId) {
      const usageCheck = await personalLearningHub.checkUsageLimit(userId);
      if (!usageCheck.canUse) {
        throw new Error(`Usage limit reached. You have ${usageCheck.remaining} sessions remaining. Upgrade to premium for unlimited access.`);
      }
    }

    // Get provisional profile if available
    let provisionalProfile: ProvisionalProfile | null = null;
    if (userId) {
      try {
        provisionalProfile = await getProvisionalProfile(userId);
        if (provisionalProfile) {
          console.log('✅ Found provisional profile for user:', userId);
        } else {
          console.log('ℹ️ No provisional profile found for user:', userId);
        }
      } catch (error) {
        console.log('⚠️ Could not fetch provisional profile:', error);
        // Continue without profile - this is not a critical error
      }
    }

    // Analyze the question and determine category
    const category = categorizeQuestion(question, provisionalProfile);
    const confidence = calculateConfidence(question, category);
    
    // Get appropriate advice based on confidence level
    const adviceLevel = confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low';
    const adviceOptions = ADVICE_TEMPLATES[category][adviceLevel];
    const advice = adviceOptions[Math.floor(Math.random() * adviceOptions.length)];

    // Personalize advice based on provisional profile
    const personalizedAdvice = personalizeAdvice(advice, provisionalProfile, category);

    // Create the response
    const response: AIAdviceResponse = {
      advice: personalizedAdvice,
      category,
      confidence,
      followUpQuestions: FOLLOW_UP_QUESTIONS[category] || [],
      resources: getResourcesForCategory(category)
    };

    // Save advice session if userId is provided
    if (userId) {
      try {
        const now = new Date().toISOString();
        const session = await personalLearningHub.saveAdviceSession({
          userId,
          question,
          advice: personalizedAdvice,
          category,
          confidence,
          ...(provisionalProfile ? {
            provisionalProfileContext: {
              primaryChallenge: provisionalProfile.primaryChallenge,
              familyStrength: provisionalProfile.familyStrength,
              supportNetwork: provisionalProfile.supportNetwork,
              currentStrategies: provisionalProfile.currentStrategies
            }
          } : {}),
          createdAt: now,
          updatedAt: now,
          dataClassification: 'non_hipaa',
          dataSensitivity: 'confidential',
          encryptionLevel: 'none',
          createdBy: userId,
          lastModifiedBy: userId,
          version: 1,
          autoDelete: false
        });
        
        response.sessionId = session.id;
        
        // Increment usage
        await personalLearningHub.incrementUsage(userId);
        
        // Log the advice session
        await AuditLoggingService.logCreate(
          userId,
          'adviceSessions',
          session.id,
          'User generated AI advice'
        );
        
        console.log('✅ Advice session saved and usage incremented');
      } catch (error) {
        console.error('⚠️ Could not save advice session:', error);
        // Don't fail the request if saving fails
      }
    }

    return response;
  } catch (error) {
    console.error('Error generating AI advice:', error);
    
    // If it's a usage limit error, re-throw it
    if (error instanceof Error && error.message.includes('Usage limit reached')) {
      throw error;
    }
    
    return {
      advice: "I'm sorry, I encountered an error while processing your question. Please try again or rephrase your question.",
      category: ADVICE_CATEGORIES.GENERAL,
      confidence: 0.1,
      followUpQuestions: [],
      resources: []
    };
  }
}

function categorizeQuestion(question: string, profile?: ProvisionalProfile | null): AdviceCategory {
  const lowerQuestion = question.toLowerCase();
  
  // Check for specific keywords and patterns
  if (lowerQuestion.includes('morning') || lowerQuestion.includes('routine') || lowerQuestion.includes('getting ready')) {
    return ADVICE_CATEGORIES.MORNING_ROUTINE;
  }
  
  if (lowerQuestion.includes('homework') || lowerQuestion.includes('school work') || lowerQuestion.includes('study') || lowerQuestion.includes('focus')) {
    return ADVICE_CATEGORIES.HOMEWORK_FOCUS;
  }
  
  if (lowerQuestion.includes('tantrum') || lowerQuestion.includes('meltdown') || lowerQuestion.includes('behavior') || lowerQuestion.includes('acting out')) {
    return ADVICE_CATEGORIES.BEHAVIOR_MANAGEMENT;
  }
  
  if (lowerQuestion.includes('emotion') || lowerQuestion.includes('feeling') || lowerQuestion.includes('upset') || lowerQuestion.includes('angry') || lowerQuestion.includes('sad')) {
    return ADVICE_CATEGORIES.EMOTIONAL_REGULATION;
  }
  
  if (lowerQuestion.includes('friend') || lowerQuestion.includes('social') || lowerQuestion.includes('play') || lowerQuestion.includes('peer')) {
    return ADVICE_CATEGORIES.SOCIAL_SKILLS;
  }
  
  if (lowerQuestion.includes('organize') || lowerQuestion.includes('mess') || lowerQuestion.includes('clean') || lowerQuestion.includes('lose')) {
    return ADVICE_CATEGORIES.ORGANIZATION;
  }
  
  if (lowerQuestion.includes('transition') || lowerQuestion.includes('change') || lowerQuestion.includes('switch') || lowerQuestion.includes('stop')) {
    return ADVICE_CATEGORIES.TRANSITIONS;
  }
  
  if (lowerQuestion.includes('sensory') || lowerQuestion.includes('noise') || lowerQuestion.includes('touch') || lowerQuestion.includes('texture') || lowerQuestion.includes('light')) {
    return ADVICE_CATEGORIES.SENSORY_NEEDS;
  }
  
  return ADVICE_CATEGORIES.GENERAL;
}

function calculateConfidence(question: string, category: AdviceCategory): number {
  const lowerQuestion = question.toLowerCase();
  let confidence = 0.3; // Base confidence
  
  // Increase confidence based on specific keywords
  const categoryKeywords: Record<AdviceCategory, string[]> = {
    [ADVICE_CATEGORIES.MORNING_ROUTINE]: ['morning', 'routine', 'getting ready', 'breakfast', 'dress'],
    [ADVICE_CATEGORIES.HOMEWORK_FOCUS]: ['homework', 'study', 'focus', 'school work', 'assignment'],
    [ADVICE_CATEGORIES.BEHAVIOR_MANAGEMENT]: ['tantrum', 'meltdown', 'behavior', 'acting out', 'discipline'],
    [ADVICE_CATEGORIES.EMOTIONAL_REGULATION]: ['emotion', 'feeling', 'upset', 'angry', 'sad', 'frustrated'],
    [ADVICE_CATEGORIES.SOCIAL_SKILLS]: ['friend', 'social', 'play', 'peer', 'interact'],
    [ADVICE_CATEGORIES.ORGANIZATION]: ['organize', 'mess', 'clean', 'lose', 'forget'],
    [ADVICE_CATEGORIES.TRANSITIONS]: ['transition', 'change', 'switch', 'stop', 'move'],
    [ADVICE_CATEGORIES.SENSORY_NEEDS]: ['sensory', 'noise', 'touch', 'texture', 'light', 'sound'],
    [ADVICE_CATEGORIES.GENERAL]: ['help', 'advice', 'support', 'challenge', 'difficulty']
  };
  
  const keywords = categoryKeywords[category] || [];
  const matchingKeywords = keywords.filter((keyword: string) => lowerQuestion.includes(keyword));
  
  confidence += (matchingKeywords.length / keywords.length) * 0.4;
  
  // Increase confidence for longer, more detailed questions
  if (question.length > 50) confidence += 0.1;
  if (question.length > 100) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function personalizeAdvice(advice: string, profile?: ProvisionalProfile | null, category?: AdviceCategory): string {
  if (!profile) return advice;
  
  let personalizedAdvice = advice;
  
  // Personalize based on primary challenge
  if (profile.primaryChallenge && category === ADVICE_CATEGORIES.MORNING_ROUTINE) {
    if (profile.primaryChallenge.includes('morning') || profile.primaryChallenge.includes('routine')) {
      personalizedAdvice += " Given your specific morning challenges, try preparing everything the night before to reduce morning stress.";
    }
  }
  
  // Personalize based on family strength
  if (profile.familyStrength && category === ADVICE_CATEGORIES.GENERAL) {
    if (profile.familyStrength.includes('figuring') || profile.familyStrength.includes('learning')) {
      personalizedAdvice += " Since you're still figuring things out, remember that it's okay to try different approaches and see what works best for your family.";
    }
  }
  
  // Personalize based on support network
  if (profile.supportNetwork && profile.supportNetwork.length > 0 && category === ADVICE_CATEGORIES.BEHAVIOR_MANAGEMENT) {
    personalizedAdvice += " Consider involving your support network in implementing these strategies consistently.";
  }
  
  return personalizedAdvice;
}

function getResourcesForCategory(category: AdviceCategory): string[] {
  const resources: Record<AdviceCategory, string[]> = {
    [ADVICE_CATEGORIES.MORNING_ROUTINE]: [
      "Visual Schedule Templates",
      "Morning Routine Checklist",
      "Timer Apps for Kids"
    ],
    [ADVICE_CATEGORIES.HOMEWORK_FOCUS]: [
      "Pomodoro Technique Guide",
      "Homework Space Setup Tips",
      "Focus Tools for ADHD"
    ],
    [ADVICE_CATEGORIES.BEHAVIOR_MANAGEMENT]: [
      "Positive Reinforcement Strategies",
      "Calm-Down Corner Setup",
      "Behavior Management Techniques"
    ],
    [ADVICE_CATEGORIES.EMOTIONAL_REGULATION]: [
      "Deep Breathing Exercises",
      "Emotion Regulation Tools",
      "Mindfulness Activities for Kids"
    ],
    [ADVICE_CATEGORIES.SOCIAL_SKILLS]: [
      "Social Stories Templates",
      "Social Skills Games",
      "Peer Interaction Strategies"
    ],
    [ADVICE_CATEGORIES.ORGANIZATION]: [
      "Visual Organization Systems",
      "Checklist Templates",
      "Organization Apps for Kids"
    ],
    [ADVICE_CATEGORIES.TRANSITIONS]: [
      "Transition Timer Apps",
      "Visual Transition Cues",
      "Smooth Transition Strategies"
    ],
    [ADVICE_CATEGORIES.SENSORY_NEEDS]: [
      "Sensory Toolkit Guide",
      "Sensory Diet Planning",
      "Sensory-Friendly Activities"
    ],
    [ADVICE_CATEGORIES.GENERAL]: [
      "General ADHD Resources",
      "Parenting Strategies",
      "Professional Support Options"
    ]
  };
  
  return resources[category] || ["General ADHD Resources", "Parenting Strategies", "Professional Support Options"];
} 