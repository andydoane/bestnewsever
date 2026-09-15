const STORAGE_KEY = "bestNewsEverStateV1";
const HIGHLIGHT_SPEED_MS = 145;
const BUTTON_DEBOUNCE_MS = 320;

const activities = [
    {
        id: 1,
        title: "Quiet to Loud",
        description: "Start in a whisper with tiny motions, then slowly build to loud voices and big motions."
    },
    {
        id: 2,
        title: "Opera Version",
        description: "Sing the poem dramatically as though you're performing at an opera."
    },
    {
        id: 3,
        title: "Robot Mode",
        description: "Deliver it completely monotone and robotic, including stiff robot movements."
    },
    {
        id: 4,
        title: "Dramatic",
        description: "Use over-the-top acting with huge, dramatic gestures."
    },
    {
        id: 5,
        title: "Old-Fashioned Preacher",
        description: "Give it the full revival-preacher treatment: pacing, raised voice, hand gestures, and a few big 'Amen!' moments."
    },
    {
        id: 6,
        title: "Boys vs. Girls",
        description: "Boys read one slide, girls read the next, and everybody reads the last one. Stand when you speak and crouch when you're not speaking."
    },
    {
        id: 7,
        title: "Leaders vs. Kids",
        description: "Leaders read one slide, kids read the next, and everybody reads the last one. Stand when you speak and crouch when you're not speaking."
    },
    {
        id: 8,
        title: "Echo Version",
        description: "One person says each line, and the audience repeats it back."
    },
    {
        id: 9,
        title: "Question-and-Answer",
        description: "Have different people deliver the lines as though they're having a conversation."
    },
    {
        id: 10,
        title: "Whisper",
        description: "Say the poem while whispering and doing tiny motions."
    },
    {
        id: 11,
        title: "Slow Motion",
        description: "Perform every motion in exaggerated slow motion."
    },
    {
        id: 12,
        title: "Speed Round",
        description: "Do the entire poem and its motions as quickly as humanly possible."
    },
    {
        id: 13,
        title: "Sleepy",
        description: "Lay on your back and say the poem, doing the motions while you stay lying down."
    },
    {
        id: 14,
        title: "Ninja",
        description: "Do all the motions like a ninja."
    },
    {
        id: 15,
        title: "Circle Up",
        description: "Stand in a big circle and do the motions together."
    },
    {
        id: 16,
        title: "Spin",
        description: "Say the words and do the motions while slowly spinning in a circle."
    },
    {
        id: 17,
        title: "Say It to the Beat",
        description: "Say the words and do the motions to a drum loop."
    },
    {
        id: 18,
        title: "Spooky",
        description: "Say the words and do the motions like a spooky ghost."
    },
    {
        id: 19,
        title: "Shout the Key Words",
        description: "Say the words and do the motions normally, shouting the words that are shown in a different color."
    },
    {
        id: 20,
        title: "Jump",
        description: "Say the words and do the motions normally, jumping when you say words that are shown in a different color."
    },
    {
        id: 21,
        title: "Pirates",
        description: "Say the words and do the motions like a pirate."
    },
    {
        id: 22,
        title: "Statue",
        description: "Freeze in a statue pose. Say the words normally, moving your lips as little as possible while maintaining the pose."
    },
    {
        id: 23,
        title: "Soldier March",
        description: "March to the beat while you say the poem like a soldier."
    },
    {
        id: 24,
        title: "Happy & Sad",
        description: "Say one slide in a happy way and the next in a sad way, alternating as you go."
    }
];

const slideFiles = [
    "assets/images/title.png",
    "assets/images/slide_01.png",
    "assets/images/slide_02.png",
    "assets/images/slide_03.png",
    "assets/images/slide_04.png",
    "assets/images/slide_05.png",
    "assets/images/slide_06.png",
    "assets/images/slide_07.png"
];

const cueImages = {
    boys: "assets/images/boys.png",
    girls: "assets/images/girls.png",
    happy: "assets/images/happy.png",
    sad: "assets/images/sad.png"
};

const app = document.getElementById("app");
const progressText = document.getElementById("progressText");
const lastInput = document.getElementById("lastInput");
const advanceButton = document.getElementById("advanceButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const adminButton = document.getElementById("adminButton");
const adminDialog = document.getElementById("adminDialog");
const adminActivityList = document.getElementById("adminActivityList");
const adminSummary = document.getElementById("adminSummary");
const historyList = document.getElementById("historyList");
const saveAdminButton = document.getElementById("saveAdminButton");
const undoLastButton = document.getElementById("undoLastButton");
const resetCycleButton = document.getElementById("resetCycleButton");
const clearAllButton = document.getElementById("clearAllButton");

let state = loadState();
let highlightTimer = null;
let highlightedIndex = -1;
let lastPressAt = 0;

function getDefaultState() {
    return {
        completed: [],
        wildCardMode: false,
        history: [],
        currentSession: null
    };
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!saved || typeof saved !== "object") {
            return getDefaultState();
        }

        return {
            completed: Array.isArray(saved.completed) ? saved.completed.filter(isValidActivityId) : [],
            wildCardMode: Boolean(saved.wildCardMode),
            history: Array.isArray(saved.history) ? saved.history : [],
            currentSession: saved.currentSession || null
        };
    } catch (error) {
        console.warn("Could not read saved Best News Ever data.", error);
        return getDefaultState();
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateProgressText();
}

function isValidActivityId(id) {
    return Number.isInteger(id) && id >= 1 && id <= activities.length;
}

function getActivity(id) {
    return activities.find(activity => activity.id === id);
}

function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function normalizeState() {
    state.completed = [...new Set(state.completed.filter(isValidActivityId))];

    if (!state.wildCardMode && state.completed.length >= 23) {
        state.wildCardMode = true;
    }

    if (
        state.currentSession &&
        state.currentSession.phase === "finished" &&
        state.currentSession.sessionDate !== getLocalDateKey()
    ) {
        state.currentSession = null;
    }

    saveState();
}

function updateProgressText() {
    if (state.wildCardMode) {
        progressText.textContent = `WILD CARD MODE • ${state.completed.length} of 24 were completed before Wild Card`;
    } else {
        progressText.textContent = `${state.completed.length} of 24 activities completed`;
    }
}

function renderFromState() {
    stopHighlighting();

    if (!state.currentSession) {
        renderWelcome();
        return;
    }

    switch (state.currentSession.phase) {
        case "selecting":
            renderSelection();
            break;
        case "selected":
            renderWinner();
            break;
        case "slides":
            renderSlide();
            break;
        case "finished":
            renderFinished();
            break;
        default:
            state.currentSession = null;
            saveState();
            renderWelcome();
    }
}

function renderWelcome() {
    startSelectionSession();
}

function buildBoardIds() {
    if (!state.wildCardMode && state.completed.length >= 23) {
        state.wildCardMode = true;
        saveState();
    }

    if (state.wildCardMode) {
        return activities.map(activity => activity.id);
    }

    const remaining = activities.filter(activity => !state.completed.includes(activity.id));
    return shuffle(remaining).slice(0, 9).map(activity => activity.id);
}

function startSelectionSession() {
    const boardIds = buildBoardIds();
    state.currentSession = {
        phase: "selecting",
        sessionDate: getLocalDateKey(),
        boardIds,
        activityId: null,
        slideIndex: 0
    };
    saveState();
    renderSelection();
}

function renderSelection() {
    const boardIds = state.currentSession.boardIds || buildBoardIds();
    state.currentSession.boardIds = boardIds;
    saveState();

    const gridClass = state.wildCardMode ? "wild" : "normal";
    const cards = boardIds.map((id, index) => {
        const activity = getActivity(id);
        return `
            <div class="activity-card color-${index % 6}" data-activity-id="${activity.id}">
                <div class="activity-title">${activity.title}</div>
            </div>
        `;
    }).join("");

    app.innerHTML = `
        <section class="selection-screen">
            ${state.wildCardMode ? '<div class="wild-banner">WILD CARD MODE — ALL 24 ARE LIVE!</div>' : ""}
            <h1 class="selection-heading">PRESS YOUR LUCK!</h1>
            <p class="selection-subheading">Press the button to lock in the flashing square.</p>
            <div id="activityGrid" class="activity-grid ${gridClass}">
                ${cards}
            </div>
        </section>
    `;

    startHighlighting();
}

function startHighlighting() {
    stopHighlighting();

    const cards = [...document.querySelectorAll(".activity-card")];
    if (!cards.length) {
        return;
    }

    function moveHighlight() {
        cards.forEach(card => card.classList.remove("active"));

        let nextIndex = Math.floor(Math.random() * cards.length);
        if (cards.length > 1) {
            while (nextIndex === highlightedIndex) {
                nextIndex = Math.floor(Math.random() * cards.length);
            }
        }

        highlightedIndex = nextIndex;
        cards[highlightedIndex].classList.add("active");
    }

    moveHighlight();
    highlightTimer = window.setInterval(moveHighlight, HIGHLIGHT_SPEED_MS);
}

function stopHighlighting() {
    if (highlightTimer) {
        window.clearInterval(highlightTimer);
        highlightTimer = null;
    }
}

function selectHighlightedActivity() {
    const cards = [...document.querySelectorAll(".activity-card")];
    if (!cards.length || highlightedIndex < 0 || !cards[highlightedIndex]) {
        return;
    }

    stopHighlighting();

    const activityId = Number(cards[highlightedIndex].dataset.activityId);
    const activity = getActivity(activityId);

    state.currentSession.phase = "selected";
    state.currentSession.activityId = activityId;
    state.currentSession.slideIndex = 0;

    if (!state.wildCardMode && !state.completed.includes(activityId)) {
        state.completed.push(activityId);
    }

    if (!state.wildCardMode && state.completed.length >= 23) {
        state.wildCardMode = true;
    }

    state.history.push({
        activityId,
        title: activity.title,
        selectedAt: new Date().toISOString()
    });

    saveState();
    renderWinner();
}

function renderWinner() {
    const activity = getActivity(state.currentSession.activityId);
    if (!activity) {
        state.currentSession = null;
        saveState();
        renderWelcome();
        return;
    }

    app.innerHTML = `
        <section class="winner-screen">
            <div class="winner-card">
                <p class="winner-kicker">TONIGHT'S VERSION IS...</p>
                <h1 class="winner-title">${activity.title}</h1>
                <p class="winner-description">${activity.description}</p>
                <div class="press-label">PRESS AGAIN FOR THE POEM</div>
            </div>
        </section>
    `;
}

function beginSlides() {
    state.currentSession.phase = "slides";
    state.currentSession.slideIndex = 0;
    saveState();
    renderSlide();
}

function renderSlide() {
    const slideIndex = Number(state.currentSession.slideIndex) || 0;
    const slideFile = slideFiles[slideIndex];

    if (!slideFile) {
        finishSession();
        return;
    }

    app.innerHTML = `
        <section class="slide-screen">
            <img class="slide-image" src="${slideFile}" alt="Best News Ever poem slide ${slideIndex + 1}">
            <div id="cueMount"></div>
            <div class="slide-counter">${slideIndex + 1} / ${slideFiles.length}</div>
        </section>
    `;

    renderCueOverlay(state.currentSession.activityId, slideIndex);
}

function renderCueOverlay(activityId, slideIndex) {
    const cueMount = document.getElementById("cueMount");
    if (!cueMount || slideIndex === 0) {
        return;
    }

    const cue = getCueForSlide(activityId, slideIndex);
    if (!cue) {
        return;
    }

    const imageMarkup = cue.image
        ? `<img class="cue-image" src="${cue.image}" alt="" onerror="this.style.display='none'">`
        : "";

    cueMount.innerHTML = `
        <div class="cue-box">
            ${imageMarkup}
            <div class="cue-label">${cue.label}</div>
        </div>
    `;
}

function getCueForSlide(activityId, slideIndex) {
    const isFinalPoemSlide = slideIndex === slideFiles.length - 1;

    if (activityId === 6) {
        if (isFinalPoemSlide) {
            return { label: "EVERYBODY!", image: null };
        }
        return slideIndex % 2 === 1
            ? { label: "BOYS!", image: cueImages.boys }
            : { label: "GIRLS!", image: cueImages.girls };
    }

    if (activityId === 7) {
        if (isFinalPoemSlide) {
            return { label: "EVERYBODY!", image: null };
        }
        return slideIndex % 2 === 1
            ? { label: "LEADERS!", image: null }
            : { label: "KIDS!", image: null };
    }

    if (activityId === 24) {
        return slideIndex % 2 === 1
            ? { label: "HAPPY!", image: cueImages.happy }
            : { label: "SAD!", image: cueImages.sad };
    }

    return null;
}

function advanceSlide() {
    const nextIndex = state.currentSession.slideIndex + 1;
    if (nextIndex >= slideFiles.length) {
        finishSession();
        return;
    }

    state.currentSession.slideIndex = nextIndex;
    saveState();
    renderSlide();
}

function finishSession() {
    state.currentSession.phase = "finished";
    saveState();
    renderFinished();
}

function renderFinished() {
    const activity = getActivity(state.currentSession.activityId);
    const activityName = activity ? activity.title : "tonight's activity";

    app.innerHTML = `
        <section class="finished-screen">
            <h1>BEST NEWS EVER!</h1>
            <p>${activityName} is complete for tonight.</p>
            <div class="press-label">DONE FOR TONIGHT</div>
            <button id="startAnotherButton" class="secondary-button" type="button" style="margin-top: 28px;">Start another round</button>
        </section>
    `;

    document.getElementById("startAnotherButton").addEventListener("click", () => {
        state.currentSession = null;
        saveState();
        renderWelcome();
    });
}

function handlePress(sourceLabel = "Button") {
    if (adminDialog.open) {
        return;
    }

    const now = Date.now();
    if (now - lastPressAt < BUTTON_DEBOUNCE_MS) {
        return;
    }
    lastPressAt = now;

    lastInput.textContent = `Last input: ${sourceLabel}`;

    if (!state.currentSession) {
        startSelectionSession();
        return;
    }

    switch (state.currentSession.phase) {
        case "selecting":
            selectHighlightedActivity();
            break;
        case "selected":
            beginSlides();
            break;
        case "slides":
            advanceSlide();
            break;
        case "finished":
            break;
        default:
            state.currentSession = null;
            saveState();
            renderWelcome();
    }
}

function shouldTreatAsButtonPress(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
        return false;
    }

    const ignoredKeys = new Set([
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "CapsLock",
        "Tab",
        "Escape",
        "F1",
        "F2",
        "F3",
        "F4",
        "F5",
        "F6",
        "F7",
        "F8",
        "F9",
        "F10",
        "F11",
        "F12"
    ]);

    return !ignoredKeys.has(event.key);
}

function openAdmin() {
    stopHighlighting();
    renderAdmin();
    adminDialog.showModal();
}

function renderAdmin() {
    adminSummary.textContent = state.wildCardMode
        ? `Wild Card Mode is ON. ${state.completed.length} activities are marked completed.`
        : `${state.completed.length} of 24 activities are marked completed.`;

    adminActivityList.innerHTML = activities.map(activity => `
        <label class="admin-check">
            <input type="checkbox" value="${activity.id}" ${state.completed.includes(activity.id) ? "checked" : ""}>
            <span>${activity.id}. ${activity.title}</span>
        </label>
    `).join("");

    const recent = [...state.history].reverse().slice(0, 10);
    historyList.innerHTML = recent.length
        ? recent.map(item => {
            const date = item.selectedAt ? new Date(item.selectedAt).toLocaleString() : "Unknown date";
            return `<div>${date} — ${item.title || `Activity ${item.activityId}`}</div>`;
        }).join("")
        : '<div class="history-empty">No selections recorded yet.</div>';
}

function saveAdminSelections() {
    const checkedIds = [...adminActivityList.querySelectorAll('input[type="checkbox"]:checked')]
        .map(input => Number(input.value))
        .filter(isValidActivityId);

    state.completed = [...new Set(checkedIds)];

    if (!state.wildCardMode && state.completed.length >= 23) {
        state.wildCardMode = true;
    }

    state.currentSession = null;
    saveState();
    renderAdmin();
    renderWelcome();
}

function undoLastSelection() {
    const last = state.history.pop();
    if (!last) {
        return;
    }

    if (!state.wildCardMode) {
        state.completed = state.completed.filter(id => id !== last.activityId);
    }

    state.currentSession = null;
    saveState();
    renderAdmin();
    renderWelcome();
}

function resetCycle() {
    const confirmed = window.confirm("Start a brand-new 24-activity cycle? This turns off Wild Card Mode and marks every activity unused.");
    if (!confirmed) {
        return;
    }

    state.completed = [];
    state.wildCardMode = false;
    state.currentSession = null;
    saveState();
    renderAdmin();
    renderWelcome();
}

function clearAllData() {
    const confirmed = window.confirm("Clear ALL Best News Ever app data, including completion progress and history?");
    if (!confirmed) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);
    state = getDefaultState();
    saveState();
    renderAdmin();
    renderWelcome();
}

async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.warn("Fullscreen was not available.", error);
    }
}

window.addEventListener("keydown", event => {
    if (!shouldTreatAsButtonPress(event) || adminDialog.open) {
        return;
    }

    event.preventDefault();
    handlePress(event.code || event.key || "Keyboard");
});

advanceButton.addEventListener("click", () => handlePress("On-screen test"));
fullscreenButton.addEventListener("click", toggleFullscreen);
adminButton.addEventListener("click", openAdmin);
saveAdminButton.addEventListener("click", saveAdminSelections);
undoLastButton.addEventListener("click", undoLastSelection);
resetCycleButton.addEventListener("click", resetCycle);
clearAllButton.addEventListener("click", clearAllData);

adminDialog.addEventListener("close", () => {
    renderFromState();
});

normalizeState();
renderFromState();
