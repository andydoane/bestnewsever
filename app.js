const STORAGE_KEY = "bestNewsEverStateV2";
const HIGHLIGHT_SPEED_MS = 145;
const BUTTON_DEBOUNCE_MS = 300;
const INTRO_FADE_IN_MS = 900;
const INTRO_HOLD_MS = 3000;
const INTRO_FADE_OUT_MS = 900;
const SCREEN_FADE_MS = 420;
const SLIDE_TRANSITION_MS = 620;

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

const poemSlideFiles = [
    "assets/images/slide_01.png",
    "assets/images/slide_02.png",
    "assets/images/slide_03.png",
    "assets/images/slide_04.png",
    "assets/images/slide_05.png",
    "assets/images/slide_06.png",
    "assets/images/slide_07.png"
];

const titleImage = "assets/images/title.png";
const smileyImage = "assets/images/smiley.png";

const cueImages = {
    boys: "assets/images/boys.png",
    girls: "assets/images/girls.png",
    happy: "assets/images/happy.png",
    sad: "assets/images/sad.png"
};

const colorClasses = [
    "color-0",
    "color-1",
    "color-2",
    "color-3",
    "color-4",
    "color-5"
];

const app = document.getElementById("app");
const overlayControls = document.getElementById("overlayControls");
const fullscreenButton = document.getElementById("fullscreenButton");
const adminButton = document.getElementById("adminButton");
const restartButton = document.getElementById("restartButton");
const adminDialog = document.getElementById("adminDialog");
const closeAdminButton = document.getElementById("closeAdminButton");
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
let slideTransitioning = false;
let introTimerIds = [];
let currentView = "boot";

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
}

function normalizeState() {
    state.completed = [...new Set(state.completed.filter(isValidActivityId))];

    if (!state.wildCardMode && state.completed.length >= 23) {
        state.wildCardMode = true;
    }

    if (state.currentSession && !isValidActivityId(state.currentSession.activityId) && state.currentSession.activityId !== null) {
        state.currentSession = null;
    }

    saveState();
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

function getGridDimensions(count, wildCardMode = false) {
    if (wildCardMode) {
        return { cols: 6, rows: 4 };
    }

    let cols = 3;
    if (count <= 1) {
        cols = 1;
    } else if (count <= 4) {
        cols = 2;
    }

    return {
        cols,
        rows: Math.ceil(count / cols)
    };
}

function buildColorIds(count, cols) {
    const assignments = [];
    const usage = [0, 0, 0, 0, 0, 0];
    let unusedFirstPass = shuffle([0, 1, 2, 3, 4, 5]);

    for (let index = 0; index < count; index += 1) {
        const leftColor = index % cols === 0 ? null : assignments[index - 1];
        const upColor = index >= cols ? assignments[index - cols] : null;

        let candidates;
        if (index < 6) {
            candidates = unusedFirstPass.filter(color => color !== leftColor && color !== upColor);
        } else {
            candidates = [0, 1, 2, 3, 4, 5].filter(color => color !== leftColor && color !== upColor);
        }

        const lowestUsage = Math.min(...candidates.map(color => usage[color]));
        const balancedCandidates = candidates.filter(color => usage[color] === lowestUsage);
        const chosen = balancedCandidates[Math.floor(Math.random() * balancedCandidates.length)];

        assignments.push(chosen);
        usage[chosen] += 1;
        unusedFirstPass = unusedFirstPass.filter(color => color !== chosen);
    }

    return assignments;
}

function clearIntroTimers() {
    introTimerIds.forEach(timerId => window.clearTimeout(timerId));
    introTimerIds = [];
}

function showOverlayControls(show) {
    overlayControls.classList.toggle("is-hidden", !show);
}

function showRestartButton(show) {
    restartButton.classList.toggle("is-hidden", !show);
}

function setChromeMode(mode) {
    showOverlayControls(["prompt", "selection", "winner"].includes(mode));
    showRestartButton(mode === "final");
}

function preloadAssets() {
    [titleImage, smileyImage, ...poemSlideFiles, ...Object.values(cueImages)].forEach(source => {
        const image = new Image();
        image.src = source;
    });
}

function bootApp() {
    normalizeState();
    preloadAssets();

    if (state.currentSession) {
        renderFromState();
    } else {
        playIntro();
    }
}

function playIntro() {
    currentView = "intro";
    clearIntroTimers();
    stopHighlighting();
    setChromeMode("intro");

    app.innerHTML = `
        <section class="app-screen intro-screen">
            <img class="intro-logo" src="${titleImage}" alt="Best News Ever">
        </section>
    `;

    const logo = app.querySelector(".intro-logo");
    window.requestAnimationFrame(() => {
        logo.classList.add("is-visible");
    });

    introTimerIds.push(window.setTimeout(() => {
        logo.classList.remove("is-visible");
    }, INTRO_FADE_IN_MS + INTRO_HOLD_MS));

    introTimerIds.push(window.setTimeout(() => {
        renderPrompt();
    }, INTRO_FADE_IN_MS + INTRO_HOLD_MS + INTRO_FADE_OUT_MS));
}

function renderPrompt() {
    currentView = "prompt";
    clearIntroTimers();
    stopHighlighting();
    setChromeMode("prompt");

    app.innerHTML = `
        <section class="app-screen prompt-screen fade-in">
            <h1 class="prompt-title">How will we say it today?</h1>
            <button id="promptButton" class="prompt-button" type="button">PRESS BUTTON</button>
        </section>
    `;

    document.getElementById("promptButton").addEventListener("click", handleAdvance);
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
    const dimensions = getGridDimensions(boardIds.length, state.wildCardMode);
    const colorIds = buildColorIds(boardIds.length, dimensions.cols);

    state.currentSession = {
        phase: "selecting",
        sessionDate: getLocalDateKey(),
        boardIds,
        colorIds,
        activityId: null,
        slideIndex: 0
    };

    saveState();
    renderSelection();
}

function renderSelection() {
    currentView = "selection";
    stopHighlighting();
    setChromeMode("selection");

    const boardIds = Array.isArray(state.currentSession.boardIds)
        ? state.currentSession.boardIds
        : buildBoardIds();

    const dimensions = getGridDimensions(boardIds.length, state.wildCardMode);
    let colorIds = Array.isArray(state.currentSession.colorIds)
        ? state.currentSession.colorIds
        : [];

    if (colorIds.length !== boardIds.length) {
        colorIds = buildColorIds(boardIds.length, dimensions.cols);
        state.currentSession.colorIds = colorIds;
        saveState();
    }

    const cards = boardIds.map((id, index) => {
        const activity = getActivity(id);
        const colorClass = colorClasses[colorIds[index]];
        return `
            <button class="activity-card ${colorClass}" type="button" data-activity-id="${activity.id}" data-index="${index}">
                <span class="activity-title">${activity.title}</span>
            </button>
        `;
    }).join("");

    const gridClass = state.wildCardMode ? "wild" : "normal";

    app.innerHTML = `
        <section class="app-screen selection-screen fade-in">
            <div class="selection-stage">
                <div class="selection-side">
                    <img class="smiley-image" src="${smileyImage}" alt="" onerror="this.style.display='none'">
                </div>

                <div id="activityGrid" class="activity-grid ${gridClass}" style="--cols: ${dimensions.cols}; --rows: ${dimensions.rows};">
                    ${cards}
                </div>

                <div class="selection-side">
                    <img class="smiley-image" src="${smileyImage}" alt="" onerror="this.style.display='none'">
                </div>
            </div>
        </section>
    `;

    document.querySelectorAll(".activity-card").forEach(card => {
        card.addEventListener("click", () => {
            highlightedIndex = Number(card.dataset.index);
            selectHighlightedActivity();
        });
    });

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

    cards.forEach(card => card.classList.remove("active"));
    const selectedCard = cards[highlightedIndex];
    selectedCard.classList.add("locked");

    const activityId = Number(selectedCard.dataset.activityId);
    state.currentSession.phase = "selected";
    state.currentSession.activityId = activityId;
    state.currentSession.slideIndex = 0;
    saveState();

    window.setTimeout(() => {
        fadeCurrentScreen(renderWinner);
    }, 300);
}

function renderWinner() {
    currentView = "winner";
    stopHighlighting();
    setChromeMode("winner");

    const activity = getActivity(state.currentSession?.activityId);
    if (!activity) {
        state.currentSession = null;
        saveState();
        renderPrompt();
        return;
    }

    app.innerHTML = `
        <section class="app-screen winner-screen fade-in">
            <div class="winner-content">
                <h1 class="winner-title">${activity.title}</h1>
                <p class="winner-description">${activity.description}</p>
                <button id="letsGoButton" class="lets-go-button" type="button">LET'S GO!</button>
            </div>
        </section>
    `;

    document.getElementById("letsGoButton").addEventListener("click", handleAdvance);
}

function beginSlides() {
    if (!state.currentSession) {
        return;
    }

    state.currentSession.phase = "slides";
    state.currentSession.slideIndex = 0;
    saveState();
    renderSlideScreen(false);
}

function getSlideSource(slideIndex) {
    if (slideIndex >= 0 && slideIndex < poemSlideFiles.length) {
        return poemSlideFiles[slideIndex];
    }

    if (slideIndex === poemSlideFiles.length) {
        return titleImage;
    }

    return null;
}

function renderSlideScreen(animateIn = true) {
    stopHighlighting();

    const slideIndex = Number(state.currentSession?.slideIndex) || 0;
    const source = getSlideSource(slideIndex);

    if (!source) {
        return;
    }

    const isFinalTitle = slideIndex === poemSlideFiles.length;
    currentView = isFinalTitle ? "final" : "slides";
    setChromeMode(currentView);

    app.innerHTML = `
        <section class="app-screen slide-screen ${animateIn ? "fade-in" : ""}">
            <div id="slideStage" class="slide-stage">
                <img class="slide-frame current" src="${source}" alt="${isFinalTitle ? "Best News Ever" : `Best News Ever poem slide ${slideIndex + 1}`}" draggable="false">
            </div>
            <div id="cueMount"></div>
        </section>
    `;

    renderCueOverlay(state.currentSession.activityId, slideIndex);

    if (isFinalTitle) {
        completeCurrentActivity();
    }
}

function moveSlide(direction) {
    if (!state.currentSession || state.currentSession.phase !== "slides" || slideTransitioning) {
        return;
    }

    const currentIndex = Number(state.currentSession.slideIndex) || 0;
    const finalIndex = poemSlideFiles.length;
    const nextIndex = currentIndex + direction;

    if (direction > 0 && currentIndex >= finalIndex) {
        return;
    }

    if (nextIndex < 0 || nextIndex > finalIndex) {
        return;
    }

    const stage = document.getElementById("slideStage");
    const currentImage = stage?.querySelector(".slide-frame.current");
    const nextSource = getSlideSource(nextIndex);

    if (!stage || !currentImage || !nextSource) {
        state.currentSession.slideIndex = nextIndex;
        saveState();
        renderSlideScreen(false);
        return;
    }

    slideTransitioning = true;
    const nextImage = document.createElement("img");
    nextImage.className = `slide-frame current ${direction > 0 ? "from-right" : "from-left"}`;
    nextImage.src = nextSource;
    nextImage.alt = nextIndex === finalIndex
        ? "Best News Ever"
        : `Best News Ever poem slide ${nextIndex + 1}`;
    nextImage.draggable = false;
    stage.appendChild(nextImage);

    const cueMount = document.getElementById("cueMount");
    if (cueMount) {
        cueMount.innerHTML = "";
    }

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            currentImage.classList.add("is-animating");
            nextImage.classList.add("is-animating");
            currentImage.style.transform = direction > 0 ? "translateX(-100%)" : "translateX(100%)";
            nextImage.style.transform = "translateX(0)";
        });
    });

    window.setTimeout(() => {
        currentImage.remove();
        nextImage.classList.remove("from-right", "from-left", "is-animating");
        nextImage.style.transform = "translateX(0)";

        state.currentSession.slideIndex = nextIndex;
        saveState();
        renderCueOverlay(state.currentSession.activityId, nextIndex);

        if (nextIndex === finalIndex) {
            currentView = "final";
            setChromeMode("final");
            completeCurrentActivity();
        } else {
            currentView = "slides";
            setChromeMode("slides");
        }

        slideTransitioning = false;
    }, SLIDE_TRANSITION_MS + 40);
}

function renderCueOverlay(activityId, slideIndex) {
    const cueMount = document.getElementById("cueMount");
    if (!cueMount || slideIndex < 0 || slideIndex >= poemSlideFiles.length) {
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
    const isFinalPoemSlide = slideIndex === poemSlideFiles.length - 1;

    if (activityId === 6) {
        if (isFinalPoemSlide) {
            return { label: "EVERYBODY!", image: null };
        }

        return slideIndex % 2 === 0
            ? { label: "BOYS!", image: cueImages.boys }
            : { label: "GIRLS!", image: cueImages.girls };
    }

    if (activityId === 7) {
        if (isFinalPoemSlide) {
            return { label: "EVERYBODY!", image: null };
        }

        return slideIndex % 2 === 0
            ? { label: "LEADERS!", image: null }
            : { label: "KIDS!", image: null };
    }

    if (activityId === 24) {
        return slideIndex % 2 === 0
            ? { label: "HAPPY!", image: cueImages.happy }
            : { label: "SAD!", image: cueImages.sad };
    }

    return null;
}

function completeCurrentActivity() {
    const session = state.currentSession;
    if (!session || !isValidActivityId(session.activityId) || session.completedRecorded) {
        return;
    }

    const activity = getActivity(session.activityId);

    if (!state.wildCardMode && !state.completed.includes(activity.id)) {
        state.completed.push(activity.id);
    }

    if (!state.wildCardMode && state.completed.length >= 23) {
        state.wildCardMode = true;
    }

    state.history.push({
        activityId: activity.id,
        title: activity.title,
        completedAt: new Date().toISOString()
    });

    session.completedRecorded = true;
    saveState();
}

function restartProcess() {
    stopHighlighting();
    slideTransitioning = false;
    state.currentSession = null;
    saveState();
    renderPrompt();
}

function fadeCurrentScreen(callback) {
    const screen = app.querySelector(".app-screen");
    if (!screen) {
        callback();
        return;
    }

    screen.classList.remove("fade-in");
    screen.classList.add("fade-out");
    window.setTimeout(callback, SCREEN_FADE_MS);
}

function renderFromState() {
    if (!state.currentSession) {
        renderPrompt();
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
            renderSlideScreen(false);
            break;
        default:
            state.currentSession = null;
            saveState();
            renderPrompt();
    }
}

function handleAdvance() {
    if (adminDialog.open || currentView === "intro") {
        return;
    }

    const now = Date.now();
    if (now - lastPressAt < BUTTON_DEBOUNCE_MS) {
        return;
    }
    lastPressAt = now;

    if (!state.currentSession) {
        fadeCurrentScreen(startSelectionSession);
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
            moveSlide(1);
            break;
        default:
            break;
    }
}

function handleBack() {
    if (adminDialog.open || !state.currentSession || state.currentSession.phase !== "slides") {
        return;
    }

    moveSlide(-1);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
        document.exitFullscreen?.().catch(() => {});
    }
}

function openAdmin() {
    populateAdmin();
    adminDialog.showModal();
}

function closeAdmin() {
    adminDialog.close();
}

function populateAdmin() {
    adminSummary.textContent = state.wildCardMode
        ? `Wild Card Mode is active. ${state.completed.length} activities were completed before or during setup.`
        : `${state.completed.length} of 24 activities are completed.`;

    adminActivityList.innerHTML = activities.map(activity => `
        <label class="admin-check">
            <input type="checkbox" value="${activity.id}" ${state.completed.includes(activity.id) ? "checked" : ""}>
            <span>${activity.id}. ${activity.title}</span>
        </label>
    `).join("");

    const recentHistory = [...state.history].reverse().slice(0, 12);
    historyList.innerHTML = recentHistory.length
        ? recentHistory.map(item => {
            const when = item.completedAt ? new Date(item.completedAt).toLocaleString() : "Unknown time";
            return `<div>${item.title || `Activity ${item.activityId}`} — ${when}</div>`;
        }).join("")
        : '<div class="history-empty">No completed activities recorded yet.</div>';
}

function saveAdminSelections() {
    const selectedIds = [...adminActivityList.querySelectorAll('input[type="checkbox"]:checked')]
        .map(input => Number(input.value))
        .filter(isValidActivityId);

    state.completed = [...new Set(selectedIds)];

    if (!state.wildCardMode && state.completed.length >= 23) {
        state.wildCardMode = true;
    }

    state.currentSession = null;
    saveState();
    populateAdmin();
    closeAdmin();
    renderPrompt();
}

function undoLastCompletedActivity() {
    if (!state.history.length) {
        return;
    }

    const last = state.history.pop();
    if (!state.wildCardMode && isValidActivityId(last.activityId)) {
        state.completed = state.completed.filter(id => id !== last.activityId);
    }

    state.currentSession = null;
    saveState();
    populateAdmin();
    renderPrompt();
}

function resetCycle() {
    const confirmed = window.confirm("Start a brand-new 24-activity cycle? This clears completed activities and turns off Wild Card Mode. Your history will be kept.");
    if (!confirmed) {
        return;
    }

    state.completed = [];
    state.wildCardMode = false;
    state.currentSession = null;
    saveState();
    populateAdmin();
    closeAdmin();
    renderPrompt();
}

function clearAllData() {
    const confirmed = window.confirm("Clear ALL Best News Ever app data, including history? This cannot be undone.");
    if (!confirmed) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);
    state = getDefaultState();
    saveState();
    populateAdmin();
    closeAdmin();
    renderPrompt();
}

document.addEventListener("keydown", event => {
    if (event.repeat) {
        return;
    }

    if (adminDialog.open) {
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleBack();
        return;
    }

    if (["Escape", "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "F11"].includes(event.key)) {
        return;
    }

    event.preventDefault();
    handleAdvance();
});

fullscreenButton.addEventListener("click", toggleFullscreen);
adminButton.addEventListener("click", openAdmin);
restartButton.addEventListener("click", restartProcess);
closeAdminButton.addEventListener("click", closeAdmin);
saveAdminButton.addEventListener("click", saveAdminSelections);
undoLastButton.addEventListener("click", undoLastCompletedActivity);
resetCycleButton.addEventListener("click", resetCycle);
clearAllButton.addEventListener("click", clearAllData);

adminDialog.addEventListener("click", event => {
    if (event.target === adminDialog) {
        closeAdmin();
    }
});

bootApp();
