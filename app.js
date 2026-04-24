// ============ VIEW SWITCHING ============
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
        if (view === 'passenger') {
            document.getElementById('passenger-app').classList.add('active');
        } else {
            document.getElementById('airline-dashboard').classList.add('active');
        }
    });
});

// ============ PHONE SCREENS (animated transitions) ============
var _prevScreen = 'screen-onboarding';
function showScreen(screenId) {
    var current = document.querySelector('#passenger-app .screen.active');
    var target = document.getElementById(screenId);
    if (!target || (current && current.id === screenId)) return;

    // Determine direction
    var direction = 'right'; // default: slide from right
    var backScreens = ['screen-home', 'screen-onboarding', 'screen-login'];
    if (backScreens.indexOf(screenId) !== -1 && current && backScreens.indexOf(current.id) === -1) {
        direction = 'left';
    }

    // Animate out old screen
    if (current) {
        current.classList.add('exit-' + (direction === 'right' ? 'left' : 'right'));
        setTimeout(function () {
            current.classList.remove('active', 'exit-left', 'exit-right');
        }, 280);
    }

    // Animate in new screen
    target.classList.add('enter-' + direction);
    // Force reflow
    void target.offsetWidth;
    target.classList.add('active');
    setTimeout(function () {
        target.classList.remove('enter-left', 'enter-right');
    }, 20);

    target.querySelector('.screen-scroll')?.scrollTo(0, 0);
    _prevScreen = screenId;

    // Update nav — 5 integrated tabs
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    var navMap = {
        'screen-home': 'nav-trip',
        'screen-boardingpass': 'nav-boarding',
        'screen-baggage': 'nav-baggage',
        'screen-guardian': 'nav-navigate',
        'screen-ar': 'nav-navigate',
        'screen-support': 'nav-support',
        'screen-wellbeing': 'nav-support',
        'screen-disruption': 'nav-trip',
        'screen-recovery': 'nav-trip',
        'screen-confirmation': 'nav-trip',
        'screen-partners': 'nav-support',
        'screen-profile': 'nav-trip',
        'screen-edit-profile': 'nav-trip',
        'screen-airline-hub': 'nav-trip',
        'screen-seatfit': 'nav-boarding',
        'screen-tsa': 'nav-trip',
        'screen-gate': 'nav-boarding',
        'screen-inflight': 'nav-trip',
        'screen-agent-resolve': 'nav-trip',
        'screen-journey-complete': 'nav-trip'
    };
    var navId = navMap[screenId];
    if (navId) document.getElementById(navId)?.classList.add('active');
}

// ============ RECOVERY OPTION SELECTION ============
let selectedOption = null;

const optionNames = {
    1: 'JA712 via Chicago',
    2: 'BA882 Direct to London',
    3: 'JA204 (Stay on this flight)'
};

function selectOption(num) {
    selectedOption = num;
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('option-' + num).classList.add('selected');

    // Show selection summary
    const summary = document.getElementById('selection-summary');
    const summaryText = document.getElementById('selection-text');
    if (summary && summaryText) {
        summaryText.textContent = `You selected ${optionNames[num]}`;
        summary.classList.remove('hidden');
        // Re-trigger animation
        summary.style.animation = 'none';
        summary.offsetHeight; // force reflow
        summary.style.animation = 'slideIn 0.3s ease';
    }

    // Show confirm button
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.classList.remove('hidden');
        confirmBtn.textContent = `Confirm — Book ${optionNames[num].split(' ')[0]}`;
    }
}

function confirmRecovery() {
    showScreen('screen-confirmation');
}

// ============ EXPANDABLE FLIGHT DETAILS ============
function toggleExpand(num) {
    const expandEl = document.getElementById('expand-' + num);
    const btn = expandEl?.closest('.option-card')?.querySelector('.expand-toggle');
    if (!expandEl) return;

    const isOpen = expandEl.classList.contains('open');
    // Close all others
    document.querySelectorAll('.option-expand').forEach(e => {
        e.classList.remove('open');
        const parentBtn = e.closest('.option-card')?.querySelector('.expand-toggle');
        if (parentBtn) parentBtn.textContent = 'Show flight details ▾';
    });

    if (!isOpen) {
        expandEl.classList.add('open');
        if (btn) btn.textContent = 'Hide flight details ▴';
    }
}

// ============ RECOVERY VIEW TOGGLE (Cards vs Compare) ============
function setRecoveryView(mode) {
    const cardsView = document.getElementById('recovery-cards-view');
    const tableView = document.getElementById('recovery-table-view');
    const cardsBtn = document.getElementById('compare-cards-btn');
    const tableBtn = document.getElementById('compare-table-btn');

    if (mode === 'cards') {
        cardsView.classList.remove('hidden');
        tableView.classList.add('hidden');
        cardsBtn.classList.add('active');
        tableBtn.classList.remove('active');
    } else {
        cardsView.classList.add('hidden');
        tableView.classList.remove('hidden');
        cardsBtn.classList.remove('active');
        tableBtn.classList.add('active');
    }
}

// ============ INTERACTIVE NAV STEPS ============
let currentNavStep = 0;

function activateNavStep(stepNum) {
    currentNavStep = stepNum;
    const steps = document.querySelectorAll('.step-nav');

    steps.forEach(step => {
        const sNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        const numWrap = step.querySelector('.step-num-wrap');
        numWrap?.classList.remove('active');

        if (sNum < stepNum) {
            step.classList.add('completed');
        } else if (sNum === stepNum) {
            step.classList.add('active');
            numWrap?.classList.add('active');
        }
    });

    // Update progress bar
    const totalSteps = steps.length;
    const pct = Math.round(((stepNum) / totalSteps) * 100);
    const progressBar = document.getElementById('nav-progress-fill');
    if (progressBar) progressBar.style.width = pct + '%';
    const pctLabel = document.getElementById('nav-pct');
    if (pctLabel) pctLabel.textContent = pct + '% complete';

    // Scroll step into view
    const activeStep = document.querySelector(`.step-nav[data-step="${stepNum}"]`);
    activeStep?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============ DASHBOARD NAVIGATION ============
function showDash(dashId) {
    document.querySelectorAll('.dash-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(dashId)?.classList.add('active');
    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-dash="${dashId}"]`)?.classList.add('active');
    // Update title
    const titles = {
        'dash-home': 'Operations Dashboard',
        'dash-disruptions': 'Live Disruptions Board',
        'dash-recovery': 'Passenger Recovery Queue',
        'dash-connections': 'Connection Risk Monitor',
        'dash-analytics': 'Performance Analytics',
        'dash-config': 'Configuration & Rules'
    };
    document.getElementById('dash-title').textContent = titles[dashId] || 'Dashboard';
}

// ============ LIVE CLOCK ============
function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    document.getElementById('phone-time').textContent = `${h12}:${m} ${ampm}`;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dash-date').textContent = now.toLocaleDateString('en-US', options);

    // London time (UTC+1 BST)
    const londonTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const lh = londonTime.getHours();
    const lm = londonTime.getMinutes().toString().padStart(2, '0');
    const lampm = lh >= 12 ? 'PM' : 'AM';
    const lh12 = lh % 12 || 12;
    const londonEl = document.getElementById('london-time');
    if (londonEl) londonEl.textContent = `${lh12}:${lm} ${lampm}`;
}
updateClock();
setInterval(updateClock, 30000);

// ============ CONNECTION TIMER COUNTDOWN ============
let connectionMinutes = 38;

const _connectionRiskModel = {
    // Demo assumptions (in a real product these come from live ops data)
    walkMins: 12,
    terminalChangePenaltyMins: 6,
    expectedCongestionMins: 6,
    safetyBufferMins: 10
};

function computeConnectionRisk(availableMins) {
    const recommended =
        _connectionRiskModel.walkMins +
        _connectionRiskModel.terminalChangePenaltyMins +
        _connectionRiskModel.expectedCongestionMins +
        _connectionRiskModel.safetyBufferMins;

    const buffer = Math.round(availableMins - recommended);

    let level = 'ok';
    if (buffer <= 0) level = 'high';
    else if (buffer <= 8) level = 'risk';

    const whyParts = [
        `${_connectionRiskModel.walkMins} min walk`,
        `${_connectionRiskModel.terminalChangePenaltyMins} min terminal change`,
        `${_connectionRiskModel.expectedCongestionMins} min expected congestion`,
        `${_connectionRiskModel.safetyBufferMins} min safety buffer`
    ];

    return { availableMins, recommendedMins: recommended, bufferMins: buffer, level, whyParts };
}

function updateConnectionRiskUI() {
    const pill = document.getElementById('conn-risk-pill');
    const availableEl = document.getElementById('conn-available');
    const recEl = document.getElementById('conn-recommended');
    const bufEl = document.getElementById('conn-buffer');
    const whyEl = document.getElementById('conn-risk-why');

    const r = computeConnectionRisk(connectionMinutes);

    if (availableEl) availableEl.textContent = `${r.availableMins} min`;
    if (recEl) recEl.textContent = `${r.recommendedMins} min`;
    if (bufEl) {
        const sign = r.bufferMins >= 0 ? '+' : '';
        bufEl.textContent = `${sign}${r.bufferMins} min`;
        bufEl.style.color = r.level === 'high' ? 'var(--red)' : r.level === 'risk' ? 'var(--amber)' : 'var(--green)';
    }
    if (pill) {
        pill.textContent = r.level === 'high' ? 'High risk' : r.level === 'risk' ? 'At risk' : 'On track';
        pill.classList.remove('ok', 'risk', 'high');
        pill.classList.add(r.level);
    }
    if (whyEl) {
        whyEl.innerHTML = `We decide “At risk” when your <strong>buffer</strong> is small after accounting for: <strong>${r.whyParts.join(
            ' + '
        )}</strong>. If delays worsen or congestion increases, the buffer can drop to zero (missed connection).`;
    }
}

function updateConnectionTimer() {
    if (connectionMinutes > 0) connectionMinutes--;
    const timerEl = document.querySelector('.timer-mins');
    if (timerEl) timerEl.textContent = connectionMinutes;
    const timerVal = document.querySelector('.timer-value');
    if (timerVal) timerVal.textContent = connectionMinutes + ' min';
    // Update ring
    const pct = connectionMinutes / 60;
    const offset = 339.292 * (1 - pct);
    const ring = document.querySelector('.ring-fg');
    if (ring) ring.style.strokeDashoffset = offset;
    // Color changes
    if (connectionMinutes <= 15) {
        if (ring) ring.style.stroke = 'var(--red)';
        if (timerEl) timerEl.style.color = 'var(--red)';
    }
    updateConnectionRiskUI();
}
setInterval(updateConnectionTimer, 60000);
setTimeout(updateConnectionRiskUI, 120);

// ============ LIVE BAGGAGE SIMULATION ============
let bagSimInterval = null;

function startBagSimulation() {
    // Simulate scan updates appearing in real-time
    const scanItems = document.querySelectorAll('.scan-item.future');
    let nextScanIdx = 0;

    // Flash the current scan item periodically
    const currentScan = document.querySelector('.scan-item.current');
    if (currentScan) {
        setInterval(() => {
            const dot = currentScan.querySelector('.scan-dot');
            if (dot) {
                dot.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.3)';
                setTimeout(() => { dot.style.boxShadow = ''; }, 700);
            }
        }, 2000);
    }
}

// Start bag sim when baggage screen is shown
const origShowScreen = showScreen;
showScreen = function (screenId) {
    origShowScreen(screenId);
    if (screenId === 'screen-baggage') {
        startBagSimulation();
    }
};

// ============ ENTRANCE ANIMATIONS ============
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.info-card, .option-card, .kpi-card, .analytics-card, .conn-passenger-card, .step-nav, .scan-item, .quick-tile, .dest-preview-card, .covered-card, .tip-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
});

// Trigger initial visibility for already visible elements
setTimeout(() => {
    document.querySelectorAll('.info-card, .option-card, .kpi-card, .analytics-card, .conn-passenger-card, .step-nav, .scan-item, .quick-tile, .dest-preview-card, .covered-card, .tip-card').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}, 100);

// ============ GREETING BASED ON TIME ============
function updateGreeting() {
    const h = new Date().getHours();
    let greeting = 'Good morning';
    if (h >= 12 && h < 17) greeting = 'Good afternoon';
    else if (h >= 17) greeting = 'Good evening';
    document.getElementById('greeting-text').textContent = greeting + ', Luthfi';
}
updateGreeting();

// ============ QR CODE GENERATOR ============
function generateQR() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 160;
    const modules = 25;
    const cellSize = size / modules;

    // Deterministic pseudo-random based on booking ref
    const seed = 'JA-X7K9M2-PAX001-JA204-14A';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#111827';

    // Finder patterns (3 corners)
    function drawFinder(x, y) {
        ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = '#111827';
        ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }
    drawFinder(0, 0);
    drawFinder(modules - 7, 0);
    drawFinder(0, modules - 7);

    // Data modules (seeded pattern)
    let s = Math.abs(hash);
    for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
            // Skip finder regions
            if ((r < 8 && c < 8) || (r < 8 && c > modules - 9) || (r > modules - 9 && c < 8)) continue;
            // Timing patterns
            if (r === 6 || c === 6) {
                if ((r + c) % 2 === 0) ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                continue;
            }
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            if (s % 3 !== 0) {
                ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }
    }

    // Center alignment pattern 
    const cx = Math.floor(modules / 2);
    ctx.fillStyle = '#111827';
    ctx.fillRect((cx - 2) * cellSize, (cx - 2) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((cx - 1) * cellSize, (cx - 1) * cellSize, 3 * cellSize, 3 * cellSize);
    ctx.fillStyle = '#111827';
    ctx.fillRect(cx * cellSize, cx * cellSize, cellSize, cellSize);
}

// Generate QR when boarding pass screen opens
const origShowScreen2 = showScreen;
showScreen = function (screenId) {
    origShowScreen2(screenId);
    if (screenId === 'screen-boardingpass') {
        setTimeout(generateQR, 50);
    }
};

// ============ BAGGAGE ADD-ONS ============
function toggleAddon(type) {
    const card = document.getElementById('addon-' + type);
    const btn = card?.querySelector('.addon-btn');
    if (!card || !btn) return;

    const isAdded = card.classList.toggle('added');
    btn.textContent = isAdded ? 'Added ✓' : 'Add';
}

// ============ AI CHATBOT ENGINE ============
const chatResponses = {
    flight: {
        patterns: ['flight', 'status', 'delay', 'ja204', 'depart', 'arrival', 'when', 'time', 'late'],
        response: `Your flight **JA204** (SFO → LHR) is currently **delayed by 1h 45m**.

📍 New departure: **12:15 PM** (was 10:30 AM)
🛬 New arrival: **8:15 AM +1** at Heathrow T5
📋 Reason: Late incoming aircraft from Denver (JA118)
🚪 Gate: **B14**, Terminal International

Would you like to see rebooking options?`
    },
    baggage: {
        patterns: ['bag', 'baggage', 'luggage', 'suitcase', 'loaded', 'carousel'],
        response: `Your bag **SW-82749102** (Black Samsonite Hardshell, 23.4 kg) is **safely loaded** on JA204! ✅

Last scan: 10:05 AM at SFO Gate B14, Hold 2
Next: Will be unloaded at LHR Terminal 5
Estimated carousel: **Carousel 7**, ~25 min after landing

💡 Tip: Want priority handling ($14.99) so your bag comes out first?`
    },
    connection: {
        patterns: ['connection', 'connect', 'transfer', 'heathrow', 'layover', 'make it', 'miss', 'lhr'],
        response: `⚠️ Your connection **JA512** (LHR → CDG) at **2:05 PM** is **at risk**.

Estimated connection time: **38 min** (minimum required: 45 min)
Walking distance: 1.85 km through Terminal 5

Our Connection Guardian is actively monitoring. If you miss it, we'll auto-rebook within seconds.

<span class="chat-link" onclick="showScreen('screen-guardian')">Open Connection Guardian →</span>`
    },
    rebooking: {
        patterns: ['rebook', 'change', 'different flight', 'option', 'alternative', 'switch'],
        response: `I've prepared **3 recovery options** for you:

1️⃣ **JA712 via Chicago** — Arrives 40 min earlier ⭐ Recommended
2️⃣ **BA882 Direct** (British Airways) — Arrives 1h 05m earlier
3️⃣ **Stay on JA204** — Connection rebooked to later departure

All fee changes are **waived** due to the delay.

<span class="chat-link" onclick="showScreen('screen-recovery')">View recovery options →</span>`
    },
    partners: {
        patterns: ['partner', 'airline', 'united', 'american', 'delta', 'southwest', 'jetblue', 'frontier', 'codeshare'],
        response: `Journey Air partners with **8 major carriers** for seamless recovery:

🟦 **United Airlines** — Star Alliance, full codeshare
🟦 **American Airlines** — Oneworld, full interline
🟦 **Delta Air Lines** — SkyTeam, full codeshare
🟦 **JetBlue Airways** — Interline, bag transfer
🟨 **Southwest Airlines** — Recovery routing
🟩 **Frontier Airlines** — ULCC recovery
🟥 **British Airways** — Transatlantic partner
🟦 **Lufthansa** — European hub partner

<span class="chat-link" onclick="showScreen('screen-partners')">View all partner details →</span>`
    },
    boardingpass: {
        patterns: ['boarding pass', 'boarding', 'check-in', 'checkin', 'qr', 'scan', 'gate pass'],
        response: `Your mobile boarding pass is ready! ✅

✈ **JA204** — SFO → LHR
💺 Seat: **14A** (Window)
🚪 Gate: **B14**
🕐 Boarding: **11:45 AM**, Group 2

<span class="chat-link" onclick="showScreen('screen-boardingpass')">Open boarding pass →</span>`
    },
    human: {
        patterns: ['human', 'agent', 'person', 'real person', 'speak', 'call', 'phone'],
        response: `I'll connect you with a human agent right away.

📞 Estimated wait: **2 min** (Priority queue — Gold member)
💬 Or I can escalate this to our SMS support line.

While you wait, is there anything I can help with? I have access to your full booking, flight status, and rebooking authority.`
    },
    seat: {
        patterns: ['seat', 'upgrade', 'window', 'aisle', 'middle', 'class'],
        response: `Your current seat: **14A (Window)** — Economy on JA204.

💺 Upgrade options:
• Economy Plus (row 8-12): available, +$129
• Premium Economy (row 1-5): available, +$349

Your seat preference (window) will be maintained on any rebooking.`
    },
    wifi: {
        patterns: ['wifi', 'internet', 'onboard', 'entertainment'],
        response: `JA204 (Boeing 787-9 Dreamliner) offers:

📶 **High-speed Wi-Fi** — Free for Gold members!
🎬 In-seat entertainment with 200+ movies
🔌 USB-A and USB-C charging at every seat
🍽️ Complimentary dinner service (menu available after boarding)`
    },
    weather: {
        patterns: ['weather', 'london', 'temperature', 'rain', 'forecast'],
        response: `London weather at arrival time (8:15 AM):

☁️ **14°C / 57°F** — Cloudy
💨 Wind: 15 km/h NW
💧 Humidity: 72%
🌅 Sunrise: 6:12 AM
🌆 Sunset: 7:48 PM

Pack a light jacket!`
    },
    greeting: {
        patterns: ['hi', 'hello', 'hey', 'help', 'what can you'],
        response: `Hey! 👋 Here's what I can help with:

✈️ Flight status & updates
🧳 Baggage tracking in real-time
🔗 Connection risk assessment
🔄 Rebooking & recovery options
🤝 Partner airline info
🎫 Boarding pass & check-in
👤 Connect to a human agent

Just ask me anything or tap a quick reply below!`
    },
    wellbeing: {
        patterns: [
            'feel better', 'help me feel better', 'feel worse', 'anxious', 'anxiety', 'panic', 'panicking', 'stressed', 'stress',
            'overwhelmed', 'scared', 'nervous', 'claustrophobic', 'calm', 'calm down', 'breathing', 'breathe',
            'grounding', 'not feeling well', 'dizzy', 'sick'
        ],
        response: `I’ve got you. Let’s make this moment easier.

You can use a **60‑second breathing reset** + grounding tools here:
<span class="chat-link" onclick="showScreen('screen-wellbeing')">Open “Feel Better” →</span>

If you tell me what’s hardest right now (stress, anxiety, tired, overwhelmed), I’ll tailor the next steps.`
    }
};

function matchIntent(text) {
    const lower = text.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const [intent, data] of Object.entries(chatResponses)) {
        let score = 0;
        for (const pattern of data.patterns) {
            if (lower.includes(pattern)) score++;
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = intent;
        }
    }

    return bestMatch;
}

// ============ WELLBEING / FEEL BETTER ============
let _wbBreathTimer = null;
let _wbBreathRemaining = 60;
let _wbBreathPhase = 'inhale';
let _wbBreathPhaseRemaining = 4;
let _wbMood = null;

function setWellbeingMood(mood) {
    _wbMood = mood;
    const label = document.getElementById('wb-mood-label');
    if (label) {
        const nice = {
            stressed: 'Stressed',
            anxious: 'Anxious',
            tired: 'Tired',
            overwhelmed: 'Overwhelmed'
        };
        label.textContent = nice[mood] || mood;
    }
}

function _wbSetBreathUI() {
    const timeEl = document.getElementById('wb-breathe-time');
    const instrEl = document.getElementById('wb-breathe-instr');
    const fillEl = document.getElementById('wb-progress-fill');

    if (timeEl) {
        const m = Math.floor(_wbBreathRemaining / 60);
        const s = (_wbBreathRemaining % 60).toString().padStart(2, '0');
        timeEl.textContent = `${m}:${s}`;
    }
    if (instrEl) {
        const verb = _wbBreathPhase === 'inhale' ? 'Inhale' : 'Exhale';
        instrEl.textContent = `${verb}… ${_wbBreathPhaseRemaining}s`;
    }
    if (fillEl) {
        const pct = Math.max(0, Math.min(100, ((60 - _wbBreathRemaining) / 60) * 100));
        fillEl.style.width = pct + '%';
    }
}

function startWellbeingBreathing() {
    stopWellbeingBreathing();
    _wbBreathRemaining = 60;
    _wbBreathPhase = 'inhale';
    _wbBreathPhaseRemaining = 4;
    _wbSetBreathUI();

    _wbBreathTimer = setInterval(() => {
        if (_wbBreathRemaining <= 0) {
            stopWellbeingBreathing(true);
            return;
        }

        _wbBreathRemaining -= 1;
        _wbBreathPhaseRemaining -= 1;

        if (_wbBreathPhaseRemaining <= 0) {
            if (_wbBreathPhase === 'inhale') {
                _wbBreathPhase = 'exhale';
                _wbBreathPhaseRemaining = 6;
            } else {
                _wbBreathPhase = 'inhale';
                _wbBreathPhaseRemaining = 4;
            }
        }

        _wbSetBreathUI();
    }, 1000);
}

function stopWellbeingBreathing(completed = false) {
    if (_wbBreathTimer) clearInterval(_wbBreathTimer);
    _wbBreathTimer = null;

    const instrEl = document.getElementById('wb-breathe-instr');
    const fillEl = document.getElementById('wb-progress-fill');
    const timeEl = document.getElementById('wb-breathe-time');

    if (completed) {
        if (instrEl) instrEl.textContent = 'Nice work. Want a calm, step-by-step plan from the assistant?';
        if (fillEl) fillEl.style.width = '100%';
        if (timeEl) timeEl.textContent = '0:00';
    } else {
        if (instrEl) instrEl.textContent = 'Tap Start. Inhale 4s, exhale 6s.';
        if (fillEl) fillEl.style.width = '0%';
        if (timeEl) timeEl.textContent = '1:00';
    }
}

function wellbeingSendToAssistant(text) {
    // Route through existing chat composer and open chat for continuity
    showScreen('screen-support');
    setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) input.value = text;
        sendChat();
    }, 60);
}

function addChatMessage(text, isUser = false) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${isUser ? 'user' : 'bot'}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = isUser ? 'L' : '✈';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    // Convert markdown-style bold to HTML
    const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    bubble.innerHTML = htmlText;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    container.appendChild(msgDiv);

    // Auto-scroll
    const scroll = document.getElementById('chat-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg bot';
    msgDiv.id = 'typing-msg';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = '✈';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    container.appendChild(msgDiv);

    const scroll = document.getElementById('chat-scroll');
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById('typing-msg');
    if (typing) typing.remove();
}

function getBotResponse(text) {
    const intent = matchIntent(text);
    if (intent && chatResponses[intent]) {
        return chatResponses[intent].response;
    }
    return `I'm not sure I understand exactly, but I'm here to help! 🤔

Try asking about:
• Your **flight status** or **delay updates**
• **Baggage** tracking
• **Connection** risk
• **Rebooking** options
• **Partner airlines**
• Your **boarding pass**

Or I can connect you with a human agent!`;
}

function sendChat() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addChatMessage(text, true);

    // Hide quick replies after first message
    const qr = document.getElementById('quick-replies');
    if (qr) qr.style.display = 'none';

    // Show typing indicator then respond
    showTypingIndicator();
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
        removeTypingIndicator();
        addChatMessage(getBotResponse(text));

        // Show contextual quick replies
        showContextualReplies(text);
    }, delay);
}

function sendQuickReply(text) {
    const input = document.getElementById('chat-input');
    if (input) input.value = text;
    sendChat();
}

function showContextualReplies(lastQuery) {
    const qr = document.getElementById('quick-replies');
    if (!qr) return;

    const intent = matchIntent(lastQuery);
    const followUps = {
        flight: ['Show rebooking options', 'Where is my baggage?', 'Show my boarding pass'],
        baggage: ['Add priority handling', 'Will I make my connection?', 'Open baggage tracker'],
        connection: ['Show rebooking options', 'Open Connection Guardian', 'Talk to a human agent'],
        rebooking: ['What\'s my flight status?', 'Where is my baggage?', 'Talk to a human agent'],
        partners: ['Show rebooking options', 'What\'s my flight status?', 'Talk to a human agent'],
        human: ['What\'s my flight status?', 'Where is my baggage?', 'Show rebooking options'],
        boardingpass: ['What\'s my flight status?', 'Where is my baggage?', 'Will I make my connection?'],
        greeting: ['What\'s my flight status?', 'Where is my baggage?', 'Will I make my connection?']
    };

    const options = followUps[intent] || ['What\'s my flight status?', 'Where is my baggage?', 'Talk to a human agent'];

    qr.innerHTML = options.map(opt => `<button class="qr-btn" onclick="sendQuickReply('${opt.replace(/'/g, "\\'")}')">` + opt + '</button>').join('');
    qr.style.display = 'flex';
}

// ============ ONBOARDING (with touch swipe) ============
let currentSlide = 0;
const totalSlides = 3;

function nextOnboardingSlide() {
    currentSlide++;
    if (currentSlide >= totalSlides) {
        finishOnboarding();
        return;
    }
    updateOnboardingSlide('next');
}

function prevOnboardingSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateOnboardingSlide('prev');
    }
}

function updateOnboardingSlide(dir) {
    var allSlides = document.querySelectorAll('.ob-slide');
    allSlides.forEach(function (s) {
        s.classList.remove('active', 'ob-slide-exit-left', 'ob-slide-exit-right');
    });
    document.querySelectorAll('.ob-dot').forEach(d => d.classList.remove('active'));

    var slide = document.querySelector('.ob-slide[data-slide="' + currentSlide + '"]');
    var dot = document.querySelector('.ob-dot[data-dot="' + currentSlide + '"]');
    if (slide) {
        slide.style.animation = 'none';
        void slide.offsetWidth;
        slide.style.animation = dir === 'prev' ? 'obSlideFromLeft 0.35s ease' : 'obFadeIn 0.35s ease';
        slide.classList.add('active');
    }
    if (dot) dot.classList.add('active');

    var btn = document.getElementById('ob-next-btn');
    if (currentSlide === totalSlides - 1 && btn) {
        btn.textContent = 'Get started';
    } else if (btn) {
        btn.textContent = 'Next';
    }
}

function finishOnboarding() {
    showScreen('screen-login');
}

// Touch swipe for onboarding
(function () {
    var obWrap = document.getElementById('ob-slides');
    if (!obWrap) return;
    var startX = 0, startY = 0, distX = 0;
    obWrap.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    obWrap.addEventListener('touchend', function (e) {
        distX = e.changedTouches[0].clientX - startX;
        var distY = Math.abs(e.changedTouches[0].clientY - startY);
        if (Math.abs(distX) > 50 && distY < 100) {
            if (distX < 0) nextOnboardingSlide();
            else prevOnboardingSlide();
        }
    }, { passive: true });
})();

// ============ LOGIN ============
function handleLogin() {
    const btn = document.querySelector('.login-btn.primary-btn');
    const origText = btn ? btn.textContent.trim() : '';
    if (btn) {
        btn.textContent = 'Signing in...';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
    }
    setTimeout(function () {
        showScreen('screen-addflight');
        if (btn) {
            btn.textContent = origText;
            btn.style.opacity = '1';
            btn.style.pointerEvents = '';
        }
    }, 800);
}

// ============ ADD FLIGHT ============
function switchAfTab(tab) {
    document.querySelectorAll('.af-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.af-panel').forEach(function (p) { p.classList.remove('active'); });

    var tabEl = document.getElementById('af-tab-' + tab);
    var panelEl = document.getElementById('af-panel-' + tab);
    if (tabEl) tabEl.classList.add('active');
    if (panelEl) panelEl.classList.add('active');
}

function searchFlight() {
    var btnText = document.getElementById('af-btn-text');
    var btnLoad = document.getElementById('af-btn-loading');
    var result = document.getElementById('af-result');
    var recent = document.getElementById('af-recent');

    if (btnText) btnText.classList.add('hidden');
    if (btnLoad) btnLoad.classList.remove('hidden');

    setTimeout(function () {
        if (btnText) btnText.classList.remove('hidden');
        if (btnLoad) btnLoad.classList.add('hidden');
        if (result) result.classList.remove('hidden');
        if (recent) recent.classList.add('hidden');
    }, 1500);
}

function quickAddFlight(ref) {
    var input = document.getElementById('af-booking-ref');
    if (input) input.value = ref;
    searchFlight();
}

function confirmAddFlight() {
    var nav = document.querySelector('.bottom-nav');
    var statusBar = document.querySelector('.status-bar');
    if (nav) nav.style.display = '';
    if (statusBar) statusBar.style.display = '';
    showScreen('screen-home');
}

// ============ PROFILE ============
function setComfortLevel(level) {
    document.querySelectorAll('.comfort-option, .v2-comfort-opt').forEach(function (o) { o.classList.remove('active'); });
    var el = document.getElementById('comfort-' + level);
    if (el) el.classList.add('active');
}

function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        currentSlide = 0;
        updateOnboardingSlide();
        var obBtn = document.getElementById('ob-next-btn');
        if (obBtn) obBtn.textContent = 'Next';

        var result = document.getElementById('af-result');
        var recent = document.getElementById('af-recent');
        if (result) result.classList.add('hidden');
        if (recent) recent.classList.remove('hidden');

        showScreen('screen-onboarding');
    }
}

// ============ ENHANCED SHOW SCREEN (nav visibility for immersive screens) ============
(function () {
    var origShow = window.showScreen;
    window.showScreen = function (screenId) {
        var nav = document.querySelector('.bottom-nav');
        var statusBar = document.querySelector('.status-bar');
        var immersive = ['screen-onboarding', 'screen-login', 'screen-addflight', 'screen-zone-notif', 'screen-bag-arrival'];

        if (immersive.indexOf(screenId) !== -1) {
            if (nav) nav.style.display = 'none';
            if (screenId === 'screen-onboarding') {
                if (statusBar) statusBar.style.display = 'none';
            } else {
                if (statusBar) statusBar.style.display = '';
            }
        } else {
            if (nav) nav.style.display = '';
            if (statusBar) statusBar.style.display = '';
        }

        origShow(screenId);
    };
})();

// ============ INITIAL STATE: Hide nav for onboarding ============
(function () {
    var nav = document.querySelector('.bottom-nav');
    var statusBar = document.querySelector('.status-bar');
    if (nav) nav.style.display = 'none';
    if (statusBar) statusBar.style.display = 'none';
})();

// ============ JOURNEY SIMULATION ============
var journeyScreens = [
    'screen-seatfit',       // 0: Seat Fit Preview
    'screen-tsa',           // 1: TSA Live Tracker
    'screen-gate',          // 2: Boarding Gate View
    'screen-zone-notif',    // 3: Zone Notification
    'screen-inflight',      // 4: In-flight Status
    'screen-agent-resolve', // 5: Autonomous Agent Resolution
    'screen-bag-arrival',   // 6: Baggage Arrival Alert
    'screen-journey-complete' // 7: Journey Complete
];

var journeyDemoActive = false;

function startJourneyDemo() {
    journeyDemoActive = true;
    // Hide back buttons, show step indicators & demo-only elements
    document.querySelectorAll('.js-back-btn').forEach(function (b) { b.style.display = 'none'; });
    document.querySelectorAll('.js-step-indicator').forEach(function (s) { s.style.display = 'flex'; });
    document.querySelectorAll('.js-demo-only').forEach(function (e) { e.style.display = ''; });
    // Reset confirm button label
    var cfBtn = document.getElementById('seatfit-confirm-btn');
    if (cfBtn) cfBtn.textContent = 'Confirm Seat 14A → Continue';
    showScreen('screen-seatfit');
}

function openStandaloneFeature(screenId) {
    journeyDemoActive = false;
    // Show back buttons, hide step indicators & demo-only elements
    document.querySelectorAll('.js-back-btn').forEach(function (b) { b.style.display = ''; });
    document.querySelectorAll('.js-step-indicator').forEach(function (s) { s.style.display = 'none'; });
    document.querySelectorAll('.js-demo-only').forEach(function (e) { e.style.display = 'none'; });
    // Update button label for standalone
    var cfBtn = document.getElementById('seatfit-confirm-btn');
    if (cfBtn) cfBtn.textContent = 'Confirm Seat 14A ✓';
    showScreen(screenId);
}

function goJourneyStep(step) {
    if (step >= 0 && step < journeyScreens.length) {
        showScreen(journeyScreens[step]);
    }
}

function goHome() {
    journeyDemoActive = false;
    showScreen('screen-home');
}

function restartJourney() {
    // Reset gate lock
    var wrapper = document.getElementById('gate-qr-wrapper');
    var overlay = document.getElementById('gate-lock-overlay');
    if (wrapper) { wrapper.classList.add('locked'); wrapper.classList.remove('unlocked'); }
    if (overlay) overlay.classList.remove('hidden');
    // Reset slider
    var slider = document.getElementById('sf-height-slider');
    if (slider) { slider.value = 178; updateSeatFit(); }
    // Restart at step 0
    startJourneyDemo();
}

// --- Seat Fit Preview Logic ---
function updateSeatFit() {
    var slider = document.getElementById('sf-height-slider');
    var valEl = document.getElementById('sf-height-val');
    var emoji = document.getElementById('sf-comfort-emoji');
    var label = document.getElementById('sf-comfort-label');
    var detail = document.getElementById('sf-comfort-detail');
    var badge = document.getElementById('sf-rec-badge');
    var bar14 = document.getElementById('sf-bar-14a');

    if (!slider) return;
    var h = parseInt(slider.value);
    if (valEl) valEl.textContent = h + ' cm';

    // Comfort rating based on height vs 31" legroom
    if (h <= 165) {
        if (emoji) emoji.textContent = '😄';
        if (label) label.textContent = 'Very Comfortable';
        if (detail) detail.textContent = 'Plenty of legroom at your height!';
        if (bar14) bar14.style.width = '90%';
        if (badge) badge.innerHTML = '✨ <strong>Recommended:</strong> Seat 14A — generous space for you';
    } else if (h <= 178) {
        if (emoji) emoji.textContent = '😊';
        if (label) label.textContent = 'Comfortable';
        if (detail) detail.textContent = 'Good legroom for your height';
        if (bar14) bar14.style.width = '72%';
        if (badge) badge.innerHTML = '✨ <strong>Recommended:</strong> Seat 14A — great fit at your height';
    } else if (h <= 188) {
        if (emoji) emoji.textContent = '😐';
        if (label) label.textContent = 'Adequate';
        if (detail) detail.textContent = 'Manageable, but consider extra legroom';
        if (bar14) bar14.style.width = '52%';
        if (badge) badge.innerHTML = '💡 <strong>Consider:</strong> Seat 7A (Extra Legroom) for more comfort';
    } else {
        if (emoji) emoji.textContent = '😬';
        if (label) label.textContent = 'Tight Fit';
        if (detail) detail.textContent = 'You may feel cramped — upgrade recommended';
        if (bar14) bar14.style.width = '35%';
        if (badge) badge.innerHTML = '⚠️ <strong>Upgrade recommended:</strong> Seat 7A or 2A for your height';
    }
}

// --- Seat Map Selection ---
function selectSeat(el, seatName) {
    if (el.classList.contains('occupied')) return;
    document.querySelectorAll('.seat.selected').forEach(function (s) {
        s.classList.remove('selected');
        s.classList.add('avail');
    });
    el.classList.remove('avail');
    el.classList.add('selected');
    var btn = document.getElementById('seatfit-confirm-btn');
    if (btn) btn.textContent = 'Confirm Seat ' + seatName + ' → Continue';
    var badge = document.getElementById('sf-rec-badge');
    if (badge) badge.innerHTML = '✨ <strong>Selected:</strong> Seat ' + seatName;
}

function confirmSeatFit() {
    if (journeyDemoActive) {
        goJourneyStep(1);
    } else {
        goHome();
    }
}

// --- Zone Notification / QR Unlock ---
function triggerZoneNotification() {
    goJourneyStep(3);
}

// ============ BOARDING PASS SWIPER & MOCK APP INTEGRATION ============
function updateBpIndicators() {
    var swiper = document.getElementById('bp-swiper');
    var dots = document.querySelectorAll('#bp-pagination .dot');
    if (!swiper || dots.length === 0) return;

    var index = Math.round(swiper.scrollLeft / swiper.clientWidth);
    dots.forEach((dot, i) => {
        if (i === index) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function openAppMock(airline) {
    var overlay = document.getElementById('app-mock-overlay');
    var textObj = document.getElementById('app-mock-text');
    var header = document.getElementById('app-mock-header');

    if (!overlay) return;

    var colors = { United: '#0032A0', Delta: '#E3132C', American: '#0078D2', JetBlue: '#304CB2', Southwest: '#FFBF27' };
    header.textContent = airline + " Airlines";
    header.style.background = (colors[airline] || '#0770e3');
    header.style.color = 'white';
    textObj.textContent = "Opening " + airline + " app...";
    overlay.classList.remove('hidden');

    setTimeout(function () {
        textObj.textContent = "Retrieving your booking...";
        setTimeout(function () {
            textObj.innerHTML = '<span style="font-size:28px;">✅</span><br><strong>Check-in Complete</strong><br><span style="color:var(--text-muted);font-size:12px;">Boarding pass updated</span>';
            setTimeout(function () {
                overlay.classList.add('hidden');
            }, 1800);
        }, 1400);
    }, 1200);
}

// ============ AIRLINE "INTEGRATION" (DEMO) ============
// Real airline APIs require OAuth, commercial agreements, and backend token exchange.
// This prototype simulates the flow and persists state locally to feel truly integrated.
const _airlineIntegrationKey = 'ja_airline_integration_v1';

function _loadAirlineIntegrationState() {
    try {
        return JSON.parse(localStorage.getItem(_airlineIntegrationKey) || '{}');
    } catch {
        return {};
    }
}

function _saveAirlineIntegrationState(state) {
    localStorage.setItem(_airlineIntegrationKey, JSON.stringify(state || {}));
}

function _getAirlineBrand(airline) {
    const map = {
        United: { code: 'UA', color: '#0032A0', label: 'United Airlines' },
        Delta: { code: 'DL', color: '#003366', label: 'Delta Air Lines' }
    };
    return map[airline] || { code: 'XX', color: '#0770e3', label: airline + ' Airlines' };
}

function _setIntegrationButtonsFromState() {
    const st = _loadAirlineIntegrationState();
    const uaBtn = document.getElementById('ua-intg-btn');
    const dlBtn = document.getElementById('dl-intg-btn');

    if (uaBtn) {
        const done = st?.United?.checkedIn;
        uaBtn.textContent = done ? '✅ Checked in (via United)' : 'Check In with United';
        uaBtn.style.opacity = '1';
    }
    if (dlBtn) {
        const done = st?.Delta?.managed;
        dlBtn.textContent = done ? '✅ Trip managed (via Delta)' : 'Manage in Delta App';
        dlBtn.style.opacity = '1';
    }
}

function openAirlineIntegration(airline) {
    const overlay = document.getElementById('app-mock-overlay');
    const textObj = document.getElementById('app-mock-text');
    const header = document.getElementById('app-mock-header');
    if (!overlay || !textObj || !header) return;

    const brand = _getAirlineBrand(airline);
    const st = _loadAirlineIntegrationState();

    header.textContent = brand.label;
    header.style.background = brand.color;
    header.style.color = 'white';
    overlay.classList.remove('hidden');

    // Step 1: "OAuth connect"
    textObj.innerHTML =
        `<div style="font-weight:800;font-size:14px;margin-bottom:6px;">Connect ${brand.label}</div>` +
        `<div style="font-size:12px;color:var(--text-secondary);line-height:1.35;">We’re securely linking your booking so you can keep the familiar airline experience inside Journey Air.</div>` +
        `<div style="margin-top:12px;display:flex;gap:10px;justify-content:center;">` +
        `<button class="primary-cta" style="margin:0;padding:10px 14px;font-size:13px;border-radius:12px;" onclick="airlineIntegrationContinue('${airline.replace(/'/g, "\\'")}')">Continue</button>` +
        `<button class="secondary-cta" style="margin:0;padding:10px 14px;font-size:13px;border-radius:12px;" onclick="closeAirlineIntegration()">Cancel</button>` +
        `</div>`;

    // Create one-time global continuations (simple prototype pattern)
    window.airlineIntegrationContinue = function (airline2) {
        const b = _getAirlineBrand(airline2);
        textObj.innerHTML =
            `<div class="spinner"></div>` +
            `<p style="margin-top:10px;color:var(--text-secondary);font-size:13px;">Signing in to ${b.code}…</p>` +
            `<p style="color:var(--text-muted);font-size:11px;margin-top:6px;">Token exchange · booking lookup · seat & boarding pass sync</p>`;

        setTimeout(() => {
            // Step 2: success + persist state + update UI
            const next = { ...(st || {}) };
            next[airline2] = next[airline2] || {};
            if (airline2 === 'United') next[airline2].checkedIn = true;
            if (airline2 === 'Delta') next[airline2].managed = true;
            next[airline2].lastSync = new Date().toISOString();
            _saveAirlineIntegrationState(next);

            const actionLabel = airline2 === 'United' ? 'Check-in complete' : 'Trip updated';
            textObj.innerHTML =
                `<span style="font-size:28px;">✅</span><br><strong>${actionLabel}</strong><br>` +
                `<span style="color:var(--text-muted);font-size:12px;">${b.code} status synced into Journey Air</span>`;

            setTimeout(() => {
                closeAirlineIntegration();
                _setIntegrationButtonsFromState();
                showToast(`${b.code} synced — your trip is updated`);
            }, 1300);
        }, 1200);
    };
}

function closeAirlineIntegration() {
    const overlay = document.getElementById('app-mock-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// ============ MANUAL BOARDING PASS (LOCAL) ============
const _manualBoardingPassKey = 'ja_manual_boarding_passes_v1';

function _loadManualBoardingPasses() {
    try {
        return JSON.parse(localStorage.getItem(_manualBoardingPassKey) || '[]');
    } catch {
        return [];
    }
}

function _saveManualBoardingPasses(passes) {
    localStorage.setItem(_manualBoardingPassKey, JSON.stringify(passes || []));
}

function openManualBoardingPass() {
    const overlay = document.getElementById('bp-manual-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
}

function closeManualBoardingPass() {
    const overlay = document.getElementById('bp-manual-overlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
}

function _bpVal(id) {
    const el = document.getElementById(id);
    return (el?.value || '').trim();
}

function saveManualBoardingPass() {
    const airline = _bpVal('bp-airline') || 'Airline';
    const flight = _bpVal('bp-flight') || 'XX000';
    const from = (_bpVal('bp-from') || 'AAA').toUpperCase();
    const to = (_bpVal('bp-to') || 'BBB').toUpperCase();
    const date = _bpVal('bp-date') || '—';
    const gate = _bpVal('bp-gate') || 'TBD';
    const seat = _bpVal('bp-seat') || 'TBD';
    const boarding = _bpVal('bp-boarding') || '—';

    const passes = _loadManualBoardingPasses();
    passes.push({ airline, flight, from, to, date, gate, seat, boarding, createdAt: Date.now() });
    _saveManualBoardingPasses(passes);

    closeManualBoardingPass();
    renderManualBoardingPasses();
    showToast('Boarding pass added');
}

function renderManualBoardingPasses() {
    const swiper = document.getElementById('bp-swiper');
    const pagination = document.getElementById('bp-pagination');
    if (!swiper || !pagination) return;

    // Remove previously-rendered manual passes
    swiper.querySelectorAll('[data-manual-pass="1"]').forEach(n => n.remove());

    const passes = _loadManualBoardingPasses();
    passes.forEach(p => {
        const card = document.createElement('div');
        card.className = 'boarding-pass-card';
        card.setAttribute('data-manual-pass', '1');
        card.innerHTML =
            `<div class="bp-header" style="background: rgba(0, 122, 255, 0.1);">` +
            `<div class="partner-logo-mini" style="background: #007AFF">BP</div>` +
            `<span class="bp-airline" style="color:#007AFF;">${p.airline}</span>` +
            `<span class="bp-class">Manual</span>` +
            `</div>` +
            `<div class="bp-route">` +
            `<div class="bp-city"><span class="bp-code">${p.from}</span><span class="bp-cityname">Origin</span></div>` +
            `<div class="bp-arrow">→</div>` +
            `<div class="bp-city"><span class="bp-code">${p.to}</span><span class="bp-cityname">Destination</span></div>` +
            `</div>` +
            `<div class="bp-details">` +
            `<div class="bp-field"><span class="bp-label">FLIGHT</span><span class="bp-val">${p.flight}</span></div>` +
            `<div class="bp-field"><span class="bp-label">DATE</span><span class="bp-val">${p.date}</span></div>` +
            `<div class="bp-field"><span class="bp-label">GATE</span><span class="bp-val">${p.gate}</span></div>` +
            `<div class="bp-field"><span class="bp-label">SEAT</span><span class="bp-val">${p.seat}</span></div>` +
            `<div class="bp-field"><span class="bp-label">BOARDING</span><span class="bp-val">${p.boarding}</span></div>` +
            `</div>` +
            `<div class="bp-divider"></div>` +
            `<div class="bp-integration-section"><div class="intg-info"><span class="intg-icon">📝</span><span>Added manually · stored on this device</span></div>` +
            `<button class="intg-btn" onclick="showToast('Tip: For live updates, connect the airline in the Integration Hub.')">How to sync?</button></div>`;

        swiper.appendChild(card);
    });

    // Rebuild pagination dots based on total cards
    const total = swiper.querySelectorAll('.boarding-pass-card').length;
    pagination.innerHTML = Array.from({ length: total })
        .map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}"></span>`)
        .join('');
}

// ============ PULL-TO-REFRESH (home screen) ============
(function () {
    var homeScroll = document.querySelector('#screen-home .screen-scroll');
    if (!homeScroll) return;
    var startY = 0, pullDist = 0, pulling = false;
    var indicator = document.createElement('div');
    indicator.className = 'pull-refresh-indicator';
    indicator.innerHTML = '<span class="pull-refresh-spinner"></span><span>Updating flight data...</span>';
    homeScroll.prepend(indicator);

    homeScroll.addEventListener('touchstart', function (e) {
        if (homeScroll.scrollTop <= 0) {
            startY = e.touches[0].clientY;
            pulling = true;
        }
    }, { passive: true });

    homeScroll.addEventListener('touchmove', function (e) {
        if (!pulling) return;
        pullDist = Math.min(e.touches[0].clientY - startY, 80);
        if (pullDist > 0) {
            indicator.style.height = pullDist + 'px';
            indicator.style.opacity = Math.min(pullDist / 60, 1);
        }
    }, { passive: true });

    homeScroll.addEventListener('touchend', function () {
        if (pullDist > 50) {
            indicator.classList.add('refreshing');
            setTimeout(function () {
                indicator.classList.remove('refreshing');
                indicator.style.height = '0px';
                indicator.style.opacity = '0';
            }, 1500);
        } else {
            indicator.style.height = '0px';
            indicator.style.opacity = '0';
        }
        pulling = false;
        pullDist = 0;
    }, { passive: true });
})();

// ============ HAPTIC-STYLE TAP FEEDBACK ============
document.querySelectorAll('.quick-tile, .info-card, .alert-card, .option-card, .addon-card, .partner-card, .intg-btn').forEach(function (el) {
    el.addEventListener('touchstart', function () { this.style.transform = 'scale(0.97)'; }, { passive: true });
    el.addEventListener('touchend', function () { this.style.transform = ''; }, { passive: true });
});

// ============ SPLASH SCREEN LOGIC ============
window.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('screen-splash');
    if (splash && splash.classList.contains('active')) {
        setTimeout(() => {
            showScreen('screen-onboarding');
        }, 2800);
    }
    // Initialize dynamic components
    setTimeout(function () {
        if (typeof renderFlightCards === 'function') renderFlightCards();
        if (typeof updateARCheckpoints === 'function') updateARCheckpoints();
        if (typeof _setIntegrationButtonsFromState === 'function') _setIntegrationButtonsFromState();
        if (typeof renderManualBoardingPasses === 'function') renderManualBoardingPasses();
    }, 100);
});

// ============ EDIT PROFILE ============
function saveProfile() {
    var btn = event.target;
    var origText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.style.opacity = '0.7';

    // Sync preference selects back to profile display
    var selects = document.querySelectorAll('#screen-edit-profile .ep-field-select');
    var prefIds = ['pref-seat', 'pref-meal', 'pref-lang', 'pref-contact'];
    selects.forEach(function (sel, i) {
        var prefEl = document.getElementById(prefIds[i]);
        if (prefEl && sel.value) prefEl.textContent = sel.value;
    });

    // Sync name
    var firstName = document.querySelector('#screen-edit-profile .ep-field-input[type="text"]');
    if (firstName) {
        var nameEl = document.querySelector('.v2-profile-name');
        var epName = document.querySelector('.ep-name');
        if (nameEl) nameEl.textContent = firstName.value;
    }

    setTimeout(function () {
        btn.textContent = '✓ Saved!';
        btn.style.background = '#34C759';
        btn.style.opacity = '1';
        setTimeout(function () {
            btn.textContent = origText;
            btn.style.background = '';
            showScreen('screen-profile');
        }, 1200);
    }, 800);
}

// ============ AIRLINE INTEGRATION HUB ============
function connectAirline(btn, code) {
    btn.textContent = 'Connecting...';
    btn.style.opacity = '0.6';
    setTimeout(function () {
        btn.textContent = '✓ Connected';
        btn.style.background = '#34C759';
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'none';
        // Move to connected section visually
        var card = btn.closest('.aih-airline-card');
        if (card) {
            var badge = document.createElement('span');
            badge.className = 'aih-status-badge aih-connected';
            badge.textContent = 'Connected';
            btn.replaceWith(badge);
        }
    }, 1200);
}

function openAirlineApp(airline) {
    // Simulate deep-link behavior
    var overlay = document.createElement('div');
    overlay.className = 'app-mock-overlay';
    overlay.innerHTML = '<div class="app-mock-card">' +
        '<div class="app-mock-header" style="background: ' + (airline === 'United' ? '#0032A0' : '#003366') + '; color: white;">' +
        airline + ' Airlines</div>' +
        '<div class="app-mock-body">' +
        '<div class="spinner"></div>' +
        '<p style="color: var(--text-secondary); font-size: 13px;">Opening ' + airline + ' check-in...</p>' +
        '<p style="color: var(--text-muted); font-size: 11px; margin-top: 8px;">If the app is installed, it will open directly.<br>Otherwise, check-in happens here in Journey Air.</p>' +
        '</div></div>';
    overlay.onclick = function () { this.remove(); };
    document.querySelector('.phone-screen').appendChild(overlay);
    setTimeout(function () { overlay.remove(); }, 3000);
}

// ============ HANDLE LOGOUT ============
function handleLogout() {
    showScreen('screen-login');
}

// ============ LIVE COUNTDOWN TIMER ============
var _gateCountdown = null;
var _gateMinutes = 80; // 1h 20m in minutes
var _gateSeconds = 0;

function startGateCountdown() {
    if (_gateCountdown) clearInterval(_gateCountdown);
    _gateCountdown = setInterval(function () {
        if (_gateSeconds <= 0) {
            if (_gateMinutes <= 0) {
                clearInterval(_gateCountdown);
                updateGateDisplay(0, 0);
                return;
            }
            _gateMinutes--;
            _gateSeconds = 59;
        } else {
            _gateSeconds--;
        }
        updateGateDisplay(_gateMinutes, _gateSeconds);
    }, 1000);
}

function updateGateDisplay(mins, secs) {
    var hrs = Math.floor(mins / 60);
    var m = mins % 60;
    var display = '';
    if (hrs > 0) {
        display = hrs + 'h ' + (m < 10 ? '0' : '') + m + 'm';
    } else {
        display = m + ':' + (secs < 10 ? '0' : '') + secs;
    }
    // Update all gate time displays
    var ringText = document.querySelector('.na-ring-text');
    if (ringText) ringText.textContent = display;
    var naTitle = document.querySelector('.na-title');
    if (naTitle) {
        if (hrs > 0) {
            naTitle.textContent = 'Gate opens in ' + hrs + 'h ' + m + 'm';
        } else {
            naTitle.textContent = 'Gate opens in ' + m + 'm ' + secs + 's';
        }
    }
    // Update progress ring
    var ringCircle = document.querySelector('.na-ring svg circle:nth-child(2)');
    if (ringCircle) {
        var total = 80 * 60; // total seconds
        var remaining = mins * 60 + secs;
        var pct = remaining / total;
        var dashoffset = 107 * pct;
        ringCircle.setAttribute('stroke-dashoffset', 107 - dashoffset);
    }
}

// Start countdown when page loads
window.addEventListener('DOMContentLoaded', function () {
    setTimeout(startGateCountdown, 3500); // Start after splash
});

// ============ LIVE CLOCK ============
function updatePhoneTime() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    var timeStr = h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
    var el = document.getElementById('phone-time');
    if (el) el.textContent = timeStr;
    // Phoenix time (MST = UTC-7, assume same timezone for demo)
    var phxEl = document.getElementById('phoenix-time');
    if (phxEl) phxEl.textContent = timeStr;
}
setInterval(updatePhoneTime, 30000);
setTimeout(updatePhoneTime, 100);

// ============ PROFILE PHOTO UPLOAD ============
function triggerPhotoUpload() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.onchange = function (e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (ev) {
                // Update all avatar displays
                document.querySelectorAll('.ep-avatar-large, .profile-avatar, .v2-profile-avatar').forEach(function (el) {
                    el.style.backgroundImage = 'url(' + ev.target.result + ')';
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                    el.textContent = '';
                    el.style.color = 'transparent';
                });
            };
            reader.readAsDataURL(file);
        }
    };
    document.body.appendChild(input);
    input.click();
    setTimeout(function () { input.remove(); }, 60000);
}

// ============ MULTIPLE FLIGHTS ============
var _flights = [
    { ref: 'JA-X7K9M2', flight: 'JA204', from: 'SFO', fromName: 'San Francisco', to: 'PHX', toName: 'Phoenix', date: '13 Apr 2026', depart: '12:15 PM', status: 'Delayed', statusClass: 'status-delayed' }
];

function addSecondFlight() {
    _flights.push({ ref: 'JA-R3M8N1', flight: 'JA512', from: 'PHX', fromName: 'Phoenix', to: 'DFW', toName: 'Dallas', date: '13 Apr 2026', depart: '4:30 PM', status: 'On Time', statusClass: 'status-ontime' });
    renderFlightCards();
    // Show toast
    showToast('Flight JA512 added to your trip!');
}

function renderFlightCards() {
    var container = document.getElementById('multi-flight-list');
    if (!container) return;
    container.innerHTML = '';
    _flights.forEach(function (f, i) {
        var card = document.createElement('div');
        card.className = 'mf-card' + (i === 0 ? ' active' : '');
        card.innerHTML = '<div class="mf-top"><span class="mf-flight">' + f.flight + '</span><span class="flight-status ' + f.statusClass + '">' + f.status + '</span></div>' +
            '<div class="mf-route"><span class="mf-code">' + f.from + '</span><span class="mf-arrow">→</span><span class="mf-code">' + f.to + '</span></div>' +
            '<div class="mf-bottom"><span class="mf-detail">' + f.date + ' · ' + f.depart + '</span></div>';
        card.onclick = function () {
            document.querySelectorAll('.mf-card').forEach(function (c) { c.classList.remove('active'); });
            card.classList.add('active');
        };
        container.appendChild(card);
    });
}

function showToast(msg) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:#1C1C1E;color:white;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:9999;font-family:var(--font);box-shadow:0 8px 32px rgba(0,0,0,0.3);animation:slideIn 0.3s ease;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
}

// ============ AR CHECKPOINT GAME ============
var _arCheckpoints = [
    { id: 1, name: 'Security Exit', icon: '🛡️', distance: '0m', status: 'completed', xp: 10 },
    { id: 2, name: 'Duty Free Zone', icon: '🛍️', distance: '45m', status: 'completed', xp: 15 },
    { id: 3, name: 'Food Court', icon: '🍔', distance: '80m', status: 'current', xp: 10 },
    { id: 4, name: 'Gate B14', icon: '🚪', distance: '120m', status: 'upcoming', xp: 25 }
];
var _arXP = 25;
var _arTotalXP = 60;
var _arMode = 'sim'; // 'sim' | 'camera'
var _arStream = null;

function updateARCheckpoints() {
    var container = document.getElementById('ar-checkpoint-list');
    if (!container) return;
    container.innerHTML = '';
    _arCheckpoints.forEach(function (cp) {
        var div = document.createElement('div');
        div.className = 'ar-cp-item ' + cp.status;
        div.innerHTML = '<div class="ar-cp-dot ' + cp.status + '">' + (cp.status === 'completed' ? '✓' : cp.icon) + '</div>' +
            '<div class="ar-cp-info"><div class="ar-cp-name">' + cp.name + '</div><div class="ar-cp-dist">' + cp.distance + '</div></div>' +
            '<div class="ar-cp-xp">+' + cp.xp + ' XP</div>';
        if (cp.status === 'current') {
            div.onclick = function () { completeCheckpoint(cp.id); };
        }
        container.appendChild(div);
    });
    // Update XP bar
    var bar = document.getElementById('ar-xp-fill');
    if (bar) bar.style.width = (_arXP / _arTotalXP * 100) + '%';
    var xpText = document.getElementById('ar-xp-text');
    if (xpText) xpText.textContent = _arXP + '/' + _arTotalXP + ' XP';
}

function completeCheckpoint(id) {
    _arCheckpoints.forEach(function (cp) {
        if (cp.id === id) {
            cp.status = 'completed';
            _arXP += cp.xp;
        } else if (cp.id === id + 1) {
            cp.status = 'current';
        }
    });
    updateARCheckpoints();
    showToast('🎉 Checkpoint completed! +' + _arCheckpoints.find(function (c) { return c.id === id; }).xp + ' XP');
}

function _arGetCurrentCheckpoint() {
    return _arCheckpoints.find(cp => cp.status === 'current') || _arCheckpoints.find(cp => cp.status !== 'completed') || _arCheckpoints[_arCheckpoints.length - 1];
}

function _arParseMeters(distanceStr) {
    const m = (distanceStr || '').match(/(\d+)\s*m/i);
    return m ? parseInt(m[1], 10) : 120;
}

function updateAROverlay() {
    const cp = _arGetCurrentCheckpoint();
    if (!cp) return;

    const isAllComplete = _arCheckpoints.every(c => c.status === 'completed');
    const meters = isAllComplete ? 0 : _arParseMeters(cp.distance);
    const etaMins = isAllComplete ? 0 : Math.max(1, Math.round(meters / 70)); // demo: ~70m/min walking

    const label = document.getElementById('ar-arrow-label');
    const dist = document.getElementById('ar-info-dist');
    const eta = document.getElementById('ar-info-eta');
    const target = document.getElementById('ar-info-target');

    if (label) label.textContent = isAllComplete ? `You've arrived!` : `${meters}m ahead`;
    if (dist) dist.textContent = `${meters}m`;
    if (eta) eta.textContent = isAllComplete ? `0 min` : `${etaMins} min`;
    if (target) target.textContent = cp.name;

    const nextBtn = document.querySelector('.ar-next-btn');
    if (nextBtn) {
        if (isAllComplete) {
            nextBtn.textContent = 'Arrived at ' + cp.name + ' ✓';
            nextBtn.style.opacity = '0.5';
            nextBtn.style.pointerEvents = 'none';
        } else {
            nextBtn.textContent = 'Next checkpoint →';
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'auto';
        }
    }
}

async function setARMode(mode) {
    _arMode = mode;
    const video = document.getElementById('ar-live-video');
    const simEls = document.querySelectorAll('#screen-ar .ar-env-ceiling, #screen-ar .ar-env-floor, #screen-ar .ar-corridor-left, #screen-ar .ar-corridor-right, #screen-ar .ar-grid-overlay, #screen-ar .ar-gate-sign, #screen-ar .ar-people, #screen-ar .ar-walk-path, #screen-ar .ar-walk-dots');

    if (mode === 'camera') {
        try {
            _arStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            if (video) {
                video.srcObject = _arStream;
                video.classList.remove('hidden');
            }
            simEls.forEach(el => el.classList.add('hidden'));
        } catch (e) {
            showToast('Camera permission denied. Using simulation mode instead.');
            setARMode('sim');
            return;
        }
    } else {
        if (_arStream) {
            _arStream.getTracks().forEach(t => t.stop());
            _arStream = null;
        }
        if (video) {
            video.srcObject = null;
            video.classList.add('hidden');
        }
        simEls.forEach(el => el.classList.remove('hidden'));
    }
    updateAROverlay();
}

function toggleARMap() {
    const panel = document.getElementById('ar-map-panel');
    if (!panel) return;
    panel.classList.toggle('hidden');
}

function toggleARFocus() {
    const root = document.getElementById('screen-ar');
    if (!root) return;
    root.classList.toggle('ar-focus');
}

function arAdvance() {
    const current = _arGetCurrentCheckpoint();
    if (!current) return;
    if (current.status === 'current') completeCheckpoint(current.id);
    updateAROverlay();
}

// Keep AR overlay fresh when entering AR screen
const _origShowScreenAR = showScreen;
showScreen = function (screenId) {
    _origShowScreenAR(screenId);
    if (screenId === 'screen-ar') {
        setTimeout(() => {
            updateARCheckpoints();
            updateAROverlay();
        }, 50);
    }
    if (screenId === 'screen-guardian') {
        setTimeout(updateConnectionRiskUI, 30);
    }
};

// ============ AR ORIENTATION (Sensors + Mouse Fallback) ============
let arInitialAlpha = null;
let arHasSensors = false;

window.addEventListener('deviceorientation', function(event) {
    if (event.alpha !== null || event.gamma !== null) {
        arHasSensors = true;
        const arrow = document.querySelector('.ar-arrow-svg');
        if (!arrow) return;
        
        arrow.style.transformOrigin = 'center';

        if (event.alpha !== null) {
            if (arInitialAlpha === null) arInitialAlpha = event.alpha;
            let diff = event.alpha - arInitialAlpha;
            // Normalize difference to -180 to 180
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            
            // Point back to original target (opposite of turn)
            let rotation = Math.max(-90, Math.min(90, -diff));
            arrow.style.transform = `rotate(${rotation}deg)`;
        } else if (event.gamma !== null) {
            let tilt = Math.max(-60, Math.min(60, event.gamma));
            arrow.style.transform = `rotate(${tilt}deg)`;
        }
    }
});

// Mouse & Touch fallback for desktop/simulator testing
function handleSimRotation(clientX) {
    if (arHasSensors) return; // Don't interfere if real sensors work
    const arrow = document.querySelector('.ar-arrow-svg');
    if (!arrow) return;
    
    // Simulate turning based on pointer X position relative to center
    const centerX = window.innerWidth / 2;
    const diffX = clientX - centerX;
    
    // Map max screen width to roughly 90 degrees rotation
    const maxRotation = 90;
    const rotation = (diffX / centerX) * maxRotation;
    
    arrow.style.transformOrigin = 'center';
    arrow.style.transform = `rotate(${rotation}deg)`;
}

window.addEventListener('mousemove', function(event) {
    handleSimRotation(event.clientX);
}, { passive: true });

window.addEventListener('touchmove', function(event) {
    if (event.touches && event.touches.length > 0) {
        handleSimRotation(event.touches[0].clientX);
    }
}, { passive: true });

