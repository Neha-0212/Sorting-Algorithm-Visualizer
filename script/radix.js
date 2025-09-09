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
        animate(radixSort([...array]));
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
    const [i, j] = move.indices;

    if (move.type == "swap") {
        [array[i], array[j]] = [array[j], array[i]];
    } else if (move.type == "assign") {
        array[i] = j;
    }

    playNote(200 + array[i] * 500);
    if (j !== undefined) {
        playNote(200 + j * 500);
    }

    showBars(move);
    animationTimeout = setTimeout(function () {
        animate(moves);
    }, 100);
}

function radixSort(array) {
    const moves = [];
    const n = array.length;
    
    // Since radix sort works with integers, we'll scale our 0-1 values
    // to integers in the range 0-999 for better visualization
    const scaledArray = array.map(val => Math.floor(val * 1000));
    
    // Find the maximum number to know number of digits
    const max = Math.max(...scaledArray);
    
    // Do counting sort for every digit
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        moves.push({ indices: [-1, exp], type: "digit", message: `Sorting by digit: ${Math.log10(exp) + 1}` });
        
        const output = new Array(n); // output array
        const count = new Array(10).fill(0);
        
        // Store count of occurrences in count[]
        for (let i = 0; i < n; i++) {
            const digit = Math.floor(scaledArray[i] / exp) % 10;
            count[digit]++;
            moves.push({ indices: [i, digit], type: "count" });
        }
        
        // Change count[i] so that count[i] contains
        // actual position of this digit in output[]
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        // Build the output array
        for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(scaledArray[i] / exp) % 10;
            output[count[digit] - 1] = scaledArray[i] / 1000; // Convert back to 0-1 range
            moves.push({ indices: [count[digit] - 1, scaledArray[i] / 1000], type: "assign" });
            count[digit]--;
        }
        
        // Copy the output array to scaledArray[], so that scaledArray[] now
        // contains sorted numbers according to current digit
        for (let i = 0; i < n; i++) {
            scaledArray[i] = output[i] * 1000; // Convert back to integer for next digit
            moves.push({ indices: [i, output[i]], type: "assign" });
        }
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

        if (move && move.indices && move.indices[0] === i) {
            if (move.type === "count") {
                bar.style.backgroundColor = "blue";
            } else if (move.type === "assign") {
                bar.style.backgroundColor = "red";
            }
        }

        container.appendChild(bar);
    }
    
    // Display current digit being processed
    if (move && move.type === "digit") {
        const info = document.createElement("div");
        info.style.position = "absolute";
        info.style.top = "10px";
        info.style.left = "10px";
        info.style.color = "white";
        info.style.backgroundColor = "rgba(0,0,0,0.5)";
        info.style.padding = "5px";
        info.style.borderRadius = "5px";
        info.textContent = move.message;
        container.appendChild(info);
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