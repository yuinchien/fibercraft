const shaftCount = 4;
const convertColorIndex = ['a','b','c','d'];
const root = document.documentElement;

let PARAMS = {
  colorA: "#f0e130",
  colorB: "#303ff0",
  colorC: "#FF007F",
  colorD: "#444",
  wefts: 24,
  warps: 24,
  tieups: 4,
  threading: [],
  treadling: [],
  tieup: [],
  colorWefts: [],
  colorWarps: [],
  size: 20
};
const pane = new Tweakpane.Pane();
const folder = pane.addFolder({
  title: 'Settings',
});

const divThreading = document.getElementById("threading");
const divTieup = document.getElementById("tieup");
const divDrawdown= document.getElementById("drawdown");
const divTreadling = document.getElementById("treadling");
const divColorWarps = document.getElementById("colorWarps");
const divColorWefts = document.getElementById("colorWefts");
const divSwatches = document.getElementById("swatches");
let interval = null;

const createBoxes = (pattern, monochrome, className)=> {
  const parent = document.createElement("div");
  parent.className = className;
  for(let i=0; i<pattern.length; i++) {
    const box = document.createElement("div");
    if(monochrome) {
      box.className = (pattern[i]==1) ? 'box x':'box';
      box.addEventListener("click", function() {
        const sectionId = this.parentElement.parentElement.id;
        const nodes = Array.prototype.slice.call( this.parentElement.children );
        const index = nodes.indexOf(this);
        const parentIndex = this.parentElement.index;
        let value = PARAMS[sectionId][parentIndex][index];
        value = value==0 ? 1:0;
        PARAMS[sectionId][parentIndex][index] = value;
        box.className = (value==1) ? 'box x':'box';
        createDrawdown();
      });
    } else {
      box.className = 'box ' + convertColorIndex[pattern[i]];
      box.addEventListener("click", function() {
        const sectionId = this.parentElement.parentElement.id;
        const nodes = Array.prototype.slice.call( this.parentElement.children );
        const index = nodes.indexOf(this);
        let value = PARAMS[sectionId][index];
        value = (value<convertColorIndex.length-1) ? value+1 : 0;
        PARAMS[sectionId][index] = value;
        box.className = 'box ' + convertColorIndex[ value ];
        createDrawdown();
      });
    }
    parent.appendChild(box);
  }
  return parent;
}

const getLocalStorage = ()=> {
  const preset = window.localStorage.getItem('preset');
  if(preset!=null) {
    PARAMS = JSON.parse(preset);
  } else {
    for(let i=0; i<shaftCount; i++) {
      PARAMS.threading.push( Array(PARAMS.warps).fill(0) );
    }
    for(let i=0; i<PARAMS.wefts; i++) {
      PARAMS.treadling.push( Array(PARAMS.tieups).fill(0) );
    }
    for(let i=0; i<PARAMS.tieups; i++) {
      PARAMS.tieup.push( Array(shaftCount).fill(0) );
    }
    PARAMS.colorWarps = Array(PARAMS.warps).fill(0);
    PARAMS.colorWefts = Array(PARAMS.wefts).fill(1);
  }
  const inputColorA = folder.addInput(PARAMS, 'colorA');
  const inputColorB = folder.addInput(PARAMS, 'colorB');
  const inputColorC = folder.addInput(PARAMS, 'colorC');
  const inputColorD = folder.addInput(PARAMS, 'colorD');
  const inputWarps = folder.addInput(PARAMS, 'warps', {min: 10, max: 120, step: 2});
  const inputWefts = folder.addInput(PARAMS, 'wefts', {min: 10, max: 120, step: 2});
  const inputTieups = folder.addInput(PARAMS, 'tieups', {min: 4, max: 6, step: 1});
  const inputSize = folder.addInput(PARAMS, 'size',{min: 12, max: 32, step: 2});

  inputColorA.on('change', (ev) => {
    root.style.setProperty('--color-a', PARAMS.colorA);
    updateLocalStorage();
  });
  inputColorB.on('change', (ev) => {
    root.style.setProperty('--color-b', PARAMS.colorB);
    updateLocalStorage();
  });
  inputColorC.on('change', (ev) => {
    root.style.setProperty('--color-c', PARAMS.colorC);
    updateLocalStorage();
  });
  inputColorD.on('change', (ev) => {
    root.style.setProperty('--color-d', PARAMS.colorD);
    updateLocalStorage();
  });
  inputSize.on('change', (ev) => {
    root.style.setProperty('--box-size', PARAMS.size+'px');
    updateLocalStorage();
  });

  inputWarps.on('change', (ev) => {
    clearInterval(interval);
    interval = setTimeout(function(){
      const delta = ev.value - PARAMS.threading[0].length;
      console.log(delta);
      if(delta==0) { return }
      if(delta>0) {
        for(let i=0; i<PARAMS.threading.length; i++) {
          PARAMS.threading[i].push( ...Array(delta).fill(0) );
        }
        PARAMS.colorWarps.push( ...Array(delta).fill(0) );
      } else {
        for(let i=0; i<PARAMS.threading.length; i++) {
          PARAMS.threading[i].splice( PARAMS.threading[i].length+delta, -delta );
        }
        PARAMS.colorWarps.splice( PARAMS.colorWarps.length+delta, -delta );
      }
      createThreading();
      createColorWarps();
      createDrawdown();
    }, 300);
  });

  inputWefts.on('change', (ev) => {
    clearInterval(interval);
    interval = setTimeout(function(){
      const delta = ev.value - PARAMS.treadling.length;
      console.log(delta);
      if(delta==0) { return }
      if(delta>0) {
        for(let i=0; i<delta; i++) {
          PARAMS.treadling.push( Array(PARAMS.tieups).fill(0) );
        }
        PARAMS.colorWefts.push( ...Array(delta).fill(1) );
      } else {
        for(let i=0; i<Math.abs(delta); i++) {
          PARAMS.treadling.pop();
        }
        PARAMS.colorWefts.splice( PARAMS.colorWefts.length+delta, -delta );
      }
      createTreadling();
      createColorWefts();
      createDrawdown();
    }, 300);
  });

  inputTieups.on('change', (ev) => {
    clearInterval(interval);
    interval = setTimeout(function(){
      const delta = ev.value - PARAMS.tieup.length;
      if(delta==0) { return }
      if(delta>0) {
        for(let i=0; i<delta; i++) {
          PARAMS.tieup.push( Array(shaftCount).fill(0) );
        }
        for(let i=0; i<PARAMS.treadling.length; i++) {
          PARAMS.treadling[i].push( ...Array(delta).fill(0) );
        }
      } else {
        for(let i=0; i<Math.abs(delta); i++) {
          PARAMS.tieup.pop();
        }
        for(let i=0; i<PARAMS.treadling.length; i++) {
          PARAMS.treadling[i].splice( PARAMS.treadling[i].length+delta, -delta );
        }
      }
      createTieup();
      createTreadling();
      createDrawdown();
    }, 300);
  });

  root.style.setProperty('--color-a', PARAMS.colorA);
  root.style.setProperty('--color-b', PARAMS.colorB);
  root.style.setProperty('--color-c', PARAMS.colorC);
  root.style.setProperty('--color-d', PARAMS.colorD);
  root.style.setProperty('--box-size', PARAMS.size+'px');
}

const updateLocalStorage = ()=> {
  window.localStorage.setItem('preset', JSON.stringify(PARAMS));
}

const removeAllChildNodes =(parent)=> {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

const createThreading = ()=> {
  removeAllChildNodes(divThreading);
  for(let i=0; i<shaftCount; i++) {
    const div = createBoxes(PARAMS.threading[i], true, 'row reverse');
    divThreading.appendChild( div );
    div.index = i;
  }
}

const createTreadling = ()=> {
  removeAllChildNodes(divTreadling);
  for(let i=0; i<PARAMS.wefts; i++) {
    const div = createBoxes(PARAMS.treadling[i], true, 'row');
    divTreadling.appendChild( div );
    div.index = i;
  }
}

const createTieup = ()=> {
  removeAllChildNodes(divTieup);
  for(let i=0; i<PARAMS.tieups; i++) {
    const div = createBoxes(PARAMS.tieup[i], true, 'col reverse');
    divTieup.appendChild( div );
    div.index = i;
  }
}
const createDrawdown = ()=> {
  removeAllChildNodes(divDrawdown);
  for(let i=0; i<PARAMS.wefts; i++) {
    const div = createBoxes(PARAMS.threading[0], false, 'row reverse');
    divDrawdown.appendChild(div);
  }
  for(let i=0; i<PARAMS.wefts; i++) {
    const myShafts = Array( shaftCount ).fill(0);
    let flagShaftActivated = false;
    for(let j=0; j<PARAMS.treadling[i].length; j++) {
      if(PARAMS.treadling[i][j] == 1) {
        for(let k=0; k<PARAMS.tieup[j].length; k++) {
          if(PARAMS.tieup[j][k]==1) {
            myShafts[k] = 1;
            flagShaftActivated = true;
          }
        }
      }
    }
    const r = divDrawdown.childNodes[i];
    for(let j=0; j<PARAMS.warps; j++) {
      if(flagShaftActivated) {
        r.childNodes[j].className = 'box ' + convertColorIndex[ PARAMS.colorWefts[i] ];
        for(let k=0; k<shaftCount; k++) {
          if(myShafts[k]==1 && PARAMS.threading[k][j]==1 ) {
            r.childNodes[j].className = 'box ' + convertColorIndex[ PARAMS.colorWarps[j] ];
          }
        }
      } else {
        r.childNodes[j].className = 'box ' + convertColorIndex[ PARAMS.colorWarps[j] ];
      }
    }
  }
  updateLocalStorage();
}
const createColorWarps = ()=> {
  removeAllChildNodes(divColorWarps);
  divColorWarps.appendChild( createBoxes(PARAMS.colorWarps, false, 'row reverse') );
}
const createColorWefts = ()=> {
  removeAllChildNodes(divColorWefts);
  divColorWefts.appendChild( createBoxes(PARAMS.colorWefts, false, 'col') );
}
const init = ()=> {
  getLocalStorage();
  createColorWarps();
  createColorWefts();
  createThreading();
  createTreadling();
  createTieup();
  createDrawdown();
}

init();
