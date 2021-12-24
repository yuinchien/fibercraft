
class Threading {
  constructor(total) {
    this.total = total;
    this.pattern = Array(total).fill(0);
    this.div = createBoxes(this.total, true);
    this.div.className = 'row reverse';
  }
}

class Treadling {
  constructor(total) {
    this.total = total;
    this.pattern = Array(total).fill(0);
    this.div = createBoxes(this.total, true);
    this.div.className = 'row';
  }
}

class Tieup {
  constructor(total) {
    this.total = total;
    this.pattern = Array(total).fill(0);
    this.div = createBoxes(this.total, true);
    this.div.className = 'col reverse';
  }
}

const createBoxes = (total, click)=> {
  const parent = document.createElement("div");
  for(let i=0; i<total; i++) {
    const box = document.createElement("div");
    box.classList.add('box');
    if(click) {
      box.addEventListener("click", function() {
        const sectionId = this.parentElement.parentElement.id;
        const dataList = dataByName[sectionId];
        const nodes = Array.prototype.slice.call( this.parentElement.children );
        const index = nodes.indexOf(this);
        const parentIndex = this.parentElement.index;
        let value = dataList[parentIndex].pattern[index];
        value = value==0 ? 1:0;
        dataList[parentIndex].pattern[index] = value;

        if(value==1) {
          this.classList.add('x');
        } else {
          this.classList.remove('x');
        }
        updateDrawdown();
      });
    }
    parent.appendChild(box);
  }
  return parent;
}

const localStorage = window.localStorage;

let warps = [];
let wefts = [];
let threadingList = [];
let treadlingList = [];
let tieupList = [];

let shaftCount = 4;

let PARAMS = {
  colorA: "#f0e130",
  colorB: "#303ff0",
  colorC: "#FF007F",
  wefts: 24,
  warps: 24,
  tieups: 4
};
const pane = new Tweakpane.Pane();
let folder = pane.addFolder({
  title: 'Settings',
});

const dataByName = {
  'threading': threadingList,
  'treadling': treadlingList,
  'tieup': tieupList,
}

const divThreading = document.getElementById("threading");
const divTieup = document.getElementById("tieup");
const divDrawdown= document.getElementById("drawdown");
const divTreadling = document.getElementById("treadling");
const divWarps = document.getElementById("warps");
const divWefts = document.getElementById("wefts");
const divSwatches = document.getElementById("swatches");

const updateDrawdown = ()=> {
  for(let i=0; i<PARAMS.wefts; i++) {
    const myShafts = Array( shaftCount ).fill(0);

    const treadlingPattern = treadlingList[i].pattern;
    for(let j=0; j<treadlingPattern.length; j++) {
      if(treadlingPattern[j] == 1) {
        const tieupPattern = tieupList[j].pattern;
        for(let k=0; k<tieupPattern.length; k++) {
          if(tieupPattern[k]==1) {
            myShafts[k] = 1;
          }
        }
      }
    }

    const r = divDrawdown.childNodes[i];

    for(let j=0; j<PARAMS.warps; j++) {

      r.childNodes[j].style.background = getColorByIndex( wefts[i] );

      for(let k=0; k<shaftCount; k++) {
        const threadingPattern = threadingList[k].pattern;
        if(myShafts[k]==1 && threadingPattern[j]==1 ) {
          r.childNodes[j].style.background = getColorByIndex( warps[j] );
        }
      }
    }
  }
}

const getLocalStorage = () => {
  const preset = window.localStorage.getItem('preset');
  if(preset!=null) {
    PARAMS = JSON.parse(preset);
  }
  const inputColorA = folder.addInput(PARAMS, 'colorA');
  const inputColorB = folder.addInput(PARAMS, 'colorB');
  const inputColorC = folder.addInput(PARAMS, 'colorC');
  const inputWarps = folder.addInput(PARAMS, 'warps', {min: 20, max: 120, step: 2});
  const inputWefts = folder.addInput(PARAMS, 'wefts', {min: 20, max: 120, step: 2});
  const inputTieups = folder.addInput(PARAMS, 'tieups', {min: 4, max: 6, step: 1});
}

const updateLocalStorage = ()=> {

  const preset = pane.exportPreset();
  window.localStorage.setItem('preset', JSON.stringify(preset));
}

const getColorByIndex = (index)=> {
  const colors = [PARAMS.colorA, PARAMS.colorB, PARAMS.colorC];
  return colors[index];
}

const init = ()=> {
  getLocalStorage();

  const rowWarps = createBoxes(PARAMS.warps, false);
  rowWarps.className = 'row reverse';
  divWarps.appendChild(rowWarps);
  const rowWefts = createBoxes(PARAMS.wefts, false);
  rowWefts.className = 'col';
  divWefts.appendChild(rowWefts);
  for(let i=0; i<PARAMS.warps; i++) {
    warps.push( 0 );
    rowWarps.childNodes[i].style.background = PARAMS.colorA;
  }
  for(let i=0; i<PARAMS.wefts; i++) {
    wefts.push( 1 );
    rowWefts.childNodes[i].style.background = PARAMS.colorB;
  }
  for(let i=0; i<shaftCount; i++) {
    const myThreading = new Threading(PARAMS.warps);
    threadingList.push( myThreading );
    divThreading.appendChild( myThreading.div );
    myThreading.div.index = i;
  }
  for(let i=0; i<PARAMS.wefts; i++) {
    const myTreadling = new Treadling(PARAMS.tieups);
    treadlingList.push( myTreadling );
    divTreadling.appendChild(myTreadling.div);
    myTreadling.div.index = i;
  }
  for(let i=0; i<PARAMS.tieups; i++) {
    const myTieup = new Tieup(shaftCount);
    tieupList.push(myTieup);
    divTieup.appendChild(myTieup.div);
    myTieup.div.index = i;
  }

  for(let i=0; i<PARAMS.wefts; i++) {
    const row = createBoxes(PARAMS.warps, false);
    row.className = 'row reverse';
    divDrawdown.appendChild(row);
    for(let j=0; j<PARAMS.warps; j++) {
      row.childNodes[j].style.background = getColorByIndex( warps[j] );
    }
  }

  document.addEventListener("mouseup", function() {
    updateLocalStorage();
  });

}

init();
