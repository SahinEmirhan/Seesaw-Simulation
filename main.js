const plankElement = document.getElementById("plank");
const sceneElement = document.getElementById("scene");
const pivotElement = document.getElementById("pivot");
const seesawElement = document.getElementById("seesaw")
const angleElement = document.getElementById("angleDisplay");
const leftWeightElement = document.getElementById("leftWeight");
const rightWeightElement = document.getElementById("rightWeight");
const nextWeightElement = document.getElementById("nextWeight");
let visualizedNextWeightElement = null;
let visualizedMarkerElement = null;



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


const STATE_KEY = "seesawState";

sceneElement.addEventListener("click", handleClick);
sceneElement.addEventListener("mousemove" , () => {handleMouseMove(event)})

document.addEventListener('DOMContentLoaded' , () => {
    restoreState();
    
})

function handleClick(event){
    calcXCoordForPivot(event);
    addWeightToSeesaw(nextWeight , xCoords);
    calcTiltAngle(nextWeight , xCoords);
    createNextRandomWeight();
    saveState();
}

function handleMouseMove(event){
    calcXCoordForPivot(event);
    visualizeNextWeight();
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
    angleElement.textContent = currentAngle;
    plankElement.style.rotate = `${currentAngle}deg`;
    nextWeightElement.textContent = nextWeight;

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
function addWeightToSeesaw(weight , xCoord ){
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

//calculating plank angle. (can be max 30 and min -30)
function calcTiltAngle(weight , xCoord){
    torque += weight * xCoord;
    currentAngle = Math.max(-30, Math.min(30, torque / 10));
    angleElement.innerHTML = currentAngle;
    plankElement.style.rotate = `${currentAngle}deg`;
    
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

const PlankPosForVisualize = plankElement.getBoundingClientRect();
//visualizes the next weight before placing it on the seesaw.
function visualizeNextWeight(){
    if(!visualizedNextWeightElement){
        visualizedNextWeightElement = document.createElement('div');
        visualizedNextWeightElement.className = 'visualized-weight';
        visualizedMarkerElement = document.createElement('div');
        visualizedMarkerElement.className = 'visualized-marker';
        seesawElement.append(visualizedNextWeightElement , visualizedMarkerElement);
    }
    
    const nextWeightPos = visualizedNextWeightElement.getBoundingClientRect();
    const xCoordsForPlank = xCoords + PlankPosForVisualize.width / 2;
    const alignedWeightPosition = xCoordsForPlank - nextWeightPos.width / 2;
    
    visualizedNextWeightElement.style.left = `${alignedWeightPosition}px`;

    const WeightSize = nextWeight * 4 + 31;
    visualizedNextWeightElement.style.width = `${WeightSize}px`
    visualizedNextWeightElement.style.height = `${WeightSize}px`;
    visualizedNextWeightElement.style.lineHeight = `${WeightSize}px`;
    visualizedNextWeightElement.innerHTML = `${nextWeight}kg`

    const markerStartPosition = xCoordsForPlank;
    visualizedMarkerElement.style.height = `${PlankPosForVisualize.top - nextWeightPos.bottom }px`
    visualizedMarkerElement.style.left = `${markerStartPosition}px`;

}

// creating next random weight.
function createNextRandomWeight(){
    nextWeight = Math.ceil(Math.random()*10);
    nextWeightElement.innerHTML = nextWeight;
}