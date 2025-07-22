Here are three questions designed to gather the most impactful data, and how that data intelligently enhances the app's features.

**Screen 1: The Primary Challenge**

* **The Question:** "To help you get started, what's the most challenging part of your day right now?"  
* **The Choices (Presented as tappable cards):**  
  1. `[ ☀️ ]` Mornings & Getting Out the Door  
  2. `[ 🎒 ]` After School & Homework  
  3. `[ 😠 ]` Emotional Meltdowns & Big Feelings  
  4. `[ 🌙 ]` Bedtime & Winding Down  
* **How it's Used (The Smart Part):**  
  1. **Stored in Firestore:** The choice (e.g., `primaryChallenge: 'mornings'`) is saved to the child's profile document.  
  2. **Primes the "Right Now" AI:** When this parent uses the AI Helper for the first time, the prompt will be invisibly "primed" with this context, leading to a much more relevant and impressive first answer.  
  3. **Personalizes the Dashboard:** The main dashboard can automatically feature a relevant "Skill Journey Playbook." If they chose "Mornings," a card for "The 'Get Out the Door' Routine" will be waiting for them on their home screen.

**Screen 2: The Core Strength**

* **The Question:** "Every child has amazing gifts. What's one of your child's superpowers?"  
* **The Choices:**  
  1. `[ 🎨 ]` Incredibly Creative & Imaginative  
  2. `[ ⚡️ ]` Full of Passionate Energy  
  3. `[ ❤️ ]` Deeply Empathetic & Caring  
  4. `[ 🧠 ]` A Curious & Quick Learner  
* **How it's Used (The Smart Part):**  
  1. **Stored in Firestore:** The choice (e.g., `primaryStrength: 'creative'`) is saved to the child's profile.  
  2. **Personalizes AI Stories:** When the parent uses the AI Story-Spinner, the prompt will be enhanced: "...write a story where the hero, Leo, uses his **Incredible Creativity** to solve the problem." This makes the stories deeply personal and affirming.  
  3. **Tailors Reinforcement:** The app's celebratory messages can be more specific. Instead of "Great job\!", it might say, "Leo's creativity was the key to success today\!"

**Screen 3: The Parent's Goal**

* **The Question:** "What are you hoping this app can help you with the most?"  
* **The Choices:**  
  1. `[ 🛠️ ]` Practical Tools & Daily Routines  
  2. `[ 💡 ]` A Deeper Understanding of my Child  
  3. `[ 🤝 ]` Feeling Less Alone & More Supported  
* **How it's Used (The Smart Part):**  
  1. **Stored in Firestore:** The choice (e.g., `parentGoal: 'practical_tools'`) is saved to the parent's user profile.  
  2. **Customizes the Onboarding Tour:** After this question, the app can offer a very short, guided tour that prioritizes the features they care about most. If they chose "Practical Tools," it would show them the Scheduler and the "Playbook Library" first.  
  3. **Informs Your Roadmap:** On the backend, you get invaluable, aggregated data about what your users *really* want, which helps you prioritize future feature development.

