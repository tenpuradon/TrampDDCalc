        const allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'o', '<', '/', 'F', 'B'];
        const buttons = [
            '7', '8', '9', 'o',
            '4', '5', '6', '<',
            '1', '2', '3', '/',
            'F', '0', 'B', 'Enter'
        ];

        const inputBox = document.getElementById('inputBox');
        const outputBox = document.getElementById('outputBox');
        const sumDisplay = document.getElementById('sumDisplay');
        const bonusDisplay = document.getElementById('bonusDisplay');
        const genderM = document.getElementById('genderM');
        const genderF = document.getElementById('genderF');
        const autoDetect = document.getElementById('autoDetect');

        const buttonGrid = document.getElementById('buttonGrid');
        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.textContent = b;
            btn.setAttribute('data-char', b);
            buttonGrid.appendChild(btn);
        });

        let inputHistory = [];
        let outputHistory = [];
        let currentInputTarget = null;

        function removeTwist(input) {
            let FlipDigits = input > 999 ? 2 : 1;
            return parseInt(input.toString().substring(0, FlipDigits));
        }

        function sumOfDigit(input) {
            let sum = 0;
            while (input > 0) {
                sum += input % 10;
                input = Math.floor(input / 10);
            }
            return sum;
        }

        function removeFlip(input) {
            let flipDigit = removeTwist(input) >= 10 ? 2 : 1;
            return parseInt(input.toString().substring(flipDigit));
        }

        function TWIST(input) {
            return sumOfDigit(removeFlip(input));
        }

        function PosBonusBase(position) {
            return position !== 'o';
        }

        function PosBonus(input) {
            let flipCount = Math.floor(removeTwist(input) / 4);
            if ((flipCount === 1 && TWIST(input) > 0) || flipCount === 0) return 0;
            return flipCount * 0.1;
        }

        function TwistDD(input) {
            let flip = Math.floor(removeTwist(input) / 4);
            let twist = TWIST(input);
            if (flip <= 1) return twist * 0.1;
            if (flip === 2) return twist <= 4 ? twist * 0.1 : ((twist - 4) * 0.2) + 0.4;
            if (flip === 3) return twist <= 2 ? twist * 0.1 : ((twist - 2) * 0.3) + 0.2;
            return twist * 0.3;
        }

        function isBack(input) {
            return input !== "F";
        }

        function skillDD(direction, skill, position, directionToggle) {
            let DD = removeTwist(skill) * 0.1;
            let flips = Math.floor(removeTwist(skill) / 4);
            DD += flips * 0.1;

            if (PosBonusBase(position)) DD += PosBonus(skill);

            if (directionToggle) {
                let newDir = Math.round(TWIST(skill) % 2);
                if (newDir !== 1 && flips > 1) DD += (flips - 1) * 0.1;
            } else {
                if (isBack(direction) && flips > 1) DD += (flips - 1) * 0.1;
            }

            if (flips > 2) DD += (flips - 2) * 0.1;
            DD += TwistDD(skill);
            return DD;
        }

        function TripleCount(inputList) {
            return inputList.filter(skill => Math.floor(removeTwist(skill) / 4) > 2).length;
        }

        function isMale(input) {
            return input === "M";
        }

        function TripleBonus(skillList, gender) {
            let bonusBase = TripleCount(skillList);
            bonusBase -= isMale(gender) ? 5 : 2;
            return bonusBase <= 0 ? 0 : bonusBase * 0.3;
        }

        function processInputLine(rawInput, directionToggle, gender) {
            const numberPart = parseInt(rawInput.replace(/\D/g, '')) || 0;
            const nonNumberPart = rawInput.replace(/\d/g, '').split('');
            const direction = nonNumberPart.includes('F') ? 'F' : nonNumberPart.includes('B') ? 'B' : 'F';
            const position = nonNumberPart.find(c => ['o', '/', '<'].includes(c)) || 'o';
            return skillDD(direction, numberPart, position, directionToggle);
        }

        function updateDisplays() {
            const gender = genderM.checked ? "M" : "F";
            const directionToggle = autoDetect.checked;

            outputHistory = inputHistory.map(input => processInputLine(input, directionToggle, gender));
            const skillList = inputHistory.map(input => parseInt(input.replace(/\D/g, '')) || 0);

            inputBox.innerHTML = '';
            inputHistory.forEach((line, index) => {
                const lineNum = index + 1;
                const container = document.createElement('div');
                container.className = 'input-line';

                const label = document.createElement('span');
                label.textContent = `${lineNum}. `;
                label.style.fontWeight = 'bold';
                label.style.marginRight = '4px';

                const content = document.createElement('span');
                content.textContent = line;

                container.appendChild(label);
                container.appendChild(content);

                container.addEventListener('dblclick', () => {
                    const inputEdit = document.createElement('input');
                    inputEdit.type = 'text';
                    inputEdit.value = line;
                    inputEdit.className = 'edit-line';
                    container.replaceWith(inputEdit);
                    inputEdit.focus();
                    currentInputTarget = inputEdit;

                    const saveEdit = () => {
                        const newValue = inputEdit.value.trim();
                        if (newValue) inputHistory[index] = newValue;
                        currentInputTarget = null;
                        updateDisplays();
                    };

                    inputEdit.addEventListener('keydown', e => {
                        if (e.key === 'Enter') saveEdit();
                    });
                    inputEdit.addEventListener('blur', saveEdit);
                });

                inputBox.appendChild(container);
                inputBox.appendChild(document.createElement('hr'));
            });


            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.id = 'inputField';
            inputField.placeholder = 'Enter...';
            inputField.addEventListener('keydown', handleKeyDown);
            inputField.addEventListener('focus', () => currentInputTarget = inputField);
            inputBox.appendChild(inputField);
            inputField.focus();

            outputBox.innerHTML = '';
            outputBox.innerHTML = '';
            outputHistory.forEach((val, index) => {
                const lineNum = index + 1;
                const container = document.createElement('div');
                container.className = 'output-line';

                const label = document.createElement('span');
                label.textContent = `${lineNum}. `;
                label.style.fontWeight = 'bold';
                label.style.marginRight = '4px';

                const content = document.createElement('span');
                content.textContent = val.toFixed(2);

                container.appendChild(label);
                container.appendChild(content);

                outputBox.appendChild(container);
                outputBox.appendChild(document.createElement('hr'));
            });


            const bonus = TripleBonus(skillList, gender);
            const sum = outputHistory.reduce((a, b) => a + b, 0) + bonus;
            sumDisplay.textContent = sum.toFixed(2);
            bonusDisplay.textContent = bonus.toFixed(2);
            /*document.getElementById('debugInfo').textContent =
              `Debug: TripleCount = ${TripleCount(skillList)}, TripleBonus = ${bonus.toFixed(2)}`;*/
        }

        function handleEnter() {
            const inputField = document.getElementById('inputField');
            const value = inputField.value.trim();
            if (!value) return;

            const gender = genderM.checked ? "M" : "F";
            const directionToggle = autoDetect.checked;

            inputHistory.push(value);
            if (inputHistory.length > 10) inputHistory.shift();
            if (outputHistory.length > 10) outputHistory.shift();

            inputField.value = '';
            updateDisplays();
        }

        function handleKeyDown(e) {
            if (e.key === 'Enter') handleEnter();
        }

        document.getElementById('clearBtn').addEventListener('click', () => {
            const inputField = document.getElementById('inputField');
            inputField.value = '';
            inputField.focus();
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            inputHistory = [];
            outputHistory = [];
            updateDisplays();
        });

        autoDetect.addEventListener('change', updateDisplays);

        document.querySelectorAll('#buttonGrid button').forEach(btn => {
            btn.addEventListener('click', () => {
                const char = btn.getAttribute('data-char');
                const target = currentInputTarget;
                if (!target) return;

                if (char === 'Enter') {
                    if (target.classList.contains('edit-line')) {
                        target.blur();
                    } else {
                        handleEnter();
                    }
                }
                /* else if (char === '<') {
                        target.value = target.value.slice(0, -1);
                      }*/
                else if (allowedChars.includes(char)) {
                    target.value += char;
                }

                /*target.focus();*/
            });
        });

        updateDisplays();