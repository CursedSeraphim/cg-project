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

//matrix used to have camera look at specific points during the automated camera flight
var firstFrame = 1;
var autoCameraLookAt;

//scene graph nodes
var root = null;
var particleNodes;
var lightingNodes;
var translateTorch;
var translateTorch1;
var translateTorch2;
var b2fNodes;
var b2fNodes2;
var diabloSGNode;
var orcShamanSGNode;
var lanternSGNode;

var hipBoneSGNode;

//waypoints
var cameraWaypoints;
var cameraWaypointIndex;
var lookAtWaypoints;
var lookAtWaypointIndex;
var orcShamanWaypoints;
var orcShamanWaypointIndex;
var cubeWaypoints;
var cubeWaypointIndex;
var diabloWaypoints;
var diabloWaypointIndex;

//TriggerSGNode
var triggerTestNode;
var triggerSGNode2;

/*DEBUG NODES*/
var rotateNode;
var rotateLight;

/*Shader Programs*/
var particleShaderProgram;

//textures
var envcubetexture;
var renderTargetColorTexture;
var renderTargetDepthTexture;
var diceTextureNode;
var floorTextureNode;
var cobbleTextureNode;
var lavaTextureNode;
var diabloTextureNode;
var orcShamanTextureNode;
var metalTextureNode;
var gridTextureNode;
var glassTextureNode;
var spikedBarsTextureNode;
var skyTextureNode;
var imSoHipTextureNode;
var skullTextureNode;
var boneTextureNode;
var ribCageTextureNode;
//texture arrays
var dreughFrames;
var orcShamanFrames;

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
  modelLanternMetal: 'models/lantern_metal.obj',
  modelLanternGlass: 'models/lantern_glass.obj',
  modelLanternGrid: 'models/lantern_grid.obj',

  lavaTexture: 'models/lava.jpg',
  diceTexture: 'models/diemap.jpg',
  floorTexture: 'models/floor_cobble.jpg',
  stoaqTexture: 'models/stoaquad.jpg',
  cobbleTexture: 'models/dungeon_wall.png',
  diabloImage: 'models/dreugh.gif',
  metalTexture: 'models/metal_128.png',//metal.png',
  glassTexture: 'models/glass.png',//glass_64.png',
  gridTexture: 'models/bars.png',
  skyTexture: 'models/sky.png',
  spikedBarsTexture: 'models/spiked_bars.png',
  hipBoneTexture: 'models/textures/bones/imsohip.png',
  ribCageTexture: 'models/textures/bones/ribcage.png',
  skullTexture: 'models/textures/bones/skull.png',
  boneTexture: 'models/textures/bones/bone.png',

  dreughFrame1: 'models/textures/dreugh/dreugh (1).gif',
dreughFrame2: 'models/textures/dreugh/dreugh (2).gif',
dreughFrame3: 'models/textures/dreugh/dreugh (3).gif',
dreughFrame4: 'models/textures/dreugh/dreugh (4).gif',
dreughFrame5: 'models/textures/dreugh/dreugh (5).gif',
dreughFrame6: 'models/textures/dreugh/dreugh (6).gif',
dreughFrame7: 'models/textures/dreugh/dreugh (7).gif',
dreughFrame8: 'models/textures/dreugh/dreugh (8).gif',
dreughFrame9: 'models/textures/dreugh/dreugh (9).gif',
dreughFrame10: 'models/textures/dreugh/dreugh (10).gif',
dreughFrame11: 'models/textures/dreugh/dreugh (11).gif',
dreughFrame12: 'models/textures/dreugh/dreugh (12).gif',
dreughFrame13: 'models/textures/dreugh/dreugh (13).gif',
dreughFrame14: 'models/textures/dreugh/dreugh (14).gif',
dreughFrame15: 'models/textures/dreugh/dreugh (15).gif',
dreughFrame16: 'models/textures/dreugh/dreugh (16).gif',
orcShamanFrame1: 'models/textures/orc_shaman/orc_shaman (1).gif',
orcShamanFrame2: 'models/textures/orc_shaman/orc_shaman (2).gif',
orcShamanFrame3: 'models/textures/orc_shaman/orc_shaman (3).gif',
orcShamanFrame4: 'models/textures/orc_shaman/orc_shaman (4).gif',
orcShamanFrame5: 'models/textures/orc_shaman/orc_shaman (5).gif',
orcShamanFrame6: 'models/textures/orc_shaman/orc_shaman (6).gif',
orcShamanFrame7: 'models/textures/orc_shaman/orc_shaman (7).gif',
orcShamanFrame8: 'models/textures/orc_shaman/orc_shaman (8).gif',
orcShamanFrame9: 'models/textures/orc_shaman/orc_shaman (9).gif',
orcShamanFrame10: 'models/textures/orc_shaman/orc_shaman (10).gif',
orcShamanFrame11: 'models/textures/orc_shaman/orc_shaman (11).gif',
orcShamanFrame12: 'models/textures/orc_shaman/orc_shaman (12).gif',
orcShamanFrame13: 'models/textures/orc_shaman/orc_shaman (13).gif',
orcShamanFrame14: 'models/textures/orc_shaman/orc_shaman (14).gif',
orcShamanFrame15: 'models/textures/orc_shaman/orc_shaman (15).gif',
orcShamanFrame16: 'models/textures/orc_shaman/orc_shaman (16).gif'

}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  render(0);
});

function init(resources) {
  //create a GL context
  gl = createContext(400, 400);

  //setting manual camera switch to off
  manualCameraEnabled = 0;
  //setting initial point to look at
  autoCameraLookAt = glm.translate(8.75, 2.35, -9.4);

  startTime = time();

  /*set camera Start position*/
  cameraPosition = vec3.fromValues(3, -1, -10);
  camera.rotation.x = -50

  /*set waypoints*/
  cameraWaypointIndex = 0;
  lookAtWaypointIndex = 0;
  let wpCam1 = glm.translate(9, 2, -8.5);
  let wpCam2 = glm.translate(18, -3.5, -8.5);
  let wpCam3 = glm.translate(25, -3.5, -8.5);
  let wpCam4 = glm.translate(25, -3.5, 24.5);
  cameraWaypoints = [wpCam1, wpCam2, wpCam3, wpCam4];
  let wpLookAt4 = glm.translate(25,-3,-15);
  lookAtWaypoints = [wpCam2, wpCam3, wpLookAt4];

  //-1 is used to trigger the orc shaman at a later point
  orcShamanWaypointIndex = -1;
  let wpOrcShaman1 = glm.translate(25, -3, -22.5);
  let wpOrcShaman2 = glm.translate(17, -3, -22.5);
  orcShamanWaypoints = [wpOrcShaman1, wpOrcShaman2];

  let waypointCube1 = mat4.create();
  waypointCube1[12] = 7;
  waypointCube1[14] = 7;
  let waypointCube2 = mat4.create();
  waypointCube2[12] = -7;
  cubeWaypointIndex = 0;
  cubeWaypoints = [waypointCube1, waypointCube2, mat4.create()];

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
  spikedBarsTextureNode = new AdvancedTextureSGNode(resources.spikedBarsTexture);
  skyTextureNode = new AdvancedTextureSGNode(resources.skyTexture);
  ribCageTextureNode = new AdvancedTextureSGNode(resources.ribCageTexture);
  imSoHipTextureNode = new AdvancedTextureSGNode(resources.hipBoneTexture);
  skullTextureNode = new AdvancedTextureSGNode(resources.skullTexture);
  boneTextureNode = new AdvancedTextureSGNode(resources.boneTexture);
// diceTextureNode.wrapS = gl.CLAMP_TO_EDGE;
//  diceTextureNode.wrapT = gl.CLAMP_TO_EDGE;
  cobbleTextureNode = new AdvancedTextureSGNode(resources.cobbleTexture);
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
resources.dreughFrame16,], gl.CLAMP_TO_EDGE);
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
resources.orcShamanFrame16,
], gl.CLAMP_TO_EDGE);
diabloTextureNode = new TextureSGNode(dreughFrames, 0, 75);
orcShamanTextureNode = new TextureSGNode(orcShamanFrames, 0, 75);
diceTextureNode = diabloTextureNode;
  //initRenderToTexture();

  gl.enable(gl.DEPTH_TEST);

  //create scenegraph
  root = createSceneGraph(gl, resources);

  /*set triggers*/
  triggerTestNode = new TriggerSGNode(5.0, glm.translate(-3, 1, 10));
  triggerSGNode2 = new TriggerSGNode(0.1, glm.translate(25, -3.5, -8.5), function() {
    console.log("looking at orcshaman");
    autoCameraLookAt = orcShamanSGNode.matrix;
    orcShamanWaypointIndex = 0;
    lookAtWaypointIndex = lookAtWaypoints.length;
  });
  root.append(triggerTestNode);
  root.append(triggerSGNode2);

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
  b2fNodes2 = new Back2FrontSGNode();

  root.append(new BlendSgNode(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, lightingNodes));

  //light debug helper function
  function createLightSphere() {
    return new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single), [
      new RenderSGNode(makeSphere(.2,10,10))
    ]);
  }


  function createParticleNode(size, area) {
    return new ShaderSGNode(particleShaderProgram,
      new BlendSgNode(gl.SRC_ALPHA, gl.ONE,
        new FireSGNode(size, area))
    );
  }

  {
    /*Init Particles*/
    let lanternFireParticleNode  = createParticleNode(100, [0.02,0.01,0.02]);


    /*PARTICLE TEST NODES*/
    let fireNode = createParticleNode(300, [0.5,0.2,0.5]);
  //  let staticFireNode = createParticleNode(600, [2,0.4,2]);
    let torchNode1 = createParticleNode(200, [0.25,0.1,0.25]);
    let torchNode2 = createParticleNode(200, [0.25,0.1,0.25]);

    /*Init Light*/
    let torchNode = new AdvancedLightSGNode(true, 10, [0,0,1]);
    torchNode.ambient = [1.0,0.6,0.05,1.0];
    torchNode.diffuse = [1.0,0.6,0.05,1.0];
    torchNode.specular = [1.0,0.6,0.05,1.0];
    torchNode.position = [0, 0, 0];
    torchNode.shininess = 100;


    /*LIGHT TEST NODES*/
    let lightNode = new AdvancedLightSGNode(true);
    lightNode.ambient = [0.0,0.0,0.0,1.0];//[0.2, 0.2, 0.2, 1];
    lightNode.diffuse = [0.6,0.3,0.05,1.0];//[0.5, 0.5, 0.5, 1];
    lightNode.specular = [0.0,0.0,0.0,1.0];//[1, 1, 1, 1];
    lightNode.position = [0, 0, 0];

    let lightTest = new AdvancedLightSGNode(true, 30, [0,0,1]);
    lightTest.ambient = [0.1,0.1,0.1,1.0];//[0.2, 0.2, 0.2, 1];
    lightTest.diffuse = [1.0,0.6,0.05,1.0];
    lightTest.specular = [0, 0, 0, 1.0];

    let torchLight1 = new AdvancedLightSGNode(true);
    torchLight1.ambient = [0.1,0.1,0.1,1.0];
    torchLight1.diffuse = [0.6,0.3,0.05,1.0];
    torchLight1.specular = [0.0,0.0,0.0,1.0];
    torchLight1.position = [0, 0, 0];

    let torchLight2 = new AdvancedLightSGNode(true);
    torchLight2.ambient = [0.1,0.1,0.1,1.0];
    torchLight2.diffuse = [0.6,0.3,0.05,1.0];
    torchLight2.specular = [0.0,0.0,0.0,1.0];
    torchLight2.position = [0, 0, 0];

    /*Init Light Positions*/
    translateTorch = new TransformationSGNode(glm.translate(0, 0, 0));
    translateTorch.append(torchNode);
    translateTorch.append(lanternFireParticleNode);
    b2fNodes.append(translateTorch);
    b2fNodes2.append(translateTorch);

    /*POSITION TEST NODES*/
    rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(0,3,8)); //translating the light is the same as setting the light position
    translateLight.append(lightNode);
    translateLight.append(fireNode);
    rotateLight.append(translateLight);
    b2fNodes.append(rotateLight);
    b2fNodes2.append(rotateLight);
/*
    let fireTransNode = new TransformationSGNode(glm.translate(-3, 5, 2));
    fireTransNode.append(staticFireNode);
    fireTransNode.append(lightTest);
    b2fNodes.append(fireTransNode);
    b2fNodes2.append(fireTransNode);
*/
    let torchTransNode1 = new TransformationSGNode(glm.translate(27.6, 0, -0.125));
    torchTransNode1.append(torchNode1);
    torchTransNode1.append(torchLight1);
    b2fNodes.append(torchTransNode1);
    b2fNodes2.append(torchTransNode1);

    let torchTransNode2 = new TransformationSGNode(glm.translate(-9.5, 3, 0));
    torchTransNode2.append(torchNode2);
    torchTransNode2.append(torchLight2);
    b2fNodes.append(torchTransNode2);
    b2fNodes2.append(torchTransNode2);
}

/*Place the interior of the dungeon*/
{
  //initialize cube
  //diceTextureNode.append(new RenderSGNode(resources.modelCube));

  let cube = new MaterialSGNode([ //use now framework implementation of material node
    diceTextureNode
  ]);
  cube.ambient = [0.1, 0.1, 0.1, 1];
  cube.diffuse = [0.1, 0.1, 0.1, 1];
  cube.specular = [0.1, 0.1, 0.1, 1];
  cube.shininess = 1;

  rotateNode = new TransformationSGNode(mat4.create());

  rotateNode.append(
      new TransformationSGNode(glm.rotateY(15) ,
        new TransformationSGNode(glm.translate(0, 1.25, 0),  [
          new RenderSGNode(resources.modelCube)
    ])));
  b2fNodes.append(rotateNode);
  b2fNodes2.append(rotateNode);

  //lightingNodes.append(cube)
}

/*Add orc shaman*/
{
  var rect = makeFloor(2, 2, 1)

    for(var i = 0; i < rect.normal.length; i++)
      rect.normal[i] = -rect.normal[i];
  orcShamanSGNode = new BillboardSGNode(glm.transform({translate: [25,-3,-15]}), [
    new RenderSGNode(rect)
  ]);
  let orc_shamanMaterialNode = new MaterialSGNode(orcShamanSGNode);
  orc_shamanMaterialNode.ambient = [0.6, 0.6, 0.6, 1];
  orc_shamanMaterialNode.diffuse = [0.5, 0.5, 0.5, 1];
  orc_shamanMaterialNode.specular = [1, 1, 1, 1];
  orc_shamanMaterialNode.shininess = 1000;

  b2fNodes2.append(orcShamanSGNode);
  orcShamanTextureNode.append(b2fNodes2);
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

  //initialize map floor
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
  metalTextureNode.append(new RenderSGNode(resources.modelMapTorches));
  let mapTorches = new MaterialSGNode(metalTextureNode);
  mapTorches.ambient = [1, 1, 1, 1];
  mapTorches.diffuse = [1, 1, 1, 1];
  mapTorches.specular = [0.0, 0.0, 0.0, 0.0];
  mapTorches.shininess = 1.0;
  lightingNodes.append(mapTorches);
}

{
  let rotatelantern = new TransformationSGNode(glm.rotateY(180));
  lanternSGNode = new TransformationSGNode(glm.translate(6,3,0), rotatelantern);

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
  metalMaterial.shininess = 20;
  rotatelantern.append(metalMaterial);

  //initialize lantern grid
  gridTextureNode.append(new RenderSGNode(resources.modelLanternGrid));
  let gridMaterial = new MaterialSGNode(gridTextureNode);
  gridMaterial.ambient = [0.24725, 0.1995, 0.0745, 1];
  gridMaterial.diffuse = [0.75164, 0.60648, 0.22648, 1];
  gridMaterial.specular = [1, 0.555802, 0.366065, 1];
  gridMaterial.shininess = 1;
  rotatelantern.append(gridMaterial);

}

/*Add diablo*/
{
  // let diablo = new MaterialSGNode(diabloSGNode);
  // diablo.ambient = [0.6, 0.6, 0.6, 1];
  // diablo.diffuse = [0.5, 0.5, 0.5, 1];
  // diablo.specular = [0.1, 0.1, 0.1, 1];
  // diablo.shininess = 1.0;

  var rect = makeFloor(2, 2, 1)

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

  b2fNodes.append(diabloSGNode);
  diabloTextureNode.append(b2fNodes);
}

lightingNodes.append(diabloTextureNode);
lightingNodes.append(lanternSGNode);
  //lightingNodes.append(b2fNodes);
  //root.append(particleNodes);
  return root;
}

function makeFloor(x, y, a) {
  var floor = makeRect(x, y);
  //TASK 3: adapt texture coordinates
  floor.texture = [0, 0,   a*x/y, 0,   a*x/y, a,   0, a];
  //floor.texture = [0, 0,   5, 0,   5, 5,   0, 5];
  return floor;
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
function lookAt(context, matrix, up) {
  var eye = [context.invViewMatrix[12], context.invViewMatrix[13], context.invViewMatrix[14]];
  var center = [matrix[12], matrix[13], matrix[14]];
  var lookAtMatrix = mat4.lookAt(mat4.create(), eye, center, up);
  context.viewMatrix = lookAtMatrix;
}

//a scene graph node for setting texture parameters
function render(timeInMilliseconds) {
  checkForWindowResize(gl);
  //update animations
  //rotateNode.matrix = glm.rotateY(timeInMilliseconds*-0.01);
  rotateNode.matrix = mat4.rotateY(mat4.create(), rotateNode.matrix, deg2rad(1));
  rotateLight.matrix = glm.rotateY(timeInMilliseconds*0.05);

  cubeWaypointIndex = moveUsingWaypoints(rotateNode.matrix, cubeWaypoints, cubeWaypointIndex, 0.1);
  if(cubeWaypointIndex == cubeWaypoints.length) {
    //makes the object patrol back to first waypoint
    cubeWaypointIndex = 0;
  }
  diabloWaypointIndex = moveUsingWaypoints(diabloSGNode.matrix, diabloWaypoints, diabloWaypointIndex, 0.1);
  if(diabloWaypointIndex == diabloWaypoints.length) {
    //makes the object patrol back to first waypoint
    diabloWaypointIndex = 0;
  }
  if(orcShamanWaypointIndex < orcShamanWaypoints.length && orcShamanWaypointIndex !== -1) {
    orcShamanWaypointIndex = moveUsingWaypoints(orcShamanSGNode.matrix, orcShamanWaypoints, orcShamanWaypointIndex, 0.1);
  }

  triggerTestNode.setTriggerFunction(function(){
    console.log("triggered");

  })

  //console.log("after: "+rotateNode.matrix[12]);
  //setup viewport
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //setup context and camera matrices
  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
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
    vec3.subtract(cameraPosition, cameraPosition, vec3.scale(vec3.create(), lookAtVector, 0.25));
  }
  if(camera.movement.backward == 1) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, lookAtVector, 0.25);
  }
  if(camera.movement.left == 1) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, crossLookAtVector, 0.25);
  }
  if(camera.movement.right == 1) {
    vec3.subtract(cameraPosition, cameraPosition, vec3.scale(vec3.create(), crossLookAtVector, 0.25));
  }
  if(camera.movement.up == 1) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, upLookAtVector, 0.25);
  }
  if(camera.movement.down == 1) {
    vec3.subtract(cameraPosition, cameraPosition, vec3.scale(vec3.create(), upLookAtVector, 0.25));
  }

  context.viewMatrix = glm.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
  if(manualCameraEnabled) {
    context.viewMatrix = mat4.multiply(mat4.create(), mouseRotateMatrix, glm.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]));
  }
  context.lookAtVector = lookAtVector;
  //get inverse view matrix to allow computing eye-to-light matrix
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  if(cameraWaypointIndex < cameraWaypoints.length && !manualCameraEnabled) {
      cameraWaypointIndex = moveUsingWaypoints(context.invViewMatrix, cameraWaypoints, cameraWaypointIndex, 0.2);
      console.log("moving camera "+cameraWaypointIndex+" < "+cameraWaypoints.length);
  }
  if(lookAtWaypointIndex < lookAtWaypoints.length && !manualCameraEnabled) {
    lookAtWaypointIndex = moveUsingWaypoints(autoCameraLookAt, lookAtWaypoints, lookAtWaypointIndex, 0.1);
    console.log("moving lookat "+lookAtWaypointIndex+" < "+lookAtWaypoints.length);
  }

  if(!manualCameraEnabled) {
    lookAt(context, autoCameraLookAt, [0,1,0]);
    context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);
  }

//updating camera position variables
  cameraPosition[0] = 0-context.invViewMatrix[12];
  cameraPosition[1] = 0-context.invViewMatrix[13];
  cameraPosition[2] = 0-context.invViewMatrix[14];

displayText((time() - startTime)/1000+"s");//+context.invViewMatrix[12]+" "+context.invViewMatrix[13]+" "+context.invViewMatrix[14]);
/* moving diablo to camera
  diabloSGNode.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0.5, -0.5, -2.5));
  diabloSGNode.matrix = mat4.multiply(mat4.create(), diabloSGNode.matrix, glm.transform({ translate: [0,0,0], rotateX: 180, scale: 0.0675}));
*/
  translateTorch.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(1, -0.5, -2.0));
  lanternSGNode.matrix = translateTorch.matrix;

  //render scenegraph
  root.render(context);

  //animate
  requestAnimationFrame(render);
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
        case 'ShiftLeft':
          camera.movement.up = 0;
          camera.movement.down = 1;
          break;
        case 'Space':
          camera.movement.up = 1;
          camera.movement.down = 0;
          break;
      }
    } else {
      switch(event.code) {
        case 'KeyC':
          manualCameraEnabled = 1;
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
        break;
        case 'ArrowDown':
        case 'KeyS':
        camera.movement.backward = 0;
          break;
        case 'ArrowLeft':
        case 'KeyA':
        camera.movement.left = 0;
          break;
        case 'ArrowRight':
        case 'KeyD':
        camera.movement.right = 0;
          break;
        case 'KeyD':
        camera.movement.right = 0;
          break;
        case 'ShiftLeft':
        camera.movement.down = 0;
          break;
        case 'Space':
          camera.movement.up = 0;
          break;
      }
    } else {
      switch(event.code) {
        case 'KeyC':
          manualCameraEnabled = 1;
          break;
      }
    }

  });
}
