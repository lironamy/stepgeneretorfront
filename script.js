import { getVibrationPattern } from './VibrationPattern.js';
import { getSuctionPattern } from './SuctionPattern.js';
import { getVibrationIntensity } from './VibrationIntensity.js';
import { getSuctionIntensity } from './SuctionIntensity.js';


fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        const questionsArray = data.questions; 
        if (Array.isArray(questionsArray)) {
            displayQuestions(questionsArray);
        } else {
            throw new Error('The fetched data does not contain an array of questions');
        }
    })
    .catch(error => console.error('Error:', error));

    function displayQuestions(questions) {
        const container = document.getElementById('questions-container');
        questions.forEach((questionObj, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question');
    
            const questionText = document.createElement('h2');
            questionText.textContent = questionObj.question;
            questionDiv.appendChild(questionText);
    
            // If it's the Hrausel preferences question
            if (questionObj.question.includes("What are your hrausel preferences?")) {
                // Predefined valid options for Hrausel preferences
                const hrauselOptions = [
                    { label: "Combination (1/1)", value: [1, 1] },
                    { label: "Vaginal (1/0)", value: [1, 0] },
                    { label: "Clitoral (0/1)", value: [0, 1] }
                ];
    
                hrauselOptions.forEach(option => {
                    const answerDiv = document.createElement('div');
                    answerDiv.classList.add('answer');
                
                    const radioButton = document.createElement('input');
                    radioButton.type = 'radio';
                    radioButton.name = `hrausel_preference_${index}`;
                    radioButton.value = JSON.stringify(option.value); // Store as JSON string
                
                    const answerLabel = document.createElement('label');
                    answerLabel.appendChild(radioButton);  // Append radio button first
                    answerLabel.append(option.label);      // Then append the text label
                
                    answerDiv.appendChild(answerLabel);
                    questionDiv.appendChild(answerDiv);
                });
                
            } else if (questionObj.question === "How would you articulate your ideal intimacy?") {
                questionObj.possible_answers.forEach(answerObj => {
                    const answerDiv = document.createElement('div');
                    answerDiv.classList.add('answer');
    
                    const answerLabel = document.createElement('label');
    
                    // Check if the current part is 'Foreplay', 'Midway', or 'End'
                    if (['Foreplay', 'Midway', 'End'].includes(answerObj.possible_answers)) {
                        answerLabel.textContent = answerObj.possible_answers;
                        answerDiv.appendChild(answerLabel);
    
                        const imagesContainer = document.createElement('div');
                        imagesContainer.classList.add('images-container');
    
                        // Use the same image set for Foreplay, Midway, and End
                        answerObj.Answer_translation.forEach(translationObj => {
                            const imgLabel = document.createElement('label');
                            imgLabel.classList.add('image-label');
    
                            const radioButton = document.createElement('input');
                            radioButton.type = 'radio';
                            radioButton.name = `intimacy_${answerObj.possible_answers.toLowerCase()}_${index}`;
                            radioButton.value = translationObj.Answer; // e.g., '1', '2', etc.
    
                            const img = document.createElement('img');
                            img.src = `image/${translationObj.Answer}.PNG`; // Ensure this path is correct
                            img.alt = `Option ${translationObj.Answer}`;
                            img.classList.add('intimacy-image');
    
                            imgLabel.appendChild(radioButton);
                            imgLabel.appendChild(img);
    
                            imagesContainer.appendChild(imgLabel);
                        });
    
                        answerDiv.appendChild(imagesContainer);
                    } 
                    else {
                        if (questionObj.type === 'multiple' && answerObj['Answer_translation']) {
                            let translation = answerObj['Answer_translation'][0];
                            let levels = answerObj['Answer_translation'].length;
                            const slider = document.createElement('input');
                            slider.type = 'range';
                            slider.min = 1;
                            slider.max = levels;
                            slider.value = translation.Answer;
    
                            answerLabel.textContent = answerObj.possible_answers;
                            answerDiv.appendChild(answerLabel);
    
                            const sliderValue = document.createElement('span');
                            sliderValue.textContent = slider.value;
                            slider.addEventListener('input', () => {
                                sliderValue.textContent = slider.value;
                            });
    
                            answerDiv.appendChild(slider);
                            answerDiv.appendChild(sliderValue);
                        } else if (questionObj.type === 'single') {
                            // Handle single-choice questions
                            const radioButton = document.createElement('input');
                            radioButton.type = 'radio';
                            radioButton.name = `question${index}`;
                            radioButton.value = answerObj.Answer;
    
                            radioButton.setAttribute('data-translation', JSON.stringify(answerObj['Answer_translation']));
    
                            answerLabel.appendChild(radioButton);
                            answerLabel.append(answerObj.Answer);
                            answerDiv.appendChild(answerLabel);
                        }
                    }
    
                    questionDiv.appendChild(answerDiv);
                });
            } 
            // Handle other questions as usual
            else if (questionObj.possible_answers) {
                questionObj.possible_answers.forEach(answerObj => {
                    const answerDiv = document.createElement('div');
                    answerDiv.classList.add('answer');
    
                    const answerLabel = document.createElement('label');
    
                    if (questionObj.type === 'multiple' && answerObj['Answer_translation']) {
                        let translation = answerObj['Answer_translation'][0];
                        let levels = answerObj['Answer_translation'].length;
                        const slider = document.createElement('input');
                        slider.type = 'range';
                        slider.min = 1;
                        slider.max = levels;
                        slider.value = translation.Answer;
    
                        answerLabel.textContent = answerObj.possible_answers;
                        answerDiv.appendChild(answerLabel);
    
                        const sliderValue = document.createElement('span');
                        sliderValue.textContent = slider.value;
                        slider.addEventListener('input', () => {
                            sliderValue.textContent = slider.value;
                        });
    
                        answerDiv.appendChild(slider);
                        answerDiv.appendChild(sliderValue);
                    } else if (questionObj.type === 'single') {
                        // Handle single-choice questions
                        const radioButton = document.createElement('input');
                        radioButton.type = 'radio';
                        radioButton.name = `question${index}`;
                        radioButton.value = answerObj.Answer;
    
                        radioButton.setAttribute('data-translation', JSON.stringify(answerObj['Answer_translation']));
    
                        answerLabel.appendChild(radioButton);
                        answerLabel.append(answerObj.Answer);
                        answerDiv.appendChild(answerLabel);
                    }
    
                    questionDiv.appendChild(answerDiv);
                });
            } 
            else {
                const noAnswerDiv = document.createElement('div');
                noAnswerDiv.classList.add('no-answer');
                noAnswerDiv.textContent = 'No possible answers available';
                questionDiv.appendChild(noAnswerDiv);
            }
    
            handleHrauselSelection();
    
            container.appendChild(questionDiv);
        });
    }
    
    function getAnswers() {
        const questions = document.querySelectorAll('.question');
        return Array.from(questions).map((question, index) => {
            const questionText = question.querySelector('h2').textContent;
            let answers = {};
            let type = '';
    
            const answerDivs = question.querySelectorAll('.answer');
    
            // Handle Hrausel preferences
            if (questionText.includes("What are your hrausel preferences?")) {
                type = 'single';
                const selectedRadio = question.querySelector('input[type="radio"]:checked');
                if (selectedRadio) {
                    answers = JSON.parse(selectedRadio.value); // Parse the stored array value
                } else {
                    console.warn(`No option selected for Hrausel preferences`);
                }
            } 
            // Handle "How would you articulate your ideal intimacy?" question
            else if (questionText.includes("How would you articulate your ideal intimacy?")) {
                type = 'multiple';
                const intimacyAnswers = {};
    
                answerDivs.forEach(answerDiv => {
                    const label = answerDiv.querySelector('label').textContent.trim();
    
                    if (['Foreplay', 'Midway', 'End'].includes(label)) {
                        // Handle image-based selection
                        const selectedImageRadio = answerDiv.querySelector('input[type="radio"]:checked');
                        if (selectedImageRadio) {
                            intimacyAnswers[label] = selectedImageRadio.value; // e.g., '1', '2', etc.
                        } else {
                            console.warn(`No image selected for ${label} intimacy`);
                        }
                    } else {
                        // Handle other possible answers if any
                        const slider = answerDiv.querySelector('input[type="range"]');
                        if (slider) {
                            intimacyAnswers[label] = slider.value;
                        }
                    }
                });
    
                answers = intimacyAnswers;
            }
            // Handle other multiple-choice questions with sliders
            else if (question.querySelector('input[type="range"]')) {
                type = 'multiple';
                answerDivs.forEach(answerDiv => {
                    const label = answerDiv.querySelector('label').textContent.trim();
                    const rangeInput = answerDiv.querySelector('input[type="range"]');
                    if (rangeInput) {
                        answers[label] = rangeInput.value;
                    }
                });
            }
            // Handle single-choice questions
            else {
                type = 'single';
                const radioInput = question.querySelector('input[type="radio"]:checked');
                if (radioInput) {
                    answers = radioInput.value;
                    const translation = safeJSONParse(radioInput.getAttribute('data-translation'));
                    
                    return { question: questionText, type, answers, translation };
                } else {
                    console.warn(`No radio button selected for question: ${questionText}`);
                }
            }
    
            return { question: questionText, type, answers };
        });
    }
    
    
    
    
    
    

// Utility function for safe JSON parsing
function safeJSONParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return null;
    }
}


function clampToMax(value, max) {
    let num;
    if (Array.isArray(value)) {
        num = value.map(v => parseFloat(v));
    } else if (typeof value === 'string') {
        num = parseFloat(value);
    } else if (typeof value === 'number') {
        num = value;
    } else {
        num = 0; 
    }
    if (Array.isArray(num)) {
        return num.map(v => isNaN(v) ? 0 : Math.min(v, max));
    } else {
        return isNaN(num) ? 0 : Math.min(num, max);
    }
}


function getStimulationValues(i, stimulationPreference) {
    let stage;
    if (i < 40) {
        stage = "start";
    } else if (i < 80) {
        stage = "middle";
    } else {
        stage = "end";
    }
    
    return stimulationPreference.Answer_translation[stage];
}




async function fetchAndApplyAnswers() {
    try {


        console.log('Entire answersData:', answersData);

        applyAnswers(answersData);

        // Extract necessary values to generate the table immediately after answers are applied
        let heatLevelExt, heatLevelInt, hrauselPreference, intimacyStartValue, intimacyMidwayValue, intimacyEndValue;
        let diversityValue, intenseLvlStartValue, intenseLvlMidwayValue, intenseLvlEndValue, ExternalLubricationLevel;
        let stimulationPreference;

        // Extract the necessary answers from the fetched data
        answersData.forEach(answer => {

            if (answer.question && answer.question.includes("Which heat level takes your pleasure up a notch?")) {
                if (answer.answer_id !== undefined) {
                    heatLevelExt = clampToMax(answer.answer_id, 42);
                    heatLevelInt = clampToMax(answer.answer_id, 42);
                }
            } else if (answer.question && answer.question.includes("What are your hrausel preferences?")) {
                if (Array.isArray(answer.answer_id) && answer.answer_id.length > 0) {
                    hrauselPreference = answer.answer_id;
                }
            } else if (answer.question && answer.question.includes("How would you articulate your ideal intimacy")) {
                if (Array.isArray(answer.answers) && answer.answers.length > 0) {
                    intimacyStartValue = clampToMax(answer.answers.find(a => a.possible_answers === 'Foreplay')?.answer_id, 10);
                    intimacyMidwayValue = clampToMax(answer.answers.find(a => a.possible_answers === 'Midway')?.answer_id, 10);
                    intimacyEndValue = clampToMax(answer.answers.find(a => a.possible_answers === 'End')?.answer_id, 10);
                }
            } else if (answer.question && answer.question.includes("How much do you love variety  in your sexual experiences?How much do you love variety  in your sexual experiences?")) {
                if (answer.answer_id !== undefined) {
                    diversityValue = clampToMax(answer.answer_id, 10);
                }
            } else if (answer.question && answer.question.includes("How intense do you like each part of the program to be?")) {
                if (Array.isArray(answer.answers) && answer.answers.length > 0) {
                    intenseLvlStartValue = clampToMax(answer.answers.find(a => a.possible_answers === 'Foreplay')?.answer_id, 10);
                    intenseLvlMidwayValue = clampToMax(answer.answers.find(a => a.possible_answers === 'Midway')?.answer_id, 10);
                    intenseLvlEndValue = clampToMax(answer.answers.find(a => a.possible_answers === 'End')?.answer_id, 10);
                }
            } else if (answer.question && answer.question.includes("How much lubricant would make your journey to pleasure smoother?")) {
                if (answer.answer_id !== undefined) {
                    ExternalLubricationLevel = clampToMax(answer.answer_id, 10);
                }
            } else if (answer.question.includes("What are your stimulation preferences?")) {
                stimulationPreference = answer.possible_answers.find(a => 
                    a.Answer === answer.selected_answer
                );
            }
        });

       
        if (
            heatLevelExt !== undefined &&
            heatLevelInt !== undefined &&
            hrauselPreference !== undefined &&
            hrauselPreference.length > 0 &&
            intimacyStartValue !== undefined &&
            diversityValue !== undefined &&
            intenseLvlStartValue !== undefined &&
            ExternalLubricationLevel !== undefined
        ) {
            calculateAndDisplayResult(
                heatLevelExt,
                heatLevelInt,
                hrauselPreference,
                intimacyStartValue,
                diversityValue,
                intenseLvlStartValue,
                ExternalLubricationLevel,
                intimacyMidwayValue,
                intenseLvlMidwayValue,
                intenseLvlEndValue,
                intimacyEndValue
            );
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `Some values are missing. Please ensure all questions have valid answers.`,
            });
            console.error('Required answers not found or are incomplete.');
        }

    } catch (error) {
        console.error('Error fetching answers:', error);
    }
}


function applyAnswers(answers) {
    const questionDivs = document.querySelectorAll('.question');
    
    answers.forEach(answer => {
        const matchingQuestionDiv = Array.from(questionDivs).find(div => 
            div.querySelector('h2').textContent.trim() === answer.question.trim()
        );

        if (matchingQuestionDiv) {
            if (answer.type === 'multiple') {
                applyMultipleChoiceAnswer(matchingQuestionDiv, answer);
            } else if (answer.type === 'single') {
                applySingleChoiceAnswer(matchingQuestionDiv, answer);
            }
        }
    });
}


function applyMultipleChoiceAnswer(questionDiv, answer) {
    const answerDivs = questionDiv.querySelectorAll('.answer');
    answerDivs.forEach(answerDiv => {
        const label = answerDiv.querySelector('label').textContent.trim();
        const slider = answerDiv.querySelector('input[type="range"]');
        if (slider && answer.answers) {
            const matchingAnswer = answer.answers.find(ans => ans.possible_answers === label);
            if (matchingAnswer) {
                slider.value = matchingAnswer.answer_id;
                answerDiv.querySelector('span').textContent = slider.value;
            }
        }
    });
}

function applySingleChoiceAnswer(questionDiv, answer) {

    const radioInputs = questionDiv.querySelectorAll('input[type="radio"]');
    
    for (let radioInput of radioInputs) {
        const answerTranslation = safeJSONParse(radioInput.getAttribute('data-translation'));
        const answerData = safeJSONParse(radioInput.getAttribute('data-answer-data'));

        
        if (answer.question.includes("What are your hrausel preferences?")) {
            const validHrauselOptions = [
                JSON.stringify([1, 1]),
                JSON.stringify([1, 0]),
                JSON.stringify([0, 1])
            ];
    
            const radioInputs = questionDiv.querySelectorAll('input[type="radio"]');
            radioInputs.forEach(radioInput => {
                const inputValue = radioInput.value;
    
                if (validHrauselOptions.includes(inputValue) && inputValue === JSON.stringify(answer.answer_id)) {
                    radioInput.checked = true;
                }
            });
        } else {
            // Handle other single-choice questions
            if (answerTranslation === answer.answer_id) {
                radioInput.checked = true;
                break;
            }
        }
    }
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
    });
}





function calculateAndDisplayResult(heatLevelExt, heatLevelInt, hrauselPreference, intimacyStartValue, diversity, intenseLvlStartValue, ExternalLubricationLevel, intimacyMidwayValue, intenseLvlMidwayValue, intenseLvlEndValue, intimacyEndValue, stimulationPreference) {
    const heatValueExt = heatLevelExt;
    const heatValueInt = heatLevelInt;
    let hrauselValues = hrauselPreference; // Initial hrausel values
    const intimacyStart = parseInt(intimacyStartValue);
    const intimacyMidway = parseInt(intimacyMidwayValue);
    const intimacyEnd = parseInt(intimacyEndValue);
    const intenseLvlStart = parseInt(intenseLvlStartValue);
    const intenseLvlMidway = parseInt(intenseLvlMidwayValue);
    const intenseLvlEnd = parseInt(intenseLvlEndValue);
    const diversityValue = parseInt(diversity);
    const externalLubricationLevel = parseInt(ExternalLubricationLevel);
    const tableBody = document.getElementById('tdresults');
    tableBody.innerHTML = '';

    const patternsStartOne = 1;
    const patternsStartTwo = 2;
    const patternsStartThree = 3;
    const patternsStartFour = 4;

    for (let i = 0; i < 120; i++) {
        const sectionClass = i < 40 ? 'start' : i < 80 ? 'midway' : 'end';
        
        // Update hrauselValues based on stimulation preference and current section
        if (stimulationPreference) {
            if (stimulationPreference.Answer === "Start Vaginal then Clitoral") {
                if (i < 40) {
                    hrauselValues = [1, 0]; // Only vibration
                } else {
                    hrauselValues = [1, 1]; // Both active
                }
            } else if (stimulationPreference.Answer === "Start Clitoral then Vaginal") {
                if (i < 40) {
                    hrauselValues = [0, 1]; // Only suction
                } else {
                    hrauselValues = [1, 1]; // Both active
                }
            } else if (stimulationPreference.Answer === "Combined all the way") {
                hrauselValues = [1, 1]; // Both always active
            }
        }

        const externalDesiredTemperature = heatValueExt * hrauselValues[1];
        const internalDesiredTemperature = heatValueInt * hrauselValues[0];
        const extLub = externalLubricationLevel * hrauselValues[1];
        const intLub = externalLubricationLevel * hrauselValues[0];

        const row = createTableRow(
            sectionClass,
            i + 1,
            externalDesiredTemperature,
            internalDesiredTemperature,
            getVibrationPattern(i, patternsStartOne, patternsStartTwo, patternsStartThree, patternsStartFour, hrauselValues, diversityValue),
            getVibrationIntensity(i, intenseLvlStart, intimacyStart, intenseLvlMidway, intimacyMidway, intimacyEnd, intenseLvlEnd, hrauselValues),
            getSuctionPattern(i, patternsStartOne, patternsStartTwo, patternsStartThree, patternsStartFour, hrauselValues, diversityValue),
            getSuctionIntensity(i, intenseLvlStart, intimacyStart, intenseLvlMidway, intimacyMidway, intimacyEnd, intenseLvlEnd, hrauselValues),
            extLub,
            intLub
        );
        tableBody.appendChild(row);
    }
}



function createTableRow(sectionClass, step, externalTemp, internalTemp, vibrationPatterns, vibrationIntensity, suctionPatterns, suctionIntensity, extLub, intLub) {
    // Helper function to map suction intensity
    function mapSuctionIntensity(pattern, intensity) {
        // Only apply mapping for wave (3) or mountain (4) patterns
        if (pattern === 3 || pattern === 4) {
            if (intensity >= 1 && intensity <= 3) {
                return 1;
            } else if (intensity >= 4 && intensity <= 6) {
                return 2;
            } else if (intensity >= 7 && intensity <= 10) {
                return 3;
            }
        }
        return intensity;
    }

    const row = document.createElement('tr');
    row.classList.add(sectionClass);

    const cellSection = document.createElement('td');
    cellSection.textContent = sectionClass;
    row.appendChild(cellSection);

    const cellStep = document.createElement('td');
    cellStep.textContent = step;
    row.appendChild(cellStep);

    const cellTime = document.createElement('td');
    cellTime.textContent = '5 sec';
    row.appendChild(cellTime);

    const cellExternalDesiredTemp = document.createElement('td');
    cellExternalDesiredTemp.textContent = externalTemp;
    row.appendChild(cellExternalDesiredTemp);

    const cellInternalDesiredTemp = document.createElement('td');
    cellInternalDesiredTemp.textContent = internalTemp;
    row.appendChild(cellInternalDesiredTemp);

    vibrationPatterns.forEach(pattern => {
        const cellPattern = document.createElement('td');
        cellPattern.textContent = pattern;
        row.appendChild(cellPattern);
    });

    vibrationIntensity.forEach(intensity => {
        const cellIntensity = document.createElement('td');
        // Apply regular clamping for vibration intensity
        cellIntensity.textContent = Math.min(intensity, 10);
        row.appendChild(cellIntensity);
    });

    // Handle suction patterns and their corresponding intensities together
    suctionPatterns.forEach((pattern, index) => {
        const cellPattern = document.createElement('td');
        cellPattern.textContent = pattern;
        row.appendChild(cellPattern);

        // Get the corresponding intensity for this pattern
        const intensity = suctionIntensity[index];
        const cellIntensity = document.createElement('td');
        
        // First map the intensity based on pattern
        const mappedIntensity = mapSuctionIntensity(pattern, intensity);
        // Then apply the clamp
        cellIntensity.textContent = Math.min(mappedIntensity, pattern === 3 || pattern === 4 ? 3 : 10);
        row.appendChild(cellIntensity);
    });

    const cellExtLubLevel = document.createElement('td');
    cellExtLubLevel.textContent = extLub;
    row.appendChild(cellExtLubLevel);

    const cellIntLubLevel = document.createElement('td');
    cellIntLubLevel.textContent = intLub;
    row.appendChild(cellIntLubLevel);

    return row;
}


function validateAnswers(answers) {
    const requiredQuestions = [
        "How intense do you like each part of the program to be?",
        "How would you articulate your ideal intimacy?",
        "How much do you love variety  in your sexual experiences?",
        "Which heat level takes your pleasure up a notch?",
        "How much lubricant would make your journey to pleasure smoother?",
        "What are your hrausel preferences?"
    ];

    // Add stimulation question to required list only if hrausel is combination
    const hrauselAnswer = answers.find(a => a.question.includes("What are your hrausel preferences?"));
    if (hrauselAnswer && Array.isArray(hrauselAnswer.answers) && 
        hrauselAnswer.answers[0] === '1' && hrauselAnswer.answers[1] === '1') { // Assuming string values
        requiredQuestions.push("What are your stimulation preferences?");
    }

    const missingQuestions = [];
    const answeredQuestions = new Set(answers.map(answer => answer.question));

    requiredQuestions.forEach(question => {
        if (!answeredQuestions.has(question)) {
            missingQuestions.push(question);
        } else {
            const answer = answers.find(a => a.question === question);
            if (answer.type === 'multiple') {
                if (question.includes("How would you articulate your ideal intimacy?")) {
                    // For this question, ensure 'Foreplay', 'Midway', and 'End' are answered with image selections
                    if (!answer.answers['Foreplay']) {
                        missingQuestions.push(`${question} (Foreplay selection missing)`);
                    }
                    if (!answer.answers['Midway']) {
                        missingQuestions.push(`${question} (Midway selection missing)`);
                    }
                    if (!answer.answers['End']) {
                        missingQuestions.push(`${question} (End selection missing)`);
                    }
                } else {
                    const hasAllParts = answer.answers && 
                        ['Foreplay', 'Midway', 'End'].every(part => 
                            answer.answers[part] !== undefined
                        );
                    if (!hasAllParts) {
                        missingQuestions.push(`${question} (incomplete)`);
                    }
                }
            } else if (!answer.answers && !answer.answer_id) {
                missingQuestions.push(question);
            }
        }
    });

    return missingQuestions;
}


function handleHrauselSelection() {
    const questions = document.querySelectorAll('.question');
    const hrauselQuestion = Array.from(questions).find(q => 
        q.querySelector('h2').textContent.includes("What are your hrausel preferences?")
    );
    const stimulationQuestion = Array.from(questions).find(q => 
        q.querySelector('h2').textContent.includes("What are your stimulation preferences?")
    );

    if (hrauselQuestion && stimulationQuestion) {
        const hrauselRadios = hrauselQuestion.querySelectorAll('input[type="radio"]');
        
        // Add change event listener to all hrausel radio buttons
        hrauselRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selectedValue = JSON.parse(e.target.value);
                
                // If combination (1/1) is selected
                if (selectedValue[0] === 1 && selectedValue[1] === 1) {
                    stimulationQuestion.style.display = 'block';
                    stimulationQuestion.querySelectorAll('input[type="radio"]').forEach(input => {
                        input.disabled = false;
                    });
                } else {
                    // For other selections (1/0 or 0/1)
                    stimulationQuestion.style.display = 'none';
                    stimulationQuestion.querySelectorAll('input[type="radio"]').forEach(input => {
                        input.checked = false;
                        input.disabled = true;
                    });
                }
            });
        });

        // Initialize state on page load
        const checkedHrausel = hrauselQuestion.querySelector('input[type="radio"]:checked');
        if (checkedHrausel) {
            const selectedValue = JSON.parse(checkedHrausel.value);
            if (selectedValue[0] === 1 && selectedValue[1] === 1) {
                stimulationQuestion.style.display = 'block';
            } else {
                stimulationQuestion.style.display = 'none';
            }
        } else {
            stimulationQuestion.style.display = 'none';
        }
    }
}


document.addEventListener('DOMContentLoaded', function () {
    if (typeof questions !== 'undefined') {
        displayQuestions(questions); 
    } else {
        console.error('Questions data is not available.');
    }

    fetchAndApplyAnswers();

    const submitButton = document.getElementById('button');
    const downloadButton = document.getElementById('download');

    if (submitButton) {
        submitButton.addEventListener('click', function () {
            const answers = getAnswers();
            const missingQuestions = validateAnswers(answers);
    
            console.log('Answers:', answers);

            // First check if any questions are missing
            if (missingQuestions.length > 0) {
                const missingSummary = missingQuestions.join('\n• ');
                Swal.fire({
                    icon: 'error',
                    title: 'Missing Answers',
                    text: `Please answer the following questions:\n\n• ${missingSummary}`,
                    confirmButtonText: 'OK'
                });
                console.error('Missing answers for questions:', missingQuestions);
                return;
            }
    
            // Initialize all required variables
            let heatLevelExt, heatLevelInt, hrauselPreference, intimacyStartValue,
                intimacyMidwayValue, intimacyEndValue, diversityValue, 
                intenseLvlStartValue, intenseLvlMidwayValue, intenseLvlEndValue,
                ExternalLubricationLevel, stimulationPreference;
    
            // Process each answer
            answers.forEach(answer => {
                const translation = answer.translation;
    
                // Heat level processing
                if (answer.question.includes("Which heat level takes your pleasure up a notch?")) {
                    heatLevelExt = clampToMax(translation, 42);
                    heatLevelInt = clampToMax(translation, 42);
                } 
                // Hrausel preferences processing
                else if (answer.question.includes("What are your hrausel preferences?")) {
                    hrauselPreference = Array.isArray(answer.answers) 
                        ? answer.answers.map(a => clampToMax(a, 1)) 
                        : clampToMax(answer.answers, 1);
                } 
                // Intimacy processing
                else if (answer.question.includes("How would you articulate your ideal intimacy")) {
                    intimacyStartValue = clampToMax(answer.answers?.["Foreplay"], 10);
                    intimacyMidwayValue = clampToMax(answer.answers?.["Midway"], 10);
                    intimacyEndValue = clampToMax(answer.answers?.["End"], 10);
                } 
                // Variety processing
                else if (answer.question.includes("How much do you love variety")) {
                    diversityValue = clampToMax(translation, 10);
                } 
                // Intensity level processing
                else if (answer.question.includes("How intense do you like each part of the program to be?")) {
                    intenseLvlStartValue = clampToMax(answer.answers?.["Foreplay"], 10);
                    intenseLvlMidwayValue = clampToMax(answer.answers?.["Midway"], 10);
                    intenseLvlEndValue = clampToMax(answer.answers?.["End"], 10);
                } 
                // Lubrication processing
                else if (answer.question.includes("How much lubricant would make your journey to pleasure smoother?")) {
                    ExternalLubricationLevel = clampToMax(translation, 10);
                }
                // Stimulation preferences processing
                else if (answer.question.includes("What are your stimulation preferences?")) {
                    stimulationPreference = {
                        Answer: answer.answers,
                        Answer_translation: translation
                    };
                }
            });
    
            // Validate Hrausel and Stimulation combination
            const hasHrausel = answers.some(a => a.question.includes("What are your hrausel preferences?"));
            const hasStimulation = answers.some(a => a.question.includes("What are your stimulation preferences?"));
    
            if (hasHrausel && !hasStimulation) {
                Swal.fire({
                    icon: 'error',
                    title: 'Missing Stimulation Preference',
                    text: 'Please select your stimulation preference when Hrausel preference is set.',
                    confirmButtonText: 'OK'
                });
                return;
            }
    
            if (
                heatLevelExt !== undefined && 
                hrauselPreference !== undefined && 
                intimacyStartValue !== undefined && 
                diversityValue !== undefined && 
                intenseLvlStartValue !== undefined && 
                ExternalLubricationLevel !== undefined &&
                stimulationPreference !== undefined
            ) {
                // Calculate and display results
                calculateAndDisplayResult(
                    heatLevelExt, 
                    heatLevelInt, 
                    hrauselPreference, 
                    intimacyStartValue, 
                    diversityValue,
                    intenseLvlStartValue, 
                    ExternalLubricationLevel, 
                    intimacyMidwayValue,
                    intenseLvlMidwayValue, 
                    intenseLvlEndValue, 
                    intimacyEndValue,
                    stimulationPreference
                );
    
// Enable the download button after generating the table
if (downloadButton) {
    downloadButton.disabled = false;
}
} else {
Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: `You have not answered all the questions. Please answer all the questions to see the results.`,
});
console.error('Required answers not found or are incomplete.');
}
});
} else {
console.error('Submit button not found.');
}

if (downloadButton) {
// Initially disable the download button until the table is generated

downloadButton.addEventListener('click', function () {
if (document.getElementById('tdresults').rows.length > 0) {
downloadTable();
} else {
Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: `Please click on the submit button to generate the results before downloading the table.`,
});
}
});
} else {
console.error('Download button not found.');
}
});

async function downloadTable() {
    const table = document.getElementById('tdresults');
    if (!table) {
        console.error('Table with ID "tdresults" not found.');
        return;
    }

    function mapSuctionIntensity(pattern, intensity) {
        if (pattern === 3 || pattern === 4) {
            if (intensity >= 1 && intensity <= 3) {
                return 1;
            } else if (intensity >= 4 && intensity <= 6) {
                return 2;
            } else if (intensity >= 7 && intensity <= 10) {
                return 3;
            }
        }
        return intensity;
    }

    const rows = table.rows;
    const result = [];

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        const pattern = parseInt(cells[7].textContent, 10); // Pattern is in column 7
        const intensity = parseInt(cells[8].textContent, 10); // Intensity is in column 8
        
        // First map the intensity based on pattern, then apply the clamp
        const mappedIntensity = mapSuctionIntensity(pattern, intensity);
        const clampedIntensity = Math.min(mappedIntensity, pattern === 3 || pattern === 4 ? 3 : 10);

        const row = {
            1: parseInt(cells[1].textContent, 10),
            2: parseInt(cells[3].textContent, 10),
            3: parseInt(cells[4].textContent, 10),
            4: parseInt(cells[5].textContent, 10),
            5: parseInt(cells[6].textContent, 10),
            6: pattern,
            7: clampedIntensity,
            8: parseInt(cells[9].textContent, 10),
            9: parseInt(cells[10].textContent, 10),
            10: 5
        };
        result.push(row);
    }
    // Convert collected data to JSON format
    const data = JSON.stringify(result, null, 2);
    
    // Create a Blob and download it as a file
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Save JSON data to the database
    try {
        const response = await fetch('http://52.23.246.251:8080/saveeasyjson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mac_address: userMacAddress, easygjson: result })
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('JSON saved to database:', responseData);
        } else {
            const errorResponse = await response.json();
            console.error('Failed to save JSON to the database:', errorResponse.message);
        }
    } catch (error) {
        console.error('Error saving JSON to database:', error);
    }
}



