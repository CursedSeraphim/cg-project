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
var manualCameraEnabled;
var startTime;
var lastRenderTime;

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
var particleNodes;
var lightingNodes;
var translateLantern;
var translateTorch1;
var translateTorch2;
var b2fNodes;
var diabloSGNode;
var orcShamanSGNode;
var durielSGNode;
var andarielSGNode;
var lanternSGNode;
var hipSGNode1;
var ribCageSGNode1;
var skullSGNode1;
var boneSGNode1;
var bone2SGNode1;
var bones1SGNode1;
var bones1SGNode2;
var skullPileSGNode1;
var skullPileSGNode2;
var hipBoneSGNode;

var crownSGNode;
var crystalSwordSGNode;
var blueJewelSGNode;
var maskSGNode;
var rubySGNode;
var emeraldSGNode;
var tiaraSGNode;
var goldSkinSGNode;
var tridentSGNode;
var goldPile1SGNode;
var goldPile2SGNode;
var goldPile3SGNode;
var goldPile4SGNode;
var goldPile5SGNode;

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

var diamondMatrixSniffer;
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
var cameraWaypointIndex;
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
var diabloWaypoints;
var diabloWaypointIndex;
var spiderWaypointIndex;
var spiderWaypoints;

//TriggerSGNode
var triggerTestNode;
var triggerSGNode2;
var triggerSGNode3;
var triggerSGNode4;
var triggerSGNode5;
var triggerSGNode6;
var triggerSGNode7;
var triggerSGNode8;
var triggerSGNode9;
var triggerSGNode10;

/*DEBUG NODES*/

/*Shader Programs*/
var particleShaderProgram;

//textures
var envcubetexture;
var renderTargetColorTexture;
var renderTargetDepthTexture;
var diceTextureNode;
var floorTextureNode;
var cobbleTextureNode;
var web1TextureNode;
var lavaTextureNode;
var diabloTextureNode;
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
  vs_single: 'shader/single.vs.glsl',
  fs_single: 'shader/single.fs.glsl',
  vs_particle:  'shader/particle.vs.glsl',
  fs_particle:  'shader/particle.fs.glsl',

  model: 'models/C-3PO.obj',
  modelCube: 'models/cube.obj',
  modeld4: 'models/d4.obj',
  modelFloor20x20: 'models/floor_20x20.obj',
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

  lavaTexture: 'textures/lava/lava.jpg',
  diceTexture: 'textures/misc/diemap.jpg',
  WebTexture1: 'textures/cobwebs/web.png',
  floorTexture: 'textures/dungeon/floor_cobble.jpg',
  stoaqTexture: 'textures/dungeon/stoaquad.jpg',
  cobbleTexture: 'textures/dungeon/dungeon_wall.png',
  diabloImage: 'textures/diablo/diablo.png',
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

diamond: 'textures/diamond/gem.png'

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

  spellWayPoints = [glm.translate(0, 0, 0)];

  //-1 is used to trigger the orc shaman at a later point
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

  let waypointd1 = mat4.create();
  waypointd1[12] = -3;
  waypointd1[13] = 2;
  waypointd1[14] = -3;
  let waypointd2 = mat4.create();
  waypointd2[12] = 3;
  waypointd2[13] = 2;
  waypointd2[14] = -3;
  let waypointd3 = mat4.create();
  waypointd3[12] = 3;
  waypointd3[13] = 2;
  waypointd3[14] = 3;
  let waypointd4 = mat4.create();
  waypointd4[12] = -3;
  waypointd4[13] = 2;
  waypointd4[14] = 3;
  diabloWaypointIndex = 0;
  diabloWaypoints = [waypointd1, waypointd2, waypointd3, waypointd4];

  /*initialize the shaderPrograms*/
  particleShaderProgram = createProgram(gl, resources.vs_particle, resources.fs_particle);

  floorTextureNode = new AdvancedTextureSGNode(resources.floorTexture);
  lavaTextureNode  = new AdvancedTextureSGNode(resources.lavaTexture);
  diceTextureNode = new AdvancedTextureSGNode(resources.diceTexture);
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
  crownTextureNode = new AdvancedTextureSGNode(resources.crownTexture);
  blueJewelTextureNode = new AdvancedTextureSGNode(resources.blueJewelTexture);
  crystalSwordTextureNode = new AdvancedTextureSGNode(resources.crystalSwordTexture);
  maskTextureNode = new AdvancedTextureSGNode(resources.maskTexture);
  rubyTextureNode = new AdvancedTextureSGNode(resources.rubyTexture);
  emeraldTextureNode = new AdvancedTextureSGNode(resources.emeraldTexture);
  tiaraTextureNode = new AdvancedTextureSGNode(resources.tiaraTexture);
  goldSkinTextureNode = new AdvancedTextureSGNode(resources.goldSkinTexture);
  tridentTextureNode = new AdvancedTextureSGNode(resources.tridentTexture);

  goldPile1TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);
  goldPile2TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);
  goldPile3TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);
  goldPile4TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);
  goldPile5TextureNode = new AdvancedTextureSGNode(resources.goldPileTexture);

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
diabloTextureNode = new TextureSGNode(dreughFrames, 0, 75);
orcShamanTextureNode = new TextureSGNode(orcShamanFrames, 0, 75);
durielTextureNode = new TextureSGNode(durielFrames, 0, 75);
andarielTextureNode = new TextureSGNode(andarielFrames, 0, 75);
diceTextureNode = diabloTextureNode;
  //initRenderToTexture();

  gl.enable(gl.DEPTH_TEST);

  //create scenegraph
  root = createSceneGraph(gl, resources);

  /*set triggers*/
  triggerSGNode2 = new TriggerSGNode(2, glm.translate(25, -3.5, -8.5), function() {
    autoCameraLookAt = orcShamanSGNode.matrix;
    orcShamanWaypointIndex = 0;
    lookAtWaypointIndex = lookAtWaypoints.length;
  });
  //node triggered by orc reaching is second waypoint
  triggerSGNode3 = new ObjectTriggerSGNode(0.1, orcShamanSGNode.matrix, wpOrcShaman2, function() {
    autoCameraLookAt = wpOrcShaman2;
    lookAtWaypointIndex = lookAtWaypoints.length;
    lookAtWaypointIndex2 = 0;
  });
  triggerSGNode4 = new TriggerSGNode(0.1, wpCam7, function() {
    waitingSince = time();
    waitingFor = 1000;
    disableMovementHeadBobbing();
    setTimeout(enableMovementHeadBobbing, waitingFor);
  });

  triggerSGNode5 = new TriggerSGNode(0.1, wpCam8, function() {
    waitingSince = time();
    waitingFor = 500;
    disableMovementHeadBobbing();
    setTimeout(enableMovementHeadBobbing, waitingFor);
  });
  //trigger spider movement
  triggerSGNode6 = new TriggerSGNode(3, wpCam8, function() {
    spiderMoving = 1;
  });
  //trigger spider to stop moving
  triggerSGNode7 = new TriggerSGNode(3, wpCam12, function() {
    console.log("trigger 7");
    spiderMoving = 0;

  });
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
  triggerSGNode8 = new TriggerSGNode(3, wpCam8, function() {
    fireSpellVolley = 1;
    //as long as second waypoint is not reached and fireSpellVolley is 1 spells will continue to fire the spider
    var startInterval = function() {
      if(fireSpellVolley) {
        fireSpell();
        setTimeout(startInterval, 375+Math.random()*100);
      }
    };
    setTimeout(startInterval, 1000);

  });

  triggerSGNode9 = new TriggerSGNode(3, wpCam10, function() {
    fireSpellVolley = 0;
    lookAtWaypointIndex6 = 0;
    autoCameraLookAt = glm.translate(spiderAndBillBoardNode.matrix[12], spiderAndBillBoardNode.matrix[13], spiderAndBillBoardNode.matrix[14]);
  });


  triggerSGNode10 = new TriggerSGNode(0.1, wpCam13, function() {
    disableMovementHeadBobbing();
  });

  root.append(triggerSGNode2);
  root.append(triggerSGNode3);
  root.append(triggerSGNode4);
  root.append(triggerSGNode5);
  root.append(triggerSGNode6);
  root.append(triggerSGNode7);
  root.append(triggerSGNode8);
  root.append(triggerSGNode9);
  root.append(triggerSGNode10);

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

  //particleNodes = new ShaderSGNode(particleShaderProgram);
  lightingNodes = new LightingSGNode();
  b2fNodes = new Back2FrontSGNode();
  root.append(new BlendSgNode(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, lightingNodes));

  //light debug helper function
  function createLightSphere() {
    return new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single), [
      new RenderSGNode(makeSphere(.2,10,10))
    ]);
  }

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

/*Place the interior of the dungeon*/
{
  //lightingNodes.append(cube)
}

/*Add orc shaman*/
{
  var rect = makeTexturedRect(2, 2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
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
  let mapFloor = new MaterialSGNode(floorTextureNode);
  mapFloor.ambient = [1, 1, 1, 1];
  mapFloor.diffuse = [1, 1, 1, 1];
  mapFloor.specular = [0.1, 0.1, 0.1, 0.1];
  mapFloor.shininess = 1000;
  lightingNodes.append(mapFloor);

  //initialize map walls
  cobbleTextureNode.append(new RenderSGNode(resources.modelMapCobble));
  let mapCobble = new MaterialSGNode(cobbleTextureNode);
  mapCobble.ambient = [1, 1, 1, 1];
  mapCobble.diffuse = [1, 1, 1, 1];
  mapCobble.specular = [0.1, 0.1, 0.1, 0.1];
  mapCobble.shininess = 1000;
  lightingNodes.append(mapCobble);

  //initialize map spiked bars
  spikedBarsTextureNode.append(new RenderSGNode(resources.modelMapSpikedBars));
  let mapSpikedBars = new MaterialSGNode(spikedBarsTextureNode);
  mapSpikedBars.ambient = [1, 1, 1, 1];
  mapSpikedBars.diffuse = [1, 1, 1, 1];
  mapSpikedBars.specular = [0.1, 0.1, 0.1, 0.1];
  mapSpikedBars.shininess = 1000;
  lightingNodes.append(orcShamanTextureNode);
  lightingNodes.append(mapSpikedBars);

  //initialize map sky
  skyTextureNode.append(new RenderSGNode(resources.modelMapSky));
  let mapSky = new MaterialSGNode(skyTextureNode);
  mapSky.ambient = [1, 1, 1, 1];
  mapSky.diffuse = [1, 1, 1, 1];
  mapSky.specular = [0.0, 0.0, 0.0, 0.0];
  mapSky.shininess = 1.0;
  lightingNodes.append(mapSky);

  //initialize map torches
  metalTextureNode2.append(new RenderSGNode(resources.modelMapTorches));
  let mapTorches = new MaterialSGNode(metalTextureNode2);
  mapTorches.ambient = [1, 1, 1, 1];
  mapTorches.diffuse = [1, 1, 1, 1];
  mapTorches.specular = [0.0, 0.0, 0.0, 0.0];
  mapTorches.shininess = 1.0;
  lightingNodes.append(mapTorches);

  //initialize map pentagram
  pentagramTextureNode.append(new RenderSGNode(resources.modelMapPentagram));
  let pentagram = new MaterialSGNode(pentagramTextureNode);
  pentagram.ambient = [1, 1, 1, 1];
  pentagram.diffuse = [1, 1, 1, 1];
  pentagram.specular = [0.1, 0.1, 0.1, 0.1];
  pentagram.shininess = 1000;
  lightingNodes.append(pentagram);

  //initialize map cobwebs
  web1TextureNode.append(new RenderSGNode(resources.modelMapWebs));
  let mapWebs = new MaterialSGNode(web1TextureNode);
  mapWebs.ambient = [1, 1, 1, 1];
  mapWebs.diffuse = [1, 1, 1, 1];
  mapWebs.specular = [0.1, 0.1, 0.1, 0.1];
  mapWebs.shininess = 1000;
  lightingNodes.append(mapWebs);

  //initialize map glass
  stainedGlassTextureNode.append(new RenderSGNode(resources.modelMapGlass));
  let mapGlass = new MaterialSGNode(stainedGlassTextureNode);
  mapGlass.ambient = [1, 1, 1, 1];
  mapGlass.diffuse = [1, 1, 1, 1];
  mapGlass.specular = [1, 1, 1, 1];
  mapGlass.shininess = 1000;
  lightingNodes.append(mapGlass);

}

{
  /*Init lantern*/
  let lanternParticleNode = new FireSGNode(50, [0.05,0.025,0.05]);
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
  torchNode.decreaseRate = 25;

  torchNode.append(lanternFireParticleNode);

  let rotatelantern = new TransformationSGNode(glm.rotateY(180));
  lanternSGNode = new TransformationSGNode(glm.translate(0,2,0),
        [torchNode, rotatelantern]);

  //initialize lantern glass
  glassTextureNode.append(new RenderSGNode(resources.modelLanternGlass));
  let glassMaterial = new MaterialSGNode(glassTextureNode);
  glassMaterial.ambient = [1, 1, 1, 1];
  glassMaterial.diffuse = [1, 1, 1, 1];
  glassMaterial.specular = [0.1, 0.1, 0.1, 0.1];
  glassMaterial.shininess = 1000;
  rotatelantern.append(glassMaterial);
  //initialize lantern metal
  metalTextureNode.append(new RenderSGNode(resources.modelLanternMetal));
  let metalMaterial = new MaterialSGNode(metalTextureNode);
  metalMaterial.ambient = [0.6, 0.6, 0.6, 1];
  metalMaterial.diffuse = [0.6, 0.6, 0.6, 1];
  metalMaterial.specular = [0.6, 0.6, 0.6, 1];
  metalMaterial.shininess = 2000;
  rotatelantern.append(metalMaterial);

  //initialize lantern grid
  gridTextureNode.append(new RenderSGNode(resources.modelLanternGrid));
  let gridMaterial = new MaterialSGNode(gridTextureNode);
  gridMaterial.ambient = [0.24725, 0.1995, 0.0745, 1];
  gridMaterial.diffuse = [0.75164, 0.60648, 0.22648, 1];
  gridMaterial.specular = [0, 0, 0, 1];
  gridMaterial.shininess = 2000;
  rotatelantern.append(gridMaterial);

}

/*Add diablo*/
{
  var rect = makeTexturedRect(2, 2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  diabloSGNode = new BillboardSGNode(glm.transform({translate: [2,0,2]}), [
    new RenderSGNode(rect)
  ]);
  let diabloMaterialNode = new MaterialSGNode(diabloSGNode);
  diabloMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  diabloMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  diabloMaterialNode.specular = [1, 1, 1, 1];
  diabloMaterialNode.shininess = 1000;

  diabloTextureNode.append(diabloMaterialNode);
  b2fNodes.append(diabloTextureNode);
}

/*Add skull piles*/
{
  var rect = makeTexturedRect(1.25, 1.25, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  skullPileSGNode1 = new BillboardSGNode(glm.transform({translate: [39.4,-5,4.1]}));
  let skullPile1MaterialNode = new MaterialSGNode(skullPile1TextureNode);
  skullPile1MaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  skullPile1MaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  skullPile1MaterialNode.specular = [1, 1, 1, 1];
  skullPile1MaterialNode.shininess = 1000;
  skullPileSGNode1.append(skullPile1MaterialNode);
  skullPile1TextureNode.append(new RenderSGNode(rect));
  b2fNodes.append(skullPileSGNode1);

  var rect = makeTexturedRect(1.25, 1.25, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  skullPileSGNode2 = new BillboardSGNode(glm.transform({translate: [48,-5,4.1]}));
  let skullPile2MaterialNode = new MaterialSGNode(skullPile1TextureNode);
  skullPile2MaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  skullPile2MaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  skullPile2MaterialNode.specular = [1, 1, 1, 1];
  skullPile2MaterialNode.shininess = 1000;
  skullPileSGNode2.append(skullPile2MaterialNode);
  skullPile1TextureNode.append(new RenderSGNode(rect));
  b2fNodes.append(skullPileSGNode2);
}

/*Add bone piles*/
{
  var rect = makeTexturedRect(0.3, 0.3, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  bones1SGNode1 = new BillboardSGNode(glm.transform({translate: [44,.25,29.3]}));
  let bones1MaterialNode = new MaterialSGNode(bones1TextureNode);
  bones1MaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  bones1MaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  bones1MaterialNode.specular = [1, 1, 1, 1];
  bones1MaterialNode.shininess = 1000;
  bones1SGNode1.append(bones1MaterialNode);
  bones1TextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(bones1SGNode1);

  var rect = makeTexturedRect(0.3, 0.3, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  bones1SGNode2 = new BillboardSGNode(glm.transform({translate: [25.6,-5.25,-8.44]}));
  let bones2MaterialNode = new MaterialSGNode(bones2TextureNode);
  bones2MaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  bones2MaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  bones2MaterialNode.specular = [1, 1, 1, 1];
  bones2MaterialNode.shininess = 1000;
  bones1SGNode2.append(bones2MaterialNode);
  bones2TextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(bones1SGNode2);
}

/*Add Duriel*/
{
  var rect = makeTexturedRect(2.5, 2.5, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  durielSGNode = new BillboardSGNode(glm.transform({translate: [43.5,-3.25,13.5]}));
  let durielMaterialNode = new MaterialSGNode(durielTextureNode);
  durielMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  durielMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  durielMaterialNode.specular = [1, 1, 1, 1];
  durielMaterialNode.shininess = 1000;
  durielSGNode.append(durielMaterialNode);
  durielTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(durielSGNode);
}

/*Add trident*/
{
  var rect = makeTexturedRect(2, 2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  tridentSGNode = new BillboardSGNode(glm.transform({translate:[-9.06,-8.25, 95.48]}));
  let tridentMat = new MaterialSGNode(tridentTextureNode);
  tridentMat.ambient = [0.6, 0.6, 0.6, 1];
  tridentMat.diffuse = [0.5, 0.5, 0.5, 1];
  tridentMat.specular = [1, 1, 1, 1];
  tridentMat.shininess = 1000;
  tridentSGNode.append(tridentMat);
  tridentTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(tridentSGNode);
}

/*Add goldskin*/
{
  var rect = makeTexturedRect(2, 2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  goldSkinSGNode = new BillboardSGNode(glm.transform({translate: [-9.12,-8.75, 92.54]}));
  let goldSkinMat = new MaterialSGNode(goldSkinTextureNode);
  goldSkinMat.ambient = [0.6, 0.6, 0.6, 1];
  goldSkinMat.diffuse = [0.5, 0.5, 0.5, 1];
  goldSkinMat.specular = [1, 1, 1, 1];
  goldSkinMat.shininess = 1000;
  goldSkinSGNode.append(goldSkinMat);
  goldSkinTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(goldSkinSGNode);
}


/*Add tiara*/
{
  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  tiaraSGNode = new BillboardSGNode(glm.transform({translate: [1.56, -7.8, 88.75]}));
  let tiaraMat = new MaterialSGNode(tiaraTextureNode);
  tiaraSGNode.ambient = [0.6, 0.6, 0.6, 1];
  tiaraSGNode.diffuse = [0.5, 0.5, 0.5, 1];
  tiaraSGNode.specular = [1, 1, 1, 1];
  tiaraSGNode.shininess = 1000;
  tiaraSGNode.append(tiaraMat);
  tiaraTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(tiaraSGNode);
}

/*Add emerald*/
{
  var rect = makeTexturedRect(0.2, 0.2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  emeraldSGNode = new BillboardSGNode(glm.transform({translate: [3.5, -8.45, 90.2]}));
  let emeraldMat = new MaterialSGNode(emeraldTextureNode);
  emeraldSGNode.ambient = [0.6, 0.6, 0.6, 1];
  emeraldSGNode.diffuse = [0.5, 0.5, 0.5, 1];
  emeraldSGNode.specular = [1, 1, 1, 1];
  emeraldSGNode.shininess = 1000;
  emeraldSGNode.append(emeraldMat);
  emeraldTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(emeraldSGNode);
}

/*Add ruby*/
{
  var rect = makeTexturedRect(0.2, 0.2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  rubySGNode = new BillboardSGNode(glm.transform({translate: [2.25, -8.45, 90.98]}));
  let rubyMat = new MaterialSGNode(rubyTextureNode);
  rubySGNode.ambient = [0.6, 0.6, 0.6, 1];
  rubySGNode.diffuse = [0.5, 0.5, 0.5, 1];
  rubySGNode.specular = [1, 1, 1, 1];
  rubySGNode.shininess = 1000;
  rubySGNode.append(rubyMat);
  rubyTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(rubySGNode);
}

/*Add blue jewel*/
{
  var rect = makeTexturedRect(0.2, 0.2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  blueJewelSGNode = new BillboardSGNode(glm.transform({translate: [2.76, -8.45, 86.56]}));
  let jewelMat = new MaterialSGNode(blueJewelTextureNode);
  jewelMat.ambient = [0.6, 0.6, 0.6, 1];
  jewelMat.diffuse = [0.5, 0.5, 0.5, 1];
  jewelMat.specular = [1, 1, 1, 1];
  jewelMat.shininess = 1000;
  blueJewelSGNode.append(jewelMat);
  blueJewelTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(blueJewelSGNode);
}

/*Add mask*/
{
  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  maskSGNode = new BillboardSGNode(glm.transform({translate: [3, -8.25, 88.2]}));
  let maskMat = new MaterialSGNode(maskTextureNode);
  maskMat.ambient = [0.6, 0.6, 0.6, 1];
  maskMat.diffuse = [0.5, 0.5, 0.5, 1];
  maskMat.specular = [1, 1, 1, 1];
  maskMat.shininess = 1000;
  maskSGNode.append(maskMat);
  maskTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(maskSGNode);
}

/*Add gold piles*/
{
  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  goldPile1SGNode = new BillboardSGNode(glm.transform({translate: [3.22, -8.5, 92]}));
  let goldPileMat = new MaterialSGNode(goldPile1TextureNode);
  goldPileMat.ambient = [0.6, 0.6, 0.6, 1];
  goldPileMat.diffuse = [0.5, 0.5, 0.5, 1];
  goldPileMat.specular = [1, 1, 1, 1];
  goldPileMat.shininess = 1000;
  goldPile1SGNode.append(goldPileMat);
  goldPile1TextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(goldPile1SGNode);

  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  goldPile2SGNode = new BillboardSGNode(glm.transform({translate: [5, -9, 89.144]}));
  let goldPileMat2 = new MaterialSGNode(goldPile2TextureNode);
  goldPileMat2.ambient = [0.6, 0.6, 0.6, 1];
  goldPileMat2.diffuse = [0.5, 0.5, 0.5, 1];
  goldPileMat2.specular = [1, 1, 1, 1];
  goldPileMat2.shininess = 1000;
  goldPile2SGNode.append(goldPileMat2);
  goldPile2TextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(goldPile2SGNode);

  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  goldPile3SGNode = new BillboardSGNode(glm.transform({translate: [1.57, -8, 91.5]}));
  let goldPileMat3 = new MaterialSGNode(goldPile3TextureNode);
  goldPileMat3.ambient = [0.6, 0.6, 0.6, 1];
  goldPileMat3.diffuse = [0.5, 0.5, 0.5, 1];
  goldPileMat3.specular = [1, 1, 1, 1];
  goldPileMat3.shininess = 1000;
  goldPile3SGNode.append(goldPileMat3);
  goldPile3TextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(goldPile3SGNode);

  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  goldPile4SGNode = new BillboardSGNode(glm.transform({translate: [1.0, -8, 89.77]}));
  let goldPileMat4 = new MaterialSGNode(goldPile4TextureNode);
  goldPileMat4.ambient = [0.6, 0.6, 0.6, 1];
  goldPileMat4.diffuse = [0.5, 0.5, 0.5, 1];
  goldPileMat4.specular = [1, 1, 1, 1];
  goldPileMat4.shininess = 1000;
  goldPile4SGNode.append(goldPileMat4);
  goldPile4TextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(goldPile4SGNode);

  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  goldPile5SGNode = new BillboardSGNode(glm.transform({translate:[0.77, -8, 91.47]}));
  let goldPileMat5 = new MaterialSGNode(goldPile5TextureNode);
  goldPileMat5.ambient = [0.6, 0.6, 0.6, 1];
  goldPileMat5.diffuse = [0.5, 0.5, 0.5, 1];
  goldPileMat5.specular = [1, 1, 1, 1];
  goldPileMat5.shininess = 1000;
  goldPile5SGNode.append(goldPileMat5);
  goldPile5TextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(goldPile5SGNode);
}

/*Add crown*/
{
  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  crownSGNode = new BillboardSGNode(glm.transform({translate: [0.247, -8.25, 86.94]}));
  let crownMat = new MaterialSGNode(crownTextureNode);
  crownMat.ambient = [0.6, 0.6, 0.6, 1];
  crownMat.diffuse = [0.5, 0.5, 0.5, 1];
  crownMat.specular = [1, 1, 1, 1];
  crownMat.shininess = 1000;
  crownSGNode.append(crownMat);
  crownTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(crownSGNode);
}

/*Add crystal sword*/
{
  var rect = makeTexturedRect(2, 2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  crystalSwordSGNode = new BillboardSGNode(glm.transform({translate: [-9.3,-8.25, 99.2]}));
  let swordMat = new MaterialSGNode(crystalSwordTextureNode);
  swordMat.ambient = [0.6, 0.6, 0.6, 1];
  swordMat.diffuse = [0.5, 0.5, 0.5, 1];
  swordMat.specular = [1, 1, 1, 1];
  swordMat.shininess = 1000;
  crystalSwordSGNode.append(swordMat);
  crystalSwordTextureNode.append(new RenderSGNode(rect));

  b2fNodes.append(crystalSwordSGNode);
}

/*Add ribCage*/
{
  var rect = makeTexturedRect(0.4, 0.4, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  ribCageSGNode1 = new BillboardSGNode(glm.transform({translate: [21,-4.75,-9.5]}));
  let ribCageMaterialNode = new MaterialSGNode(ribCageTextureNode);
  ribCageMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  ribCageMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  ribCageMaterialNode.specular = [1, 1, 1, 1];
  ribCageMaterialNode.shininess = 1000;
  ribCageSGNode1.append(ribCageMaterialNode);
  ribCageTextureNode.append(new RenderSGNode(rect));

  lightingNodes.append(ribCageSGNode1);
}

/*Add bones*/
{
  var rect = makeTexturedRect(0.3, 0.3, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  boneSGNode1 = new BillboardSGNode(glm.transform({translate: [25.1,-5.25,-1]}));
  let boneMaterialNode = new MaterialSGNode(boneTextureNode);
  boneMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  boneMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  boneMaterialNode.specular = [1, 1, 1, 1];
  boneMaterialNode.shininess = 1000;
  boneSGNode1.append(boneMaterialNode);
  boneTextureNode.append(new RenderSGNode(rect));

  lightingNodes.append(boneSGNode1);

  var rect = makeTexturedRect(0.3, 0.3, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  bone2SGNode1 = new BillboardSGNode(glm.transform({translate: [40,.25,32.5]}));
  let bone2MaterialNode = new MaterialSGNode(bone2TextureNode);
  bone2MaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  bone2MaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  bone2MaterialNode.specular = [1, 1, 1, 1];
  bone2MaterialNode.shininess = 1000;
  bone2TextureNode.append(bone2MaterialNode);
  bone2TextureNode.append(new RenderSGNode(rect));

  lightingNodes.append(bone2SGNode1);
}

/*Add skull*/
{
  var rect = makeTexturedRect(0.3, 0.3, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  skullSGNode1 = new BillboardSGNode(glm.transform({translate: [10,0.5,-9.5]}));
  let skullCageMaterialNode = new MaterialSGNode(skullTextureNode);
  skullCageMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  skullCageMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  skullCageMaterialNode.specular = [1, 1, 1, 1];
  skullCageMaterialNode.shininess = 1000;
  skullSGNode1.append(skullCageMaterialNode);
  skullTextureNode.append(new RenderSGNode(rect));

  lightingNodes.append(skullSGNode1);
}

/*Add hip*/
{
  var rect = makeTexturedRect(0.3, 0.3, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  hipSGNode1 = new BillboardSGNode(glm.transform({translate: [9.5,0.5,-4.5]}));
  let hipMaterialNode = new MaterialSGNode(imSoHipTextureNode);
  hipMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  hipMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  hipMaterialNode.specular = [1, 1, 1, 1];
  hipMaterialNode.shininess = 1000;
  hipSGNode1.append(hipMaterialNode);
  imSoHipTextureNode.append(new RenderSGNode(rect));

  lightingNodes.append(hipSGNode1);
}

/*add spider*/
{
  spiderAndBillBoardNode = new TransformationSGNode(glm.transform({translate: [spiderStartingPosition[0], spiderStartingPosition[1], spiderStartingPosition[2]], rotateY: 0}));
  spiderTransformationNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderMovementSet1SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderMovementSet2SGNode = new TransformationSGNode(glm.translate(0,0,0));

  spiderTextureNode1.append(new RenderSGNode(resources.modelSpiderAbdomen));
  let spiderMaterial1 = new MaterialSGNode(spiderTextureNode1);
  spiderMaterial1.ambient = [1, 1, 1, 1];
  spiderMaterial1.diffuse = [1, 1, 1, 1];
  spiderMaterial1.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial1.shininess = 1000;
  spiderAbdomenSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderAbdomenSGNode.append(spiderMaterial1);

  spiderTextureNode2.append(new RenderSGNode(resources.modelSpiderLeftFrontLeg));
  let spiderMaterial2 = new MaterialSGNode(spiderTextureNode2);
  spiderMaterial2.ambient = [1, 1, 1, 1];
  spiderMaterial2.diffuse = [1, 1, 1, 1];
  spiderMaterial2.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial2.shininess = 1000;
  spiderLeftFrontLegSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderLeftFrontLegSGNode.append(spiderMaterial2);

  spiderTextureNode3.append(new RenderSGNode(resources.modelSpiderLeftFrontLeg2));
  let spiderMaterial3 = new MaterialSGNode(spiderTextureNode3);
  spiderMaterial3.ambient = [1, 1, 1, 1];
  spiderMaterial3.diffuse = [1, 1, 1, 1];
  spiderMaterial3.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial3.shininess = 1000;
  spiderLeftFrontLeg2SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderLeftFrontLeg2SGNode.append(spiderMaterial3);

  spiderTextureNode4.append(new RenderSGNode(resources.modelSpiderLeftHindLeg2));
  let spiderMaterial4 = new MaterialSGNode(spiderTextureNode4);
  spiderMaterial4.ambient = [1, 1, 1, 1];
  spiderMaterial4.diffuse = [1, 1, 1, 1];
  spiderMaterial4.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial4.shininess = 1000;
  spiderLeftHindLeg2SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderLeftHindLeg2SGNode.append(spiderMaterial4);

  spiderTextureNode5.append(new RenderSGNode(resources.modelSpiderLeftHindLeg));
  let spiderMaterial5 = new MaterialSGNode(spiderTextureNode5);
  spiderMaterial5.ambient = [1, 1, 1, 1];
  spiderMaterial5.diffuse = [1, 1, 1, 1];
  spiderMaterial5.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial5.shininess = 1000;
  spiderLeftHindLegSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderLeftHindLegSGNode.append(spiderMaterial5);

  spiderTextureNode6.append(new RenderSGNode(resources.modelSpiderRightFrontLeg));
  let spiderMaterial6 = new MaterialSGNode(spiderTextureNode6);
  spiderMaterial6.ambient = [1, 1, 1, 1];
  spiderMaterial6.diffuse = [1, 1, 1, 1];
  spiderMaterial6.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial6.shininess = 1000;
  spiderRightFrontLegSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderRightFrontLegSGNode.append(spiderMaterial6);

  spiderTextureNode7.append(new RenderSGNode(resources.modelSpiderRightFrontLeg2));
  let spiderMaterial7 = new MaterialSGNode(spiderTextureNode7);
  spiderMaterial7.ambient = [1, 1, 1, 1];
  spiderMaterial7.diffuse = [1, 1, 1, 1];
  spiderMaterial7.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial7.shininess = 1000;
  spiderRightFrontLeg2SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderRightFrontLeg2SGNode.append(spiderMaterial7);

  spiderTextureNode8.append(new RenderSGNode(resources.modelSpiderRightHindLeg2));
  let spiderMaterial8 = new MaterialSGNode(spiderTextureNode8);
  spiderMaterial8.ambient = [1, 1, 1, 1];
  spiderMaterial8.diffuse = [1, 1, 1, 1];
  spiderMaterial8.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial8.shininess = 1000;
  spiderRightHindLeg2SGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderRightHindLeg2SGNode.append(spiderMaterial8);

  spiderTextureNode9.append(new RenderSGNode(resources.modelSpiderRightHindLeg));
  let spiderMaterial9 = new MaterialSGNode(spiderTextureNode9);
  spiderMaterial9.ambient = [1, 1, 1, 1];
  spiderMaterial9.diffuse = [1, 1, 1, 1];
  spiderMaterial9.specular = [0.3, 0.3, 0.3, 0.3];
  spiderMaterial9.shininess = 1000;
  spiderRightHindLegSGNode = new TransformationSGNode(glm.translate(0,0,0));
  spiderRightHindLegSGNode.append(spiderMaterial9);

  var rect = makeTexturedRect(2.5, 2.5, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  andarielSGNode = new TransformationSGNode(glm.transform({translate: [0,2.65,-2], rotateX:180}));
  let andarielMaterialNode = new MaterialSGNode(andarielTextureNode);
  andarielMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  andarielMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  andarielMaterialNode.specular = [0.1, 0.1, 0.1, 0.1];
  andarielMaterialNode.shininess = 1000;
  andarielSGNode.append(andarielMaterialNode);
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

/*create Diamond*/
{
  //initialize lantern glass
  diamondTextureNode.append(new RenderSGNode(makeDiamond()));
  let diamondMaterial = new MaterialSGNode(diamondTextureNode);
  diamondMaterial.ambient = [1, 1, 1, 1];
  diamondMaterial.diffuse = [1, 1, 1, 1];
  diamondMaterial.specular = [1, 1, 1, 1];
  diamondMaterial.shininess = 100;
  diamondUpDownNode = new TransformationSGNode(glm.translate(0,0,0), diamondMaterial);
  diamondRotateNode = new TransformationSGNode(glm.translate(0,-7, 90), diamondUpDownNode);
  diamondTransformationNode = new TransformationSGNode(glm.translate(0,-6, 90), diamondRotateNode);
  diamondMatrixSniffer = new SnifferSGNode(diamondTransformationNode);
  //TODO
  let particles = createParticleNode(500, [4,30,4], [0.75, 0.6, 1], [0.75/8, 0.6/8, 1/8]);
  diamondUpDownNode.append(particles);

  b2fNodes.append(diamondMatrixSniffer);

  let diamondLight = new AdvancedLightSGNode(false);
  diamondLight.ambient = [0.0,0.2,0.6,1];
  diamondLight.diffuse = [0.0,0.4,1,1];
  diamondLight.specular = [0,0.4,1,1];
  diamondLight.decreaseRate = 7;

  diamondRotateNode.append(diamondLight);

  /*place spotlight*/

  let moonLight = new AdvancedLightSGNode(false, 10, [0,1,-0.8], [0,5,80]);
  moonLight.ambient = [0,0,0,1];
  moonLight.diffuse = [1,1,1,1];
  moonLight.specular = [1,1,1,1];
  moonLight.append(createLightSphere());
  moonLight.decreaseRate = 1000;
  b2fNodes.append(moonLight);
}

  //lightingNodes.append(diabloTextureNode);
  //lightingNodes.append(b2fNodes);
  //root.append(particleNodes);
  lightingNodes.append(b2fNodes);
  lightingNodes.append(lanternSGNode);
  return root;
}

function makeTexturedRect(x, y, a) {
  var rect = makeRect(x, y);
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
      partNode || new FireSGNode(size, area, colorMult, colorMin))
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

  diabloWaypointIndex = moveUsingWaypoints(diabloSGNode.matrix, diabloWaypoints, diabloWaypointIndex, 0.1*timediff);
  if(diabloWaypointIndex == diabloWaypoints.length) {
    //makes the object patrol back to first waypoint
    diabloWaypointIndex = 0;
  }
  if(orcShamanWaypointIndex < orcShamanWaypoints.length && orcShamanWaypointIndex !== -1) {
    orcShamanWaypointIndex = moveUsingWaypoints(orcShamanSGNode.matrix, orcShamanWaypoints, orcShamanWaypointIndex, 0.1*timediff);
  }

  //setup viewport
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //setup context and camera matrices
  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 110);
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
  context.lookAtVector = lookAtVector;
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

    lookAtObject(context, autoCameraLookAt, [0,1,0]);
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);
  }
  if(lookAtWaypointIndex7 === 2) {
    autoCameraLookAt = finalDiamondMatrix;
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

displayText(((timeInMilliseconds)/1000).toFixed(2)+"s" + " "+context.invViewMatrix[12]+" "+context.invViewMatrix[13]+" "+context.invViewMatrix[14]);
/* moving diablo to camera
  diabloSGNode.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0.5, -0.5, -2.5));
  diabloSGNode.matrix = mat4.multiply(mat4.create(), diabloSGNode.matrix, glm.transform({ translate: [0,0,0], rotateX: 180, scale: 0.0675}));
*/
  //translateLantern.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(1, -0.75, -2));
  lanternSGNode.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0.5, -0.65, -2));
  //lanternSGNode.matrix = translateLantern.matrix;

  //render scenegraph
  root.render(context);

  //animate
  requestAnimationFrame(render);

  lastRenderTime = timeInMilliseconds;
}

//TODO make head go back down when stopping MovementHeadBobbing so camera doesn't stop midair
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
      }
    } else {
      switch(event.code) {
        case 'KeyC':
          manualCameraEnabled = true;
          disableMovementHeadBobbing();
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
