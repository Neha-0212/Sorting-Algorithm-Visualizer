let array = [];
let animationTimeout;
init();
let audioCtx = null;
let isSoundEnabled = true;
let isSorting = false;

const container = document.getElementById("sort-container");
const shuffleBtn = document.getElementById("shuffleBtn");
const soundBtn = document.getElementById("soundBtn");
const sortBtn = document.getElementById("sortBtn");
const numBarsSlider = document.getElementById("numBarsSlider");
const numBarsValue = document.getElementById("numBarsValue");

shuffleBtn.addEventListener("click", shuffleArray);
soundBtn.addEventListener("click", toggleSound);
sortBtn.addEventListener("click", toggleSorting);
numBarsSlider.addEventListener("input", updateNumBars);

function playNote(freq) {
    if (isSoundEnabled && audioCtx == null) {
        audioCtx = new (AudioContext || webkitAudioContext || window.webkitAudioContext)();
    }
    if (isSoundEnabled) {
        const dur = 0.1;
        const osc = audioCtx.createOscillator();
        osc.frequency.value = freq;
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
        const node = audioCtx.createGain();
        node.gain.value = 0.1;
        node.gain.linearRampToValueAtTime(
            0, audioCtx.currentTime + dur
        );
        osc.connect(node);
        node.connect(audioCtx.destination);
    }
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    const soundIcon = soundBtn.querySelector('i');
    soundIcon.classList.toggle("fa-volume-up", isSoundEnabled);
    soundIcon.classList.toggle("fa-volume-off", !isSoundEnabled);
}

function init() {
    array = [];
    const numBarsSlider = document.getElementById("numBarsSlider");
    const numBarsValue = document.getElementById("numBarsValue");
    const numBars = numBarsSlider.value;
    numBarsValue.textContent = numBars;
    for (let i = 0; i < numBars; i++) {
        array[i] = Math.random();
    }
    showBars();

    numBarsSlider.addEventListener("input", function () {
        const numBars = this.value;
        numBarsValue.textContent = numBars;
        array = [];
        for (let i = 0; i < numBars; i++) {
            array[i] = Math.random();
        }
        showBars();
    });
}

function updateNumBars() {
    const numBars = numBarsSlider.value;
    numBarsValue.textContent = numBars;
    array = [];
    for (let i = 0; i < numBars; i++) {
        array[i] = Math.random();
    }
    showBars();
}

function shuffleArray() {
    if (isSorting) return;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    showBars();
}

function toggleSorting() {
    if (!isSorting) {
        isSorting = true;
        animate(countingSort([...array]));
        sortBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        clearTimeout(animationTimeout);
        isSorting = false;
        sortBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function animate(moves) {
    if (!isSorting) return;
    if (moves.length == 0) {
        isSorting = false;
        sortBtn.innerHTML = '<i class="fas fa-play"></i>';
        showBars();
        return;
    }
    
    const move = moves.shift();
    
    if (move.type === "assign") {
        array[move.index] = move.value;
    }
    
    if (move.type === "count" || move.type === "move" || move.type === "copy") {
        playNote(200 + move.value * 500);
    }

    showBars(move);
    animationTimeout = setTimeout(function () {
        animate(moves);
    }, 100);
}

function countingSort(array) {
    const moves = [];
    const n = array.length;
    
    // Since our array contains values between 0 and 1,
    // we'll scale them to integers for counting sort
    const scaledArray = array.map(val => Math.floor(val * 100));
    
    // Find the maximum value to determine the range
    const max = Math.max(...scaledArray);
    
    // Initialize count array
    const count = new Array(max + 1).fill(0);
    
    // Count the occurrences of each value
    for (let i = 0; i < n; i++) {
        count[scaledArray[i]]++;
        moves.push({ index: i, value: scaledArray[i] / 100, type: "count" });
    }
    
    // Modify count array to store cumulative counts
    for (let i = 1; i <= max; i++) {
        count[i] += count[i - 1];
    }
    
    // Build the output array
    const output = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        output[count[scaledArray[i]] - 1] = scaledArray[i] / 100;
        moves.push({ index: count[scaledArray[i]] - 1, value: scaledArray[i] / 100, type: "move" });
        count[scaledArray[i]]--;
    }
    
    // Copy the sorted elements back to the original array
    for (let i = 0; i < n; i++) {
        moves.push({ index: i, value: output[i], type: "assign" });
    }
    
    return moves;
}

function showBars(move) {
    const container = document.getElementById("sort-container");
    container.innerHTML = "";
    
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");
        
        if (move && move.index === i) {
            if (move.type === "count") {
                bar.style.backgroundColor = "blue";
            } else if (move.type === "move" || move.type === "assign") {
                bar.style.backgroundColor = "red";
            }
        }
        
        container.appendChild(bar);
    }
}

function showPythonCode() {
    document.getElementById("python-code").style.display = "block";
    document.getElementById("c-code").style.display = "none";
    document.getElementById("cpp-code").style.display = "none";
    document.getElementById("js-code").style.display = "none";
    document.getElementById("java-code").style.display="none";
}

function showCCode() {
    document.getElementById("python-code").style.display = "none";
    document.getElementById("c-code").style.display = "block";
    document.getElementById("cpp-code").style.display = "none";
    document.getElementById("js-code").style.display = "none";
    document.getElementById("java-code").style.display="none";
}

function showCPPCode() {
    document.getElementById("python-code").style.display = "none";
    document.getElementById("c-code").style.display = "none";
    document.getElementById("cpp-code").style.display = "block";
    document.getElementById("js-code").style.display = "none";
    document.getElementById("java-code").style.display="none";
}

function showJSCode() {
    document.getElementById("python-code").style.display = "none";
    document.getElementById("c-code").style.display = "none";
    document.getElementById("cpp-code").style.display = "none";
    document.getElementById("js-code").style.display = "block";
    document.getElementById("java-code").style.display="none";
}

function showJavaCode() {
    document.getElementById("python-code").style.display = "none";
    document.getElementById("c-code").style.display = "none";
    document.getElementById("cpp-code").style.display = "none";
    document.getElementById("js-code").style.display = "none";
    document.getElementById("java-code").style.display="block";
}