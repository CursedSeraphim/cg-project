'use strict';

var gl = null;
const camera = {
  rotation: {
    x: 0,
    y: 0
  },
  movement: {
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0
  }
};

/*camera position vector*/
var cameraPosition;

//manual camera control switch
var fov = 30;
var manualCameraEnabled;
var startTime;
var lastRenderTime;

//used for camera rotation at the end
var turned = 0;
var deathRoll = 0;
var upX = 0;
var upY = 1;
var upZ = 0;

//used for waiting between camera movements
var waitingSince;
var waitingFor;

//matrix used to have camera look at specific points during the automated camera flight
var firstFrame = 1;
var autoCameraLookAt;
var MovementHeadBobbing = 1;
var movementSpeedModifier = 1;

//scene graph nodes
var root = null;
var lightingNodes;
var translateLantern;
var b2fNodes;
var orcShamanSGNode;
var andarielSGNode;
var lanternSGNode;
var swordSGNode;
var swordToggleNode;
var swordParent;
var stabbed = 0;
var swordWaypointIndex = 0;
var youDiedSGNode;
var bloodPosSGNode;
var bloodParticle;

//spider (compex model) scene graph nodes
var spiderAbdomenSGNode;
var spiderHeadSGNode;
var spiderRightFrontLegSGNode;
var spiderRightFrontLeg2SGNode;
var spiderRightHindLegSGNode;
var spiderRightHindLeg2SGNode;
var spiderRightPincerSGNode;
var spiderLeftFrontLegSGNode;
var spiderLeftFrontLeg2SGNode;
var spiderLeftHindLegSGNode;
var spiderLeftHindLeg2SGNode;
var spiderLeftPincerSGNode;
var spiderTransformationNode;
var spiderAndBillBoardNode;
var spiderMovementSet1SGNode;
var spiderMovementSet2SGNode;
var spiderStartingPosition;
//spellParticle
var spellParentNode;
var spellSGNode;
var spellLightNode;
var spellParticle;
var fireSpellVolley = 0;
//diamond transformation
var diamondRotateNode;
var diamondTransformationNode;
var diamondUpDownNode;

//used for spell
var spellWayPointIndex = -1;
var spellWayPoints;

//activates spider animation and activates waypoint movement toward camera
var spiderMoving = 0;

//waypoints
var cameraWaypoints;
var cameraWaypoints2;
var cameraWaypointIndex;
var cameraWaypointIndex2;
var lookAtWaypoints;
var lookAtWaypoints2;
var lookAtWaypoints3;
var lookAtWaypoints4;
var lookAtWaypoints5;
var lookAtWaypoints6;
var lookAtWaypoints7;
var lookAtWaypointIndex;
var lookAtWaypointIndex2;
var lookAtWaypointIndex3;
var lookAtWaypointIndex4;
var lookAtWaypointIndex5;
var lookAtWaypointIndex6;
var lookAtWaypointIndex7;
var orcShamanWaypoints;
var orcShamanWaypointIndex;
var spiderWaypointIndex;
var spiderWaypoints;

/*Shader Programs*/
var particleShaderProgram;
var simpleShaderProgram;

//textures
var floorTextureNode;
var cobbleTextureNode;
var web1TextureNode;
var dreughTextureNode;
var orcShamanTextureNode;
var durielTextureNode;
var andarielTextureNode;
var metalTextureNode;
var metalTextureNode2;
var pentagramTextureNode;
var stainedGlassTextureNode;
var gridTextureNode;
var glassTextureNode;
var spikedBarsTextureNode;
var skyTextureNode;
var imSoHipTextureNode;
var skullTextureNode;
var boneTextureNode;
var bone2TextureNode;
var ribCageTextureNode;
var bones1TextureNode;
var bones2TextureNode;
var skullPile1TextureNode;
var spiderTextureNode1;
var spiderTextureNode2;
var spiderTextureNode3;
var spiderTextureNode4;
var spiderTextureNode5;
var spiderTextureNode6;
var spiderTextureNode7;
var spiderTextureNode8;
var spiderTextureNode9;
var swordTextureNode;
var youDiedTextureNode;

var crownTextureNode;
var crystalSwordTextureNode;
var blueJewelTextureNode;
var maskTextureNode;
var rubyTextureNode;
var emeraldTextureNode;
var tiaraTextureNode;
var goldSkinTextureNode;
var tridentTextureNode;
var goldPile1TextureNode;
var goldPile2TextureNode;
var goldPile3TextureNode;
var goldPile4TextureNode;
var goldPile5TextureNode;

var diamondTextureNode;
var nightSkyTextureNode;

//texture arrays
var dreughFrames;
var orcShamanFrames;
var durielFrames;
var andarielFrames;

var bobbSpeed = 75;
var bobbHeight = 25;

//load the required resources using a utility function
loadResources({
  vs_lighting: 'shader/lighting.vs.glsl',
  fs_lighting: 'shader/lighting.fs.glsl',
  vs_simple: 'shader/simple.vs.glsl',
  fs_simple: 'shader/simple.fs.glsl',
  vs_particle:  'shader/particle.vs.glsl',
  fs_particle:  'shader/particle.fs.glsl',

  modelMapCobble: 'models/MapCobble.obj',
  modelMapFloor: 'models/MapFloor.obj',
  modelMapSpikedBars: 'models/MapSpikedBars.obj',
  modelMapSky: 'models/MapSky.obj',
  modelMapTorches: 'models/MapTorches.obj',
  modelMapGlass: 'models/MapGlass.obj',
  modelMapPentagram: 'models/MapPentagram.obj',
  modelMapWebs: 'models/MapWebs.obj',
  modelLanternMetal: 'models/lantern_metal.obj',
  modelLanternGlass: 'models/lantern_glass.obj',
  modelLanternGrid: 'models/lantern_grid.obj',
  //spider parts
  modelSpiderAbdomen: 'models/spider/black_widow_abdomen.obj',
  modelSpiderHead: 'models/spider/black_widow_torso_and_head.obj',
  modelSpiderRightFrontLeg: 'models/spider/black_widow_right_front_leg.obj',
  modelSpiderRightFrontLeg2: 'models/spider/black_widow_right_front_leg_2.obj',
  modelSpiderRightHindLeg: 'models/spider/black_widow_right_hind_leg.obj',
  modelSpiderRightHindLeg2: 'models/spider/black_widow_right_hind_leg_2.obj',
  modelSpiderRightPincer: 'models/spider/black_widow_right_pincer.obj',
  modelSpiderLeftFrontLeg: 'models/spider/black_widow_Left_front_leg.obj',
  modelSpiderLeftFrontLeg2: 'models/spider/black_widow_Left_front_leg_2.obj',
  modelSpiderLeftHindLeg: 'models/spider/black_widow_Left_hind_leg.obj',
  modelSpiderLeftHindLeg2: 'models/spider/black_widow_Left_hind_leg_2.obj',
  modelSpiderLeftPincer: 'models/spider/black_widow_Left_pincer.obj',

  WebTexture1: 'textures/cobwebs/web.png',
  floorTexture: 'textures/dungeon/floor_cobble.jpg',
  cobbleTexture: 'textures/dungeon/dungeon_wall.png',
  metalTexture: 'textures/metal/metal_32.png',//metal.png',
  glassTexture: 'textures/glass/glass.png',//glass_64.png',
  stainedGlassTexture: 'textures/glass/stainedGlass.png',
  gridTexture: 'textures/metal/bars.png',
  skyTexture: 'textures/sky/sky.png',
  spikedBarsTexture: 'textures/metal/spiked_bars.png',
  hipBoneTexture: 'textures/bones/imsohip.png',
  ribCageTexture: 'textures/bones/ribCage.png',
  skullTexture: 'textures/bones/skull.png',
  boneTexture: 'textures/bones/bone.png',
  bones1Texture: 'textures/bones/bones1.png',
  skullPileTexture: 'textures/bones/skullPile.png',
  pentagramTexture: 'textures/misc/pentagram.png',
  spiderTexture: 'textures/spider/spider.png',
  swordTexture: 'textures/misc/bloody_sword.png',
  youDiedTexture: 'textures/misc/youdied.png',

  crownTexture: 'textures/treasure/crown.png',
  crystalSwordTexture: 'textures/treasure/crystal_sword.png',
  blueJewelTexture: 'textures/treasure/jewel_blue.png',
  maskTexture: 'textures/treasure/mask.png',
  rubyTexture: 'textures/treasure/ruby.png',
  emeraldTexture: 'textures/treasure/emerald.png',
  tiaraTexture: 'textures/treasure/tiara.png',
  goldSkinTexture: 'textures/treasure/goldskin.png',
  tridentTexture: 'textures/treasure/trident.png',
  goldPileTexture: 'textures/treasure/goldPile.png',

  andarielFrame1: 'textures/andariel/andariel (1).gif',
  andarielFrame2: 'textures/andariel/andariel (2).gif',
  andarielFrame3: 'textures/andariel/andariel (3).gif',
  andarielFrame4: 'textures/andariel/andariel (4).gif',
  andarielFrame5: 'textures/andariel/andariel (5).gif',
  andarielFrame6: 'textures/andariel/andariel (6).gif',
  andarielFrame7: 'textures/andariel/andariel (7).gif',
  andarielFrame8: 'textures/andariel/andariel (8).gif',
  andarielFrame9: 'textures/andariel/andariel (9).gif',
  andarielFrame10: 'textures/andariel/andariel (10).gif',
  andarielFrame11: 'textures/andariel/andariel (11).gif',
  andarielFrame12: 'textures/andariel/andariel (12).gif',
  andarielFrame13: 'textures/andariel/andariel (13).gif',
  andarielFrame14: 'textures/andariel/andariel (14).gif',
  andarielFrame15: 'textures/andariel/andariel (15).gif',
  andarielFrame16: 'textures/andariel/andariel (16).gif',

  durielFrame1: 'textures/duriel/duriel (1).gif',
durielFrame2: 'textures/duriel/duriel (2).gif',
durielFrame3: 'textures/duriel/duriel (3).gif',
durielFrame4: 'textures/duriel/duriel (4).gif',
durielFrame5: 'textures/duriel/duriel (5).gif',
durielFrame6: 'textures/duriel/duriel (6).gif',
durielFrame7: 'textures/duriel/duriel (7).gif',
durielFrame8: 'textures/duriel/duriel (8).gif',
durielFrame9: 'textures/duriel/duriel (9).gif',
durielFrame10: 'textures/duriel/duriel (10).gif',
durielFrame11: 'textures/duriel/duriel (11).gif',
durielFrame12: 'textures/duriel/duriel (12).gif',

  dreughFrame1: 'textures/dreugh/dreugh (1).gif',
dreughFrame2: 'textures/dreugh/dreugh (2).gif',
dreughFrame3: 'textures/dreugh/dreugh (3).gif',
dreughFrame4: 'textures/dreugh/dreugh (4).gif',
dreughFrame5: 'textures/dreugh/dreugh (5).gif',
dreughFrame6: 'textures/dreugh/dreugh (6).gif',
dreughFrame7: 'textures/dreugh/dreugh (7).gif',
dreughFrame8: 'textures/dreugh/dreugh (8).gif',
dreughFrame9: 'textures/dreugh/dreugh (9).gif',
dreughFrame10: 'textures/dreugh/dreugh (10).gif',
dreughFrame11: 'textures/dreugh/dreugh (11).gif',
dreughFrame12: 'textures/dreugh/dreugh (12).gif',
dreughFrame13: 'textures/dreugh/dreugh (13).gif',
dreughFrame14: 'textures/dreugh/dreugh (14).gif',
dreughFrame15: 'textures/dreugh/dreugh (15).gif',
dreughFrame16: 'textures/dreugh/dreugh (16).gif',

orcShamanFrame1: 'textures/orc_shaman/orc_shaman (1).gif',
orcShamanFrame2: 'textures/orc_shaman/orc_shaman (2).gif',
orcShamanFrame3: 'textures/orc_shaman/orc_shaman (3).gif',
orcShamanFrame4: 'textures/orc_shaman/orc_shaman (4).gif',
orcShamanFrame5: 'textures/orc_shaman/orc_shaman (5).gif',
orcShamanFrame6: 'textures/orc_shaman/orc_shaman (6).gif',
orcShamanFrame7: 'textures/orc_shaman/orc_shaman (7).gif',
orcShamanFrame8: 'textures/orc_shaman/orc_shaman (8).gif',
orcShamanFrame9: 'textures/orc_shaman/orc_shaman (9).gif',
orcShamanFrame10: 'textures/orc_shaman/orc_shaman (10).gif',
orcShamanFrame11: 'textures/orc_shaman/orc_shaman (11).gif',
orcShamanFrame12: 'textures/orc_shaman/orc_shaman (12).gif',
orcShamanFrame13: 'textures/orc_shaman/orc_shaman (13).gif',
orcShamanFrame14: 'textures/orc_shaman/orc_shaman (14).gif',
orcShamanFrame15: 'textures/orc_shaman/orc_shaman (15).gif',
orcShamanFrame16: 'textures/orc_shaman/orc_shaman (16).gif',

diamond: 'textures/diamond/gem.png',
nightSky: 'textures/nightsky/nightsky.png',

}).then(function (resources /*an object containing our keys with the loaded resources*/) {

  init(resources);

  render(0);
});

function init(resources) {
  //create a GL context
  gl = createContext(400, 400);

  //setting manual camera control variable, dependent on link
  //clicked
  var param = window.location.search.substr(1).split("&");
  if('free=true' == param) {
    manualCameraEnabled = true;
    disableMovementHeadBobbing();
  }
  else
    manualCameraEnabled = false;
  //setting initial point to look at
  autoCameraLookAt = glm.translate(8.75, 2.35, -9.4);
  waitingFor = 0;
  waitingSince = 0;
  startTime = time();

  /*set camera Start position*/
  cameraPosition = vec3.fromValues(3, -1, -10);
  //cameraPosition = vec3.fromValues(0, 3, -87);

  /*set waypoints*/
  cameraWaypointIndex = 0;
  lookAtWaypointIndex = 0;
  let wpCam1 = glm.translate(9, 3, -8.5);
  let wpCam2 = glm.translate(18, -3.5, -8.5);
  let wpCam3 = glm.translate(25, -3.5, -8.5);
  let wpCam4 = glm.translate(25, -3.5, 10);
  let wpCam5 = glm.translate(25, 2.3, 21);
  let wpCam6 = glm.translate(25, 2.3, 28);
  let wpCam7 = glm.translate(47.5, 2.3, 28);
  let wpCam8 = glm.translate(47.5, 2.3, 42);
  let wpCam9 = glm.translate(32.3, 2.3, 42);
  let wpCam10 = glm.translate(32.3, 2.3, 81.3);
  let wpCam11 = glm.translate(29, 2.3, 81.3);
  let wpCam12 = glm.translate(12.5, -7.5, 81.3);
  let wpCam13 = glm.translate(7, -7.5, 81.3);
  cameraWaypoints = [wpCam1, wpCam2, wpCam3, wpCam4, wpCam5, wpCam6, wpCam7, wpCam8, wpCam9, wpCam10, wpCam11, wpCam12, wpCam13];
  let wpLookAt1 = glm.translate(25,-3,-15);
  lookAtWaypoints = [wpCam2, wpCam3, wpLookAt1];
  cameraWaypointIndex2 = -1;

  //initialize spellWayPoints
  spellWayPoints = [glm.translate(0, 0, 0)];

  //changing the -1 vales to 0 later on triggers waypoiint movements
  orcShamanWaypointIndex = -1;
  let wpOrcShaman1 = glm.translate(25, -3.5, -22.5);
  let wpOrcShaman2 = glm.translate(20, -3.5, -22.5);
  orcShamanWaypoints = [wpOrcShaman1, wpOrcShaman2];
  lookAtWaypointIndex2 = -1;
  lookAtWaypoints2 = [wpOrcShaman2, wpCam6];
  let durielPos = glm.translate(43.25,-2.75,13.5);
  let skullPilePos1 = glm.translate(39.4,-5,4.1);
  let skullPilePos2 = glm.translate(48,-5,4.1);
  lookAtWaypointIndex3 = -1;
  lookAtWaypoints3 = [wpCam7, durielPos, skullPilePos2, durielPos, skullPilePos2, durielPos];
  lookAtWaypointIndex4 = -1;
  spiderStartingPosition = [100, -9.75, 80];
  let spiderPos = glm.translate(spiderStartingPosition[0], spiderStartingPosition[1], spiderStartingPosition[2]);
  let wpLookAt2 = glm.translate(35, 1,13.5);
  lookAtWaypoints4 = [wpLookAt2, wpCam8];
  lookAtWaypointIndex5 = -1;
  lookAtWaypoints5 = [spiderPos];
  let wpLookAt3 = glm.translate(32.3, 2.3, 85);
  lookAtWaypoints6 = [wpLookAt3, wpCam12];
  lookAtWaypointIndex6 = -1;
  let wpLookAt4 = glm.translate(wpCam12[12]-2, wpCam12[13], wpCam12[14])
  let wpLookAt5 = glm.translate(0, -6, 90);
  lookAtWaypoints7 = [wpLookAt4, wpLookAt5];
  lookAtWaypointIndex7 = -1;
  spiderWaypointIndex = 0;

  /*initialize the shaderPrograms*/
  particleShaderProgram = createProgram(gl, resources.vs_particle, resources.fs_particle);
  simpleShaderProgram = createProgram(gl, resources.vs_simple, resources.fs_simple);

  floorTextureNode = new AdvancedTextureSGNode(resources.floorTexture);
  glassTextureNode = new AdvancedTextureSGNode(resources.glassTexture);
  gridTextureNode = new AdvancedTextureSGNode(resources.gridTexture);
  metalTextureNode = new AdvancedTextureSGNode(resources.metalTexture);
  metalTextureNode2 = new AdvancedTextureSGNode(resources.metalTexture);
  stainedGlassTextureNode = new AdvancedTextureSGNode(resources.stainedGlassTexture);
  spikedBarsTextureNode = new AdvancedTextureSGNode(resources.spikedBarsTexture);
  skyTextureNode = new AdvancedTextureSGNode(resources.skyTexture);
  ribCageTextureNode = new AdvancedTextureSGNode(resources.ribCageTexture);
  imSoHipTextureNode = new AdvancedTextureSGNode(resources.hipBoneTexture);
  skullTextureNode = new AdvancedTextureSGNode(resources.skullTexture);
  boneTextureNode = new AdvancedTextureSGNode(resources.boneTexture);
  bone2TextureNode = new AdvancedTextureSGNode(resources.boneTexture);
  bones1TextureNode = new AdvancedTextureSGNode(resources.bones1Texture);
  bones2TextureNode = new AdvancedTextureSGNode(resources.bones1Texture);
  skullPile1TextureNode = new AdvancedTextureSGNode(resources.skullPileTexture);
  pentagramTextureNode = new AdvancedTextureSGNode(resources.pentagramTexture);
  cobbleTextureNode = new AdvancedTextureSGNode(resources.cobbleTexture);
  web1TextureNode = new AdvancedTextureSGNode(resources.WebTexture1);
  spiderTextureNode1 = new AdvancedTextureSGNode(resources.spiderTexture);
  spiderTextureNode2 = new AdvancedTextureSGNode(resources.spiderTexture);
  spiderTextureNode3 = new AdvancedTextureSGNode(resources.spiderTexture);
  spiderTextureNode4 = new AdvancedTextureSGNode(resources.spiderTexture);
  spiderTextureNode5 = new AdvancedTextureSGNode(resources.spiderTexture);
  spiderTextureNode6 = new AdvancedTextureSGNode(resources.spiderTexture);
  spiderTextureNode7 = new AdvancedTextureSGNode(resources.spiderTexture);
  spiderTextureNode8 = new AdvancedTextureSGNode(resources.spiderTexture);
  spiderTextureNode9 = new AdvancedTextureSGNode(resources.spiderTexture);
  diamondTextureNode = new AdvancedTextureSGNode(resources.diamond);
  nightSkyTextureNode = new AdvancedTextureSGNode(resources.nightSky);
  crownTextureNode = new AdvancedTextureSGNode(resources.crownTexture);
  blueJewelTextureNode = new AdvancedTextureSGNode(resources.blueJewelTexture);
  crystalSwordTextureNode = new AdvancedTextureSGNode(resources.crystalSwordTexture);
  maskTextureNode = new AdvancedTextureSGNode(resources.maskTexture);
  rubyTextureNode = new AdvancedTextureSGNode(resources.rubyTexture);
  emeraldTextureNode = new AdvancedTextureSGNode(resources.emeraldTexture);
  tiaraTextureNode = new AdvancedTextureSGNode(resources.tiaraTexture);
  goldSkinTextureNode = new AdvancedTextureSGNode(resources.goldSkinTexture);
  tridentTextureNode = new AdvancedTextureSGNode(resources.tridentTexture);
  swordTextureNode  = new AdvancedTextureSGNode(resources.swordTexture);
  youDiedTextureNode  = new AdvancedTextureSGNode(resources.youDiedTexture);

  goldPile1TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);
  goldPile2TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);
  goldPile3TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);
  goldPile4TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);
  goldPile5TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);

//initializing animation frames
  andarielFrames = initAnimatedTexture([resources.andarielFrame1,
resources.andarielFrame2,
resources.andarielFrame3,
resources.andarielFrame4,
resources.andarielFrame5,
resources.andarielFrame6,
resources.andarielFrame7,
resources.andarielFrame8,
resources.andarielFrame9,
resources.andarielFrame10,
resources.andarielFrame11,
resources.andarielFrame12,
resources.andarielFrame13,
resources.andarielFrame14,
resources.andarielFrame15,
resources.andarielFrame16], gl.CLAMP_TO_EDGE);
  dreughFrames = initAnimatedTexture([resources.dreughFrame1,
resources.dreughFrame2,
resources.dreughFrame3,
resources.dreughFrame4,
resources.dreughFrame5,
resources.dreughFrame6,
resources.dreughFrame7,
resources.dreughFrame8,
resources.dreughFrame9,
resources.dreughFrame10,
resources.dreughFrame11,
resources.dreughFrame12,
resources.dreughFrame13,
resources.dreughFrame14,
resources.dreughFrame15,
resources.dreughFrame16], gl.CLAMP_TO_EDGE);
durielFrames = initAnimatedTexture([resources.durielFrame1,
resources.durielFrame2,
resources.durielFrame3,
resources.durielFrame4,
resources.durielFrame5,
resources.durielFrame6,
resources.durielFrame7,
resources.durielFrame8,
resources.durielFrame9,
resources.durielFrame10,
resources.durielFrame11,
resources.durielFrame12], gl.CLAMP_TO_EDGE);
orcShamanFrames = initAnimatedTexture([resources.orcShamanFrame1,
resources.orcShamanFrame2,
resources.orcShamanFrame3,
resources.orcShamanFrame4,
resources.orcShamanFrame5,
resources.orcShamanFrame6,
resources.orcShamanFrame7,
resources.orcShamanFrame8,
resources.orcShamanFrame9,
resources.orcShamanFrame10,
resources.orcShamanFrame11,
resources.orcShamanFrame12,
resources.orcShamanFrame13,
resources.orcShamanFrame14,
resources.orcShamanFrame15,
resources.orcShamanFrame16], gl.CLAMP_TO_EDGE);
dreughTextureNode = new TextureSGNode(dreughFrames, 0, 75);
orcShamanTextureNode = new TextureSGNode(orcShamanFrames, 0, 75);
durielTextureNode = new TextureSGNode(durielFrames, 0, 75);
andarielTextureNode = new TextureSGNode(andarielFrames, 0, 75);

  gl.enable(gl.DEPTH_TEST);

  //create scenegraph
  root = createSceneGraph(gl, resources);

  /*set triggers*/
  let triggerSGNode2 = new TriggerSGNode(2, glm.translate(25, -3.5, -8.5), function() {
    autoCameraLookAt = orcShamanSGNode.matrix;
    orcShamanWaypointIndex = 0;
    lookAtWaypointIndex = lookAtWaypoints.length;
  });
  //triggered by orc reaching its second waypoint
  let triggerSGNode3 = new ObjectTriggerSGNode(0.1, orcShamanSGNode.matrix, wpOrcShaman2, function() {
    autoCameraLookAt = wpOrcShaman2;
    lookAtWaypointIndex = lookAtWaypoints.length;
    lookAtWaypointIndex2 = 0;
  });
  //triggered when turning around after looking at duriel
  let triggerSGNode4 = new TriggerSGNode(0.1, wpCam7, function() {
    waitingSince = time();
    waitingFor = 1000;
    disableMovementHeadBobbing();
    setTimeout(enableMovementHeadBobbing, waitingFor);
  });
  //triggered when first looking at the spider
  let triggerSGNode5 = new TriggerSGNode(0.1, wpCam8, function() {
    waitingSince = time();
    waitingFor = 500;
    disableMovementHeadBobbing();
    setTimeout(enableMovementHeadBobbing, waitingFor);
  });
  //trigger spider movement
  let triggerSGNode6 = new TriggerSGNode(3, wpCam8, function() {
    spiderMoving = 1;
  });
  //trigger spider to stop moving
  let triggerSGNode7 = new TriggerSGNode(3, wpCam12, function() {
    console.log("trigger 7");
    spiderMoving = 0;

  });
  //color for spell effect and light
  var r = 0.75;r*=10;
  var g = 0.20;
  var b = 0.80;
  spellParentNode = new TransformationSGNode(glm.translate(0,0,0));
  spellParticle = createParticleNode(500, [1,1,1], [r, g, b], [r/8, g/8, b/8]);
  spellSGNode = new TransformationSGNode(glm.translate(0, 0, 0));
  spellLightNode = new AdvancedLightSGNode(true);
  spellLightNode.ambient = [0,0,0,1.0];
  spellLightNode.diffuse = [0,0,0,1.0];
  spellLightNode.specular = [0,0,0,1.0];
  spellLightNode.position = [0, 0, 0];
  spellSGNode.append(spellLightNode);
  spellParentNode.append(spellSGNode);
  b2fNodes.append(spellParentNode);
  var target = spiderAndBillBoardNode;
  var fireSpell = function(){
    //remove spellparticle children from spellsgnode before firing a new one
    spellSGNode.remove(spellParticle);
    //add new spell particle
    spellSGNode.append(spellParticle);
    //add spell parent to b2fnodes
    //set spell light
    spellLightNode.ambient = [r/8,g/8,b/8,1.0];
    spellLightNode.diffuse = [r/4,g/4,b/4,1.0];
    spellLightNode.specular = [r/4,g/4,b/4,1.0];
    //set spell position to camera
    spellSGNode.matrix[12] = -cameraPosition[0];
    spellSGNode.matrix[13] = -cameraPosition[1]-1.5;
    spellSGNode.matrix[14] = -cameraPosition[2];
    //set spell target
    let variedTargetMatrix = glm.translate(target.matrix[12]+Math.random()*0.25*(-cameraPosition[0]-target.matrix[12]), target.matrix[13]+Math.random()*5, target.matrix[14]+Math.random()*0.25*(-cameraPosition[2]-target.matrix[14]));
    spellWayPoints = [variedTargetMatrix];
    //(re)set spell waypoint index to initialize waypoint movement
    spellWayPointIndex = 0;
    //add trigger for when the spell hits the target
    root.append(new ObjectTriggerSGNode(2.5, spellSGNode.matrix, variedTargetMatrix, function() {
      //when spell hits the target turn spell light off
      spellLightNode.ambient = [0,0,0,1.0];
      spellLightNode.diffuse = [0,0,0,1.0];
      spellLightNode.specular = [0,0,0,1.0];
      //remove particle effect
      spellSGNode.remove(spellParticle);
      //reomve the trigger
      root.remove(this);
    }));

  }
  //trigger volley of spells
  let triggerSGNode8 = new TriggerSGNode(3, wpCam8, function() {
    fireSpellVolley = 1;
    //as long as second waypoint is not reached and fireSpellVolley is 1 spells will continue to fire the spider
    var startInterval = function() {
      if(fireSpellVolley) {
        fireSpell();
        setTimeout(startInterval, 375+Math.random()*100);
      }
    };
    //starting interval just after starting to walk after looking at the spider
    setTimeout(startInterval, 1000);

  });

  //deactivating spell volley
  let triggerSGNode9 = new TriggerSGNode(3, wpCam10, function() {
    fireSpellVolley = 0;
    lookAtWaypointIndex6 = 0;
    autoCameraLookAt = glm.translate(spiderAndBillBoardNode.matrix[12], spiderAndBillBoardNode.matrix[13], spiderAndBillBoardNode.matrix[14]);
  });

  //stopping headbobbing near the end of the camera flight
  let triggerSGNode10 = new TriggerSGNode(0.1,wpCam13, function() {
    disableMovementHeadBobbing();
  });

  //triggering death animation
  let triggerSGNode11 = new TriggerSGNode(0.1, glm.translate(2.4, -8.20, 83.88), function() {
    setTimeout(function() {
      stabbed = 1;
    }, 2000);
    //triggering death roll with higher dealy
    setTimeout(function() {
      deathRoll = 1;
    }, 2500);
  });

//appending trigger nodes
  root.append(triggerSGNode2);
  root.append(triggerSGNode3);
  root.append(triggerSGNode4);
  root.append(triggerSGNode5);
  root.append(triggerSGNode6);
  root.append(triggerSGNode7);
  root.append(triggerSGNode8);
  root.append(triggerSGNode9);
  root.append(triggerSGNode10);
  root.append(triggerSGNode11);

  initInteraction(gl.canvas);
}

function initAnimatedTexture(array, clampType) {
  let animationArray = [];
  for(var i = 0; i < array.length; i++) {
    animationArray.push(initTextures(array[i], clampType));
  }
  return animationArray;
}

function createSceneGraph(gl, resources) {
  //create scenegraph
  const root = new ShaderSGNode(createProgram(gl, resources.vs_lighting, resources.fs_lighting));

  lightingNodes = new LightingSGNode();
  b2fNodes = new Back2FrontSGNode();
  root.append(new BlendSgNode(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, lightingNodes));

  function createTorch(color, pos, colorMult, colorMin) {
    var particle = createParticleNode(120, [0.2,0.05,0.2], colorMult,colorMin);
    let torchLight = new AdvancedLightSGNode(true);
    torchLight.ambient = [0,0,0,1];
    torchLight.diffuse = color;
    torchLight.specular = color;
    torchLight.position = pos;
    torchLight.append(particle);
    return torchLight;
  }

  function createDefaultMaterialNode(specular, children) {
    var node = new MaterialSGNode(children);
    node.ambient = [1, 1, 1, 1];
    node.diffuse = [1, 1, 1, 1];
    node.specular = [1*specular, 1*specular, 1*specular, 1];
    node.shininess = 1000;
    return node;
  }
  function createBillBoard(position, size) {
    var rect = makeTexturedRect(size[0], size[1], size[2]);
    let billboard = new BillboardSGNode(glm.transform({translate: position}), [
      new RenderSGNode(rect)
    ]);
    return createDefaultMaterialNode(0.1, billboard);
  }


  {
    /*Init Light Positions*/
    //translateLantern = new TransformationSGNode(glm.translate(0, 0, 0));
    //translateLantern.append(torchNode);
    //translateLantern.append(lanternFireParticleNode);
    //b2fNodes.append(translateLantern);

    /*POSITION TEST NODES*/

    function createFireTorch(pos) {
      var torch = createTorch([1.0,0.6,0.05,1.0],
                          pos);
      torch.ambient = [0.25,0.15,0.0125,1.0];
      //torch.spotAngle = 105 * Math.PI/180;
      torch.decreaseRate = 5;
      return torch;
    }

    b2fNodes.append(createFireTorch([27.6, 0, -0.125]));
    b2fNodes.append(createFireTorch([-9.5, 3, 0]));
    b2fNodes.append(createFireTorch([32.0625, -1, 26.675]));
    b2fNodes.append(createFireTorch([43.45, -1, 0.4]));

    function createGreenTorch(pos, lookAt) {
      var torch = createTorch([0.05,0.3,0.025,1.0],
                          pos,
                          [0.2,0.5,0.1],
                          [0,0.5,0]);
      torch.ambient = [0,0,0,1.0]
      //torch.spotAngle = 105 * Math.PI/180;
      torch.lookAt = lookAt;
      torch.decreaseRate = 10;
      return torch;
    }

    b2fNodes.append(createGreenTorch([40, -3, 50.85], [0,0,-1]));
    b2fNodes.append(createGreenTorch([80, -3, 50.85], [0,0,-1]));
    b2fNodes.append(createGreenTorch([90, -3, 50.85], [0,0,-1]));
    b2fNodes.append(createGreenTorch([100, -3, 50.85], [0,0,-1]));
    b2fNodes.append(createGreenTorch([110, -3, 50.85], [0,0,-1]));

    b2fNodes.append(createGreenTorch([40, -3, 89.15], [0,0,1]));
    b2fNodes.append(createGreenTorch([50, -3, 89.15], [0,0,1]));
    b2fNodes.append(createGreenTorch([70, -3, 89.15], [0,0,1]));
    b2fNodes.append(createGreenTorch([60, -3, 89.15], [0,0,1]));
    b2fNodes.append(createGreenTorch([80, -3, 89.15], [0,0,1]));
    b2fNodes.append(createGreenTorch([90, -3, 89.15], [0,0,1]));
    b2fNodes.append(createGreenTorch([100, -3, 89.15], [0,0,1]));
    b2fNodes.append(createGreenTorch([110, -3, 89.15], [0,0,1]));

/*
    let torchTransNode5 = new TransformationSGNode(glm.translate(49.7, -1, 18.95));
    torchTransNode5.append(torchNode5);
    torchTransNode5.append(torchLight5);
    b2fNodes.append(torchTransNode5);
    */
}

/*Add orc shaman*/
{
  var rect = makeTexturedRect(2, 2, 1)

  orcShamanSGNode = new BillboardSGNode(glm.transform({translate: [25,-3.5,-15]}), [
    new RenderSGNode(rect)
  ]);
  let orc_shamanMaterialNode = new MaterialSGNode(orcShamanSGNode);
  orc_shamanMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  orc_shamanMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  orc_shamanMaterialNode.specular = [1, 1, 1, 1];
  orc_shamanMaterialNode.shininess = 1000;

  orcShamanTextureNode.append(orcShamanSGNode);
}

/*Place the Dungeon Layout, e.g. walls, floor,...*/
{

  //initialize map floor
  floorTextureNode.append(new RenderSGNode(resources.modelMapFloor));
  lightingNodes.append(createDefaultMaterialNode(0.1,floorTextureNode));

  //initialize map walls
  cobbleTextureNode.append(new RenderSGNode(resources.modelMapCobble));
  lightingNodes.append(createDefaultMaterialNode(0.1,cobbleTextureNode));

  //initialize map spiked bars
  spikedBarsTextureNode.append(new RenderSGNode(resources.modelMapSpikedBars));
  lightingNodes.append(orcShamanTextureNode);
  lightingNodes.append(createDefaultMaterialNode(0.2,spikedBarsTextureNode));

  //initialize map sky
  skyTextureNode.append(new RenderSGNode(resources.modelMapSky));
  lightingNodes.append(createDefaultMaterialNode(0.1,skyTextureNode));

  //initialize map torches
  metalTextureNode2.append(new RenderSGNode(resources.modelMapTorches));
  lightingNodes.append(createDefaultMaterialNode(0.6,metalTextureNode2));

  //initialize map pentagram
  pentagramTextureNode.append(new RenderSGNode(resources.modelMapPentagram));
  lightingNodes.append(createDefaultMaterialNode(0.4,pentagramTextureNode));

  //initialize map cobwebs
  web1TextureNode.append(new RenderSGNode(resources.modelMapWebs));
  lightingNodes.append(createDefaultMaterialNode(0,web1TextureNode));

  //initialize map glass
  stainedGlassTextureNode.append(new RenderSGNode(resources.modelMapGlass));
  b2fNodes.append(createDefaultMaterialNode(0.7,stainedGlassTextureNode));
}

{
  /*Init lantern*/
  let lanternParticleNode = new ParticleSGNode(50, [0.05,0.025,0.05]);
  let lanternFireParticleNode  = createParticleNode(null, null, null, null, lanternParticleNode);
  lanternParticleNode.maxDistanceFromStart = 0.1;
  lanternParticleNode.windStrength = 0;
  lanternParticleNode.maxMovement = 0.5;

  /*Init Lantern-Light*/
  let torchNode = new AdvancedLightSGNode(true, 10, [0,0,1]);
  torchNode.ambient = [1.0,0.6,0.2,1.0];
  torchNode.diffuse = [1.0,0.6,0.2,1.0];
  torchNode.specular = [1.0,0.6,0.2,1.0];
  torchNode.position = [0, 0.15, 0.02];
  torchNode.decreaseRate = 40;

  torchNode.append(lanternFireParticleNode);

  let rotatelantern = new TransformationSGNode(glm.rotateY(180));
  lanternSGNode = new TransformationSGNode(glm.translate(0,2,0),
        [torchNode, rotatelantern]);

  //initialize lantern glass
  glassTextureNode.append(new RenderSGNode(resources.modelLanternGlass));
  rotatelantern.append(createDefaultMaterialNode(0.1, glassTextureNode));
  //initialize lantern metal
  metalTextureNode.append(new RenderSGNode(resources.modelLanternMetal));
  rotatelantern.append(createDefaultMaterialNode(0.3,metalTextureNode));

  //initialize lantern grid
  gridTextureNode.append(new RenderSGNode(resources.modelLanternGrid));
  rotatelantern.append(createDefaultMaterialNode(0.3,gridTextureNode));

}

/*Add dreugh*/
{
  dreughTextureNode.append(createBillBoard([52,2,27], [2, 2, 1]));
  b2fNodes.append(dreughTextureNode);
}

/*Add skull piles*/
{
  skullPile1TextureNode.append(createBillBoard([39.4,-5,4.1], [1.25, 1.25, 1]));
  skullPile1TextureNode.append(createBillBoard([48,-5,4.1], [1.25, 1.25, 1]));
  b2fNodes.append(skullPile1TextureNode);
}

/*Add bone piles*/
{
  bones1TextureNode.append(createBillBoard([44,.25,29.3], [0.3, 0.3, 1]));
  b2fNodes.append(bones1TextureNode);

  bones2TextureNode.append(createBillBoard([25.6,-5.25,-8.44], [0.3, 0.3, 1]));
  b2fNodes.append(bones2TextureNode);
}

/*Add Duriel*/
{
  durielTextureNode.append(createBillBoard([43.5,-3.25,13.5], [2.5, 2.5, 1]));
  b2fNodes.append(durielTextureNode);
}

/*Add sword*/
{
  var rect = makeTexturedRect(2, 2, 1)
  swordParent = new TransformationSGNode(glm.transform({translate:[0,0,0]}));
  swordSGNode = new TransformationSGNode(glm.transform({translate:[0,0,0], rotateX:90}));
  let swordMat = new MaterialSGNode(swordTextureNode);
  swordSGNode.append(createDefaultMaterialNode(1,swordTextureNode));
  swordTextureNode.append(new RenderSGNode(rect));

  bloodParticle = new ParticleSGNode(250, [0.7,0.025,0.7], [0.2,0,0,0],[0.05,0,0,1]);

  bloodPosSGNode = new TransformationSGNode(glm.translate(100,100,100),
    new TransformationSGNode(glm.rotateX(-90),
    new ShaderSGNode(particleShaderProgram,
      bloodParticle)));

  bloodParticle.emmitModifier = -1;
  bloodParticle.fireSpeed = 8;
  bloodParticle.windStrength = 0;
  bloodParticle.fireEmmitAngle = -5;
  bloodParticle.sparkEmmitAngle = -1;
  bloodParticle.speedVariance = 0.5;
  bloodParticle.sizeVariance = 0.5;
  bloodParticle.sparkEmmitRate = 2;
  bloodParticle.particleSizeReduction = 0;
  bloodParticle.fireRiseFactor = 1;
  bloodParticle.movementScaling = 5;
  bloodParticle.maxMovement = 10000;
  bloodParticle.maxDistanceFromStart = 10000;
  bloodParticle.windStrength = 0;
  bloodParticle.newSpawns = 250;
  bloodParticle.fireHeatDegreeRate = 4;
  bloodParticle.fireCenterHeatDegreeRate = 0;
  bloodParticle.variance = 0.1;

  b2fNodes.append(swordSGNode);
  b2fNodes.append(bloodPosSGNode);
}

/*Add trident*/
{
  tridentTextureNode.append(createBillBoard([-9.06,-8.25, 95.48], [2, 2, 1]));
  b2fNodes.append(tridentTextureNode);
}

/*Add goldskin*/
{
  goldSkinTextureNode.append(createBillBoard([-9.12,-8.75, 92.54], [2, 2, 1]));
  b2fNodes.append(goldSkinTextureNode);
}


/*Add tiara*/
{
  tiaraTextureNode.append(createBillBoard([1.56, -7.8, 88.75], [0.4, 0.4, 1]));
  b2fNodes.append(tiaraTextureNode);
}

/*Add emerald*/
{
  emeraldTextureNode.append(createBillBoard([3.5, -8.45, 90.2], [0.2, 0.2, 1]));
  b2fNodes.append(emeraldTextureNode);
}

/*Add ruby*/
{
  rubyTextureNode.append(createBillBoard([2.25, -8.45, 90.98], [0.2, 0.2, 1]));
  b2fNodes.append(rubyTextureNode);
}

/*Add blue jewel*/
{
  blueJewelTextureNode.append(createBillBoard([2.76, -8.45, 86.56], [0.2, 0.2, 1]));
  b2fNodes.append(blueJewelTextureNode);
}

/*Add mask*/
{
  maskTextureNode.append(createBillBoard([3, -8.25, 88.2], [0.4, 0.4, 1]));
  b2fNodes.append(maskTextureNode);
}

/*Add gold piles*/
{
  goldPile1TextureNode.append(createBillBoard([3.22, -8.5, 92], [0.4, 0.4, 1]));
  b2fNodes.append(goldPile1TextureNode);

  goldPile2TextureNode.append(createBillBoard([5, -9, 89.144], [0.4, 0.4, 1]));
  b2fNodes.append(goldPile2TextureNode);

  goldPile3TextureNode.append(createBillBoard([1.57, -8, 91.5], [0.4, 0.4, 1]));
  b2fNodes.append(goldPile3TextureNode);

  goldPile4TextureNode.append(createBillBoard([1.0, -8, 89.77], [0.4, 0.4, 1]));
  b2fNodes.append(goldPile4TextureNode);

  goldPile5TextureNode.append(createBillBoard([0.77, -8, 91.47], [0.4, 0.4, 1]));
  b2fNodes.append(goldPile5TextureNode);
}

/*Add crown*/
{
  crownTextureNode.append(createBillBoard([0.247, -8.25, 86.94], [0.4, 0.4, 1]));
  b2fNodes.append(crownTextureNode);
}

/*Add crystal sword*/
{
  crystalSwordTextureNode.append(createBillBoard([-9.3,-8.25, 99.2], [2, 2, 1]));
  b2fNodes.append(crystalSwordTextureNode);
}

/*Add youDied*/
{
  var rect = makeTexturedRect(2, 2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  youDiedSGNode = new BillboardSGNode(glm.transform({translate: [0,1,0]}));
  let youdiedMatNode = new MaterialSGNode(youDiedTextureNode);
  youdiedMatNode.ambient = [0.6, 0.6, 0.6, 1];
  youdiedMatNode.diffuse = [0.5, 0.5, 0.5, 1];
  youdiedMatNode.specular = [0, 0, 0, 1];
  youdiedMatNode.shininess = 1;
  youDiedSGNode.append(youdiedMatNode);
  youDiedTextureNode.append(new RenderSGNode(rect));

  //b2fNodes.append(new ShaderSGNode(simpleShaderProgram, youDiedSGNode));
}

/*Add ribCage*/
{
  ribCageTextureNode.append(createBillBoard([21,-4.75,-9.5], [0.4, 0.4, 1]));
  lightingNodes.append(ribCageTextureNode);
}

/*Add bones*/
{
  boneTextureNode.append(createBillBoard([25.1,-5.25,-1], [0.3, 0.3, 1]));
  lightingNodes.append(boneTextureNode);

  bone2TextureNode.append(createBillBoard([40,.25,32.5], [0.3, 0.3, 1]));
  lightingNodes.append(bone2TextureNode);
}

/*Add skull*/
{
  skullTextureNode.append(createBillBoard([10,0.5,-9.5], [0.3, 0.3, 1]));
  lightingNodes.append(skullTextureNode);
}

/*Add hip*/
{
  imSoHipTextureNode.append(createBillBoard([9.5,0.5,-4.5], [0.3, 0.3, 1]));
  lightingNodes.append(imSoHipTextureNode);
}

/*add spider*/
{
  spiderAndBillBoardNode = new TransformationSGNode(glm.transform({translate: [spiderStartingPosition[0], spiderStartingPosition[1], spiderStartingPosition[2]], rotateY: 0}));
  spiderTransformationNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderMovementSet1SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderMovementSet2SGNode = new TransformationSGNode(glm.translate(0,0,0));

  spiderTextureNode1.append(new RenderSGNode(resources.modelSpiderAbdomen));
  spiderAbdomenSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderAbdomenSGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode1));

  spiderTextureNode2.append(new RenderSGNode(resources.modelSpiderLeftFrontLeg));
  spiderLeftFrontLegSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderLeftFrontLegSGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode2));

  spiderTextureNode3.append(new RenderSGNode(resources.modelSpiderLeftFrontLeg2));
  spiderLeftFrontLeg2SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderLeftFrontLeg2SGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode3));

  spiderTextureNode4.append(new RenderSGNode(resources.modelSpiderLeftHindLeg2));
  spiderLeftHindLeg2SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderLeftHindLeg2SGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode4));

  spiderTextureNode5.append(new RenderSGNode(resources.modelSpiderLeftHindLeg));
  spiderLeftHindLegSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderLeftHindLegSGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode5));

  spiderTextureNode6.append(new RenderSGNode(resources.modelSpiderRightFrontLeg));
  spiderRightFrontLegSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderRightFrontLegSGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode6));

  spiderTextureNode7.append(new RenderSGNode(resources.modelSpiderRightFrontLeg2));
  spiderRightFrontLeg2SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderRightFrontLeg2SGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode7));

  spiderTextureNode8.append(new RenderSGNode(resources.modelSpiderRightHindLeg2));
  spiderRightHindLeg2SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderRightHindLeg2SGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode8));

  spiderTextureNode9.append(new RenderSGNode(resources.modelSpiderRightHindLeg));
  spiderRightHindLegSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderRightHindLegSGNode.append(createDefaultMaterialNode(0.3, spiderTextureNode9));

  var rect = makeTexturedRect(2.5, 2.5, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  andarielSGNode = new TransformationSGNode(glm.transform({translate: [0,2.65,-2], rotateX:180}));
  andarielSGNode.append(createDefaultMaterialNode(0.1, andarielTextureNode));
  andarielTextureNode.append(new RenderSGNode(rect));

  spiderMovementSet1SGNode.append(spiderRightFrontLegSGNode);
  spiderMovementSet1SGNode.append(spiderLeftFrontLeg2SGNode);
  spiderMovementSet1SGNode.append(spiderRightHindLeg2SGNode);
  spiderMovementSet1SGNode.append(spiderLeftHindLegSGNode);
  spiderMovementSet2SGNode.append(spiderLeftFrontLegSGNode);
  spiderMovementSet2SGNode.append(spiderRightFrontLeg2SGNode);
  spiderMovementSet2SGNode.append(spiderLeftHindLeg2SGNode);
  spiderMovementSet2SGNode.append(spiderRightHindLegSGNode);

  spiderTransformationNode.append(spiderMovementSet1SGNode);
  spiderTransformationNode.append(spiderMovementSet2SGNode);
  spiderTransformationNode.append(spiderAbdomenSGNode);
  spiderAndBillBoardNode.append(spiderTransformationNode);
  spiderAndBillBoardNode.append(andarielSGNode);
  lightingNodes.append(spiderAndBillBoardNode);
}

{
  //generate night sky
  var shaderNode = new ShaderSGNode(simpleShaderProgram);
    shaderNode.append(new TransformationSGNode(glm.transform({translate: [0,20,0], rotateX:90}),
      new RenderSGNode(makeTexturedRect(5.12*2,2.56*2,1))));
    shaderNode.append(new TransformationSGNode(glm.transform({translate: [0,20,90], rotateX:90}),
      new RenderSGNode(makeTexturedRect(5.12*2,2.56*2,1))));

  nightSkyTextureNode.append(shaderNode);
  root.append(nightSkyTextureNode);
}

/*create Diamond*/
{
  diamondTextureNode.append(new RenderSGNode(makeDiamond()));
  let diamondMaterial = createDefaultMaterialNode(1, diamondTextureNode);
  diamondMaterial.shininess = 100;

  diamondUpDownNode = new TransformationSGNode(glm.translate(0,0,0), diamondMaterial);
  diamondRotateNode = new TransformationSGNode(glm.translate(0,-7, 90), diamondUpDownNode);
  diamondTransformationNode = new TransformationSGNode(glm.translate(0,-6, 90), diamondRotateNode);
  let particles = createParticleNode(500, [4,30,4], [0.75, 0.6, 1], [0.75/8, 0.6/8, 1/8]);
  diamondUpDownNode.append(particles);

  b2fNodes.append(diamondTransformationNode);

  let diamondLight = new AdvancedLightSGNode(false);
  diamondLight.ambient = [0.0,0.2,0.6,1];
  diamondLight.diffuse = [0.0,0.4,1,1];
  diamondLight.specular = [0,0.4,1,1];
  diamondLight.position = [0,0.6,0];
  diamondLight.decreaseRate = 8;

  diamondUpDownNode.append(diamondLight);

  /*place spotlight*/
  //TODO Loch in der Decke ans Spotlight anpassen (schräg nicht gerade)
  let moonLight = new AdvancedLightSGNode(false, 10, [0,1,-0.8], [0,5,80]);
  moonLight.ambient = [0,0,0,1];
  moonLight.diffuse = [1,1,1,1];
  moonLight.specular = [1,1,1,1];
  moonLight.decreaseRate = 1000;
  b2fNodes.append(moonLight);
}

  //lightingNodes.append(dreughTextureNode);
  //lightingNodes.append(b2fNodes);
  lightingNodes.append(b2fNodes);
  lightingNodes.append(lanternSGNode);
  return root;
}

function makeTexturedRect(x, y, a) {
  var rect = makeRect(x, y);

  /*flip the normal vector*/
  for(var i = 0; i < rect.normal.length; i++)
    rect.normal[i] = -rect.normal[i];

  rect.texture = [0, 0,   a*x/y, 0,   a*x/y, a,   0, a];
  return rect;
}

function initTextures(resources, clampType)
{
    var texture = resources;
    //create texture object
    var textureEnv = gl.createTexture();
    //select a texture unit
    gl.activeTexture(gl.TEXTURE0);
    //bind texture to active texture unit
    gl.bindTexture(gl.TEXTURE_2D, textureEnv);
    //set sampling parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //TASK 4: change texture sampling behaviour
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, clampType);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, clampType);

    //upload texture data
    gl.texImage2D(gl.TEXTURE_2D, //texture unit targe t == texture type
      0, //level of detail level (default 0)
      gl.RGBA, //internal format of the data in memory
      gl.RGBA, //image format (should match internal format)
      gl.UNSIGNED_BYTE, //image data type
      texture); //actual image data
    //clean up/unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);
    return textureEnv;

}

function createParticleNode(size, area, colorMult, colorMin, partNode) {
  return new ShaderSGNode(particleShaderProgram,
    new BlendSgNode(gl.SRC_ALPHA, gl.ONE,
      partNode || new ParticleSGNode(size, area, colorMult, colorMin))
  );
}

/*
changes the objectMatrix towards a waypointMatrix of the waypointMatrixArray using the waypointIndex and a specified speed
returns the current waypointIndex which might be incremented by the function when the current waypoint has been reached
*/
function moveUsingWaypoints(objectMatrix, waypointMatrixArray, waypointIndex, speed) {
  var x = objectMatrix[12];
  var y = objectMatrix[13];
  var z = objectMatrix[14];

  var waypointMatrix = waypointMatrixArray[waypointIndex];
  var wx = waypointMatrix[12];
  var wy = waypointMatrix[13];
  var wz = waypointMatrix[14];

  //distances
  var dx = wx - x;
  var dy = wy - y;
  var dz = wz - z;
  var distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

  var f = Math.sqrt((speed * speed) / (dx * dx + dy * dy + dz * dz));
  if(distance < speed) {
    //if waypoint is reached (last step will only walk remaining distance and therefore might be slightly slower)
    objectMatrix[12] = wx;
    objectMatrix[13] = wy;
    objectMatrix[14] = wz;
    waypointIndex++;
  } else {
    objectMatrix[12] += dx*f;
    objectMatrix[13] += dy*f;
    objectMatrix[14] += dz*f;
  }
  return waypointIndex;
}

function deg2rad(degrees) {
  return degrees * Math.PI / 180;
}

function reduceBloodParticle() {
  if(bloodParticle.newSpawns > 0) {
    bloodParticle.newSpawns -= 15;
    setTimeout(reduceBloodParticle, 400);
  }
  else {
    bloodParticle.newSpawns = 0;
  }
}


//function used to make camera look at point given in matrix[12-15]
function lookAtObject(context, matrix, up) {
  var eye = [context.invViewMatrix[12], context.invViewMatrix[13], context.invViewMatrix[14]];
  var center = [matrix[12], matrix[13], matrix[14]];
  var lookAtMatrix = mat4.lookAt(mat4.create(), eye, center, up);
  context.viewMatrix = lookAtMatrix;
}

function ObjectLookAtMatrix(object, targetMatrix, up) {
  var lookAt = mat4.lookAt(mat4.create(), [object.matrix[12], 0, object.matrix[14]], [targetMatrix[12], 0, targetMatrix[14]], [0, -1, 0]);

  for(var i = 0; i < 12; i++) {
    object.matrix[i] = lookAt[i];
  }
  mat4.multiply(object.matrix, object.matrix, glm.transform({rotateX:180}));
}

//a scene graph node for setting texture parameters
function render(timeInMilliseconds) {
  var timediff = Math.min((timeInMilliseconds - (lastRenderTime || timeInMilliseconds))/20.0 ,5.0);
  checkForWindowResize(gl);
  //update animations

  if(orcShamanWaypointIndex < orcShamanWaypoints.length && orcShamanWaypointIndex !== -1) {
    orcShamanWaypointIndex = moveUsingWaypoints(orcShamanSGNode.matrix, orcShamanWaypoints, orcShamanWaypointIndex, 0.1*timediff);
  }

  //setup viewport
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //setup context and camera matrices
  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(fov), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 110);
  //very primitive camera implementation
  //let lookAtMatrix = mat4.lookAt(mat4.create(), [0,0,0], [0,0,0], [0,1,0]);
  let mouseRotateMatrix = mat4.multiply(mat4.create(),
                          glm.rotateX(-camera.rotation.y),
                          glm.rotateY(-camera.rotation.x));
  //context.viewMatrix = mat4.multiply(mat4.create(), lookAtMatrix, mouseRotateMatrix);
  /*let inverseRotateMatrix = mat4.multiply(mat4.create(),
                          glm.rotateY(camera.rotation.x),
                          glm.rotateX(camera.rotation.y)
                          );
                          */
  let inverseRotateMatrix = mat4.invert(mat4.create(), mouseRotateMatrix);
  let lookAtVector = vec3.transformMat4(vec3.create(), [0, 0, -1], inverseRotateMatrix);
  vec3.normalize(lookAtVector, lookAtVector);
  let crossLookAtVector = vec3.cross(vec3.create(), lookAtVector, [0, 1, 0]);
  vec3.normalize(crossLookAtVector, crossLookAtVector);
  let upLookAtVector = [0, -1, 0];
  if(camera.movement.forward == 1) {
    vec3.subtract(cameraPosition, cameraPosition, vec3.scale(vec3.create(), lookAtVector, 0.25*movementSpeedModifier));
    enableMovementHeadBobbing();
  }
  if(camera.movement.backward == 1) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, lookAtVector, 0.25*movementSpeedModifier);
    enableMovementHeadBobbing();
  }
  if(camera.movement.left == 1) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, crossLookAtVector, 0.25*movementSpeedModifier);
    enableMovementHeadBobbing();
  }
  if(camera.movement.right == 1) {
    vec3.subtract(cameraPosition, cameraPosition, vec3.scale(vec3.create(), crossLookAtVector, 0.25*movementSpeedModifier));
    enableMovementHeadBobbing();
  }
  if(camera.movement.up == 1) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, upLookAtVector, 0.25*movementSpeedModifier);
  }
  if(camera.movement.down == 1) {
    vec3.subtract(cameraPosition, cameraPosition, vec3.scale(vec3.create(), upLookAtVector, 0.25*movementSpeedModifier));
  }

  context.viewMatrix = glm.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
  if(manualCameraEnabled) {
    mat4.multiply(context.viewMatrix, mouseRotateMatrix, glm.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]));
  }
  //get inverse view matrix to allow computing eye-to-light matrix
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  if(spiderMoving) {
    if(spiderWaypointIndex < 1){
      spiderWaypointIndex = moveUsingWaypoints(spiderAndBillBoardNode.matrix, [glm.translate(context.invViewMatrix[12], spiderAndBillBoardNode.matrix[13], context.invViewMatrix[14])], spiderWaypointIndex, 0.15*timediff);
      if(spiderWaypointIndex === 1) {
        spiderMoving = 0;
      }
    }
    var speed = 2.5;
    spiderAbdomenSGNode.matrix[13] += speed*Math.sin(timeInMilliseconds/75)/25;
    andarielSGNode.matrix[13] += speed*Math.sin(timeInMilliseconds/75)/25;
    spiderMovementSet1SGNode.matrix = mat4.rotateY(mat4.create(),spiderMovementSet1SGNode.matrix, deg2rad(Math.sin(90+timeInMilliseconds*speed/200)*1.75));
    spiderMovementSet2SGNode.matrix = mat4.rotateY(mat4.create(),spiderMovementSet2SGNode.matrix, deg2rad(Math.sin(timeInMilliseconds*speed/200)*1.75));
    spiderMovementSet1SGNode.matrix[13] += deg2rad(Math.sin(timeInMilliseconds*speed/100)*3*speed);
    spiderMovementSet2SGNode.matrix[13] += deg2rad(-Math.sin(timeInMilliseconds*speed/100)*3*speed);
  }

//head bobbing
  context.invViewMatrix[13] += Math.sin(timeInMilliseconds/bobbSpeed)/bobbHeight;

  diamondRotateNode.matrix = glm.rotateY(timeInMilliseconds*-0.01);
  diamondUpDownNode.matrix[13] = Math.sin(timeInMilliseconds*0.001);
  var finalDiamondMatrix = mat4.multiply(mat4.create(), diamondTransformationNode.matrix, diamondRotateNode.matrix);
  mat4.multiply(finalDiamondMatrix, finalDiamondMatrix, diamondUpDownNode.matrix);

  if(!manualCameraEnabled) {
    if(cameraWaypointIndex < cameraWaypoints.length && time() - waitingSince >= waitingFor) {
        cameraWaypointIndex = moveUsingWaypoints(context.invViewMatrix, cameraWaypoints, cameraWaypointIndex, 0.2 * timediff);
        if(cameraWaypointIndex === cameraWaypoints.length) {
          setTimeout(function() {
            bobbSpeed *= 0.5;
            cameraWaypointIndex2 = 0;
          }, 1500);
        }
    }
    if(cameraWaypointIndex2 === 0) {
      moveUsingWaypoints(context.invViewMatrix, [glm.translate(2.4, -8.20, 83.88)], cameraWaypointIndex2, 0.1 * timediff);
    }
    if(lookAtWaypointIndex < lookAtWaypoints.length) {
      lookAtWaypointIndex = moveUsingWaypoints(autoCameraLookAt, lookAtWaypoints, lookAtWaypointIndex, 0.1 * timediff);
    }
    if(lookAtWaypointIndex2 < lookAtWaypoints2.length && lookAtWaypointIndex2 !== -1) {
      lookAtWaypointIndex2 = moveUsingWaypoints(autoCameraLookAt, lookAtWaypoints2, lookAtWaypointIndex2, 2 * timediff);
      if(lookAtWaypointIndex2 === lookAtWaypoints2.length) {
        lookAtWaypointIndex3 = 0;
      }
    }
    if(lookAtWaypointIndex3 < lookAtWaypoints3.length && lookAtWaypointIndex3 !== -1) {
      lookAtWaypointIndex3 = moveUsingWaypoints(autoCameraLookAt, lookAtWaypoints3, lookAtWaypointIndex3, 0.45 * timediff);
      if(lookAtWaypointIndex3 === lookAtWaypoints3.length) {
        lookAtWaypointIndex4 = 0;
      }
    }
    if(lookAtWaypointIndex4 < lookAtWaypoints4.length && lookAtWaypointIndex4 !== -1) {
      lookAtWaypointIndex4 = moveUsingWaypoints(autoCameraLookAt, lookAtWaypoints4, lookAtWaypointIndex4, 1 * timediff);
      if(lookAtWaypointIndex4 === lookAtWaypoints4.length) {
        lookAtWaypointIndex5 = 0;
      }
    }
    if(lookAtWaypointIndex5 < lookAtWaypoints5.length && lookAtWaypointIndex5 !== -1){
      lookAtWaypointIndex5 = moveUsingWaypoints(autoCameraLookAt, lookAtWaypoints5, lookAtWaypointIndex5, 0.5 * timediff);
      if(lookAtWaypointIndex5 === lookAtWaypoints5.length) {
        autoCameraLookAt = spiderAndBillBoardNode.matrix;
      }

    }
    if(lookAtWaypointIndex6 < lookAtWaypoints6.length && lookAtWaypointIndex6 !== -1){
      lookAtWaypointIndex6 = moveUsingWaypoints(autoCameraLookAt, lookAtWaypoints6, lookAtWaypointIndex6, 1 * timediff);
      if(lookAtWaypointIndex6 === lookAtWaypoints6.length) {
        lookAtWaypointIndex7 = 0;
      }
    }
    if(lookAtWaypointIndex7 < 2 && lookAtWaypointIndex7 !== -1){
      lookAtWaypointIndex7 = moveUsingWaypoints(autoCameraLookAt, [glm.translate(7, -7.5, 81.3), finalDiamondMatrix], lookAtWaypointIndex7, 0.1 * timediff);
    }

    lookAtObject(context, autoCameraLookAt, [upX,upY,upZ]);
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);
    lookAtVector = vec3.normalize(vec3.create(), vec3.fromValues(autoCameraLookAt[12], autoCameraLookAt[13], autoCameraLookAt[14]));
  }
  if(lookAtWaypointIndex7 === 2) {
    autoCameraLookAt = finalDiamondMatrix;
    if(deathRoll) {
      lookAtWaypointIndex7 = -1;
    }
  }


  if(spellWayPointIndex < spellWayPoints.length && spellWayPointIndex != -1) {
    spellWayPointIndex = moveUsingWaypoints(spellSGNode.matrix, spellWayPoints, spellWayPointIndex, 3.5);
    //spellSGNode.matrix[12] += 0.5;
    spellSGNode.matrix[13] += 0.5;
    //spellSGNode.matrix[14] += 0.5;
    //mat4.multiply(spellSGNode.matrix, spellSGNode.matrix, glm.rotateX(15));
    //mat4.multiply(spellSGNode.matrix, spellSGNode.matrix, glm.rotateY(15));
    //mat4.multiply(spellSGNode.matrix, spellSGNode.matrix, glm.rotateZ(15));
  }

  ObjectLookAtMatrix(spiderAndBillBoardNode, context.invViewMatrix, [0,1,0]);

  //<  context.invViewMatrix[13] += Math.sin(timeInMilliseconds*bobbSpeed)/bobbHeight;
  /*
  {
    var lookAt = mat4.lookAt(mat4.create(), [spiderTransformationNode.matrix[12], 0, spiderTransformationNode.matrix[14]], [context.invViewMatrix[12], 0, context.invViewMatrix[14]], [0, -1, 0]);

    for(var i = 0; i < 12; i++) {
      spiderTransformationNode.matrix[i] = lookAt[i];
    }
    mat4.multiply(spiderTransformationNode.matrix, spiderTransformationNode.matrix, glm.transform({rotateX:180}));
  }
  */
//updating camera position variables
  cameraPosition[0] = 0-context.invViewMatrix[12];
  cameraPosition[1] = 0-context.invViewMatrix[13];
  cameraPosition[2] = 0-context.invViewMatrix[14];

displayText(((timeInMilliseconds)/1000).toFixed(2)+"s" +
" " +context.invViewMatrix[12].toFixed(2)+" "
    +context.invViewMatrix[13].toFixed(2)+" "
    +context.invViewMatrix[14].toFixed(2));
  //translateLantern.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(1, -0.75, -2));
  if(!deathRoll) {
    lanternSGNode.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0.5, -0.65, -2));

  }
  youDiedSGNode.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0, 0, -3));

  if(!stabbed) {
    swordParent.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0, -3, -3));

  } else {
    if(swordWaypointIndex !== 1) {
      let stabbedPosition = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0, -1, -3));

      bloodPosSGNode.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0, -0.75, -4));

      for(var i = 0; i < 12; i++) {
        bloodPosSGNode.matrix[i] = andarielSGNode.matrix[i];
      }

      mat4.multiply(bloodPosSGNode.matrix, bloodPosSGNode.matrix, glm.rotateX(-90));
      //bloodPosSGNode.matrix = mat4.multiply(mat4.create(), swordParent.matrix, glm.translate(0, -1, -5));

      moveUsingWaypoints(swordParent.matrix, [stabbedPosition], 0, 0.6 * timediff);
      swordSGNode.matrix = swordParent.matrix;
      if(!turned) {
        reduceBloodParticle();
        mat4.multiply(swordSGNode.matrix,swordSGNode.matrix, glm.rotateX(90));
        mat4.multiply(swordSGNode.matrix, swordSGNode.matrix, mouseRotateMatrix);
        turned = 1;
      }

    }
  }
  if(deathRoll && !manualCameraEnabled) {
    moveUsingWaypoints(autoCameraLookAt, [glm.translate(1.56, -7.8, 88.7)], 0, 0.1);
    if(context.invViewMatrix[13] < -6) {
      context.invViewMatrix[13]-=0.05;
    }
    if(upY > 0) {
      upY -= 0.025;
      mat4.multiply(swordSGNode.matrix,swordSGNode.matrix, glm.rotateZ(-1));
      mat4.multiply(swordSGNode.matrix,swordSGNode.matrix, glm.rotateY(2));

    }
    if(upX < 1) {
      upX += 0.025;
    }
  }

  context.lookAtVector = lookAtVector;
  //mat4.multiply(swordSGNode.matrix, swordSGNode.matrix, glm.rotateX(90));
  //lanternSGNode.matrix = translateLantern.matrix;

  //render scenegraph
  root.render(context);

  //animate
  requestAnimationFrame(render);

  lastRenderTime = timeInMilliseconds;
}

function enableMovementHeadBobbing() {
  MovementHeadBobbing = 1;

  bobbSpeed = 75;
  bobbHeight = 25;
}
function disableMovementHeadBobbing() {
  MovementHeadBobbing = 0;

  bobbSpeed = 300;
  bobbHeight = 200;
}

//camera control
function initInteraction(canvas) {
  const mouse = {
    pos: { x : 0, y : 0},
    leftButtonDown: false
  };
  function toPos(event) {
    //convert to local coordinates
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  canvas.addEventListener('mousedown', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = event.button === 0;
  });
  canvas.addEventListener('mousemove', function(event) {
    const pos = toPos(event);
    const delta = { x : mouse.pos.x - pos.x, y: mouse.pos.y - pos.y };
    if (mouse.leftButtonDown && manualCameraEnabled) {
      //add the relative movement of the mouse to the rotation variables
  		camera.rotation.x += delta.x*.25;
  		camera.rotation.y += delta.y*.25, 180;
      camera.rotation.y = Math.min(90, camera.rotation.y);
      camera.rotation.y = Math.max(-90, camera.rotation.y);
    }
    mouse.pos = pos;
  });
  canvas.addEventListener('mouseup', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = false;
  });
  //register globally
  document.addEventListener('keypress', function(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    if (event.code === 'KeyR' && manualCameraEnabled) {
      camera.rotation.x = 0;
  		camera.rotation.y = 0;
      fov = 30;
    }
  });
  document.addEventListener('keydown', function(event) {
    if(manualCameraEnabled) {
      switch(event.code) {
        case 'ArrowUp':
        case 'KeyW':
          camera.movement.forward = 1;
          camera.movement.backward = 0;
          break;
        case 'ArrowDown':
        case 'KeyS':
          camera.movement.forward = 0;
          camera.movement.backward = 1;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          camera.movement.left = 1;
          camera.movement.right = 0;
          break;
        case 'ArrowRight':
        case 'KeyD':
          camera.movement.left = 0;
          camera.movement.right = 1;
          break;
        case 'ControlLeft':
          camera.movement.up = 0;
          camera.movement.down = 1;
          break;
        case 'Space':
          camera.movement.up = 1;
          camera.movement.down = 0;
          break;
        case 'ShiftLeft':
          movementSpeedModifier = 5;
        break;
        case 'KeyR':
          fov = Math.min(175, fov+5);
        break;
        case 'KeyT':
          fov = Math.max(5, fov-5);
        break;
      }
    } else {
      switch(event.code) {
        case 'KeyC':
          manualCameraEnabled = true;
          disableMovementHeadBobbing();
          deathRoll = 0;
          b2fNodes.remove(swordSGNode);
          break;
      }
    }

  });

  document.addEventListener('keyup', function(event) {
    if(manualCameraEnabled) {
      switch(event.code) {
        case 'ArrowUp':
        case 'KeyW':
        camera.movement.forward = 0;
        disableMovementHeadBobbing();
        break;
        case 'ArrowDown':
        case 'KeyS':
        camera.movement.backward = 0;
        disableMovementHeadBobbing();
          break;
        case 'ArrowLeft':
        case 'KeyA':
        camera.movement.left = 0;
        disableMovementHeadBobbing();
          break;
        case 'ArrowRight':
        case 'KeyD':
        camera.movement.right = 0;
        disableMovementHeadBobbing();
          break;
        case 'ControlLeft':
        camera.movement.down = 0;
          break;
        case 'Space':
          camera.movement.up = 0;
          break;
        case 'ShiftLeft':
          movementSpeedModifier = 1;
        break;
      }
    } else {
      switch(event.code) {
        case 'KeyC':
          manualCameraEnabled = true;
          break;
      }
    }

  });
}
