const apiUrl = 'https://opentdb.com/api.php';
const amountOfQuestions = 5;

const questionContainer = document.getElementById('question-container');
const answerButtonsContainer = document.getElementById('answer-buttons');
const previousButton = document.getElementById('previous-button');
const nextButton = document.getElementById('next-button');
const restartButton = document.getElementById('restart-button');
const scoreContainer = document.getElementById('score-container');

let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];

async function fetchQuestions() {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        amount: amountOfQuestions,
        type: 'multiple',
      },
    });
    questions = response.data.results;
    displayQuestion();
  } catch (error) {
    console.error('Failed to fetch questions:', error);
  }
}

function displayQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionContainer.innerHTML = currentQuestion.question;
  answerButtonsContainer.innerHTML = '';

  const allAnswers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  const shuffledAnswers = shuffle(allAnswers);

  shuffledAnswers.forEach((answer) => {
    const button = document.createElement('button');
    button.innerText = decodeHTML(answer);
    button.classList.add('answer-button');
    button.addEventListener('click', () => selectAnswer(answer));
    answerButtonsContainer.appendChild(button);
  });
  if (currentQuestionIndex === amountOfQuestions - 1) {
    showScore();
    return;
  }
  
  updateNavigationButtons();
  updateAnswerButtons();
}

function selectAnswer(answer) {
  userAnswers[currentQuestionIndex] = answer;
  updateAnswerButtons();
  nextButton.disabled = false;
}

function updateAnswerButtons() {
  const currentQuestion = questions[currentQuestionIndex];
  const answerButtons = answerButtonsContainer.querySelectorAll('.answer-button');

  answerButtons.forEach((button) => {
    const answer = button.innerText;
    button.classList.remove('selected');
    button.classList.remove('correct');
    button.classList.remove('wrong');

    if (answer === userAnswers[currentQuestionIndex]) {
      button.classList.add('selected');
    }

    if (answer === currentQuestion.correct_answer && userAnswers[currentQuestionIndex] !== undefined) {
      button.classList.add('correct');
    }

    if (answer !== currentQuestion.correct_answer && answer === userAnswers[currentQuestionIndex]) {
      button.classList.add('wrong');
    }
  });

  if (userAnswers[currentQuestionIndex] !== undefined) {
    const correctAnswerButton = Array.from(answerButtons).find((button) => button.innerText === currentQuestion.correct_answer);
    correctAnswerButton.classList.add('correct-answer');
  }
}

function updateNavigationButtons() {
  previousButton.disabled = currentQuestionIndex === 0;
  nextButton.disabled = currentQuestionIndex === questions.length - 1;
}

function showNextQuestion() {
  currentQuestionIndex++;
  displayQuestion();
}

function showPreviousQuestion() {
  currentQuestionIndex--;
  displayQuestion();
}

function showScore() {
  questionContainer.innerHTML = '';
  answerButtonsContainer.innerHTML = '';

  const score = calculateScore();
  const scoreText = `Your score: ${score} out of ${amountOfQuestions}`;
  const scoreElement = document.createElement('p');
  scoreElement.innerText = scoreText;
  scoreContainer.appendChild(scoreElement);

  previousButton.classList.add('hide');
  nextButton.classList.add('hide');
  scoreContainer.classList.remove('hide');
  restartButton.classList.remove('hide');
}

function restartQuiz() {
  currentQuestionIndex = 0;
  userAnswers = [];
  scoreContainer.innerHTML = ''; // Clear the score container
  scoreContainer.classList.add('hide');
  restartButton.classList.add('hide');
  fetchQuestions();
}

function calculateScore() {
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    const currentQuestion = questions[i];
    const userAnswer = userAnswers[i];
    if (currentQuestion.correct_answer === userAnswer) {
      score++;
    }
  }
  return score;
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

fetchQuestions();

previousButton.addEventListener('click', showPreviousQuestion);
nextButton.addEventListener('click', showNextQuestion);
restartButton.addEventListener('click', restartQuiz);