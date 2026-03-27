// ========= DEFINICIÓN DE ELEMENTOS DOM =========
const screens = {
    menu: document.getElementById('main-menu'),
    g1Start: document.getElementById('g1-start-screen'),
    g1Game: document.getElementById('g1-game-screen'),
    g1Stage: document.getElementById('g1-stage-screen'),
    g2Setup: document.getElementById('g2-setup-screen'),
    g2Game: document.getElementById('g2-game-screen'),
    g2Win: document.getElementById('g2-win-screen')
};

function showScreen(screenKey) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenKey].classList.add('active');
}

// ========= BOTONES DE NAVEGACIÓN =========
document.getElementById('btn-menu-g1').addEventListener('click', () => showScreen('g1Start'));
document.getElementById('btn-menu-g2').addEventListener('click', () => showScreen('g2Setup'));
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => showScreen('menu'));
});

// ==========================================
//          JUEGO 1: ETAPAS
// ==========================================
let g1Stage = 1;
let g1LevelsWon = 0;
let g1CorrectAnswer = 0;

const elG1 = {
    stageDisp: document.getElementById('g1-stage-display'),
    levelDisp: document.getElementById('g1-level-display'),
    progFill: document.getElementById('g1-progress-fill'),
    qText: document.getElementById('g1-question-text'),
    optsGrid: document.getElementById('g1-options-container'),
    feedback: document.getElementById('g1-feedback'),
    stageTitle: document.getElementById('g1-stage-title')
};

document.getElementById('btn-start-g1').addEventListener('click', () => { g1Stage = 1; g1LevelsWon = 0; g1UpdateUI(); g1Gen(); showScreen('g1Game'); });
document.getElementById('btn-next-stage-g1').addEventListener('click', () => { g1Stage++; g1LevelsWon = 0; g1UpdateUI(); g1Gen(); showScreen('g1Game'); });

function g1UpdateUI() {
    elG1.stageDisp.textContent = g1Stage;
    elG1.levelDisp.textContent = g1LevelsWon + 1 > 5 ? 5 : g1LevelsWon + 1;
    elG1.progFill.style.width = `${(g1LevelsWon / 5) * 100}%`;
}

function genMath(difficulty) {
    let operator;
    if (difficulty === 1) operator = '+';
    else if (difficulty === 2) operator = '-';
    else if (difficulty === 3) operator = 'x';
    else if (difficulty === 4) operator = '/';
    else {
        const ops = ['+', '-', 'x', '/'];
        operator = ops[Math.floor(Math.random() * ops.length)];
    }

    let num1, num2, correct;
    let max = 10 + (difficulty * 5); // Escala dificultad

    switch (operator) {
        case '+':
            num1 = Math.floor(Math.random() * max) + 1;
            num2 = Math.floor(Math.random() * max) + 1;
            correct = num1 + num2; break;
        case '-':
            num1 = Math.floor(Math.random() * max) + 5;
            num2 = Math.floor(Math.random() * num1) + 1;
            correct = num1 - num2; break;
        case 'x':
            let mMax = Math.min(12, 3 + difficulty);
            num1 = Math.floor(Math.random() * mMax) + 2;
            num2 = Math.floor(Math.random() * mMax) + 2;
            correct = num1 * num2; break;
        case '/':
            num2 = Math.floor(Math.random() * 10) + 2;
            let temp = Math.floor(Math.random() * 10) + 2;
            num1 = num2 * temp;
            correct = temp; break;
    }
    return { n1: num1, op: operator, n2: num2, ans: correct };
}

function g1Gen() {
    elG1.feedback.classList.add('hidden');
    elG1.optsGrid.innerHTML = '';

    let prob = genMath(g1Stage);
    g1CorrectAnswer = prob.ans;
    elG1.qText.textContent = `${prob.n1} ${prob.op} ${prob.n2}`;

    let opts = [prob.ans];
    while (opts.length < 4) {
        let off = Math.floor(Math.random() * 10) - 5;
        if (off === 0) off = 1;
        let w = prob.ans + off;
        if (w < 0 && prob.op !== '-') w = Math.abs(w) + 2;
        if (!opts.includes(w)) opts.push(w);
    }
    opts.sort(() => Math.random() - 0.5);

    opts.forEach(o => {
        let b = document.createElement('button');
        b.className = 'option-btn';
        b.textContent = o;
        b.onclick = () => g1Check(o, b);
        elG1.optsGrid.appendChild(b);
    });
}

function g1Check(sel, btn) {
    const btns = document.querySelectorAll('#g1-options-container .option-btn');
    btns.forEach(b => b.style.pointerEvents = 'none');
    elG1.feedback.classList.remove('hidden');

    if (sel === g1CorrectAnswer) {
        btn.classList.add('correct');
        elG1.feedback.textContent = '¡Correcto!';
        elG1.feedback.className = 'feedback success';
        g1LevelsWon++;
        g1UpdateUI();
        setTimeout(() => {
            if (g1LevelsWon >= 5) {
                elG1.progFill.style.width = '100%';
                setTimeout(() => { elG1.stageTitle.textContent = `¡Etapa ${g1Stage} Completada!`; showScreen('g1Stage'); }, 400);
            } else g1Gen();
        }, 1000);
    } else {
        btn.classList.add('wrong');
        elG1.feedback.textContent = '¡Incorrecto! Intenta otra vez.';
        elG1.feedback.className = 'feedback error';
        btns.forEach(b => { if (parseInt(b.textContent) === g1CorrectAnswer) b.classList.add('correct'); });
        setTimeout(g1Gen, 1500);
    }
}

// ==========================================
//          JUEGO 2: SERPIENTES Y ESCALERAS
// ==========================================
let g2PlayersCount = 2;
let g2Players = [];
let g2Turn = 0; // Índice de g2Players
let g2CorrectAnswer = 0;
let diceAnimating = false;

// 50 Casillas. Snakes bajan, Ladders suben.
const boardMap = {
    // Escaleras
    4: 14, 9: 31, 20: 38, 28: 42,
    // Serpientes
    17: 7, 34: 15, 46: 25, 49: 11
};

const elG2 = {
    countDisp: document.getElementById('players-count'),
    boardGrid: document.getElementById('board-grid'),
    turnBox: document.getElementById('g2-turn-box'),
    turnText: document.getElementById('g2-turn-text'),
    pInfo: document.getElementById('g2-players-info'),
    qText: document.getElementById('g2-question-text'),
    optsGrid: document.getElementById('g2-options-container'),
    feedback: document.getElementById('g2-feedback'),
    diceArea: document.getElementById('dice-area'),
    dice: document.getElementById('dice'),
    diceRes: document.getElementById('dice-result-text'),
    winTitle: document.getElementById('g2-win-title'),
    qArea: document.getElementById('g2-question-area')
};

document.getElementById('btn-minus').onclick = () => { if (g2PlayersCount > 1) elG2.countDisp.textContent = --g2PlayersCount; };
document.getElementById('btn-plus').onclick = () => { if (g2PlayersCount < 4) elG2.countDisp.textContent = ++g2PlayersCount; };

document.getElementById('btn-start-g2').addEventListener('click', () => {
    // Init jugadores
    const colors = ['p1', 'p2', 'p3', 'p4'];
    g2Players = [];
    for (let i = 0; i < g2PlayersCount; i++) {
        g2Players.push({ id: i + 1, pos: 1, diff: 1, colorCls: `token-${colors[i]}`, boxCls: `turn-${colors[i]}` });
    }
    g2Turn = 0;

    renderBoard();
    updatePlayersInfo();
    startTurn();
    showScreen('g2Game');
});

function renderBoard() {
    elG2.boardGrid.innerHTML = '';
    // Lógica para grid 10x5 en patrón serpiente
    // Fila 5 (arriba): 50 a 41
    // Fila 4: 31 a 40
    // Fila 3: 30 a 21
    // Fila 2: 11 a 20
    // Fila 1 (abajo): 10 a 1
    const order = [];
    for (let r = 4; r >= 0; r--) {
        let rowStart = r * 10 + 1;
        let rowCards = [];
        for (let c = 0; c < 10; c++) rowCards.push(rowStart + c);
        if (r % 2 !== 0) rowCards.reverse(); // Dirección alternante
        else rowCards.reverse(); // Wait, Fila0 (1-10) visualmente va izq a der. Fila1 (11-20) der a izq.
        order.push(...rowCards);
    }
    // Arreglando el patron serpiente visual
    const correctOrder = [
        ...[50, 49, 48, 47, 46, 45, 44, 43, 42, 41],
        ...[31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        ...[30, 29, 28, 27, 26, 25, 24, 23, 22, 21],
        ...[11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        ...[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    ];

    correctOrder.forEach(num => {
        let cell = document.createElement('div');
        cell.className = `board-cell bg-${(num % 4) + 1}`;
        cell.id = `cell-${num}`;
        cell.textContent = num;

        let snInd = document.createElement('div');
        snInd.className = 'sn-indicator';
        if (num in boardMap) {
            snInd.textContent = boardMap[num] > num ? '🪜' : '🐍';
        }
        cell.appendChild(snInd);

        let tkCtx = document.createElement('div');
        tkCtx.className = 'player-tokens-container';
        tkCtx.id = `tokens-${num}`;
        cell.appendChild(tkCtx);

        elG2.boardGrid.appendChild(cell);
    });

    drawTokens();
}

function drawTokens() {
    document.querySelectorAll('.player-tokens-container').forEach(c => c.innerHTML = '');
    g2Players.forEach(p => {
        let container = document.getElementById(`tokens-${p.pos}`);
        if (container) {
            let tk = document.createElement('div');
            tk.className = `player-token ${p.colorCls}`;
            container.appendChild(tk);
        }
    });
}

function updatePlayersInfo() {
    elG2.pInfo.innerHTML = '';
    g2Players.forEach(p => {
        let c = document.createElement('div');
        c.className = 'p-card';
        c.innerHTML = `<div class="dot ${p.colorCls}"></div> J${p.id} (Pos: ${p.pos})`;
        elG2.pInfo.appendChild(c);
    });
}

function startTurn() {
    if (diceAnimating) return;
    elG2.diceArea.classList.add('hidden');
    elG2.qArea.classList.remove('hidden');

    let p = g2Players[g2Turn];

    // Configurar layout UI para turno actual
    elG2.turnBox.className = `turn-indicator ${p.boxCls}`;
    elG2.turnText.textContent = `Turno del Jugador ${p.id}`;

    // Generar pregunta
    g2GenProblem(p.diff);
}

function g2GenProblem(diff) {
    elG2.feedback.classList.add('hidden');
    elG2.optsGrid.innerHTML = '';

    let prob = genMath(diff);
    g2CorrectAnswer = prob.ans;
    elG2.qText.textContent = `${prob.n1} ${prob.op} ${prob.n2}`;

    let opts = [prob.ans];
    while (opts.length < 4) {
        let off = Math.floor(Math.random() * 10) - 5;
        if (off === 0) off = 1;
        let w = prob.ans + off;
        if (w < 0 && prob.op !== '-') w = Math.abs(w) + 2;
        if (!opts.includes(w)) opts.push(w);
    }
    opts.sort(() => Math.random() - 0.5);

    opts.forEach(o => {
        let b = document.createElement('button');
        b.className = 'option-btn';
        b.textContent = o;
        b.onclick = () => g2Check(o, b);
        elG2.optsGrid.appendChild(b);
    });
}

function g2Check(sel, btn) {
    const btns = document.querySelectorAll('#g2-options-container .option-btn');
    btns.forEach(b => b.style.pointerEvents = 'none');
    elG2.feedback.classList.remove('hidden');
    elG2.feedback.style.opacity = '1';
    elG2.feedback.style.visibility = 'visible';

    if (sel === g2CorrectAnswer) {
        btn.classList.add('correct');
        elG2.feedback.textContent = '¡Correcto! Tirando dado...';
        elG2.feedback.className = 'feedback success';

        g2Players[g2Turn].diff++; // Sube dificultad

        setTimeout(() => { doDiceRoll(); }, 800);
    } else {
        btn.classList.add('wrong');
        elG2.feedback.textContent = '¡Fallaste! Pierdes tu turno.';
        elG2.feedback.className = 'feedback error';
        btns.forEach(b => { if (parseInt(b.textContent) === g2CorrectAnswer) b.classList.add('correct'); });

        setTimeout(() => { endTurn(); }, 2000);
    }
}

function doDiceRoll() {
    diceAnimating = true;
    elG2.qArea.classList.add('hidden');
    elG2.diceArea.classList.remove('hidden');

    // Animación visual del dado
    elG2.dice.textContent = '🎲';
    elG2.diceRes.textContent = 'Tirando...';

    setTimeout(() => {
        let roll = Math.floor(Math.random() * 6) + 1;
        const diceFaces = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        elG2.dice.textContent = diceFaces[roll];
        elG2.diceRes.textContent = `¡Avanzas ${roll} casillas!`;

        setTimeout(() => { movePlayer(roll); }, 1500);
    }, 500);
}

function movePlayer(steps) {
    let p = g2Players[g2Turn];

    let target = p.pos + steps;
    if (target > 50) target = 50 - (target - 50); // Rebote si te pasas

    p.pos = target;
    drawTokens();
    updatePlayersInfo();

    // Verificar serpientes/escaleras
    setTimeout(() => {
        if (boardMap[p.pos]) {
            let nTarget = boardMap[p.pos];
            let msg = nTarget > p.pos ? '¡Escalera! Subes a la ' + nTarget : '¡Serpiente! Bajas a la ' + nTarget;
            elG2.diceRes.textContent = msg;
            p.pos = nTarget;
            setTimeout(() => { drawTokens(); updatePlayersInfo(); checkWin(p); }, 1500);
        } else {
            checkWin(p);
        }
    }, 700);
}

function checkWin(p) {
    if (p.pos === 50) {
        diceAnimating = false;
        elG2.winTitle.textContent = `¡El Jugador ${p.id} ha ganado!`;
        setTimeout(() => showScreen('g2Win'), 500);
        return;
    }
    endTurn();
}

function endTurn() {
    diceAnimating = false;
    g2Turn = (g2Turn + 1) % g2PlayersCount;
    startTurn();
}
