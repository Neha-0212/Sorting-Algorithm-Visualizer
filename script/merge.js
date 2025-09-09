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
        animate(mergeSort([...array]));
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
    } else if (move.type == "compare") {
        // Just for visualization, no change to array
    } else if (move.type == "merge") {
        // Just for visualization, no change to array
    }

    if (move.type === "compare" || move.type === "merge") {
        playNote(200 + array[i] * 500);
        if (j !== undefined) {
            playNote(200 + j * 500);
        }
    }

    showBars(move);
    animationTimeout = setTimeout(function () {
        animate(moves);
    }, 100);
}

function mergeSort(array) {
    const moves = [];
    const tempArray = [...array];
    
    // Recursive merge sort function
    function doMergeSort(start, end) {
        if (start < end) {
            const mid = Math.floor((start + end) / 2);
            
            // Add a move to show the division
            moves.push({ indices: [start, end], type: "divide", message: `Dividing: ${start}-${end}` });
            
            // Recursively sort both halves
            doMergeSort(start, mid);
            doMergeSort(mid + 1, end);
            
            // Merge the sorted halves
            merge(start, mid, end);
        }
    }
    
    function merge(start, mid, end) {
        moves.push({ indices: [start, end], type: "merge", message: `Merging: ${start}-${end}` });
        
        let i = start;
        let j = mid + 1;
        let k = start;
        
        // Create a temporary array for the merge
        const temp = [...array];
        
        while (i <= mid && j <= end) {
            // Compare elements
            moves.push({ indices: [i, j], type: "compare" });
            
            if (temp[i] <= temp[j]) {
                moves.push({ indices: [k, temp[i]], type: "assign" });
                array[k] = temp[i];
                i++;
            } else {
                moves.push({ indices: [k, temp[j]], type: "assign" });
                array[k] = temp[j];
                j++;
            }
            k++;
        }
        
        // Copy remaining elements from left half
        while (i <= mid) {
            moves.push({ indices: [k, temp[i]], type: "assign" });
            array[k] = temp[i];
            i++;
            k++;
        }
        
        // Copy remaining elements from right half
        while (j <= end) {
            moves.push({ indices: [k, temp[j]], type: "assign" });
            array[k] = temp[j];
            j++;
            k++;
        }
    }
    
    // Start the recursive sorting
    doMergeSort(0, array.length - 1);
    
    return moves;
}

function showBars(move) {
    const container = document.getElementById("sort-container");
    container.innerHTML = "";

    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");

        if (move && move.indices) {
            if (move.type === "compare" && (move.indices[0] === i || move.indices[1] === i)) {
                bar.style.backgroundColor = "blue";
            } else if (move.type === "assign" && move.indices[0] === i) {
                bar.style.backgroundColor = "red";
            } else if (move.type === "divide" && i >= move.indices[0] && i <= move.indices[1]) {
                bar.style.backgroundColor = "green";
            } else if (move.type === "merge" && i >= move.indices[0] && i <= move.indices[1]) {
                bar.style.backgroundColor = "purple";
            }
        }

        container.appendChild(bar);
    }
    
    // Display current operation
    if (move && (move.type === "divide" || move.type === "merge")) {
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