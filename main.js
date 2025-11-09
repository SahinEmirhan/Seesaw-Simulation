const plankElement = document.getElementById("plank");
const sceneElement = document.getElementById("scene");
const pivotElement = document.getElementById("pivot");
const seesawElement = document.getElementById("seesaw")
const angleElement = document.getElementById("angleDisplay");
const leftWeightElement = document.getElementById("leftWeight");
const rightWeightElement = document.getElementById("rightWeight");
const nextWeightElement = document.getElementById("nextWeight");
const resetButtonElement = document.getElementById("resetButton");
let visualizedNextWeightElement = null;
let visualizedMarkerElement = null;
const seesawPos = seesawElement.getBoundingClientRect();
let xCoords = 0;
let nextWeight = 0;
let rightSideWeight = 0;
let leftSideWeight = 0;
let seesawWeights = {
    rightSide : [],
    leftSide : [],
    origin : []
    }
let torque = 0;
let currentAngle = 0;
let r, g, b;

const STATE_KEY = "seesawState";

sceneElement.addEventListener("click", handleClick);
sceneElement.addEventListener("mousemove" , () => {handleMouseMove(event)})

resetButtonElement.addEventListener("click" , resetButtonClick)


document.addEventListener('DOMContentLoaded' , () => {
    restoreState();
    
})

function handleClick(event){
    calcXCoordForPivot(event);
    removeNextWeightVisualization();
    addWeightToSeesaw(nextWeight , xCoords , currentAngle);
    calcTiltAngle(nextWeight , xCoords);
    createNextRandomWeight();
    saveState();
}

function handleMouseMove(event){
    calcXCoordForPivot(event);
    visualizeNextWeight();
}

function resetButtonClick(){ 
    rightSideWeight = 0;
    leftSideWeight = 0;
    seesawWeights = {
    rightSide : [],
    leftSide : [],
    origin : []
    }
    torque = 0;
    currentAngle = 0;
    plankElement.querySelectorAll('.new-weight').forEach(node => node.remove());
    plankElement.style.setProperty("--tilt", `0deg`);
    angleElement.textContent = currentAngle;
    rightWeightElement.textContent = rightSideWeight;
    leftWeightElement.textContent = leftSideWeight;
    createNextRandomWeight();
    nextWeightElement.textContent = nextWeight;
    localStorage.removeItem(STATE_KEY);
} 

function saveState() {
    const snapshot = {
        weights: seesawWeights,
        leftTotal: leftSideWeight,
        rightTotal: rightSideWeight,
        torque,
        angle: currentAngle,
        nextWeight
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(snapshot));
}

function updateUIFromState() {
    leftWeightElement.textContent = leftSideWeight;
    rightWeightElement.textContent = rightSideWeight;
    angleElement.textContent = currentAngle.toFixed(2);
    nextWeightElement.textContent = nextWeight;
    plankElement.style.setProperty("--tilt", `${currentAngle}deg`);
    for(let i = 0; i < seesawWeights.leftSide.length; i++){
        addWeightToSeesawVisualization(seesawWeights.leftSide[i].weight , seesawWeights.leftSide[i].xCoord);
    }
    for(let i = 0; i < seesawWeights.origin.length; i++){
        addWeightToSeesawVisualization(seesawWeights.origin[i].weight , seesawWeights.origin[i].xCoord);
    }
    for(let i = 0; i < seesawWeights.rightSide.length; i++){
        addWeightToSeesawVisualization(seesawWeights.rightSide[i].weight , seesawWeights.rightSide[i].xCoord);
    }
    
}

function restoreState() {
    const raw = localStorage.getItem(STATE_KEY);
    if(!raw){
        createNextRandomWeight();
        return;
    }
    try {
        const stateObj = JSON.parse(raw);
        seesawWeights = stateObj.weights || { rightSide: [], leftSide: [], origin: [] };
        leftSideWeight = stateObj.leftTotal || 0;
        rightSideWeight = stateObj.rightTotal || 0;
        torque = stateObj.torque || 0;
        currentAngle = stateObj.angle || 0;
        nextWeight = stateObj.nextWeight;
        
        
        updateUIFromState();
    } catch (err) {
        console.error("State parse error", err);
    }
}

// deciding position (left or right) and adding weight to seesaw. 
function addWeightToSeesaw(weight , xCoord , angle){
    addWeightToSeesawVisualization(weight , xCoord , angle);
    if(xCoord > 0){
        seesawWeights.rightSide.push({weight , xCoord})
        rightSideWeight += weight;
        rightWeightElement.innerHTML = rightSideWeight;
    }
    else if (xCoord < 0){
        seesawWeights.leftSide.push({weight , xCoord})
        leftSideWeight += weight;
        leftWeightElement.innerHTML = leftSideWeight;
    }
    else{
        seesawWeights.origin.push({weight , xCoord})
    }
}


function addWeightToSeesawVisualization(weight ,xCoord , angle ){
    const plankPos = plankElement.getBoundingClientRect();
        newWeightElement = document.createElement('div');
        newWeightElement.className = 'new-weight';
        plankElement.append(newWeightElement);
        const xCoordsForPlank = (xCoord + plankPos.width / 2) * seesawPos.width / plankPos.width;
        const WeightSize = weight * 4 + 31;
        const alignedWeightPosition = xCoordsForPlank - WeightSize / 2;
        newWeightElement.style.left = `${alignedWeightPosition}px`;
        newWeightElement.style.rotate = `${-angle}deg`;
        
        newWeightElement.style.width = `${WeightSize}px`
        newWeightElement.style.height = `${WeightSize}px`;
        newWeightElement.style.lineHeight = `${WeightSize}px`;
        newWeightElement.innerHTML = `${weight}kg`
        r = weight * 6 + 55;
        g = weight * 12 + 55;
        b = weight * 14 + 110;
        newWeightElement.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

        newWeightElement.addEventListener('animationend', () => {
            newWeightElement.style.transition = "rotate 0.4s ease-in";
            requestAnimationFrame(() => {
            newWeightElement.style.rotate = "0deg"; 
            });
        }, { once: true });
}

//calculating plank angle. (can be max 30 and min -30)
function calcTiltAngle(weight , xCoord){
    torque += weight * xCoord;
    currentAngle = Math.max(-30, Math.min(30, torque / 10));
    angleElement.innerHTML = currentAngle.toFixed(2);
    plankElement.style.setProperty("--tilt", `${currentAngle}deg`);
    
}

//calculating x coords for pivot triangle.
function calcXCoordForPivot(event){
    const pivotPos = pivotElement.getBoundingClientRect();
    const plankPos = plankElement.getBoundingClientRect();
    xCoords = event.clientX - (pivotPos.left + pivotPos.width / 2);
    let plankWidth = plankPos.width / 2;
    
    if(xCoords > plankWidth) 
        xCoords = plankWidth;
    else if (xCoords < -plankWidth) 
        xCoords = -plankWidth;

}


//visualizes the next weight before placing it on the seesaw.
function visualizeNextWeight(){
    if(!visualizedNextWeightElement){
        visualizedNextWeightElement = document.createElement('div');
        visualizedNextWeightElement.className = 'visualized-weight';
        visualizedMarkerElement = document.createElement('div');
        visualizedMarkerElement.className = 'visualized-marker';
        seesawElement.append(visualizedNextWeightElement , visualizedMarkerElement);
        r = nextWeight * 6 + 55;
        g = nextWeight * 12 + 55;
        b = nextWeight * 14 + 110;
        visualizedNextWeightElement.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
    
    const nextWeightPos = visualizedNextWeightElement.getBoundingClientRect();
    const xCoordsForPlank = xCoords + seesawPos.width / 2;
    const alignedWeightPosition = xCoordsForPlank - nextWeightPos.width / 2 ;
    
    visualizedNextWeightElement.style.left = `${alignedWeightPosition}px`;

    const WeightSize = nextWeight * 4 + 31;
    visualizedNextWeightElement.style.width = `${WeightSize}px`
    visualizedNextWeightElement.style.height = `${WeightSize}px`;
    visualizedNextWeightElement.style.lineHeight = `${WeightSize}px`;
    
    visualizedNextWeightElement.innerHTML = `${nextWeight}kg`

    const markerStartPosition = xCoordsForPlank;
    visualizedMarkerElement.style.height = `${seesawPos.top - nextWeightPos.bottom }px`
    visualizedMarkerElement.style.left = `${markerStartPosition}px`;

}

function removeNextWeightVisualization() {
  if (visualizedNextWeightElement) {
    visualizedNextWeightElement.remove();
    visualizedNextWeightElement = null;
  }
  if (visualizedMarkerElement) {
    visualizedMarkerElement.remove();
    visualizedMarkerElement = null;
  }
}


// creating next random weight.
function createNextRandomWeight(){
    nextWeight = Math.ceil(Math.random()*10);
    nextWeightElement.innerHTML = nextWeight;
}