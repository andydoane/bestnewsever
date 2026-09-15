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

const slideReferenceImage = new Image();
slideReferenceImage.src = poemSlideFiles[0];
slideReferenceImage.addEventListener("load", () => {
    positionSlideFullscreenButton();
});

const cueImages = {
    boys: "assets/images/boys.png",
    girls: "assets/images/girls.png",
    happy: "assets/images/happy.png",
    sad: "assets/images/sad.png",
    leaders1: "assets/images/leaders_1.png",
    leaders2: "assets/images/leaders_2.png"
};

const colorClasses = [
    "color-0",
    "color-1",
    "color-2",
    "color-3",
    "color-4",
    "color-5"
];

const activityColorValues = [
    "#ff5a51",
    "#ffa351",
    "#ffc751",
    "#a7cb6f",
    "#40b9c5",
    "#7f66c6"
];

const fixedBoardColorIds = [
    0, 1, 2, 3, 4, 5,
    3, 4, 5, 0, 1, 2,
    0, 1, 2, 3, 4, 5,
    3, 4, 5, 0, 1, 2
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
    state.wildCardMode = false;

    if (
        state.currentSession &&
        !isValidActivityId(state.currentSession.activityId) &&
        state.currentSession.activityId !== null
    ) {
        state.currentSession = null;
    }

    if (
        state.currentSession &&
        state.currentSession.phase === "selecting" &&
        (
            !Array.isArray(state.currentSession.boardIds) ||
            state.currentSession.boardIds.length !== activities.length
        )
    ) {
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
    showOverlayControls(["prompt", "finalPrompt", "selection", "winner"].includes(mode));
    showRestartButton(mode === "final");
}

function preloadAssets() {
    [titleImage, smileyImage, ...poemSlideFiles, ...Object.values(cueImages)].forEach(source => {
        const image = new Image();
        image.src = source;
    });
}

function resetFinishedCycleForNewRun() {
    if (state.completed.length < activities.length) {
        return false;
    }

    state.completed = [];
    state.wildCardMode = false;
    state.currentSession = null;
    saveState();

    return true;
}

function bootApp() {
    normalizeState();

    const startedNewCycle = resetFinishedCycleForNewRun();

    preloadAssets();

    if (!startedNewCycle && state.currentSession) {
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

function renderFinalActivityPrompt() {
    currentView = "finalPrompt";
    clearIntroTimers();
    stopHighlighting();
    setChromeMode("finalPrompt");

    app.innerHTML = `
        <section class="app-screen prompt-screen fade-in">
            <h1 class="prompt-title">There's only one activity left!<br>Which one is it?</h1>
            <button id="finalActivityPromptButton" class="prompt-button" type="button">PRESS BUTTON</button>
        </section>
    `;

    document.getElementById("finalActivityPromptButton").addEventListener("click", handleAdvance);
}

function buildBoardIds() {
    return activities.map(activity => activity.id);
}

function startSelectionSession() {
    finalRevealRunning = false;

    state.currentSession = {
        phase: "selecting",
        sessionDate: getLocalDateKey(),
        boardIds: buildBoardIds(),
        colorIds: [...fixedBoardColorIds],
        finalRound: false,
        activityId: null,
        slideIndex: 0
    };

    saveState();
    renderSelection();
}

function startFinalSelectionSession() {
    finalRevealRunning = false;

    state.currentSession = {
        phase: "selecting",
        sessionDate: getLocalDateKey(),
        boardIds: buildBoardIds(),
        colorIds: [...fixedBoardColorIds],
        finalRound: true,
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

    const finalRound = Boolean(state.currentSession.finalRound);
    const boardIds = buildBoardIds();
    const colorIds = [...fixedBoardColorIds];

    state.currentSession.boardIds = boardIds;
    state.currentSession.colorIds = colorIds;
    saveState();

    const cards = boardIds.map((id, index) => {
        const activity = getActivity(id);
        const colorId = colorIds[index];
        const colorClass = colorClasses[colorId];
        const isCompleted = state.completed.includes(id);
        const completedClass = isCompleted && !finalRound ? " completed" : "";
        const completedMark = isCompleted && !finalRound
            ? '<span class="completed-mark" aria-hidden="true">✕</span>'
            : "";

        return `
            <button
                class="activity-card ${colorClass}${completedClass}"
                type="button"
                data-activity-id="${activity.id}"
                data-index="${index}"
                data-color="${activityColorValues[colorId]}"
            >
                <span class="activity-title">${activity.title}</span>
                ${completedMark}
            </button>
        `;
    }).join("");

    app.innerHTML = `
        <section class="app-screen selection-screen fade-in">
            <div class="selection-stage">
                <div class="selection-side">
                    <img class="smiley-image" src="${smileyImage}" alt="" onerror="this.style.display='none'">
                </div>

                <div id="activityGrid" class="activity-grid full">
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
            const activityId = Number(card.dataset.activityId);

            if (!finalRound && state.completed.includes(activityId)) {
                return;
            }

            highlightedIndex = Number(card.dataset.index);
            selectHighlightedActivity();
        });
    });

    startHighlighting();
}

function startHighlighting() {
    stopHighlighting();

    const allCards = [...document.querySelectorAll(".activity-card")];
    if (!allCards.length) {
        return;
    }

    const finalRound = Boolean(state.currentSession?.finalRound);

    const eligibleCards = finalRound
        ? allCards
        : allCards.filter(card => {
            const activityId = Number(card.dataset.activityId);
            return !state.completed.includes(activityId);
        });

    if (!eligibleCards.length) {
        return;
    }

    function moveHighlight() {
        allCards.forEach(card => card.classList.remove("active"));

        let nextCard = eligibleCards[Math.floor(Math.random() * eligibleCards.length)];

        if (eligibleCards.length > 1) {
            while (Number(nextCard.dataset.index) === highlightedIndex) {
                nextCard = eligibleCards[Math.floor(Math.random() * eligibleCards.length)];
            }
        }

        highlightedIndex = Number(nextCard.dataset.index);
        nextCard.classList.add("active");
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
    if (finalRevealRunning) {
        return;
    }

    const cards = [...document.querySelectorAll(".activity-card")];
    if (!cards.length || highlightedIndex < 0 || !cards[highlightedIndex]) {
        return;
    }

    if (state.currentSession?.finalRound) {
        startFinalReveal();
        return;
    }

    const selectedCard = cards[highlightedIndex];
    const activityId = Number(selectedCard.dataset.activityId);

    if (state.completed.includes(activityId)) {
        return;
    }

    stopHighlighting();

    cards.forEach(card => card.classList.remove("active"));
    selectedCard.classList.add("locked");

    state.currentSession.phase = "selected";
    state.currentSession.activityId = activityId;
    state.currentSession.slideIndex = 0;
    saveState();

    window.setTimeout(() => {
        fadeCurrentScreen(renderWinner);
    }, 300);
}

function startFinalReveal() {
    if (finalRevealRunning) {
        return;
    }

    const remainingActivity = activities.find(activity => {
        return !state.completed.includes(activity.id);
    });

    if (!remainingActivity) {
        return;
    }

    finalRevealRunning = true;
    stopHighlighting();
    showOverlayControls(false);

    const cards = [...document.querySelectorAll(".activity-card")];

    cards.forEach(card => {
        card.classList.remove("active", "locked");
    });

    const cardsToEliminate = shuffle(
        cards.filter(card => {
            return Number(card.dataset.activityId) !== remainingActivity.id;
        })
    );

    eliminateFinalRevealCards(cardsToEliminate, remainingActivity.id, 0);
}

function eliminateFinalRevealCards(cards, remainingActivityId, index) {
    if (index >= cards.length) {
        const survivor = document.querySelector(
            `.activity-card[data-activity-id="${remainingActivityId}"]`
        );

        survivor?.classList.add("final-survivor");

        window.setTimeout(() => {
            if (!state.currentSession) {
                finalRevealRunning = false;
                return;
            }

            state.currentSession.phase = "selected";
            state.currentSession.activityId = remainingActivityId;
            state.currentSession.slideIndex = 0;
            state.currentSession.finalRound = false;

            saveState();

            finalRevealRunning = false;
            fadeCurrentScreen(renderWinner);
        }, 1400);

        return;
    }

    explodeActivityCard(cards[index]);

    let delay;

    if (index < 12) {
        delay = 95;
    } else if (index < 19) {
        delay = 145;
    } else if (index < cards.length - 1) {
        delay = 240;
    } else {
        delay = 420;
    }

    window.setTimeout(() => {
        eliminateFinalRevealCards(cards, remainingActivityId, index + 1);
    }, delay);
}

function explodeActivityCard(card) {
    if (!card) {
        return;
    }

    createConfettiBurst(card);
    card.classList.add("exploding");

    window.setTimeout(() => {
        card.classList.remove("exploding");
        card.classList.add("eliminated");
    }, 340);
}

function createConfettiBurst(card) {
    const rect = card.getBoundingClientRect();
    const color = card.dataset.color || "#ff5a51";
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const pieceCount = 18;

    for (let index = 0; index < pieceCount; index += 1) {
        const piece = document.createElement("span");
        const angle =
            (Math.PI * 2 * index) / pieceCount +
            (Math.random() * 0.5 - 0.25);

        const distance = 70 + Math.random() * 150;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const rotation = Math.round(Math.random() * 720 - 360);

        piece.className = "confetti-piece";
        piece.style.left = `${centerX}px`;
        piece.style.top = `${centerY}px`;
        piece.style.width = `${6 + Math.random() * 9}px`;
        piece.style.height = `${10 + Math.random() * 13}px`;
        piece.style.backgroundColor = color;
        piece.style.setProperty("--confetti-x", `${x}px`);
        piece.style.setProperty("--confetti-y", `${y}px`);
        piece.style.setProperty("--confetti-rotation", `${rotation}deg`);
        piece.style.animationDelay = `${Math.random() * 55}ms`;

        document.body.appendChild(piece);

        window.setTimeout(() => {
            piece.remove();
        }, 950);
    }
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

function getCueSlide(activityId, poemIndex) {
    const isFinalPoemSlide = poemIndex === poemSlideFiles.length - 1;

    if (activityId === 6) {
        if (isFinalPoemSlide) {
            return {
                label: "Everybody!",
                images: [cueImages.boys, cueImages.girls]
            };
        }

        return poemIndex % 2 === 0
            ? { label: "Boys!", images: [cueImages.boys] }
            : { label: "Girls!", images: [cueImages.girls] };
    }

    if (activityId === 7) {
        if (isFinalPoemSlide) {
            return {
                label: "Everybody!",
                images: [cueImages.boys, cueImages.girls, cueImages.leaders1, cueImages.leaders2]
            };
        }

        return poemIndex % 2 === 0
            ? { label: "Leaders!", images: [cueImages.leaders1, cueImages.leaders2] }
            : { label: "Kids!", images: [cueImages.boys, cueImages.girls] };
    }

    if (activityId === 24) {
        return poemIndex % 2 === 0
            ? { label: "Say it happy!", images: [cueImages.happy] }
            : { label: "Say it sad!", images: [cueImages.sad] };
    }

    return null;
}

function buildSlideSequence(activityId) {
    const sequence = [];

    poemSlideFiles.forEach((source, poemIndex) => {
        const cue = getCueSlide(activityId, poemIndex);
        if (cue) {
            sequence.push({
                type: "cue",
                label: cue.label,
                images: cue.images,
                isFinalTitle: false
            });
        }

        sequence.push({
            type: "image",
            source,
            alt: `Best News Ever poem slide ${poemIndex + 1}`,
            isFinalTitle: false
        });
    });

    sequence.push({
        type: "image",
        source: titleImage,
        alt: "Best News Ever",
        isFinalTitle: true
    });

    return sequence;
}

function createSlideFrame(slide, enteringClass = "") {
    if (slide.type === "cue") {
        const frame = document.createElement("div");
        frame.className = `slide-frame cue-slide current ${enteringClass}`.trim();

        const imageMarkup = slide.images.map(source => `
            <img class="cue-slide-image" src="${source}" alt="" onerror="this.style.display='none'">
        `).join("");

        frame.innerHTML = `
            <div class="cue-slide-content">
                <div class="cue-slide-images ${slide.images.length > 2 ? "many" : ""}">
                    ${imageMarkup}
                </div>
                <div class="cue-slide-text">${slide.label}</div>
            </div>
        `;

        return frame;
    }

    const image = document.createElement("img");
    image.className = `slide-frame image-slide current ${enteringClass}`.trim();
    image.src = slide.source;
    image.alt = slide.alt;
    image.draggable = false;
    image.addEventListener("load", positionSlideFullscreenButton, { once: true });
    return image;
}

function syncSlideFullscreenButton(show) {
    const slideScreen = app.querySelector(".slide-screen");
    if (!slideScreen) {
        return;
    }

    let button = document.getElementById("slideFullscreenButton");

    if (!show) {
        button?.remove();
        return;
    }

    if (!button) {
        button = document.createElement("button");
        button.id = "slideFullscreenButton";
        button.className = "slide-fullscreen-button";
        button.type = "button";
        button.title = "Fullscreen";
        button.setAttribute("aria-label", "Fullscreen");
        button.textContent = "⛶";
        button.addEventListener("click", toggleFullscreen);
        slideScreen.appendChild(button);
    }

    window.requestAnimationFrame(positionSlideFullscreenButton);
}

function positionSlideFullscreenButton() {
    const button = document.getElementById("slideFullscreenButton");
    const stage = document.getElementById("slideStage");

    if (!button || !stage) {
        return;
    }

    const margin = Math.max(14, Math.min(28, window.innerWidth * 0.015));
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;

    const imageRatio =
        slideReferenceImage.complete &&
        slideReferenceImage.naturalWidth > 0 &&
        slideReferenceImage.naturalHeight > 0
            ? slideReferenceImage.naturalWidth / slideReferenceImage.naturalHeight
            : 16 / 9;

    const stageRatio = stageWidth / stageHeight;

    let displayedWidth;
    let displayedHeight;
    let topOffset;
    let rightOffset;

    if (imageRatio > stageRatio) {
        displayedWidth = stageWidth;
        displayedHeight = displayedWidth / imageRatio;
        topOffset = (stageHeight - displayedHeight) / 2;
        rightOffset = 0;
    } else {
        displayedHeight = stageHeight;
        displayedWidth = displayedHeight * imageRatio;
        topOffset = 0;
        rightOffset = (stageWidth - displayedWidth) / 2;
    }

    button.style.top = `${topOffset + margin}px`;
    button.style.right = `${rightOffset + margin}px`;
}

function renderSlideScreen(animateIn = true) {
    stopHighlighting();

    const slideIndex = Number(state.currentSession?.slideIndex) || 0;
    const sequence = buildSlideSequence(state.currentSession?.activityId);
    const slide = sequence[slideIndex];

    if (!slide) {
        return;
    }

    const isFinalTitle = Boolean(slide.isFinalTitle);
    currentView = isFinalTitle ? "final" : "slides";
    setChromeMode(currentView);

    app.innerHTML = `
        <section class="app-screen slide-screen ${animateIn ? "fade-in" : ""}">
            <div id="slideStage" class="slide-stage"></div>
        </section>
    `;

    const stage = document.getElementById("slideStage");
    stage.appendChild(createSlideFrame(slide));
    syncSlideFullscreenButton(!isFinalTitle);

    if (isFinalTitle) {
        completeCurrentActivity();
    }
}

function moveSlide(direction) {
    if (!state.currentSession || state.currentSession.phase !== "slides" || slideTransitioning) {
        return;
    }

    const sequence = buildSlideSequence(state.currentSession.activityId);
    const currentIndex = Number(state.currentSession.slideIndex) || 0;
    const finalIndex = sequence.length - 1;
    const nextIndex = currentIndex + direction;

    if (direction > 0 && currentIndex >= finalIndex) {
        return;
    }

    if (nextIndex < 0 || nextIndex > finalIndex) {
        return;
    }

    const stage = document.getElementById("slideStage");
    const currentFrame = stage?.querySelector(".slide-frame.current");
    const nextSlide = sequence[nextIndex];

    if (!stage || !currentFrame || !nextSlide) {
        state.currentSession.slideIndex = nextIndex;
        saveState();
        renderSlideScreen(false);
        return;
    }

    slideTransitioning = true;
    const nextFrame = createSlideFrame(nextSlide, direction > 0 ? "from-right" : "from-left");
    stage.appendChild(nextFrame);

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            currentFrame.classList.add("is-animating");
            nextFrame.classList.add("is-animating");
            currentFrame.style.transform = direction > 0 ? "translateX(-100%)" : "translateX(100%)";
            nextFrame.style.transform = "translateX(0)";
        });
    });

    window.setTimeout(() => {
        currentFrame.remove();
        nextFrame.classList.remove("from-right", "from-left", "is-animating");
        nextFrame.style.transform = "translateX(0)";

        state.currentSession.slideIndex = nextIndex;
        saveState();

        if (nextSlide.isFinalTitle) {
            currentView = "final";
            setChromeMode("final");
            syncSlideFullscreenButton(false);
            completeCurrentActivity();
        } else {
            currentView = "slides";
            setChromeMode("slides");
            syncSlideFullscreenButton(true);
        }

        slideTransitioning = false;
    }, SLIDE_TRANSITION_MS + 40);
}


function completeCurrentActivity() {
    const session = state.currentSession;
    if (!session || !isValidActivityId(session.activityId) || session.completedRecorded) {
        return;
    }

    const activity = getActivity(session.activityId);

    if (!state.completed.includes(activity.id)) {
        state.completed.push(activity.id);
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
    finalRevealRunning = false;

    state.currentSession = null;

    if (state.completed.length >= activities.length) {
        state.completed = [];
        state.wildCardMode = false;
    }

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
    if (
        adminDialog.open ||
        currentView === "intro" ||
        finalRevealRunning
    ) {
        return;
    }

    const now = Date.now();
    if (now - lastPressAt < BUTTON_DEBOUNCE_MS) {
        return;
    }
    lastPressAt = now;

    if (!state.currentSession) {
        if (state.completed.length >= activities.length) {
            resetFinishedCycleForNewRun();
        }

        if (currentView === "finalPrompt") {
            fadeCurrentScreen(startFinalSelectionSession);
            return;
        }

        if (state.completed.length === activities.length - 1) {
            fadeCurrentScreen(renderFinalActivityPrompt);
            return;
        }

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
    adminSummary.textContent = `${state.completed.length} of 24 activities are completed.`;

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
    state.wildCardMode = false;
    state.currentSession = null;

    saveState();
    populateAdmin();
    closeAdmin();
    renderPrompt();
}

function undoLastCompletedActivity() {
    let historyIndex = -1;

    for (let index = state.history.length - 1; index >= 0; index -= 1) {
        const activityId = state.history[index].activityId;

        if (state.completed.includes(activityId)) {
            historyIndex = index;
            break;
        }
    }

    if (historyIndex === -1) {
        return;
    }

    const [last] = state.history.splice(historyIndex, 1);

    state.completed = state.completed.filter(id => id !== last.activityId);
    state.wildCardMode = false;
    state.currentSession = null;

    saveState();
    populateAdmin();
    renderPrompt();
}

function resetCycle() {
    const confirmed = window.confirm(
        "Start a brand-new 24-activity cycle? This clears completed activities. Your history will be kept."
    );

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

window.addEventListener("resize", positionSlideFullscreenButton);

bootApp();
