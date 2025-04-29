let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let currentFlashcardIndex = 0;
let currentTopic = '';
let quizQuestions = []; // New array to store quiz questions with shuffled options

// Available topics - add new topics here when you add new files
const availableTopics = ['CSC109_ch2', 'CSC109_ch3'];

// DOM Elements
const topicSelection = document.getElementById('topic-selection');
const topicsContainer = document.getElementById('topics-container');
const mainMenu = document.getElementById('main-menu');
const studyContainer = document.getElementById('study-container');
const flashcardsContainer = document.getElementById('flashcards-container');
const quizContainer = document.getElementById('quiz-container');
const markdownContent = document.getElementById('markdown-content');
const flashcardQuestion = document.getElementById('flashcard-question');
const flashcardAnswer = document.getElementById('flashcard-answer');
const showAnswerBtn = document.getElementById('show-answer');
const prevCardBtn = document.getElementById('prev-card');
const nextCardBtn = document.getElementById('next-card');
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options-container');
const explanationContainer = document.getElementById('explanation-container');
const explanationElement = document.getElementById('explanation');
const nextButton = document.getElementById('next-button');
const resultsContainer = document.getElementById('results-container');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');

// Menu buttons
const studyBtn = document.getElementById('study-btn');
const flashcardsBtn = document.getElementById('flashcards-btn');
const testBtn = document.getElementById('test-btn');

// Back buttons
const backToTopicsBtn = document.getElementById('back-to-topics');
const backToMenuBtn = document.getElementById('back-to-menu');
const backToMenuFlashcardsBtn = document.getElementById('back-to-menu-flashcards');
const backToMenuQuizBtn = document.getElementById('back-to-menu-quiz');

// Load available topics
function loadTopics() {
    displayTopics(availableTopics);
}

function displayTopics(topics) {
    topicsContainer.innerHTML = '';
    topics.forEach(topic => {
        const button = document.createElement('button');
        button.classList.add('menu-btn');
        button.textContent = topic;
        button.addEventListener('click', () => selectTopic(topic));
        topicsContainer.appendChild(button);
    });
}

function selectTopic(topic) {
    currentTopic = topic;
    topicSelection.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    
    // Clear previous content
    questions = [];
    markdownContent.innerHTML = '';
    currentQuestionIndex = 0;
    currentFlashcardIndex = 0;
    score = 0;
    
    // Hide all containers
    studyContainer.classList.add('hidden');
    flashcardsContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    explanationContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    
    // Update current topic display
    document.querySelectorAll('.current-topic').forEach(element => {
        element.textContent = topic;
    });
    
    // Load new topic content
    loadTopicContent(topic);
}

async function loadTopicContent(topic) {
    try {
        // Load questions for the selected topic
        const response = await fetch(`topics/${topic}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();
        
        // Load markdown content for the selected topic
        await loadMarkdown(topic);
    } catch (error) {
        console.error('Error loading topic content:', error);
    }
}

// Load markdown content
async function loadMarkdown(topic) {
    try {
        const response = await fetch(`notes/${topic}.md`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdown = await response.text();
        markdownContent.innerHTML = marked.parse(markdown);
    } catch (error) {
        console.error('Error loading markdown:', error);
        markdownContent.innerHTML = '<p>Error loading study notes. Please try again later.</p>';
    }
}

// Show study mode
function showStudy() {
    mainMenu.classList.add('hidden');
    studyContainer.classList.remove('hidden');
}

// Show flashcards mode
function showFlashcards() {
    mainMenu.classList.add('hidden');
    flashcardsContainer.classList.remove('hidden');
    // Shuffle questions for flashcards
    questions = shuffleArray([...questions]);
    currentFlashcardIndex = 0;
    showFlashcard();
}

function showFlashcard() {
    const currentFlashcard = questions[currentFlashcardIndex];
    flashcardQuestion.textContent = currentFlashcard.question;
    flashcardAnswer.textContent = currentFlashcard.explanation;
    flashcardAnswer.classList.add('hidden');
    showAnswerBtn.textContent = 'Show Answer';
}

// Show quiz mode
function showQuiz() {
    mainMenu.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    // Shuffle questions for quiz
    quizQuestions = shuffleArray([...questions]);
    startQuiz();
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
}

function showQuestion() {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';
    explanationContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');

    // Update quiz counter
    document.getElementById('quiz-counter').textContent = `(${currentQuestionIndex + 1}/${quizQuestions.length})`;

    // Create array of options with their indices
    let optionsWithIndices = currentQuestion.options.map((option, index) => ({
        text: option,
        originalIndex: index
    }));

    // Shuffle the options
    optionsWithIndices = shuffleArray([...optionsWithIndices]);

    // Find the new index of the correct answer
    const correctAnswerIndex = optionsWithIndices.findIndex(
        option => option.originalIndex === currentQuestion.correctAnswer
    );

    // Store the correct answer index in the current question
    currentQuestion.currentCorrectAnswer = correctAnswerIndex;

    // Create buttons for the shuffled options
    optionsWithIndices.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option');
        button.textContent = option.text;
        button.addEventListener('click', () => selectAnswer(optionsWithIndices.indexOf(option)));
        optionsContainer.appendChild(button);
    });
}

function selectAnswer(selectedIndex) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    
    options.forEach(option => {
        option.disabled = true;
    });

    if (selectedIndex === currentQuestion.currentCorrectAnswer) {
        options[selectedIndex].classList.add('correct');
        score++;
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[currentQuestion.currentCorrectAnswer].classList.add('correct');
    }

    explanationElement.textContent = currentQuestion.explanation;
    explanationContainer.classList.remove('hidden');
}

function showResults() {
    questionElement.textContent = '';
    optionsContainer.innerHTML = '';
    explanationContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    scoreElement.textContent = `${score} out of ${questions.length}`;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Event Listeners
studyBtn.addEventListener('click', showStudy);
flashcardsBtn.addEventListener('click', showFlashcards);
testBtn.addEventListener('click', showQuiz);

backToTopicsBtn.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    topicSelection.classList.remove('hidden');
});

backToMenuBtn.addEventListener('click', () => {
    studyContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});

backToMenuFlashcardsBtn.addEventListener('click', () => {
    flashcardsContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});

backToMenuQuizBtn.addEventListener('click', () => {
    quizContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});

// Flashcard click handler
document.getElementById('flashcard').addEventListener('click', () => {
    const answer = document.getElementById('flashcard-answer');
    const hint = document.querySelector('.flashcard-hint');
    if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        hint.textContent = 'Click to hide answer';
    } else {
        answer.classList.add('hidden');
        hint.textContent = 'Click to reveal answer';
    }
});

prevCardBtn.addEventListener('click', () => {
    currentFlashcardIndex = (currentFlashcardIndex - 1 + questions.length) % questions.length;
    showFlashcard();
});

nextCardBtn.addEventListener('click', () => {
    currentFlashcardIndex = (currentFlashcardIndex + 1) % questions.length;
    showFlashcard();
});

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
});

restartButton.addEventListener('click', () => {
    // Hide results container
    resultsContainer.classList.add('hidden');
    // Reset and reshuffle
    startQuiz();
});

// Theme switching
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    
    // Update all theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    });
}

// Add theme toggle event listeners
document.querySelectorAll('.theme-toggle').forEach(button => {
    button.addEventListener('click', toggleTheme);
});

// Initialize theme when the page loads
initializeTheme();

// Start the app
loadTopics();
