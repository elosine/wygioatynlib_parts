//////////////////////////////////////////////////////////////////////////////////////
// GLOBAL VARIABLES ----------------------------------------------------------------//
//////////////////////////////////////////////////////////////////////////////////////
//TIMING & ANIMATION ENGINE ///////////////////////////////////////////
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
var SECPERFRAME = 1.0 / FRAMERATE;
var PXPERSEC = 150.0;
var PXPERMS = PXPERSEC / 1000.0;
var PXPERFRAME = PXPERSEC / FRAMERATE;
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
var pieceClock = 0.0;
var clockadj = 0.0;
var leadTime = 13.0;
var startTime = 0;
var played = false;
// COLORS //////////////////////////////////////////////////////////////
var clr_neonMagenta = new THREE.Color("rgb(255, 21, 160)");
var clr_seaGreen = new THREE.Color("rgb(0, 255, 108)");
var clr_neonBlue = new THREE.Color("rgb(6, 107, 225)");
var clr_forest = new THREE.Color("rgb(11, 102, 35)");
var clr_jade = new THREE.Color("rgb(0, 168, 107)");
var clr_neonGreen = new THREE.Color("rgb(57, 255, 20)");
var clr_limegreen = new THREE.Color("rgb(153, 255, 0)");
var clr_yellow = new THREE.Color("rgb(255, 255, 0)");
var clr_orange = new THREE.Color("rgb(255, 128, 0)");
var clr_red = new THREE.Color("rgb(255, 0, 0)");
var clr_purple = new THREE.Color("rgb(255, 0, 255)");
var clr_neonRed = new THREE.Color("rgb(255, 37, 2)");
var clr_safetyOrange = new THREE.Color("rgb(255, 103, 0)");
var clr_green = new THREE.Color("rgb(0, 255, 0)");
var clr_white = new THREE.Color("rgb(255, 255, 255)");
// SCENE ///////////////////////////////////////////////////////////////
var camera, scene, renderer, canvas;
//// Scene Settings ///////////////////////////////
////// Camera Position Settings //////////
var CAM_Y = 370;
var CAM_Z = 450;
var CAM_ROTATION_X = rads(-65);
////// Scene Size //////////
var SCENE_W = 1920;
var SCENE_H = 720;
// var RUNWAYLENGTH = 1070;
var RUNWAYLENGTH = 2070;
var RUNWAYLENGTH_FRAMES = RUNWAYLENGTH / PXPERFRAME;
// TRACKS ///////////////////////////////////////////////////////////////
var NUMTRACKS = 8;
var TRACK_X_OFFSET = 800;
var TRACK_Y_OFFSET = 10;
var TRACK_DIAMETER = 20;
var SPACE_BETWEEN_TRACKS = (TRACK_X_OFFSET * 2) / (NUMTRACKS - 1);
// GOFRETS //////////////////////////////////////////////////////////////
//// Beats //////////////////////////////////
var GOFRETLENGTH = 32;
var GOFRETHEIGHT = 14;
var GOFRETPOSZ = (-GOFRETLENGTH / 2) + 1;
var GOFRETWIDTH = 190;
var goFretBigAdd = 5;
var goFretGeom = new THREE.CubeGeometry(GOFRETWIDTH, GOFRETHEIGHT, GOFRETLENGTH);
var goFretGeomBig = new THREE.CubeGeometry(GOFRETWIDTH + goFretBigAdd, GOFRETHEIGHT + goFretBigAdd, GOFRETLENGTH + goFretBigAdd);
var goFrets = []; //[goFret, goFretMatl]
var goFretBlink = [];
for (var i = 0; i < NUMTRACKS; i++) {
  goFretBlink.push(0);
}
var stopGoFretBlink = [];
for (var i = 0; i < NUMTRACKS; i++) {
  stopGoFretBlink.push(0);
}
//// Events //////////////////////////////////
var EVENTGOFRETLENGTH = 34;
var EVENTGOFRETHEIGHT = 21;
var EVENTGOFRETPOSZ = (-EVENTGOFRETLENGTH / 2) + 2;
var EVENTGOFRETWIDTH = 70;
var eventGoFretBigAdd = 7;
var eventGoFretGeom = new THREE.CubeGeometry(EVENTGOFRETWIDTH, EVENTGOFRETHEIGHT, EVENTGOFRETLENGTH);
var eventGoFretGeomBig = new THREE.CubeGeometry(EVENTGOFRETWIDTH + eventGoFretBigAdd, EVENTGOFRETHEIGHT + eventGoFretBigAdd, EVENTGOFRETLENGTH + eventGoFretBigAdd);
var eventGoFrets = []; //[goFret, goFretMatl]
var eventGoFretBlink = [];
for (var i = 0; i < NUMTRACKS; i++) {
  eventGoFretBlink.push(0);
}
// NOTATION SVGS /////////////////////////////////////////////////////////
var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_XLINK = 'http://www.w3.org/1999/xlink';
var notationContainers = [];
var notationContainerDOMs = [];
var NOTATION_CONTAINER_H = 350.0;
var dictOfNotationSVGsByPart = {};
var currentNotationById = [];
// EVENTS ////////////////////////////////////////////////////////////////
var eventMatrix = [];
//// Beat Markers //////////////////////////////////
var beatMarkerGeom = new THREE.CubeGeometry(GOFRETWIDTH + 2, GOFRETHEIGHT + 2, GOFRETLENGTH + 2);
//// Pitches //////////////////////////////////
var pitchMarkerGeom = new THREE.CubeGeometry(GOFRETWIDTH - 20, GOFRETHEIGHT + 6, 8);
var currentPitchesById = [];
var dictOfPitchSVGsByPart = {};
// CURVE FOLLOWERS /////////////////////////////////////////////////////////
var cresCrvRects = [];
var cresSvgCrvs = [];
var cresCrvFollowers = [];
var cresCrvCoords;
var crvFollowData = [];
var notationCanvasH;
///////////////////////////////////////////////////////////////////////////////////////////////////
// FACTORY --------------------------------------------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTION: onstartup --------------------------------------------------------------- //
function onstartup() {
  var startButton = document.getElementById("startButton");
  startButton.addEventListener("click", init);
}
// FUNCTION: init --------------------------------------------------------------- //
function init() {
  if (!played) {
    played = true;
    startButton.parentNode.removeChild(startButton);
    createScene();
    // eventMatrix = createEvents(); //startPiece trigger at end of this function
  }
}
// FUNCTION: startPiece --------------------------------------------------------------- //
function startPiece() {
  createScene();
  requestAnimationFrame(animationEngine);
}
// FUNCTION: createScene ------------------------------------------------------------- //
function createScene() {
  // CAMERA //////////////////////////////////////////////////////////////////
  camera = new THREE.PerspectiveCamera(75, SCENE_W / SCENE_H, 1, 3000);
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.rotation.x = rads(CAM_ROTATION_X);
  // SCENE ///////////////////////////////////////////////////////////////////
  scene = new THREE.Scene();
  // LIGHTS //////////////////////////////////////////////////////////////////
  var sun = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  sun.position.set(100, 600, 175);
  scene.add(sun);
  var sun2 = new THREE.DirectionalLight(0x40A040, 0.6);
  sun2.position.set(-100, 350, 200);
  scene.add(sun2);
  // RENDERER ////////////////////////////////////////////////////////////////
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(SCENE_W, SCENE_H);
  canvas = document.getElementById('runway');
  canvas.appendChild(renderer.domElement);
  // RUNWAY //////////////////////////////////////////////////////////////////
  var runwayMatl =
    new THREE.MeshLambertMaterial({
      color: 0x0040C0
    });
  var runwayGeom = new THREE.PlaneGeometry(
    SCENE_W,
    RUNWAYLENGTH,
  );
  var runway = new THREE.Mesh(runwayGeom, runwayMatl);
  runway.position.z = -RUNWAYLENGTH / 2;
  runway.rotation.x = rads(-90);
  scene.add(runway);
  // TRACKS //////////////////////////////////////////////////////////////////////////////////////
  var trgeom = new THREE.CylinderGeometry(TRACK_DIAMETER, TRACK_DIAMETER, RUNWAYLENGTH, 32);
  var trmatl = new THREE.MeshLambertMaterial({
    color: 0x708090
  });
  for (var i = 0; i < NUMTRACKS; i++) {
    var tTr = new THREE.Mesh(trgeom, trmatl);
    tTr.rotation.x = rads(-90);
    tTr.position.z = -(RUNWAYLENGTH / 2);
    tTr.position.y = (-TRACK_DIAMETER / 2) + TRACK_Y_OFFSET;
    tTr.position.x = -TRACK_X_OFFSET + (SPACE_BETWEEN_TRACKS * i);
    scene.add(tTr);
    // GO FRETS ////////////////////////////////////////////////////////////////////////////
    //// BEATS ////////////////////////////////////////
    var tGoFretSet = [];
    var goFretMatl = new THREE.MeshLambertMaterial({
      color: clr_neonGreen
    });
    tGoFret = new THREE.Mesh(goFretGeom, goFretMatl);
    tGoFret.position.z = GOFRETPOSZ;
    tGoFret.position.y = GOFRETHEIGHT;
    var tTrackXpos = -TRACK_X_OFFSET + (SPACE_BETWEEN_TRACKS * i);
    tGoFret.position.x = tTrackXpos;
    scene.add(tGoFret);
    tGoFretSet.push(tGoFret);
    tGoFretSet.push(goFretMatl);
    goFrets.push(tGoFretSet);
    //// EVENTS ///////////////////////////////////////
    var t_eventGoFretSet = [];
    var t_eventGoFretMatl = new THREE.MeshLambertMaterial({
      color: clr_yellow
    });
    t_eventGoFret = new THREE.Mesh(eventGoFretGeom, t_eventGoFretMatl);
    t_eventGoFret.position.z = EVENTGOFRETPOSZ;
    t_eventGoFret.position.y = EVENTGOFRETHEIGHT;
    t_eventGoFret.position.x = tTrackXpos; //see beats
    scene.add(t_eventGoFret);
    t_eventGoFretSet.push(t_eventGoFret);
    t_eventGoFretSet.push(t_eventGoFretMatl);
    eventGoFrets.push(t_eventGoFretSet);
    // NOTATION CONTAINERS ///////////////////////////////////////////////
    var tcont = document.getElementById("notationContainersOuterDiv");
    var tsvgCanvas = document.createElementNS(SVG_NS, "svg");
    tsvgCanvas.setAttributeNS(null, "width", GOFRETWIDTH.toString());
    tsvgCanvas.setAttributeNS(null, "height", NOTATION_CONTAINER_H.toString());
    tsvgCanvas.setAttributeNS(null, "id", "notationSVGcont" + i.toString());
    var trMargin = 41;
    var ttrgap = 45;
    var txloc = (ttrgap * i) + trMargin;
    tsvgCanvas.setAttributeNS(null, "transform", "translate(" + txloc.toString() + ", 0)");
    tsvgCanvas.setAttributeNS(null, "class", "notationCanvas");
    tsvgCanvas.style.backgroundColor = "white";
    tcont.appendChild(tsvgCanvas);
    notationContainers.push(tsvgCanvas);
  }
  for (var i = 0; i < notationContainers.length; i++) {
    notationContainerDOMs.push(document.getElementById(notationContainers[i].id));
  }
  // MAKE ALL NOTATION SVGS /////////////////////////////////////////////////////////////
  var notationCont_boundingBox = notationContainers[0].getBoundingClientRect();
  var notationContW = notationCont_boundingBox.width;
  var notationContH = notationCont_boundingBox.height;
  notationCanvasH = notationContH * 0.6666666667;
  var notationContCenterX = notationContW / 2;
  var notationContCenterY = notationContH / 2;
  for (const [key, value] of Object.entries(notationElementDictByElementByPart)) {
    var t_notationSVGs = [];
    for (var j = 0; j < value.length; j++) {
      var t_notationSVG = document.createElementNS(SVG_NS, "image");
      t_notationSVG.setAttributeNS(SVG_XLINK, 'xlink:href', value[j]);
      t_notationSVG.setAttributeNS(null, 'width', notationContW.toString());
      var t_svgH = notationContH * 0.6666666667;
      t_notationSVG.setAttributeNS(null, 'height', t_svgH.toString());
      t_notationSVG.setAttributeNS(null, "transform", "translate( 0, 5)");
      t_notationSVG.setAttributeNS(null, "id", key + j.toString());
      t_notationSVG.setAttributeNS(null, 'visibility', 'visible');
      t_notationSVGs.push(t_notationSVG);
    }
    dictOfNotationSVGsByPart[key] = t_notationSVGs;
  }
  // DRAW INITIAL NOTATION FOR EACH TRACK
  for (var i = 0; i < NUMTRACKS; i++) {
    var t_img = dictOfNotationSVGsByPart["pulseTrack"][i];
    notationContainerDOMs[i].appendChild(t_img);
    currentNotationById.push(t_img.id);
  }
  // PITCHES SVGS ///////////////////////////////////////////////////////////
  for (const [key, value] of Object.entries(pitchSetDictByPSByPart)) {
    var t_notationSVGs = [];
    for (var j = 0; j < value.length; j++) {
      var t_notationSVG = document.createElementNS(SVG_NS, "image");
      t_notationSVG.setAttributeNS(SVG_XLINK, 'xlink:href', value[j][1]);
      t_notationSVGw = notationContW.toString() * 0.5;
      t_notationSVG.setAttributeNS(null, 'width', t_notationSVGw.toString());
      var t_svgH = notationContH * 0.3333333;
      t_notationSVG.setAttributeNS(null, 'height', t_svgH.toString());
      var t_pitchX = notationContCenterX - (t_notationSVGw / 2);
      var t_pitchY = notationContH * 0.67;
      t_notationSVG.setAttributeNS(null, "transform", "translate(" + t_pitchX.toString() + "," + t_pitchY.toString() + ")");
      t_notationSVG.setAttributeNS(null, "id", key + j.toString());
      t_notationSVG.setAttributeNS(null, 'visibility', 'visible');
      t_notationSVGs.push(t_notationSVG);
    }
    dictOfPitchSVGsByPart[key] = t_notationSVGs;
  }
  // DRAW INITIAL PITCHES FOR EACH TRACK
  for (var i = 0; i < NUMTRACKS; i++) {
    var t_img = dictOfPitchSVGsByPart[pitchSets[0]][i];
    notationContainerDOMs[i].appendChild(t_img);
    currentPitchesById.push(t_img.id);
  }
  // CURVES  ///////////////////////////////////////////////////////////
  cresCrvCoords = plot(function(x) {
    return Math.pow(x, 3);
  }, [0, 1, 0, 1], notationContW, notationContH * 0.6666666667);
  for (var i = 0; i < NUMTRACKS; i++) {
    //// CURVE FOLLOW RECTS ////////////////////////////////////////
    var tcresFollowRect = document.createElementNS(SVG_NS, "rect");
    tcresFollowRect.setAttributeNS(null, "x", "0");
    tcresFollowRect.setAttributeNS(null, "y", "0");
    tcresFollowRect.setAttributeNS(null, "width", notationContW.toString());
    tcresFollowRect.setAttributeNS(null, "height", "0");
    tcresFollowRect.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
    tcresFollowRect.setAttributeNS(null, "id", "cresFollowRect" + i.toString());
    tcresFollowRect.setAttributeNS(null, "transform", "translate( 0, -3)");
    tcresFollowRect.setAttributeNS(null, 'visibility', 'hidden');
    notationContainerDOMs[i].appendChild(tcresFollowRect);
    cresCrvRects.push(tcresFollowRect);
    //// CURVES ////
    var tcresSvgCrv = document.createElementNS(SVG_NS, "path");
    var tpathstr = "";
    for (var j = 0; j < cresCrvCoords.length; j++) {
      if (j == 0) {
        tpathstr = tpathstr + "M" + cresCrvCoords[j].x.toString() + " " + cresCrvCoords[j].y.toString() + " ";
      } else {
        tpathstr = tpathstr + "L" + cresCrvCoords[j].x.toString() + " " + cresCrvCoords[j].y.toString() + " ";
      }
    }
    tcresSvgCrv.setAttributeNS(null, "d", tpathstr);
    tcresSvgCrv.setAttributeNS(null, "stroke", "rgba(255, 21, 160, 0.5)");
    tcresSvgCrv.setAttributeNS(null, "stroke-width", "4");
    tcresSvgCrv.setAttributeNS(null, "fill", "none");
    tcresSvgCrv.setAttributeNS(null, "id", "cresCrv" + i.toString());
    tcresSvgCrv.setAttributeNS(null, "transform", "translate( 0, -3)");
    tcresSvgCrv.setAttributeNS(null, 'visibility', 'hidden');
    notationContainerDOMs[i].appendChild(tcresSvgCrv);
    cresSvgCrvs.push(tcresSvgCrv);
    // CURVE FOLLOWERS
    var tcresSvgCirc = document.createElementNS(SVG_NS, "circle");
    tcresSvgCirc.setAttributeNS(null, "cx", cresCrvCoords[0].x.toString());
    tcresSvgCirc.setAttributeNS(null, "cy", cresCrvCoords[0].y.toString());
    tcresSvgCirc.setAttributeNS(null, "r", "10");
    tcresSvgCirc.setAttributeNS(null, "stroke", "none");
    tcresSvgCirc.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
    tcresSvgCirc.setAttributeNS(null, "id", "cresCrvCirc" + i.toString());
    tcresSvgCirc.setAttributeNS(null, "transform", "translate( 0, -3)");
    tcresSvgCirc.setAttributeNS(null, 'visibility', 'hidden');
    notationContainerDOMs[i].appendChild(tcresSvgCirc);
    cresCrvFollowers.push(tcresSvgCirc);
    //Make FOLLOWERS
    crvFollowData.push(0.0);
  }





  // FOR FRAME BY FRAME TESTS -------------------------------------------- //
  // document.addEventListener('keydown', function(event) {
  //   if (event.code == 'KeyA') {
  //     fbf()
  //   }
  // });
  // function fbf() {
  //   update(MSPERFRAME);
  //   // draw();
  // }
  // RENDER ///////////////////////////////////////////////
  // var helper = new THREE.CameraHelper(camera);
  // scene.add(helper);
  renderer.render(scene, camera);
}
// FUNCTION: animationEngine --------------------------------------------------------- //
function animationEngine(timestamp) {
  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;
  while (delta >= MSPERFRAME) {
    update(MSPERFRAME);
    // draw();
    delta -= MSPERFRAME;
  }
  requestAnimationFrame(animationEngine);
}
// UPDATE ---------------------------------------------------------------------------- //
function update(aMSPERFRAME) {
  // CLOCK ////////////////////////////////////////////////////////////////////////////
  framect++;
  pieceClock += aMSPERFRAME;
  pieceClock = pieceClock - clockadj;
  // EVENTS ///////////////////////////////////////////////////////////////////////////
  //// [ t_goFrame, t_playerNum, drawEventGate, t_eventType, t_mesh, t_goTime, t_startZ, t_eventSpecificData, t_endFrame ]
  for (var i = 0; i < eventMatrix.length; i++) {
    var t_goFrame = eventMatrix[i][0];
    var t_endFrame = eventMatrix[i][8];
    var t_mesh = eventMatrix[i][4];
    // Advance EVENT MESH
    t_mesh.position.z += PXPERFRAME;
    //// Only look at events if they are on the scene
    if (t_goFrame <= (framect + RUNWAYLENGTH_FRAMES) && t_endFrame >= framect) {
      var t_playerNum = eventMatrix[i][1];
      var t_eventRenderGate = eventMatrix[i][2];
      var t_eventType = eventMatrix[i][3];
      var t_eventSpecificData = eventMatrix[i][7];
      // Add Event Mesh to Scene
      if (t_eventRenderGate) {
        eventMatrix[i][2] = false;
        scene.add(t_mesh);
      }
      //// GO FRAME ACTIONS /////////////////////////////////////////////////////////////////////////
      if (framect == t_goFrame) {
        switch (t_eventType) {
          case 4: // Cres
            goFretBlink[t_playerNum] = framect + 11;
            cresSvgCrvs[t_playerNum].setAttributeNS(null, "visibility", "visible");
            cresCrvFollowers[t_playerNum].setAttributeNS(null, "visibility", "visible");
            cresCrvRects[t_playerNum].setAttributeNS(null, "visibility", "visible");
            break;
          default:
        }
      }

      //// UPDATES ////////////////////////////////////////////////////////////////////////////////////
      if (framect > t_goFrame && framect < t_endFrame) {
        switch (t_eventType) {
          case 4: // Cres
            crvFollowData[t_playerNum] = Math.floor(scale(framect, t_goFrame, t_endFrame, 0, cresCrvCoords.length));
            cresCrvFollowers[t_playerNum].setAttributeNS(null, "cx", cresCrvCoords[crvFollowData[t_playerNum]].x.toString());
            cresCrvFollowers[t_playerNum].setAttributeNS(null, "cy", cresCrvCoords[crvFollowData[t_playerNum]].y.toString());
            var temph = notationCanvasH - cresCrvCoords[crvFollowData[t_playerNum]].y;
            cresCrvRects[t_playerNum].setAttributeNS(null, "y", cresCrvCoords[crvFollowData[t_playerNum]].y.toString());
            cresCrvRects[t_playerNum].setAttributeNS(null, "height", temph.toString());
            break;
          default:
        }
      }

      //// END FRAME ACTIONS /////////////////////////////////////////////////////////////////////////
      if (framect == t_endFrame) {
        switch (t_eventType) {
          case 0: //beats
            goFretBlink[t_playerNum] = framect + 11;
            break;
          case 1: // Notation events
            eventGoFretBlink[t_playerNum] = framect + 11;
            //REMOVE PREVIOUS Notation
            var t_oldNotationId = document.getElementById(currentNotationById[t_playerNum]);
            if (t_oldNotationId != null) {
              notationContainerDOMs[t_playerNum].removeChild(t_oldNotationId);
            }
            //Add New Notation
            var t_img = dictOfNotationSVGsByPart[t_eventSpecificData][t_playerNum];
            notationContainerDOMs[t_playerNum].appendChild(t_img);
            currentNotationById[t_playerNum] = t_img.id;
            break;
          case 2: // pitches
            //REMOVE PREVIOUS Pitches
            var t_oldNotationId = document.getElementById(currentPitchesById[t_playerNum]);
            if (t_oldNotationId != null) {
              notationContainerDOMs[t_playerNum].removeChild(t_oldNotationId);
            }
            //Add New Pitches
            var t_img = dictOfPitchSVGsByPart[t_eventSpecificData][t_playerNum];
            notationContainerDOMs[t_playerNum].appendChild(t_img);
            currentPitchesById[t_playerNum] = t_img.id;
            break;
          case 3: // Stop
            stopGoFretBlink[t_playerNum] = framect + 11;
            break;
          case 4: // Cres
            crvFollowData[t_playerNum][0] = false;
            cresSvgCrvs[t_playerNum].setAttributeNS(null, "visibility", "hidden");
            cresCrvFollowers[t_playerNum].setAttributeNS(null, "visibility", "hidden");
            cresCrvRects[t_playerNum].setAttributeNS(null, "visibility", "hidden");
            break;
          default:
        }
        scene.remove(scene.getObjectByName(t_mesh.name));
      }
    }
  }
  //// BLINK TIMERS ////////////////////////////////////////////////////////
  ////// Beats //////////////////////////////////////////
  for (var i = 0; i < goFretBlink.length; i++) {
    if (framect <= goFretBlink[i]) {
      goFrets[i][0].material.color = clr_safetyOrange;
      goFrets[i][0].geometry = goFretGeomBig;
    } else {
      goFrets[i][0].material.color = clr_neonGreen;
      goFrets[i][0].geometry = goFretGeom;
    }
  }
  ////// Events //////////////////////////////////////////
  for (var i = 0; i < eventGoFretBlink.length; i++) {
    if (framect <= eventGoFretBlink[i]) {
      eventGoFrets[i][0].material.color = clr_neonRed;
      eventGoFrets[i][0].geometry = eventGoFretGeomBig;
    } else {
      eventGoFrets[i][0].material.color = clr_yellow;
      eventGoFrets[i][0].geometry = eventGoFretGeom;
    }
  }
  ////// Stop //////////////////////////////////////////
  for (var i = 0; i < stopGoFretBlink.length; i++) {
    if (framect <= stopGoFretBlink[i]) {
      goFrets[i][0].material.color = clr_red;
      goFrets[i][0].geometry = goFretGeomBig;
    }
  }
  // RENDER EACH FRAME ////////////////////////////////////
  renderer.render(scene, camera);
}
///////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS ------------------------------------------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTION: createEvents ----------------------------------------------- //
function createEvents() {
  ////// [0]oboe, [1]Violin,  [2]Piano, [3]Perc, [4]Viola, [5]Trombone, [6]Bass Clarinet, [7]Cello
  // [ goTime, playerNum, eventType, eventSpecificData]  // EVENT TYPES: 0-beat; 1-notation; 2-pitch;
  var t_eventMatrix = [];
  var t_eventIx = 0;
  for (var i = 0; i < eventSet.length; i++) {
    var t_goTime = eventSet[i][0];
    t_goTime = t_goTime + leadTime;
    t_goTime = t_goTime - startTime;
    var t_playerNum = eventSet[i][1];
    var t_numPxTilGo = t_goTime * PXPERSEC;
    var t_startZ = GOFRETPOSZ - t_numPxTilGo;
    var t_goFrame = Math.round(t_numPxTilGo / PXPERFRAME);
    var t_endFrame = t_goFrame;
    var t_eventType = eventSet[i][2];
    var t_eventSpecificData = eventSet[i][3];
    ////////////////////////////////////////////////////////////////////////////
    //// ------ Switch on eventType: eventSet[i][j][1] -----------------------//
    ////////////////////////////////////////////////////////////////////////////
    switch (t_eventType) {
      case 0: // beats ---------------------------------------------------------------------
        var t_beatMarkerMatl = new THREE.MeshLambertMaterial({
          color: clr_neonMagenta
        });
        var t_mesh = new THREE.Mesh(beatMarkerGeom, t_beatMarkerMatl);
        t_mesh.position.z = t_startZ;
        t_mesh.position.y = GOFRETHEIGHT;
        t_mesh.position.x = -TRACK_X_OFFSET + (SPACE_BETWEEN_TRACKS * t_playerNum);
        t_mesh.name = t_eventIx + "_beat";
        break;
      case 1: // Notation Events ------------------------------------------------------------------
        var t_eventMarkerMatl = new THREE.MeshLambertMaterial({
          color: clr_seaGreen
        });
        var t_mesh = new THREE.Mesh(eventGoFretGeom, t_eventMarkerMatl);
        t_mesh.position.z = t_startZ;
        t_mesh.position.y = EVENTGOFRETHEIGHT;
        t_mesh.position.x = -TRACK_X_OFFSET + (SPACE_BETWEEN_TRACKS * t_playerNum);
        t_mesh.name = t_eventIx + "_notationevent";
        break;
      case 2: // Pitches ---------------------------------------------------------------------
        var t_pitchesMarkerMatl = new THREE.MeshLambertMaterial({
          color: clr_white
        });
        var t_mesh = new THREE.Mesh(pitchMarkerGeom, t_pitchesMarkerMatl);
        t_mesh.position.z = t_startZ;
        t_mesh.position.y = EVENTGOFRETHEIGHT;
        t_mesh.position.x = -TRACK_X_OFFSET + (SPACE_BETWEEN_TRACKS * t_playerNum);
        t_mesh.name = t_eventIx + "_pitch";
        break;
      case 3: // Stop ---------------------------------------------------------------------
        var t_stopMarkerMatl = new THREE.MeshLambertMaterial({
          color: clr_neonRed
        });
        var t_mesh = new THREE.Mesh(beatMarkerGeom, t_stopMarkerMatl);
        t_mesh.position.z = t_startZ;
        t_mesh.position.y = EVENTGOFRETHEIGHT;
        t_mesh.position.x = -TRACK_X_OFFSET + (SPACE_BETWEEN_TRACKS * t_playerNum);
        t_mesh.name = t_eventIx + "_stop";
        break;
      case 4: // Cres ---------------------------------------------------------------------
        var t_cresDur = t_eventSpecificData;
        var t_cresEventLength = t_cresDur * PXPERSEC;
        var t_cresEventGeom = new THREE.CubeGeometry(50, GOFRETHEIGHT + 5, t_cresEventLength);
        var t_stopMarkerMatl = new THREE.MeshLambertMaterial({
          color: clr_purple
        });
        var t_mesh = new THREE.Mesh(t_cresEventGeom, t_stopMarkerMatl);
        t_mesh.position.z = t_startZ - (t_cresEventLength / 2.0);
        t_mesh.position.y = GOFRETHEIGHT;
        t_mesh.position.x = -TRACK_X_OFFSET + (SPACE_BETWEEN_TRACKS * t_playerNum);
        t_mesh.name = t_eventIx + "_cres";
        t_endFrame = t_goFrame + Math.round(t_cresDur * FRAMERATE);
        break;
      default:
    }
    t_eventIx++;
    var t_singleEventDataArray = [t_goFrame, t_playerNum, true, t_eventType, t_mesh, t_goTime, t_startZ, t_eventSpecificData, t_endFrame];
    t_eventMatrix.push(t_singleEventDataArray);
  }
  startPiece();
  return t_eventMatrix;
}
