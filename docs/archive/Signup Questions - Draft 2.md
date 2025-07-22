# Signup Questions - Draft 2

Welcome! We're here to help make your family's journey a little easier. These quick questions help us personalize your experience - no pressure, just tell us what feels right.

**This will take just 2 minutes.**

---

## Question 1: Daily Challenges

**"What part of the day feels most overwhelming for your family?"**

*Choose the option that feels most true for you right now:*

- `[ ☀️ ]` Mornings & Getting Ready
- `[ 🎒 ]` After School & Homework Time  
- `[ 😤 ]` Big Emotions & Meltdowns
- `[ 🌙 ]` Bedtime & Winding Down
- `[ 🤷 ]` It changes every day

**How this helps us:**
- **Stores in Firestore:** `primaryChallenge: 'mornings'` in child profile
- **Primes AI Quick Advice:** When you use the AI Helper, it will know your biggest daily struggle
- **Personalizes Dashboard:** Shows relevant "Skill Journey Playbooks" for your specific challenge
- **Guides Resource Recommendations:** Suggests articles and strategies for your toughest time

---

## Question 2: Child's Strengths

**"What's something your child does that makes you proud?"**

*Every child is amazing in their own way - what makes yours special?*

- `[ 🎨 ]` Creative & Imaginative
- `[ ⚡️ ]` Full of Energy & Enthusiasm
- `[ ❤️ ]` Kind & Caring
- `[ 🧠 ]` Curious & Quick to Learn
- `[ 🌟 ]` Something else entirely

**How this helps us:**
- **Stores in Firestore:** `primaryStrength: 'creative'` in child profile
- **Personalizes AI Stories:** "Write a story where the hero uses their **Incredible Creativity** to solve the problem"
- **Tailors Celebrations:** Instead of "Great job!", we say "Your creativity was the key to success today!"
- **Builds Confidence:** Focuses on what makes your child amazing

---

## Question 3: Support Network

**"Who else is part of your child's support team?"**

*There's no right answer - every family is different:*

- `[ 👨‍⚕️ ]` Doctor or therapist
- `[ 👩‍🏫 ]` Teacher or school support
- `[ 👨‍👩‍👧‍👦 ]` Extended family
- `[ 🤝 ]` Support groups or other parents
- `[ 🆘 ]` We're figuring this out as we go

**How this helps us:**
- **Stores in Firestore:** `supportNetwork: ['therapist', 'teacher']` in child profile
- **Enhances AI Advice:** "Since you have a therapist, you might want to discuss this strategy with them"
- **Personalizes Resources:** Suggests articles relevant to your support level
- **Guides Feature Development:** Helps us build tools that work for your situation

---

## Question 4: Current Strategies

**"What's already working well for your family?"**

*We want to build on what you're already doing right:*

- `[ 📅 ]` We have some good routines
- `[ 🎯 ]` We use rewards and positive reinforcement
- `[ 🧘 ]` We practice calming techniques
- `[ 🤷 ]` We're still figuring it out
- `[ 💪 ]` We're trying lots of different things

**How this helps us:**
- **Stores in Firestore:** `currentStrategies: ['routines', 'positive_reinforcement']` in child profile
- **Avoids Redundancy:** Won't suggest strategies you've already tried
- **Builds on Strengths:** Enhances what's already working
- **Respects Your Efforts:** Acknowledges the work you're already doing

---

## Data Integration with Existing Child Profile

These signup questions will populate the existing child profile structure:

```typescript
interface Child {
  id: string;
  familyId: string;
  name: string;
  age: number;
  diagnosis: string;
  strengths: string[];           // From Question 2
  challenges: string[];          // From Question 1
  interests: string[];
  medications?: string;
  allergies?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // New fields from signup questions:
  primaryChallenge?: string;     // From Question 1
  primaryStrength?: string;      // From Question 2
  supportNetwork?: string[];     // From Question 3
  currentStrategies?: string[];  // From Question 4
}
```

## Strategic Benefits

### For AI Quick Advice
- **Immediate Context:** AI knows your biggest daily challenge from day one
- **Personalized Responses:** Advice tailored to your child's strengths and support level
- **Respects Current Efforts:** Won't suggest strategies you've already tried
- **Support-Aware:** Considers what resources are available to your family

### For App Personalization
- **Dashboard Customization:** Shows relevant skill journeys and resources
- **Resource Library:** Prioritizes articles for your specific situation
- **AI Story Generation:** Creates stories that celebrate your child's unique strengths
- **Progress Tracking:** Baseline data for measuring improvement over time

### For Feature Development
- **User Insights:** Understands what families really need
- **Priority Setting:** Focuses development on most common challenges
- **Support Integration:** Guides therapist/school sharing features
- **Community Building:** Identifies common support needs

## User Experience Flow

1. **Warm Welcome:** "Welcome! We're here to help make your family's journey a little easier."
2. **Progress Indicator:** "Question 1 of 4" with visual progress bar
3. **Time Estimate:** "This will take just 2 minutes"
4. **Skip Option:** "I'll come back to this later" button
5. **Reassurance:** "There are no wrong answers - just tell us what feels right"
6. **Completion:** "Perfect! We're personalizing your experience..."

## Accessibility & Inclusivity

- **Gender Neutral:** Uses "your child" instead of assuming gender
- **Family Structure:** Works for single parents, blended families, guardians
- **Cultural Sensitivity:** Avoids assumptions about "normal" family routines
- **Diverse Experiences:** Includes options for different support levels and situations
- **No Judgment:** Acknowledges that every family's journey is different

This approach ensures every family feels seen, supported, and understood from their very first interaction with the app. 