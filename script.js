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

const appContainer = document.getElementById('app');

function showScreen(screenKey) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenKey].classList.add('active');

    if (screenKey === 'g2Game') {
        appContainer.classList.add('is-wide');
    } else {
        appContainer.classList.remove('is-wide');
    }
}

// Navegación Global
document.getElementById('btn-menu-g1').addEventListener('click', () => showScreen('g1Start'));
document.getElementById('btn-menu-g2').addEventListener('click', () => showScreen('g2Setup'));
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => showScreen('menu'));
});

// ==========================================
//   JUEGO 1: EXAMEN DE MATEMÁTICAS FINANCIERAS (10 ETAPAS DE 5 NIVELES)
// ==========================================
let g1Stage = 1;      // 1-10
let g1LevelsWon = 0;  // 0-5 por etapa
let retryMode = false;
let currentExercise = null;

const TIER_NAMES = ['Novato', 'Principiante', 'Intermedio', 'Avanzado', 'Maestro'];
const TIER_MSGS = [
    '¡Bien hecho! Sigamos con el nivel Novato.',
    '¡Excelente! Ahora entramos al nivel Principiante con conversiones.',
    '¡Muy bien! Próximo reto: nivel Intermedio (Método Exacto/Aproximado).',
    '¡Increíble! Ahora prepárate para el nivel Avanzado (Despejes y cadena).',
    '¡Maestro! Estás en la recta final de la práctica real.'
];

const elG1 = {
    stageDisp: document.getElementById('g1-stage-display'),
    levelDisp: document.getElementById('g1-level-display'),
    progFill: document.getElementById('g1-progress-fill'),
    tierBadge: document.getElementById('g1-tier-badge'),
    qText: document.getElementById('g1-question-text'),
    qFind: document.getElementById('g1-question-find'),
    optsGrid: document.getElementById('g1-options-container'),
    feedback: document.getElementById('g1-feedback'),
    stageTitle: document.getElementById('g1-stage-title'),
    stageMsg: document.getElementById('g1-stage-msg')
};

document.getElementById('btn-start-g1').addEventListener('click', () => {
    g1Stage = 1;
    g1LevelsWon = 0;
    retryMode = false;
    g1UpdateUI();
    g1Gen();
    showScreen('g1Game');
});

document.getElementById('btn-next-stage-g1').addEventListener('click', () => {
    g1Stage++;
    g1LevelsWon = 0;
    retryMode = false;
    if (g1Stage > 10) {
        // Fin del juego total
        elG1.stageTitle.textContent = "¡Examen Completado!";
        elG1.stageMsg.textContent = "Has superado las 10 etapas (50 niveles). ¡Eres un experto!";
        // Podríamos volver al menú o dejarlo ahí
    } else {
        g1UpdateUI();
        g1Gen();
        showScreen('g1Game');
    }
});

function g1UpdateUI() {
    const tierIdx = Math.min(Math.floor((g1Stage - 1) / 2), 4);
    elG1.stageDisp.textContent = g1Stage;
    elG1.levelDisp.textContent = g1LevelsWon + 1 > 5 ? 5 : g1LevelsWon + 1;
    elG1.progFill.style.width = `${(g1LevelsWon / 5) * 100}%`;
    elG1.tierBadge.textContent = TIER_NAMES[tierIdx];
}

function fmtMoney(x) {
    return '$' + x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtResult(val, unit) {
    if (unit === 'money') return fmtMoney(val);
    if (unit === 'percent') return (Math.round(val * 100) / 100).toFixed(2) + '%';
    if (unit === 'months') return Math.round(val) + ' meses';
    if (unit === 'days') return Math.round(val) + ' días';
    return String(Math.round(val * 100) / 100);
}

function g1Gen() {
    elG1.feedback.className = 'feedback hidden';
    elG1.optsGrid.innerHTML = '';

    currentExercise = genFinancialProblem(g1Stage, retryMode);
    elG1.qText.innerText = currentExercise.question;
    elG1.qFind.textContent = currentExercise.findLabel;

    let correctLabel = fmtResult(currentExercise.correctValue, currentExercise.unit);
    let opts = [correctLabel];
    let seed = currentExercise.correctValue;
    let offsets = [0.8, 1.2, 0.9, 1.1, 1.5, 0.5];
    offsets.sort(() => Math.random() - 0.5);
    
    for (let off of offsets) {
        if (opts.length >= 4) break;
        let w = seed * off;
        let wL = fmtResult(w, currentExercise.unit);
        if (!opts.includes(wL)) opts.push(wL);
    }
    while (opts.length < 4) {
        let w = seed + (Math.random() * 20 - 10);
        let wL = fmtResult(w, currentExercise.unit);
        if (!opts.includes(wL)) opts.push(wL);
    }
    opts.sort(() => Math.random() - 0.5);

    opts.forEach(opt => {
        let b = document.createElement('button');
        b.className = 'option-btn';
        b.textContent = opt;
        b.onclick = () => g1Check(opt, b);
        elG1.optsGrid.appendChild(b);
    });
}

function g1Check(selected, btn) {
    const btns = elG1.optsGrid.querySelectorAll('.option-btn');
    btns.forEach(b => b.style.pointerEvents = 'none');
    
    let correctLabel = fmtResult(currentExercise.correctValue, currentExercise.unit);

    if (selected === correctLabel) {
        btn.classList.add('correct');
        elG1.feedback.textContent = '¡Nivel superado!';
        elG1.feedback.className = 'feedback success';
        g1LevelsWon++;
        retryMode = false;

        setTimeout(() => {
            if (g1LevelsWon >= 5) {
                elG1.progFill.style.width = '100%';
                setTimeout(() => {
                    const tierIdx = Math.min(Math.floor((g1Stage - 1) / 2), 4);
                    elG1.stageTitle.textContent = `¡Etapa ${g1Stage} Completada!`;
                    elG1.stageMsg.textContent = TIER_MSGS[tierIdx];
                    showScreen('g1Stage');
                }, 400);
            } else {
                g1UpdateUI();
                g1Gen();
            }
        }, 1000);
    } else {
        btn.classList.add('wrong');
        elG1.feedback.innerHTML = `Error: ${currentExercise.explanation}<br>Intenta un ejercicio similar.`;
        elG1.feedback.className = 'feedback error';
        btns.forEach(b => { if (b.textContent === correctLabel) b.classList.add('correct'); });
        retryMode = true;
        setTimeout(g1Gen, 4000);
    }
}

function genFinancialProblem(stage, isRetry) {
    const tierNum = Math.ceil(stage / 2); // 1-5
    const topics = ['IS', 'DS', 'DES'];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    let C = Math.floor(Math.random() * 50) * 1000 + 5000;
    let i = (Math.floor(Math.random() * 10) + 5) / 100;
    let t = Math.floor(Math.random() * 5) + 1;

    let res = { question: '', findLabel: '', correctValue: 0, explanation: '', unit: 'money' };

    if (tierNum === 1) { // Novato
        if (topic === 'IS') {
            res.correctValue = C * i * t;
            res.question = `Capital: ${fmtMoney(C)}. Tasa: ${(i*100).toFixed(0)}% anual. Plazo: ${t} años.`;
            res.findLabel = 'Interés Simple (I)';
            res.explanation = `I = C · i · t (${C} · ${i} · ${t})`;
        } else if (topic === 'DS') {
            let D = C * i;
            res.correctValue = C - D;
            res.question = `Valor Nominal: ${fmtMoney(C)}. Tasa de descuento: ${(i*100).toFixed(0)}%.`;
            res.findLabel = 'Valor Neto (Vn)';
            res.explanation = `Vn = V(1 - d). Descuento: ${C} · ${i} = ${D}. Vn = ${C} - ${D}.`;
        } else {
            let I = C * i * t;
            res.correctValue = C + I;
            res.question = `Depósito de ${fmtMoney(C)} al ${(i*100).toFixed(0)}% simple por ${t} años.`;
            res.findLabel = 'Monto (M)';
            res.explanation = `M = C + I. I = ${C} · ${i} · ${t} = ${I}. M = ${C} + ${I}.`;
        }
    } else if (tierNum === 2) { // Principiante
        let t_months = Math.floor(Math.random() * 24) + 6;
        if (topic === 'IS') {
            res.correctValue = C * i * (t_months / 12);
            res.question = `Interés simple de ${fmtMoney(C)} al ${(i*100).toFixed(0)}% anual por ${t_months} meses.`;
            res.findLabel = 'Interés Simple (I)';
            res.explanation = `t = ${t_months}/12 años. I = C · i · t.`;
        } else {
            let t_days = Math.floor(Math.random() * 200) + 30;
            res.correctValue = C * i * (t_days / 360);
            res.question = `Préstamo de ${fmtMoney(C)} al ${(i*100).toFixed(0)}% anual por ${t_days} días (360 días/año).`;
            res.findLabel = 'Interés Simple (I)';
            res.explanation = `t = ${t_days}/360 años. I = C · i · t.`;
        }
    } else if (tierNum === 3) { // Intermedio
        let t_days = Math.floor(Math.random() * 150) + 50;
        let isExact = Math.random() > 0.5;
        let factor = isExact ? 365 : 360;
        res.correctValue = C * i * (t_days / factor);
        res.question = `C: ${fmtMoney(C)}. i: ${(i*100).toFixed(0)}%. Plazo: ${t_days} días. Método ${isExact ? 'Exacto (365)' : 'Aproximado (360)'}.`;
        res.findLabel = 'Interés Simple (I)';
        res.explanation = `Alica división entre ${factor} para el tiempo.`;
    } else if (tierNum === 4) { // Avanzado
        if (topic === 'DS') {
            res.correctValue = C * (1 - 0.10) * (1 - 0.05);
            res.question = `Monto: ${fmtMoney(C)}. Descuentos sucesivos bancarios: 10% y 5%.`;
            res.findLabel = 'Valor Neto final (Vn)';
            res.explanation = `Vn = V(1-d1)(1-d2) = ${C} · 0.90 · 0.95.`;
        } else {
            let I = C * i * t;
            if (Math.random() > 0.5) {
                res.unit = 'months';
                res.correctValue = t * 12;
                res.question = `¿Cuántos meses deben pasar para que ${fmtMoney(C)} al ${(i*100).toFixed(0)}% anual gane $${(C*i*t).toFixed(2)} de interés simple?`;
                res.findLabel = 'Tiempo (t) en meses';
                res.explanation = `t = I / (C · i). Luego multiplica por 12 para meses.`;
            } else {
                res.correctValue = i * 100;
                res.unit = 'percent';
                res.question = `¿Tasa anual simple se requiere para que ${fmtMoney(C)} en ${t} años gane ${fmtMoney(I)}?`;
                res.findLabel = 'Tasa (i)%';
                res.explanation = `i = I / (C · t).`;
            }
        }
    } else { // Maestro
        res.correctValue = C - (C * 0.12);
        res.question = `Una empresa gestiona un préstamo de ${fmtMoney(C)} al 12% con descuento anticipado completo.`;
        res.findLabel = '¿Cuál es el Valor Neto (Vn) recibido?';
        res.explanation = `Usa Vn = V(1-d). Resultado: ${C} - (${C} · 0.12).`;
    }
    return res;
}

// ==========================================
//   JUEGO 2: ARITMÉTICA (S/E)
// ==========================================
let g2PlayersCount = 2;
let g2Players = [];
let g2Turn = 0;
let g2CorrectValue = 0;
let diceAnimating = false;

const boardMap = { 4: 14, 9: 31, 20: 38, 28: 42, 17: 7, 34: 15, 46: 25, 49: 11 };

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
    const order = [
        50, 49, 48, 47, 46, 45, 44, 43, 42, 41,
        31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        30, 29, 28, 27, 26, 25, 24, 23, 22, 21,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        10, 9, 8, 7, 6, 5, 4, 3, 2, 1
    ];
    order.forEach(num => {
        let cell = document.createElement('div');
        cell.className = `board-cell bg-${(num % 4) + 1}`;
        cell.id = `cell-${num}`;
        cell.textContent = num;
        let sn = document.createElement('div');
        sn.className = 'sn-indicator';
        if (num in boardMap) sn.textContent = boardMap[num] > num ? '🪜' : '🐍';
        cell.appendChild(sn);
        let tk = document.createElement('div');
        tk.className = 'player-tokens-container';
        tk.id = `tokens-${num}`;
        cell.appendChild(tk);
        elG2.boardGrid.appendChild(cell);
    });
    drawTokens();
}

function drawTokens() {
    document.querySelectorAll('.player-tokens-container').forEach(c => c.innerHTML = '');
    g2Players.forEach(p => {
        let cnt = document.getElementById(`tokens-${p.pos}`);
        if(cnt){ let t = document.createElement('div'); t.className = `player-token ${p.colorCls}`; cnt.appendChild(t); }
    });
}

function updatePlayersInfo() {
    elG2.pInfo.innerHTML = '';
    g2Players.forEach(p => {
        let c = document.createElement('div'); c.className = 'p-card';
        c.innerHTML = `<div class="dot ${p.colorCls}"></div> J${p.id} (P:${p.pos})`;
        elG2.pInfo.appendChild(c);
    });
}

function startTurn() {
    if (diceAnimating) return;
    elG2.diceArea.classList.add('hidden');
    elG2.qArea.classList.remove('hidden');
    let p = g2Players[g2Turn];
    elG2.turnBox.className = `turn-indicator ${p.boxCls}`;
    elG2.turnText.textContent = `Turno J${p.id}`;
    g2GenProb(p.diff);
}

function g2GenProb(diff) {
    elG2.feedback.classList.add('hidden');
    elG2.optsGrid.innerHTML = '';
    let n1 = Math.floor(Math.random() * (10 * diff)) + 1;
    let n2 = Math.floor(Math.random() * (10 * diff)) + 1;
    g2CorrectValue = n1 + n2;
    elG2.qText.textContent = `${n1} + ${n2}`;
    let opts = [g2CorrectValue];
    while(opts.length < 4){
        let w = g2CorrectValue + (Math.floor(Math.random()*10)-5);
        if(w >= 0 && !opts.includes(w)) opts.push(w);
    }
    opts.sort(()=>Math.random()-0.5).forEach(o => {
        let b = document.createElement('button'); b.className = 'option-btn'; b.textContent = o;
        b.onclick = () => g2Chk(o, b); elG2.optsGrid.appendChild(b);
    });
}

function g2Chk(sel, btn) {
    const btns = elG2.optsGrid.querySelectorAll('.option-btn');
    btns.forEach(b => b.style.pointerEvents = 'none');
    elG2.feedback.classList.remove('hidden');
    if (sel === g2CorrectValue) {
        btn.classList.add('correct');
        elG2.feedback.textContent = '¡Correcto!';
        setTimeout(doRoll, 800);
    } else {
        btn.classList.add('wrong');
        elG2.feedback.textContent = '¡Fallaste!';
        btns.forEach(b => { if(parseInt(b.textContent) === g2CorrectValue) b.classList.add('correct'); });
        setTimeout(endG2Turn, 1500);
    }
}

function doRoll() {
    diceAnimating = true;
    elG2.qArea.classList.add('hidden');
    elG2.diceArea.classList.remove('hidden');
    setTimeout(() => {
        let roll = Math.floor(Math.random() * 6) + 1;
        elG2.dice.textContent = ['🎲','⚀','⚁','⚂','⚃','⚄','⚅'][roll];
        elG2.diceRes.textContent = `¡Avanzas ${roll}!`;
        setTimeout(() => {
            let p = g2Players[g2Turn];
            p.pos += roll;
            if(p.pos > 50) p.pos = 50 - (p.pos-50);
            if(boardMap[p.pos]) p.pos = boardMap[p.pos];
            drawTokens(); updatePlayersInfo();
            if(p.pos === 50){ showScreen('g2Win'); } else { endG2Turn(); }
        }, 1000);
    }, 600);
}

function endG2Turn() { diceAnimating = false; g2Turn = (g2Turn + 1) % g2PlayersCount; startTurn(); }
