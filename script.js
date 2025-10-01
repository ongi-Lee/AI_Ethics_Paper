/*
 * Alien Prescription Simulation
 *
 * This script implements an interactive simulation inspired by the
 * alien prescription task described in the research paper “Accuracy‑Time
 * Tradeoffs in AI‑Assisted Decision Making under Time Pressure”.
 *
 * Users can toggle whether time pressure is enabled and choose which
 * type of AI assistance they receive: no AI, AI assistance before
 * submitting an answer, AI assistance after submitting an initial
 * answer, or a mixed condition where the assistance type is chosen
 * randomly for each question. The simulation then presents a series
 * of “aliens” with unique treatment plans and observed symptoms.
 * Participants must select the best medicine based on the rules.
 */

// Dataset: define a set of alien tasks. Each task consists of a unique
// treatment plan (decision set rules) and a list of observed symptoms.
const tasks = [
  {
    id: 1,
    // Each rule has an array of groups (AND) and a result. Within each
    // group, the strings are OR conditions. The boolean `intermediate`
    // indicates whether the result is an intermediate symptom (true) or
    // a final medicine (false).
    rules: [
      { groups: [['shortness of breath', 'seizures', 'brain fog', 'neck pain']], result: 'broken bones', intermediate: true },
      { groups: [['brain fog', 'slurred speech'], ['slurred speech', 'seizures', 'sleepy'], ['bloating']], result: 'fast heart rate', intermediate: true },
      { groups: [['seizures', 'shortness of breath', 'brain fog', 'confusion']], result: 'low blood pressure', intermediate: true },
      { groups: [['shortness of breath', 'sleepy', 'aching joints']], result: 'stimulants', intermediate: false },
      { groups: [['migraine'], ['thirsty'], ['bloating'], ['low blood pressure']], result: 'tranquilizers', intermediate: false },
      { groups: [['shortness of breath', 'aching joints', 'jaundice', 'confusion']], result: 'antibiotics', intermediate: false },
      { groups: [['broken bones', 'seizures'], ['thirsty'], ['vomiting', 'aching joints']], result: 'vitamins', intermediate: false },
      { groups: [['neck pain', 'rash', 'jaundice'], ['slurred speech', 'rash']], result: 'laxatives', intermediate: false }
    ],
    observed: ['thirsty', 'vomiting', 'bloating', 'migraine', 'brain fog']
  },
  {
    id: 2,
    rules: [
      { groups: [['shortness of breath', 'seizures', 'brain fog', 'neck pain']], result: 'broken bones', intermediate: true },
      { groups: [['brain fog', 'slurred speech'], ['slurred speech', 'seizures', 'sleepy'], ['bloating']], result: 'fast heart rate', intermediate: true },
      { groups: [['seizures', 'shortness of breath', 'brain fog', 'confusion']], result: 'low blood pressure', intermediate: true },
      { groups: [['shortness of breath', 'sleepy', 'aching joints']], result: 'stimulants', intermediate: false },
      { groups: [['migraine'], ['thirsty'], ['bloating'], ['low blood pressure']], result: 'tranquilizers', intermediate: false },
      { groups: [['shortness of breath', 'aching joints', 'jaundice', 'confusion']], result: 'antibiotics', intermediate: false },
      { groups: [['broken bones', 'seizures'], ['thirsty'], ['vomiting', 'aching joints']], result: 'vitamins', intermediate: false },
      { groups: [['neck pain', 'rash', 'jaundice'], ['slurred speech', 'rash']], result: 'laxatives', intermediate: false }
    ],
    observed: ['seizures', 'thirsty', 'vomiting', 'bloating', 'neck pain']
  },
  {
    id: 3,
    rules: [
      { groups: [['shortness of breath', 'seizures', 'brain fog', 'neck pain']], result: 'broken bones', intermediate: true },
      { groups: [['brain fog', 'slurred speech'], ['slurred speech', 'seizures', 'sleepy'], ['bloating']], result: 'fast heart rate', intermediate: true },
      { groups: [['seizures', 'shortness of breath', 'brain fog', 'confusion']], result: 'low blood pressure', intermediate: true },
      { groups: [['shortness of breath', 'sleepy', 'aching joints']], result: 'stimulants', intermediate: false },
      { groups: [['migraine'], ['thirsty'], ['bloating'], ['low blood pressure']], result: 'tranquilizers', intermediate: false },
      { groups: [['shortness of breath', 'aching joints', 'jaundice', 'confusion']], result: 'antibiotics', intermediate: false },
      { groups: [['broken bones', 'seizures'], ['thirsty'], ['vomiting', 'aching joints']], result: 'vitamins', intermediate: false },
      { groups: [['neck pain', 'rash', 'jaundice'], ['slurred speech', 'rash']], result: 'laxatives', intermediate: false }
    ],
    observed: ['shortness of breath', 'sleepy', 'jaundice', 'rash']
  },
  {
    id: 4,
    rules: [
      { groups: [['shortness of breath', 'seizures', 'brain fog', 'neck pain']], result: 'broken bones', intermediate: true },
      { groups: [['brain fog', 'slurred speech'], ['slurred speech', 'seizures', 'sleepy'], ['bloating']], result: 'fast heart rate', intermediate: true },
      { groups: [['seizures', 'shortness of breath', 'brain fog', 'confusion']], result: 'low blood pressure', intermediate: true },
      { groups: [['shortness of breath', 'sleepy', 'aching joints']], result: 'stimulants', intermediate: false },
      { groups: [['migraine'], ['thirsty'], ['bloating'], ['low blood pressure']], result: 'tranquilizers', intermediate: false },
      { groups: [['shortness of breath', 'aching joints', 'jaundice', 'confusion']], result: 'antibiotics', intermediate: false },
      { groups: [['broken bones', 'seizures'], ['thirsty'], ['vomiting', 'aching joints']], result: 'vitamins', intermediate: false },
      { groups: [['neck pain', 'rash', 'jaundice'], ['slurred speech', 'rash']], result: 'laxatives', intermediate: false }
    ],
    observed: ['seizures', 'slurred speech', 'sleepy', 'bloating']
  }
];

// List of final medicines and intermediate symptoms, used for display and
// highlighting purposes. We also define a translation map so that Korean
// labels can be shown to the user while keeping the internal codes for
// evaluation logic.
const finalMedicines = ['stimulants', 'tranquilizers', 'antibiotics', 'vitamins', 'laxatives'];
const intermediateSymptoms = ['broken bones', 'fast heart rate', 'low blood pressure'];

// Mapping of medicine codes to Korean labels. If a code is not present
// it will fall back to the code itself.
const medicineLabels = {
  stimulants: '흥분제',
  tranquilizers: '진정제',
  antibiotics: '항생제',
  vitamins: '비타민',
  laxatives: '완하제'
};

// Mapping of symptom and intermediate names to Korean labels. This covers
// all raw symptoms and intermediate results defined in the treatment
// plan so that the displayed information is fully localised.
const symptomLabels = {
  'shortness of breath': '호흡곤란',
  seizures: '발작',
  'brain fog': '뇌안개',
  'neck pain': '목 통증',
  'slurred speech': '말이 어눌함',
  sleepy: '졸림',
  bloating: '복부 팽만감',
  confusion: '혼란',
  'aching joints': '관절 통증',
  migraine: '편두통',
  thirsty: '갈증',
  jaundice: '황달',
  vomiting: '구토',
  rash: '발진',
  'broken bones': '골절',
  'fast heart rate': '빠른 심박수',
  'low blood pressure': '저혈압'
};

// Shuffle helper for randomising tasks order.
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// DOM elements
const configPanel = document.getElementById('configPanel');
const timePressureCheckbox = document.getElementById('timePressure');
const aiModeSelect = document.getElementById('aiMode');
const startBtn = document.getElementById('startBtn');
const quizSection = document.getElementById('quizSection');
const timersDiv = document.getElementById('timers');
const globalTimerEl = document.getElementById('globalTimer');
const localTimerEl = document.getElementById('localTimer');
const treatmentPlanEl = document.getElementById('treatmentPlan');
const observedEl = document.getElementById('observedSymptoms');
const aiBoxEl = document.getElementById('aiBox');
const choicesForm = document.getElementById('choicesForm');
const submitBtn = document.getElementById('submitAnswer');
const resultSection = document.getElementById('resultSection');
const scoreSummaryEl = document.getElementById('scoreSummary');
const restartBtn = document.getElementById('restartBtn');
const alienImgEl = document.getElementById('alienImage');

// Simulation state
let taskOrder = [];
let currentTaskIndex = 0;
let currentAssistMode = 'none';
let globalTimeRemaining = 0;
let globalTimerInterval = null;
let localTimeRemaining = 0;
let localTimerInterval = null;
let awaitingUpdate = false;
let initialAnswer = null;
let answerRecords = [];

// Attach event listeners
startBtn.addEventListener('click', startSimulation);
submitBtn.addEventListener('click', handleSubmit);
restartBtn.addEventListener('click', restartSimulation);

// Start the simulation: initialise state and display the first question.
function startSimulation() {
  // Reset state
  answerRecords = [];
  currentTaskIndex = 0;
  awaitingUpdate = false;
  initialAnswer = null;
  // Determine assistance mode
  currentAssistMode = aiModeSelect.value;
  // Shuffle task order to avoid predictable sequence
  taskOrder = shuffle(tasks);
  // Hide config panel and results, show quiz
  configPanel.classList.add('hidden');
  resultSection.classList.add('hidden');
  quizSection.classList.remove('hidden');
  // Setup timers if time pressure enabled
  if (timePressureCheckbox.checked) {
    timersDiv.classList.remove('hidden');
    // 5 minutes global timer (300 seconds)
    globalTimeRemaining = 300;
    updateGlobalTimerDisplay();
    globalTimerInterval = setInterval(() => {
      globalTimeRemaining--;
      updateGlobalTimerDisplay();
      if (globalTimeRemaining <= 0) {
        clearInterval(globalTimerInterval);
        // End simulation when global timer runs out
        endSimulation();
      }
    }, 1000);
    // Apply large font and blinking effect to timers under time pressure
    globalTimerEl.classList.add('large-timer', 'blinking');
    localTimerEl.classList.add('large-timer', 'blinking');
  } else {
    timersDiv.classList.add('hidden');
    // Remove large/blinking styles if previously added
    globalTimerEl.classList.remove('large-timer', 'blinking');
    localTimerEl.classList.remove('large-timer', 'blinking');
  }
  // Render first question
  renderQuestion();
}

// Render the current question
function renderQuestion() {
  // Clear previous timers
  clearLocalTimer();
  // Reset AI box and submit button
  aiBoxEl.classList.add('hidden');
  aiBoxEl.textContent = '';
  submitBtn.textContent = '답 제출';
  submitBtn.classList.remove('hidden');
  awaitingUpdate = false;
  initialAnswer = null;
  // If no more tasks, end simulation
  if (currentTaskIndex >= taskOrder.length) {
    endSimulation();
    return;
  }
  const task = taskOrder[currentTaskIndex];
  // Evaluate task to compute derived symptoms and best medicine
  const evaluation = evaluateTask(task);
  task.evaluation = evaluation;
  // Determine assistance type for this question
  let assistType = currentAssistMode;
  if (currentAssistMode === 'mixed') {
    // Randomly pick one of none, before, after
    const options = ['none', 'before', 'after'];
    assistType = options[Math.floor(Math.random() * options.length)];
  }
  task.assistType = assistType;
  // Format and display treatment plan
  treatmentPlanEl.innerHTML = formatTreatmentPlan(task.rules);
  // Display observed symptoms
  observedEl.innerHTML = `관찰된 증상: ` + task.observed.map(s => {
    const label = symptomLabels[s] || s;
    return `<span class="symptom">${label}</span>`;
  }).join(', ');
  // Display alien image
  if (alienImgEl) {
    alienImgEl.classList.remove('hidden');
  }
  // Build choice radio buttons
  buildChoices(finalMedicines);
  // Show AI suggestion immediately if AI-before
  if (assistType === 'before') {
    showAIBox(evaluation, task);
  }
  // Start local timer if time pressure enabled
  if (timePressureCheckbox.checked) {
    // 60 seconds for initial attempt
    localTimeRemaining = 60;
    updateLocalTimerDisplay();
    localTimerInterval = setInterval(() => {
      localTimeRemaining--;
      updateLocalTimerDisplay();
      if (localTimeRemaining <= 0) {
        // For AI-after, automatically proceed to reveal AI if time runs out and not yet revealed
        if (assistType === 'after' && !awaitingUpdate) {
          // Reveal AI and start update phase
          handleSubmit();
        } else if (awaitingUpdate) {
          // Finalise answer when update timer expires
          finalizeAnswer();
        } else {
          // No AI or AI-before: just record whatever is selected and proceed
          handleSubmit();
        }
      }
    }, 1000);
  }
}

// Build radio buttons for medicine choices
function buildChoices(options) {
  choicesForm.innerHTML = '';
  options.forEach(option => {
    const id = `choice-${option}`;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'medicine';
    input.id = id;
    input.value = option;
    label.appendChild(input);
    // Display Korean label if available, otherwise fallback to the code
    const displayName = medicineLabels[option] || option;
    label.appendChild(document.createTextNode(displayName));
    choicesForm.appendChild(label);
    // When clicked, mark selected
    input.addEventListener('change', () => {
      // remove selected class from all
      Array.from(choicesForm.querySelectorAll('label')).forEach(lbl => lbl.classList.remove('selected'));
      label.classList.add('selected');
    });
  });
}

// Handle submit button click
function handleSubmit() {
  const task = taskOrder[currentTaskIndex];
  const assistType = task.assistType;
  const selectedInput = choicesForm.querySelector('input[name="medicine"]:checked');
  const selectedValue = selectedInput ? selectedInput.value : null;
  // If AI-after and we haven't shown the AI yet, reveal AI and allow update
  if (assistType === 'after' && !awaitingUpdate) {
    // Save the initial answer
    initialAnswer = selectedValue;
    // Show AI suggestion and explanation
    showAIBox(task.evaluation, task);
    awaitingUpdate = true;
    // Reset local timer to 20 seconds for update phase
    if (timePressureCheckbox.checked) {
      clearLocalTimer();
      localTimeRemaining = 20;
      updateLocalTimerDisplay();
      localTimerInterval = setInterval(() => {
        localTimeRemaining--;
        updateLocalTimerDisplay();
        if (localTimeRemaining <= 0) {
          finalizeAnswer();
        }
      }, 1000);
    }
    // Change button text to indicate update (Korean)
    submitBtn.textContent = '최종 답 제출';
    return;
  }
  // For no-AI or AI-before or update phase of AI-after
  finalizeAnswer();
}

// Finalise answer: evaluate correctness, record, and move to next question
function finalizeAnswer() {
  const task = taskOrder[currentTaskIndex];
  const assistType = task.assistType;
  const selectedInput = choicesForm.querySelector('input[name="medicine"]:checked');
  let finalAnswer = selectedInput ? selectedInput.value : null;
  // If AI-after update phase but user did not change selection, keep initial answer
  if (assistType === 'after' && awaitingUpdate && !finalAnswer) {
    finalAnswer = initialAnswer;
  }
  // Clear timers for this question
  clearLocalTimer();
  // Compute correctness
  let correctness = 'wrong';
  const evalScores = task.evaluation.finalScores;
  if (finalAnswer) {
    const bestScore = Math.max(...Object.values(evalScores));
    const bestMeds = Object.keys(evalScores).filter(m => evalScores[m] === bestScore);
    if (bestMeds.includes(finalAnswer)) {
      correctness = 'best';
    } else if (evalScores[finalAnswer] > 0) {
      correctness = 'suboptimal';
    }
  }
  // Record result
  answerRecords.push({
    taskId: task.id,
    assistType,
    selected: finalAnswer,
    correctness
  });
  // Move to next task
  currentTaskIndex++;
  renderQuestion();
}

// End simulation and display results
function endSimulation() {
  // Clear timers
  clearLocalTimer();
  if (globalTimerInterval) {
    clearInterval(globalTimerInterval);
    globalTimerInterval = null;
  }
  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');
  // Compute statistics
  let bestCount = answerRecords.filter(r => r.correctness === 'best').length;
  let suboptimalCount = answerRecords.filter(r => r.correctness === 'suboptimal').length;
  let wrongCount = answerRecords.filter(r => r.correctness === 'wrong').length;
  const total = answerRecords.length;
  scoreSummaryEl.innerHTML = `총 ${total}개 문제를 완료했습니다.<br>` +
    `최적 정답: ${bestCount}개<br>` +
    `차선 정답: ${suboptimalCount}개<br>` +
    `오답: ${wrongCount}개`;

  // Compute a confusion matrix for tasks where AI assistance was provided
  // Categories: AI 권고가 정답/오답과 사용자가 정답/오답인 경우
  let aiCorrect_userCorrect = 0;
  let aiCorrect_userWrong = 0;
  let aiWrong_userCorrect = 0;
  let aiWrong_userWrong = 0;
  answerRecords.forEach(record => {
    // Skip if no AI assistance
    if (record.assistType === 'none') return;
    // Find the corresponding task to check AI recommendation
    const task = taskOrder.find(t => t.id === record.taskId);
    if (!task || !task.aiRecommendation) return;
    // Determine if AI recommendation was correct
    const evalScores = task.evaluation.finalScores;
    const maxScore = Math.max(...Object.values(evalScores));
    const bestMeds = Object.keys(evalScores).filter(m => evalScores[m] === maxScore);
    const aiCorrect = bestMeds.includes(task.aiRecommendation);
    // Determine if user answer was correct
    const userCorrect = record.correctness === 'best';
    if (aiCorrect && userCorrect) aiCorrect_userCorrect++;
    else if (aiCorrect && !userCorrect) aiCorrect_userWrong++;
    else if (!aiCorrect && userCorrect) aiWrong_userCorrect++;
    else aiWrong_userWrong++;
  });
  // Build the confusion matrix table
  let matrixHTML = '<h3>AI 권고와 사용자 결과 혼동 행렬</h3>';
  matrixHTML += '<table class="confusion-matrix"><thead><tr><th rowspan="2">AI 권고</th><th colspan="2">사용자</th></tr>';
  matrixHTML += '<tr><th>정답</th><th>오답</th></tr></thead><tbody>';
  matrixHTML += `<tr><th>정답</th><td>${aiCorrect_userCorrect}</td><td>${aiCorrect_userWrong}</td></tr>`;
  matrixHTML += `<tr><th>오답</th><td>${aiWrong_userCorrect}</td><td>${aiWrong_userWrong}</td></tr>`;
  matrixHTML += '</tbody></table>';
  scoreSummaryEl.innerHTML += '<br><br>' + matrixHTML;
}

// Restart simulation: return to settings
function restartSimulation() {
  // Clear timers
  clearLocalTimer();
  if (globalTimerInterval) {
    clearInterval(globalTimerInterval);
    globalTimerInterval = null;
  }
  // Show config panel
  configPanel.classList.remove('hidden');
  quizSection.classList.add('hidden');
  resultSection.classList.add('hidden');
}

// Show AI suggestion box with recommendation and brief explanation
function showAIBox(evaluation, task) {
  // AI recommendation is the medicine with highest score
  const scores = evaluation.finalScores;
  const bestScore = Math.max(...Object.values(scores));
  const bestMeds = Object.keys(scores).filter(m => scores[m] === bestScore);
  // In case of ties, choose one at random
  const aiRecommendation = bestMeds[Math.floor(Math.random() * bestMeds.length)];

  // Save recommendation on the task for later analysis (confusion matrix)
  task.aiRecommendation = aiRecommendation;
  // Determine a reason: pick an intermediate symptom used in the rule if available,
  // otherwise pick one of the observed symptoms from the best combination.
  let reasonSymptom = null;
  // Find the rule for this medicine
  const rule = task.rules.find(r => !r.intermediate && r.result === aiRecommendation);
  if (rule) {
    // Check for intermediate in groups that are derived
    for (const group of rule.groups) {
      for (const sym of group) {
        if (intermediateSymptoms.includes(sym) && evaluation.derived.has(sym)) {
          reasonSymptom = sym;
          break;
        }
      }
      if (reasonSymptom) break;
    }
    if (!reasonSymptom) {
      // Pick an observed symptom from the groups that is present
      for (const group of rule.groups) {
        for (const sym of group) {
          if (task.observed.includes(sym)) {
            reasonSymptom = sym;
            break;
          }
        }
        if (reasonSymptom) break;
      }
    }
  }
  // Build message in Korean using the translation map for medicine labels
  const recommendationLabel = medicineLabels[aiRecommendation] || aiRecommendation;
  let message = `AI가 <strong>${recommendationLabel}</strong> 처방을 권장합니다.`;
  if (reasonSymptom) {
    // Use Korean label for the reason symptom
    const reasonLabel = symptomLabels[reasonSymptom] || reasonSymptom;
    message += ` 이유: 외계인에게 <span class="${intermediateSymptoms.includes(reasonSymptom) ? 'intermediate' : 'symptom'}">${reasonLabel}</span> 증상이 포함되어 있기 때문입니다.`;
  }
  aiBoxEl.innerHTML = message;
  aiBoxEl.classList.remove('hidden');
}

// Evaluate a task: forward chain intermediate symptoms and compute scores for final medicines
function evaluateTask(task) {
  const observed = task.observed;
  const derived = new Set();
  // Forward chaining to derive intermediate symptoms
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of task.rules) {
      if (rule.intermediate && !derived.has(rule.result)) {
        const satisfied = rule.groups.every(group => group.some(sym => observed.includes(sym) || derived.has(sym)));
        if (satisfied) {
          derived.add(rule.result);
          changed = true;
        }
      }
    }
  }
  // Compute scores for final medicines
  const finalScores = {};
  const usedCombos = {};
  for (const rule of task.rules) {
    if (!rule.intermediate) {
      // Check if all groups satisfied
      const satisfiedGroups = [];
      let allSatisfied = true;
      for (const group of rule.groups) {
        const availableSyms = group.filter(sym => observed.includes(sym) || derived.has(sym));
        if (availableSyms.length === 0) {
          allSatisfied = false;
          break;
        }
        satisfiedGroups.push(availableSyms);
      }
      if (!allSatisfied) continue;
      // Generate all combinations and count unique observed symptoms used
      let bestCount = 0;
      let bestSet = new Set();
      function explore(idx, currentSet) {
        if (idx >= satisfiedGroups.length) {
          // Count unique observed symptoms
          const count = Array.from(currentSet).filter(sym => observed.includes(sym)).length;
          if (count > bestCount) {
            bestCount = count;
            bestSet = new Set(currentSet);
          }
          return;
        }
        for (const sym of satisfiedGroups[idx]) {
          currentSet.add(sym);
          explore(idx + 1, currentSet);
          currentSet.delete(sym);
        }
      }
      explore(0, new Set());
      finalScores[rule.result] = bestCount;
      usedCombos[rule.result] = bestSet;
    }
  }
  return { derived, finalScores, usedCombos };
}

// Format the treatment plan into HTML with highlighting
function formatTreatmentPlan(rules) {
  return rules.map(rule => {
    const groupStr = rule.groups.map(group => {
      const content = group.map(sym => wrapSym(sym)).join(' or ');
      return `(${content})`;
    }).join(' and ');
    const resultStr = wrapSym(rule.result);
    return `<div class="rule">${groupStr} → ${resultStr}</div>`;
  }).join('');
}

// Wrap a symptom or medicine in a span with appropriate class for colour
function wrapSym(sym) {
  if (finalMedicines.includes(sym)) {
    // Use Korean label for medicines if available
    const label = medicineLabels[sym] || sym;
    return `<span class="medicine">${label}</span>`;
  } else if (intermediateSymptoms.includes(sym)) {
    // Intermediate results use Korean label if available
    const label = symptomLabels[sym] || sym;
    return `<span class="intermediate">${label}</span>`;
  } else {
    // Raw symptoms use Korean label if available
    const label = symptomLabels[sym] || sym;
    return `<span class="symptom">${label}</span>`;
  }
}

// Update global timer display and handle colour changes
function updateGlobalTimerDisplay() {
  const minutes = Math.floor(globalTimeRemaining / 60);
  const seconds = globalTimeRemaining % 60;
  globalTimerEl.textContent = `전체 타이머: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  // Colour change not necessary for global timer
}

// Update local timer display and handle colour changes
function updateLocalTimerDisplay() {
  const seconds = localTimeRemaining;
  localTimerEl.textContent = `남은 시간: ${seconds}s`;
  localTimerEl.classList.remove('warning', 'danger');
  if (seconds <= 0) {
    localTimerEl.classList.add('danger');
  } else if (seconds <= 10) {
    localTimerEl.classList.add('warning');
  }
}

// Clear the local timer interval
function clearLocalTimer() {
  if (localTimerInterval) {
    clearInterval(localTimerInterval);
    localTimerInterval = null;
  }
}