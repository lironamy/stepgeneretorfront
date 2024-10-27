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
                
            } else if (questionObj.possible_answers) {
                // Handle other questions as you are currently doing
                questionObj.possible_answers.forEach(answerObj => {
                    const answerDiv = document.createElement('div');
                    answerDiv.classList.add('answer');
    
                    const answerLabel = document.createElement('label');
    
                    if (questionObj.type === 'multiple' && answerObj['Answer_translation']) {
                        // Handle multiple-choice with sliders
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
            } else {
                const noAnswerDiv = document.createElement('div');
                noAnswerDiv.classList.add('no-answer');
                noAnswerDiv.textContent = 'No possible answers available';
                questionDiv.appendChild(noAnswerDiv);
            }
    
            container.appendChild(questionDiv);
        });
    }
    

    function getAnswers() {
        const questions = document.querySelectorAll('.question');
        return Array.from(questions).map((question, index) => {
            const questionText = question.querySelector('h2').textContent;
            let answers = {};
            let type = '';


    
            const answerDivs = question.querySelectorAll('.answer'); // Define answerDivs here
    
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
            // Handle questions with sliders (for External/Internal temperature, Lubrication, etc.)
            else if (answerDivs[0] && answerDivs[0].querySelector('input[type="range"]')) {
                type = 'multiple';
                answerDivs.forEach(answerDiv => {
                    const label = answerDiv.querySelector('label').textContent.trim();
                    const rangeInput = answerDiv.querySelector('input[type="range"]');
                    answers[label] = rangeInput.value;
                });
            } 
            // Handle single-choice questions (for External/Internal temperature, Lubrication, etc.)
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






async function fetchAndApplyAnswers() {
    try {


        console.log('Entire answersData:', answersData);

        applyAnswers(answersData);

        // Extract necessary values to generate the table immediately after answers are applied
        let heatLevelExt, heatLevelInt, hrauselPreference, intimacyStartValue, intimacyMidwayValue, intimacyEndValue;
        let diversityValue, intenseLvlStartValue, intenseLvlMidwayValue, intenseLvlEndValue, ExternalLubricationLevel;

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
                    intimacyStartValue = clampToMax(answer.answers.find(a => a.possible_answers === 'Start')?.answer_id, 10);
                    intimacyMidwayValue = clampToMax(answer.answers.find(a => a.possible_answers === 'Midway')?.answer_id, 10);
                    intimacyEndValue = clampToMax(answer.answers.find(a => a.possible_answers === 'End')?.answer_id, 10);
                }
            } else if (answer.question && answer.question.includes("How much do you love diversity in your sexual experiences?")) {
                if (answer.answer_id !== undefined) {
                    diversityValue = clampToMax(answer.answer_id, 10);
                }
            } else if (answer.question && answer.question.includes("How intense do you like each part of the program to be?")) {
                if (Array.isArray(answer.answers) && answer.answers.length > 0) {
                    intenseLvlStartValue = clampToMax(answer.answers.find(a => a.possible_answers === 'Start')?.answer_id, 10);
                    intenseLvlMidwayValue = clampToMax(answer.answers.find(a => a.possible_answers === 'Midway')?.answer_id, 10);
                    intenseLvlEndValue = clampToMax(answer.answers.find(a => a.possible_answers === 'End')?.answer_id, 10);
                }
            } else if (answer.question && answer.question.includes("How much lube would make your journey to pleasure smoother?")) {
                if (answer.answer_id !== undefined) {
                    ExternalLubricationLevel = clampToMax(answer.answer_id, 10);
                }
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





function calculateAndDisplayResult(heatLevelExt, heatLevelInt, hrauselPreference, intimacyStartValue, diversity, intenseLvlStartValue, ExternalLubricationLevel, intimacyMidwayValue, intenseLvlMidwayValue, intenseLvlEndValue, intimacyEndValue) {
    const heatValueExt = heatLevelExt;
    const heatValueInt = heatLevelInt;
    const hrauselValues = hrauselPreference;
    const intimacyStart = parseInt(intimacyStartValue);
    const intimacyMidway = parseInt(intimacyMidwayValue);
    const intimacyEnd = parseInt(intimacyEndValue);
    const intenseLvlStart = parseInt(intenseLvlStartValue);
    const intenseLvlMidway = parseInt(intenseLvlMidwayValue);
    const intenseLvlEnd = parseInt(intenseLvlEndValue);
    const diversityValue = parseInt(diversity);
    const externalLubricationLevel = parseInt(ExternalLubricationLevel);
    const externalDesiredTemperature = heatValueExt * hrauselValues[1];
    const internalDesiredTemperature = heatValueInt * hrauselValues[0];
    const extLub = externalLubricationLevel * hrauselValues[1];
    const intLub = externalLubricationLevel * hrauselValues[0];
    const tableBody = document.getElementById('tdresults');
    tableBody.innerHTML = '';  
    const patternsStartOne = 1;
    const patternsStartTwo = 2;
    const patternsStartThree = 3;
    const patternsStartFour = 4;

    for (let i = 0; i < 120; i++) {
        const sectionClass = i < 40 ? 'start' : i < 80 ? 'midway' : 'end';
        
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
        cellIntensity.textContent = intensity > 10 ? 10 : intensity;
        row.appendChild(cellIntensity);
    });

    suctionPatterns.forEach(pattern => {
        const cellPattern = document.createElement('td');
        cellPattern.textContent = pattern;
        row.appendChild(cellPattern);
    });

    suctionIntensity.forEach(intensity => {
        const cellIntensity = document.createElement('td');
        cellIntensity.textContent = intensity > 10 ? 10 : intensity;
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


            let heatLevelExt, heatLevelInt, hrauselPreference, intimacyStartValue, intimacyMidwayValue, intimacyEndValue;
            let diversityValue, intenseLvlStartValue, intenseLvlMidwayValue, intenseLvlEndValue, ExternalLubricationLevel;

            answers.forEach(answer => {
                const translation = answer.translation;

                if (answer.question.includes("Which heat level takes your pleasure up a notch?")) {
                    heatLevelExt = clampToMax(translation, 42);
                    heatLevelInt = clampToMax(translation, 42);
                } else if (answer.question.includes("What are your hrausel preferences?")) {
                    hrauselPreference = Array.isArray(answer.answers) 
                        ? answer.answers.map(a => clampToMax(a, 1)) 
                        : clampToMax(answer.answers, 1);
                } else if (answer.question.includes("How would you articulate your ideal intimacy")) {
                    intimacyStartValue = clampToMax(answer.answers?.["Start"], 10);
                    intimacyMidwayValue = clampToMax(answer.answers?.["Midway"], 10);
                    intimacyEndValue = clampToMax(answer.answers?.["End"], 10);
                } else if (answer.question.includes("How much do you love diversity in your sexual experiences?")) {
                    diversityValue = clampToMax(translation, 10);
                } else if (answer.question.includes("How intense do you like each part of the program to be?")) {
                    intenseLvlStartValue = clampToMax(answer.answers?.["Start"], 10);
                    intenseLvlMidwayValue = clampToMax(answer.answers?.["Midway"], 10);
                    intenseLvlEndValue = clampToMax(answer.answers?.["End"], 10);
                } else if (answer.question.includes("How much lube would make your journey to pleasure smoother?")) {
                    ExternalLubricationLevel = clampToMax(translation, 10);
                }
            });

            if (
                heatLevelExt !== undefined && 
                hrauselPreference !== undefined && 
                intimacyStartValue !== undefined && 
                diversityValue !== undefined && 
                intenseLvlStartValue !== undefined && 
                ExternalLubricationLevel !== undefined
            ) {
                calculateAndDisplayResult(
                    heatLevelExt, heatLevelInt, hrauselPreference, intimacyStartValue, diversityValue,
                    intenseLvlStartValue, ExternalLubricationLevel, intimacyMidwayValue,
                    intenseLvlMidwayValue, intenseLvlEndValue, intimacyEndValue
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

    const rows = table.rows;
    const result = [];

    // Collect data from the table rows
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        const row = {
            1: cells[1].textContent,
            2: cells[3].textContent,
            3: cells[4].textContent,
            4: cells[5].textContent,
            5: cells[6].textContent,
            6: cells[7].textContent,
            7: cells[8].textContent,
            8: cells[9].textContent,
            9: cells[10].textContent,
            10: "5"
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

        // Handling response from the server
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



