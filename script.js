// ============================
// GLOBAL VARIABLES & CONFIGURATION
// ============================

// User state variables
let currentLanguage = 'en';
let moodScore = 50;
let stressScore = 50;
let detectedTopics = ['Anxiety', 'Stress'];
let chatHistory = [];
let conversationHistory = [];
let videoStream = null;
let isCameraOn = false;

// Gemini API Configuration - REPLACE WITH YOUR ACTUAL API KEY
const GEMINI_API_KEY = 'AIzaSyB1vlS1kINLd8r7ee0x8xDkloNPmEdQaW4'; // Get from https://makersuite.google.com/app/apikey

// FIX 1: Correctly define the API URL as a constant string using the key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AIzaSyB1vlS1kINLd8r7ee0x8xDkloNPmEdQaW4}`;


// Mental Health Context for AI
const MENTAL_HEALTH_CONTEXT = `You are MindCare AI, a compassionate mental health assistant designed to help students with stress, depression, and anxiety. 

IMPORTANT GUIDELINES:
1. Be empathetic, non-judgmental, and supportive - validate feelings first
2. Use evidence-based therapeutic approaches (CBT, DBT, mindfulness techniques)
3. NEVER give medical advice, diagnoses, or prescribe medications
4. Always encourage professional help when symptoms are severe
5. Provide practical coping strategies and validation
6. Ask open-ended questions to understand feelings better
7. Maintain professional boundaries while being warm
8. Focus on strengths, resilience, and small steps
9. Suggest actionable, practical steps
10. Recognize and validate all emotions

SAFETY PROTOCOLS:
- If user mentions self-harm/suicide, provide crisis resources IMMEDIATELY
- If user needs immediate help, prioritize connecting them to professionals
- Safety always comes before conversation flow
- Never encourage harmful behaviors

CURRENT CONTEXT:
- Platform: Web-based mental health assistant
- User: Student seeking mental health support
- Time: ${new Date().toLocaleString()}
- Goal: Provide immediate support, coping strategies, and guide toward professional help if needed`;

// Emotion analysis patterns
const EMOTION_KEYWORDS = {
    anxiety: ['anxious', 'worried', 'nervous', 'panic', 'overwhelmed', 'scared', 'fear', 'racing thoughts', 'panic attack'],
    depression: ['depressed', 'sad', 'hopeless', 'empty', 'tired', 'worthless', 'guilty', 'suicidal', 'no purpose', 'lonely'],
    stress: ['stressed', 'pressure', 'burnout', 'exhausted', 'tense', 'frustrated', 'burnt out', 'overworked'],
    anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'frustrated'],
    positive: ['happy', 'good', 'better', 'improving', 'hopeful', 'calm', 'relieved', 'excited', 'joyful', 'peaceful']
};

// Crisis resources by language
const CRISIS_RESOURCES = {
    en: {
        suicide: '988 Suicide & Crisis Lifeline (Call or Text 988)',
        text: 'Crisis Text Line: Text HOME to 741741',
        website: 'https://988lifeline.org',
        international: 'International Suicide Hotlines: https://www.opencounseling.com/suicide-hotlines'
    },
    es: {
        suicide: 'Línea de Prevención del Suicidio: 988',
        text: 'Texto AYUDA al 741741',
        website: 'https://suicidepreventionlifeline.org/help-yourself/en-espanol/',
        international: 'Líneas internacionales: https://www.telefonodelaesperanza.org'
    },
    fr: {
        suicide: '3114 - Prévention Suicide (Appel gratuit)',
        text: 'Text SOS to 3114',
        website: 'https://3114.fr',
        international: 'SOS Amitié: 09 72 39 40 50'
    },
    hi: {
        suicide: 'वंदना हेल्पलाइन: 9999 666 555',
        text: 'टेक्स्ट HELP to 88888',
        website: 'https://www.aasra.info',
        international: 'अंतरराष्ट्रीय हेल्पलाइन: https://www.befrienders.org'
    }
};

// Language translations
const TRANSLATIONS = {
    welcome: {
        en: "Welcome to MindCare AI",
        es: "Bienvenido a MindCare AI",
        fr: "Bienvenue sur MindCare AI",
        hi: "माइंडकेयर एआई में आपका स्वागत है",
        zh: "欢迎来到MindCare AI",
        ar: "مرحبًا بك في MindCare AI"
    },
    start_talking: {
        en: "Start Talking",
        es: "Empezar a Hablar",
        fr: "Commencer à Parler",
        hi: "बात शुरू करें",
        zh: "开始对话",
        ar: "ابدأ المحادثة"
    },
    feeling_anxious: {
        en: "I feel anxious today",
        es: "Me siento ansioso hoy",
        fr: "Je me sens anxieux aujourd'hui",
        hi: "मैं आज चिंतित महसूस कर रहा हूँ",
        zh: "我今天感到焦虑",
        ar: "أشعر بالقلق اليوم"
    },
    feeling_depressed: {
        en: "I'm feeling depressed",
        es: "Me siento deprimido",
        fr: "Je me sens déprimé",
        hi: "मैं उदास महसूस कर रहा हूँ",
        zh: "我感到沮丧",
        ar: "أشعر بالاكتئاب"
    },
    need_coping: {
        en: "I need coping strategies",
        es: "Necesito estrategias de afrontamiento",
        fr: "J'ai besoin de stratégies d'adaptation",
        hi: "मुझे मुकाबला करने की रणनीतियों की आवश्यकता है",
        zh: "我需要应对策略",
        ar: "أحتاج إلى استراتيجيات للتكيف"
    }
};

// ============================
// INITIALIZATION
// ============================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('MindCare AI Initializing...');
    
    // Initialize all components
    initializeLanguage();
    initializeChatbot();
    initializeQuestionnaire();
    updateAnalysisDisplay();
    
    // Set up event listeners
    document.getElementById('languageSelect').addEventListener('change', changeLanguage);
    
    // Initialize conversation history
    conversationHistory = [
        {
            role: "user",
            parts: [{ text: MENTAL_HEALTH_CONTEXT }]
        },
        {
            role: "model",
            parts: [{ text: "I understand. I am MindCare AI, ready to provide compassionate mental health support. How are you feeling today?" }]
        }
    ];
    
    // Load saved data
    loadSavedData();
    
    // FIX 2: Re-add the crucial camera event listener setup
    const cameraBtn = document.getElementById('cameraToggleBtn');
    if (cameraBtn) {
        cameraBtn.addEventListener('click', toggleCamera);
    }

    console.log('MindCare AI Initialized Successfully');
});

// ============================
// LANGUAGE MANAGEMENT
// ============================

function initializeLanguage() {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
    currentLanguage = savedLanguage;
    updateLanguageContent();
}

function changeLanguage() {
    const newLanguage = document.getElementById('languageSelect').value;
    currentLanguage = newLanguage;
    localStorage.setItem('preferredLanguage', newLanguage);
    updateLanguageContent();
    
    // Update quick responses
    updateQuickResponses();
    
    showNotification(`Language changed to ${getLanguageName(newLanguage)}`, 'success');
}

function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'hi': 'Hindi',
        'zh': 'Chinese',
        'ar': 'Arabic'
    };
    return languages[code] || 'English';
}

function updateLanguageContent() {
    // Update all translatable elements
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = getTranslation(key, currentLanguage);
    });
}

function getTranslation(key, language) {
    return TRANSLATIONS[key]?.[language] || TRANSLATIONS[key]?.['en'] || key;
}

function updateQuickResponses() {
    const buttons = document.querySelectorAll('.quick-response');
    if (buttons.length >= 3) {
        buttons[0].textContent = TRANSLATIONS.feeling_anxious[currentLanguage] || "I feel anxious today";
        buttons[1].textContent = TRANSLATIONS.feeling_depressed[currentLanguage] || "I'm feeling depressed";
        buttons[2].textContent = TRANSLATIONS.need_coping[currentLanguage] || "I need coping strategies";
    }
}

// ============================
// CHATBOT & GEMINI API INTEGRATION
// ============================

function initializeChatbot() {
    // Load previous chat history
    const savedChat = localStorage.getItem('mindcare_chatHistory');
    if (savedChat) {
        try {
            chatHistory = JSON.parse(savedChat);
            loadChatHistory();
        } catch (e) {
            console.error('Error loading chat history:', e);
            chatHistory = [];
        }
    }
    
    // Load conversation history
    const savedConvo = localStorage.getItem('mindcare_conversationHistory');
    if (savedConvo) {
        try {
            conversationHistory = JSON.parse(savedConvo);
        } catch (e) {
            console.error('Error loading conversation history:', e);
            conversationHistory = [];
        }
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) {
        showNotification('Please enter a message', 'warning');
        return;
    }
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Process message with AI
        const response = await processWithGeminiAPI(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response to chat
        addMessageToChat(response, 'ai');
        
        // Update analysis
        updateAnalysisFromMessage(message, response);
        
    } catch (error) {
        console.error('Error processing message:', error);
        removeTypingIndicator();
        
        // Fallback response
        const fallbackResponse = getFallbackResponse(detectEmotion(message));
        addMessageToChat(fallbackResponse, 'ai');
    }
}

async function processWithGeminiAPI(userMessage) {
    // Check for crisis keywords
    if (isCrisisSituation(userMessage)) {
        return handleCrisisSituation(userMessage);
    }
    
    // Analyze sentiment and topics
    analyzeMessageContent(userMessage);
    
    try {
        // Add user message to conversation history
        conversationHistory.push({
            role: "user",
            parts: [{ text: userMessage }]
        });
        
        // Prepare API request
        const requestBody = {
            contents: conversationHistory,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
        
        console.log('Sending request to Gemini API...');
        
        // Make API call
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Gemini API Response:', data);
        
        // Extract AI response
        let aiResponse = '';
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            aiResponse = data.candidates[0].content.parts[0].text;
        } else {
            console.warn('Unexpected API response structure:', data);
            aiResponse = "I understand you're reaching out. Could you tell me more about what you're experiencing?";
        }
        
        // Add AI response to conversation history
        conversationHistory.push({
            role: "model",
            parts: [{ text: aiResponse }]
        });
        
        // Limit history to prevent token overflow
        if (conversationHistory.length > 20) {
            conversationHistory = [
                conversationHistory[0], // Keep context
                conversationHistory[1], // Keep initial response
                ...conversationHistory.slice(-18) // Keep recent 9 exchanges
            ];
        }
        
        // Save conversation history
        localStorage.setItem('mindcare_conversationHistory', JSON.stringify(conversationHistory));
        
        return aiResponse;
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        
        // Check if it's an API key error
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('403') || error.message.includes('400')) {
            showNotification('API Key Error: Please check your Gemini API key', 'error');
            return "I'm having trouble connecting to my knowledge base. Please check if the API key is correctly configured. In the meantime, I can still help with basic support. How are you feeling right now?";
        }
        
        // Fallback to emotion-based response
        const emotion = detectEmotion(userMessage);
        return getFallbackResponse(emotion);
    }
}

// ============================
// MESSAGE PROCESSING & ANALYSIS
// ============================

function analyzeMessageContent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Detect emotions
    let moodChange = 0;
    let stressChange = 0;
    // Keep existing topics and add new ones
    
    let currentDetectedTopics = [...detectedTopics]; 
    if (currentDetectedTopics.includes('Anxiety') || currentDetectedTopics.includes('Stress')) {
         currentDetectedTopics = currentDetectedTopics.filter(t => t !== 'Anxiety' && t !== 'Stress');
    }

    // Check for anxiety keywords
    if (EMOTION_KEYWORDS.anxiety.some(keyword => lowerMessage.includes(keyword))) {
        if (!currentDetectedTopics.includes('Anxiety')) currentDetectedTopics.push('Anxiety');
        moodChange -= 10;
        stressChange += 15;
    }
    
    // Check for depression keywords
    if (EMOTION_KEYWORDS.depression.some(keyword => lowerMessage.includes(keyword))) {
        if (!currentDetectedTopics.includes('Depression')) currentDetectedTopics.push('Depression');
        moodChange -= 15;
        stressChange += 10;
    }
    
    // Check for stress keywords
    if (EMOTION_KEYWORDS.stress.some(keyword => lowerMessage.includes(keyword))) {
        if (!currentDetectedTopics.includes('Stress')) currentDetectedTopics.push('Stress');
        moodChange -= 5;
        stressChange += 20;
    }
    
    // Check for anger keywords
    if (EMOTION_KEYWORDS.anger.some(keyword => lowerMessage.includes(keyword))) {
        if (!currentDetectedTopics.includes('Anger')) currentDetectedTopics.push('Anger');
        moodChange -= 8;
        stressChange += 12;
    }
    
    // Check for positive keywords
    if (EMOTION_KEYWORDS.positive.some(keyword => lowerMessage.includes(keyword))) {
        if (!currentDetectedTopics.includes('Improvement')) currentDetectedTopics.push('Improvement');
        moodChange += 20;
        stressChange -= 10;
    }
    
    detectedTopics = currentDetectedTopics;

    // Update scores with boundaries
    moodScore = Math.max(0, Math.min(100, moodScore + moodChange));
    stressScore = Math.max(0, Math.min(100, stressScore + stressChange));
    
    // Update display
    updateAnalysisDisplay();
    
    // Save to analytics
    saveEmotionAnalytics(message, moodChange, stressChange);
}

function detectEmotion(message) {
    const lowerMessage = message.toLowerCase();
    
    if (EMOTION_KEYWORDS.anxiety.some(k => lowerMessage.includes(k))) return 'anxiety';
    if (EMOTION_KEYWORDS.depression.some(k => lowerMessage.includes(k))) return 'depression';
    if (EMOTION_KEYWORDS.stress.some(k => lowerMessage.includes(k))) return 'stress';
    if (EMOTION_KEYWORDS.anger.some(k => lowerMessage.includes(k))) return 'anger';
    if (EMOTION_KEYWORDS.positive.some(k => lowerMessage.includes(k))) return 'positive';
    
    return 'neutral';
}

function getFallbackResponse(emotion) {
    const responses = {
        anxiety: [
            "I hear that you're feeling anxious. That's completely valid. Let's try a simple grounding technique: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
            "Anxiety can feel overwhelming. Remember, these feelings are temporary. Would you like to try a breathing exercise together? Inhale for 4 counts, hold for 4, exhale for 6.",
            "It takes courage to talk about anxiety. What's one small thing that usually helps you feel a bit more grounded?"
        ],
        depression: [
            "I'm really glad you're reaching out. Depression can make everything feel heavy. You're not alone in this. What's one thing, no matter how small, that brought you even a tiny bit of peace recently?",
            "Depression often lies to us about our worth. The fact that you're here, reaching out, shows incredible strength. Would you like to share what's been particularly difficult lately?",
            "Remember that depression is an illness, not a personal failing. Healing takes time. Is there a professional you feel comfortable talking to about these feelings?"
        ],
        stress: [
            "Stress can feel like carrying a heavy load. Let's set it down together for a moment. What's one thing causing you stress that you can temporarily set aside?",
            "When we're stressed, our thoughts can race. Try this: Write down everything on your mind without judgment. Sometimes seeing it on paper makes it feel more manageable.",
            "Stress often comes from feeling out of control. What's one small thing within your control that you can do right now to care for yourself?"
        ],
        anger: [
            "Anger is a valid emotion that deserves to be heard. What's underneath the anger? Often there's hurt, fear, or frustration.",
            "When anger surfaces, try this: Take a step back, breathe deeply 3 times, then ask yourself what you need right now.",
            "Anger can be protective. It might be telling you that a boundary has been crossed. What boundary might need attention?"
        ],
        positive: [
            "It's wonderful to hear you're feeling better! Celebrating small victories is important. What helped contribute to this improvement?",
            "Progress isn't always linear, so moments of relief are worth noting. How can you build on this positive feeling?",
            "I'm genuinely happy to hear you're doing better. Remember this feeling when things get tough again - it's proof that difficult feelings pass."
        ],
        neutral: [
            "Thank you for sharing. I'm here to listen without judgment. Could you tell me more about what's on your mind?",
            "Sometimes just putting feelings into words can be helpful. What would you like to talk about today?",
            "I'm listening. Take your time - there's no rush. What's been on your mind lately?"
        ]
    };
    
    const emotionResponses = responses[emotion] || responses.neutral;
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
}

function isCrisisSituation(message) {
    const crisisKeywords = [
        'suicide', 'kill myself', 'end my life', 'want to die',
        'hurting myself', 'self harm', 'can\'t go on', 'no reason to live',
        'want to end it all', 'ending it all', '自杀', '자살', 'suicidio'
    ];
    
    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

function handleCrisisSituation(message) {
    const resources = CRISIS_RESOURCES[currentLanguage] || CRISIS_RESOURCES.en;
    
    // Log crisis situation (for safety monitoring)
    console.warn('CRISIS SITUATION DETECTED:', message.substring(0, 100));
    
    return `🚨 *I hear that you're in significant pain, and I'm deeply concerned for your safety.* *❗ IMMEDIATE HELP - PLEASE CONTACT NOW:*
* *Crisis Lifeline:* ${resources.suicide}
* *Crisis Text Line:* ${resources.text}
* *Website:* ${resources.website}
* *International:* ${resources.international}

*These services are:*
✓ Free and confidential
✓ Available 24/7
✓ Staffed by trained professionals
✓ Ready to help right now

*Please reach out to one of these resources immediately.* You don't have to go through this alone. Your life matters, and there are people who want to support you.

*While waiting to connect:*
* Stay in a safe place
* Remove any means of harm if possible
* Reach out to someone you trust

Would you like me to help you connect with any of these resources or find local support in your area?`;
}

// ============================
// CHAT UI FUNCTIONS
// ============================

function setQuickResponse(text) {
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.value = text;
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function addMessageToChat(message, sender, saveToHistory = true) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return; 

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format message with line breaks
    const formattedMessage = escapeHtml(message).replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="message-content">${formattedMessage}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to history
    if (saveToHistory) {
        chatHistory.push({
            sender,
            message,
            timestamp: now.toISOString(),
            moodScore,
            stressScore
        });
        
        // Keep only last 50 messages
        if (chatHistory.length > 50) {
            chatHistory = chatHistory.slice(-50);
        }
        
        localStorage.setItem('mindcare_chatHistory', JSON.stringify(chatHistory));
    }
}

function loadChatHistory() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Clear existing messages except the first AI message (if it exists)
    let startIndex = 0;
    if (chatMessages.firstElementChild && chatMessages.firstElementChild.classList.contains('ai-message')) {
        // Keep the initial welcome message if it was loaded at startup
        startIndex = 1; 
    }
    
    const existingMessages = chatMessages.querySelectorAll('.message');
    for (let i = existingMessages.length - 1; i >= startIndex; i--) {
        existingMessages[i].remove();
    }
    
    // Add history messages
    chatHistory.forEach(item => {
        if (item.sender !== 'system') {
            addMessageToChat(item.message, item.sender, false);
        }
    });
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ============================
// ANALYSIS & DISPLAY FUNCTIONS
// ============================

function updateAnalysisFromMessage(userMessage, aiResponse) {
    // Analyze AI response for suggestions
    const lowerResponse = aiResponse.toLowerCase();
    
    // Check for coping strategies in response
    const strategies = [];
    if (lowerResponse.includes('breathing') || lowerResponse.includes('breathe')) {
        strategies.push('Breathing Exercise');
    }
    if (lowerResponse.includes('ground') || lowerResponse.includes('5 things')) {
        strategies.push('Grounding Technique');
    }
    if (lowerResponse.includes('write') || lowerResponse.includes('journal')) {
        strategies.push('Journaling');
    }
    if (lowerResponse.includes('professional') || lowerResponse.includes('therapist')) {
        strategies.push('Professional Referral');
    }
    if (lowerResponse.includes('mindful') || lowerResponse.includes('meditat')) {
        strategies.push('Mindfulness');
    }
    
    // Update topics list display (assuming an element exists for this)
    if (strategies.length > 0) {
        const topicsList = document.getElementById('topicsList');
        if (topicsList) {
             strategies.forEach(strategy => {
                if (!topicsList.innerHTML.includes(strategy)) {
                    // This is a simple, DOM-based way to check, usually prefer checking detectedTopics array
                    detectedTopics.push(strategy.replace(' ', '_')); // Add to main array for persistence
                    const topicTag = document.createElement('span');
                    topicTag.className = 'topic-tag';
                    topicTag.textContent = strategy;
                    topicsList.appendChild(topicTag);
                }
            });
        }
    }
    
    // Reduce stress slightly after productive conversation
    setTimeout(() => {
        stressScore = Math.max(0, stressScore - 3);
        moodScore = Math.min(100, moodScore + 2);
        updateAnalysisDisplay();
    }, 1000);
}

function updateAnalysisDisplay() {
    // Update mood level
    let moodText = '';
    if (moodScore > 70) moodText = 'Positive';
    else if (moodScore > 40) moodText = 'Neutral';
    else if (moodScore > 20) moodText = 'Low';
    else moodText = 'Depressed';
    
    const moodLevelEl = document.getElementById('moodLevel');
    const moodProgressEl = document.getElementById('moodProgress');

    if (moodLevelEl) moodLevelEl.textContent = moodText;
    if (moodProgressEl) moodProgressEl.style.width = `${moodScore}%`;
    
    // Update stress level
    let stressText = '';
    if (stressScore > 70) stressText = 'High';
    else if (stressScore > 40) stressText = 'Moderate';
    else if (stressScore > 20) stressText = 'Low';
    else stressText = 'Minimal';
    
    const stressLevelEl = document.getElementById('stressLevel');
    const stressProgressEl = document.getElementById('stressProgress');

    if (stressLevelEl) stressLevelEl.textContent = stressText;
    if (stressProgressEl) stressProgressEl.style.width = `${stressScore}%`;
    
    // Update topics
    const topicsEl = document.getElementById('topics');
    if (topicsEl && detectedTopics.length > 0) {
        // Filter out duplicates and display unique topics
        const uniqueTopics = [...new Set(detectedTopics)];
        topicsEl.textContent = uniqueTopics.join(', ');
    }
    
    // Save current state
    saveCurrentState();
}

// ============================
// QUESTIONNAIRE FUNCTIONS
// ============================

function initializeQuestionnaire() {
    // Load saved questionnaire data
    const savedAssessment = localStorage.getItem('mindcare_assessment');
    if (savedAssessment) {
        try {
            const assessment = JSON.parse(savedAssessment);
            if (assessment.q1 !== undefined) {
                const q1Input = document.querySelector(`input[name="q1"][value="${assessment.q1}"]`);
                if (q1Input) q1Input.checked = true;
            }
            if (assessment.q2 !== undefined) {
                const q2Input = document.querySelector(`input[name="q2"][value="${assessment.q2}"]`);
                if (q2Input) q2Input.checked = true;
            }
        } catch (e) {
            console.error('Error loading assessment:', e);
        }
    }
}

function calculateQuickAssessment() {
    // Get values from quick assessment
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    
    if (!q1 || !q2) {
        showNotification('Please answer all questions', 'warning');
        return;
    }
    
    const score = parseInt(q1.value) + parseInt(q2.value);
    
    // Save assessment
    localStorage.setItem('mindcare_assessment', JSON.stringify({
        q1: q1.value,
        q2: q2.value,
        score: score,
        date: new Date().toISOString()
    }));
    
    // Get result content div
    const resultDiv = document.getElementById('resultContent');
    const resultCard = document.getElementById('assessmentResult');
    
    if (!resultDiv || !resultCard) return;

    let resultHTML = '';
    let recommendation = '';
    let severity = '';
    
    if (score <= 2) {
        severity = 'positive';
        resultHTML = `
            <div class="result-level positive">
                <h5><i class="fas fa-smile"></i> Minimal Distress</h5>
                <p>Your responses suggest minimal symptoms of depression or anxiety.</p>
            </div>
        `;
        recommendation = "Continue practicing self-care and mindfulness. Regular check-ins can help maintain mental wellbeing.";
        moodScore = Math.min(100, moodScore + 10);
    } else if (score <= 4) {
        severity = 'moderate';
        resultHTML = `
            <div class="result-level moderate">
                <h5><i class="fas fa-meh"></i> Mild to Moderate Distress</h5>
                <p>You may be experiencing some symptoms that could benefit from support.</p>
            </div>
        `;
        recommendation = "Consider exploring coping strategies and self-help resources. Regular self-care practices can be helpful.";
        moodScore = Math.max(0, moodScore - 5);
        stressScore = Math.min(100, stressScore + 10);
    } else {
        severity = 'severe';
        resultHTML = `
            <div class="result-level severe">
                <h5><i class="fas fa-frown"></i> Significant Distress</h5>
                <p>Your responses indicate significant symptoms that may benefit from professional support.</p>
            </div>
        `;
        recommendation = "Consider speaking with a mental health professional for personalized support. Early intervention can be very effective.";
        moodScore = Math.max(0, moodScore - 15);
        stressScore = Math.min(100, stressScore + 20);
        if (!detectedTopics.includes('Assessment_High_Risk')) detectedTopics.push('Assessment_High_Risk');
    }
    
    resultHTML += `
        <div class="result-details">
            <p><strong>Score:</strong> ${score}/6 (PHQ-2 & GAD-2 combined)</p>
            <p><strong>Interpretation:</strong> ${getAssessmentInterpretation(score)}</p>
            <p><strong>Recommendation:</strong> ${recommendation}</p>
            <div class="result-actions">
                <button onclick="scrollToSection('chat')" class="action-btn">
                    <i class="fas fa-comment"></i> Talk to AI Assistant
                </button>
                <button onclick="scrollToSection('resources')" class="action-btn">
                    <i class="fas fa-hands-helping"></i> View Resources
                </button>
                <button onclick="resetAssessment()" class="action-btn">
                    <i class="fas fa-redo"></i> Retake Assessment
                </button>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = resultHTML;
    resultCard.classList.remove('hidden');
    
    // Update analysis display
    if (!detectedTopics.includes('Assessment')) detectedTopics.push('Assessment');
    updateAnalysisDisplay();
    
    // Scroll to result
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    // Show notification
    showNotification('Assessment completed. See results below.', 'success');
}

function getAssessmentInterpretation(score) {
    if (score <= 2) return "Likely minimal symptoms";
    if (score <= 4) return "Possible mild symptoms - monitor closely";
    if (score <= 6) return "Possible moderate symptoms - consider professional evaluation";
    return "Possible significant symptoms - professional evaluation recommended";
}

function resetAssessment() {
    document.querySelectorAll('input[name="q1"], input[name="q2"]').forEach(input => {
        input.checked = false;
    });
    const resultCard = document.getElementById('assessmentResult');
    if (resultCard) {
        resultCard.classList.add('hidden');
    }
    localStorage.removeItem('mindcare_assessment');
    showNotification('Assessment reset. You can retake it now.', 'info');
}

// ============================
// FACE DETECTION FUNCTIONS (Simulated)
// ============================

async function startCamera() {
    try {
        const video = document.getElementById('video');
        
        // Get camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
        });
        
        videoStream = stream;
        if (video) video.srcObject = stream;
        if (video) video.play();
        isCameraOn = true;
        
        // Update UI button/state
        const cameraToggleBtn = document.getElementById('cameraToggleBtn');
        if (cameraToggleBtn) {
            cameraToggleBtn.textContent = 'Stop Camera';
            cameraToggleBtn.classList.add('active');
        }
        if (video) video.classList.remove('hidden');
        
        showNotification('Camera started for emotional analysis.', 'info');
        
        // SIMULATE FACE DETECTION / EMOTION ANALYSIS START
        // For simulation, we'll periodically update a dummy emotion.
        if (window.faceDetectionInterval) clearInterval(window.faceDetectionInterval);
        window.faceDetectionInterval = setInterval(simulateFaceDetection, 5000);
        
    } catch (err) {
        console.error('Error accessing camera:', err);
        isCameraOn = false;
        videoStream = null;
        showNotification('Failed to start camera. Please check permissions.', 'error');
        // Ensure UI is reset on failure
        const cameraToggleBtn = document.getElementById('cameraToggleBtn');
        if (cameraToggleBtn) {
            cameraToggleBtn.textContent = 'Start Camera';
            cameraToggleBtn.classList.remove('active');
        }
        const video = document.getElementById('video');
        if (video) video.classList.add('hidden');
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    isCameraOn = false;
    
    const video = document.getElementById('video');
    if (video) video.srcObject = null;
    if (video) video.classList.add('hidden');

    const cameraToggleBtn = document.getElementById('cameraToggleBtn');
    if (cameraToggleBtn) {
        cameraToggleBtn.textContent = 'Start Camera';
        cameraToggleBtn.classList.remove('active');
    }
    
    if (window.faceDetectionInterval) {
        clearInterval(window.faceDetectionInterval);
    }
    showNotification('Camera stopped. Real-time analysis paused.', 'info');
}

function toggleCamera() {
    if (isCameraOn) {
        stopCamera();
    } else {
        startCamera();
    }
}

function simulateFaceDetection() {
    if (!isCameraOn) return;
    
    // Randomly simulate a detected emotion
    const emotions = ['neutral', 'stress', 'anxiety', 'positive', 'neutral', 'neutral'];
    const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    console.log('Simulated Facial Emotion:', detectedEmotion);
    
    // Update mood/stress based on simulated detection
    if (detectedEmotion === 'stress') {
        stressScore = Math.min(100, stressScore + 5);
        moodScore = Math.max(0, moodScore - 3);
        if (!detectedTopics.includes('Face_Stress')) detectedTopics.push('Face_Stress');
    } else if (detectedEmotion === 'anxiety') {
        stressScore = Math.min(100, stressScore + 8);
        moodScore = Math.max(0, moodScore - 5);
        if (!detectedTopics.includes('Face_Anxiety')) detectedTopics.push('Face_Anxiety');
    } else if (detectedEmotion === 'positive') {
        stressScore = Math.max(0, stressScore - 5);
        moodScore = Math.min(100, moodScore + 10);
        if (!detectedTopics.includes('Face_Positive')) detectedTopics.push('Face_Positive');
    }
    
    updateAnalysisDisplay();
}

// ============================
// UTILITY FUNCTIONS
// ============================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    // Use template literal for class names
    notification.className = `notification ${type}`; 
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 4000);
}

// ============================
// DATA STORAGE
// ============================

function saveCurrentState() {
    localStorage.setItem('mindcare_state', JSON.stringify({
        moodScore,
        stressScore,
        detectedTopics
    }));
}

function loadSavedData() {
    const savedState = localStorage.getItem('mindcare_state');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            moodScore = state.moodScore ?? 50; // Use nullish coalescing for safety
            stressScore = state.stressScore ?? 50;
            detectedTopics = state.detectedTopics ?? ['Anxiety', 'Stress'];
            updateAnalysisDisplay();
        } catch (e) {
            console.error('Error loading state data:', e);
        }
    }
}

function saveEmotionAnalytics(message, moodChange, stressChange) {
    let analytics;
    try {
        analytics = JSON.parse(localStorage.getItem('mindcare_analytics')) || [];
    } catch (e) {
        console.error('Error parsing analytics data:', e);
        analytics = [];
    }
    
    analytics.push({
        timestamp: new Date().toISOString(),
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        moodChange,
        stressChange,
        finalMood: moodScore,
        finalStress: stressScore,
        topics: detectedTopics.join(', ')
    });
    
    // Keep last 100 analytics entries
    if (analytics.length > 100) {
        analytics = analytics.slice(-100);
    }
    
    localStorage.setItem('mindcare_analytics', JSON.stringify(analytics));
}

// FIX 3: Event listener added back to ensure camera button works
document.addEventListener('DOMContentLoaded', () => {
    // This part is redundant as it's included in initialize but kept for completeness
    const cameraBtn = document.getElementById('cameraToggleBtn');
    if (cameraBtn) {
        cameraBtn.addEventListener('click', toggleCamera);
    }
    
    // Add event listener for the input field to allow 'Enter' to send
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', handleKeyPress);
    }

    // Add event listeners for quick response buttons
    document.querySelectorAll('.quick-response').forEach(button => {
        button.addEventListener('click', () => setQuickResponse(button.textContent));
    });

    // Add event listener for assessment submission (assuming button ID is 'submitAssessment')
    const submitAssessmentBtn = document.getElementById('submitAssessment');
    if (submitAssessmentBtn) {
        submitAssessmentBtn.addEventListener('click', calculateQuickAssessment);
    }
});