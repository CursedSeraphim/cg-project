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
    right: 0
  }
};

/*camera position vector*/
var cameraPosition;

//scene graph nodes
var root = null;
var particleNodes;
var lightingNodes;
var translateTorch;
var diabloSGNode;

//waypoints
var cubeWaypoints;
var cubeWaypointIndex;

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
  lavaTexture: 'models/lava.jpg',
  diceTexture: 'models/diemap.jpg',
  floorTexture: 'models/floor_cobble.jpg',
  stoaqTexture: 'models/stoaquad.jpg',
  cobbleTexture: 'models/black_cobble_rotated.jpg',
  diabloImage: 'models/diablo.png'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  render(0);
});

function init(resources) {
  //create a GL context
  gl = createContext(400, 400);

  /*set camera Start position*/
  cameraPosition = vec3.fromValues(3, -1, -10);

  /*set waypoints*/
  let waypoint1 = mat4.create();
  waypoint1[12] = 7;
  waypoint1[14] = 7;
  let waypoint2 = mat4.create();
  waypoint2[12] = -7;
  cubeWaypointIndex = 0;
  cubeWaypoints = [waypoint1, waypoint2, mat4.create()];

  /*initialize the shaderPrograms*/
  particleShaderProgram = createProgram(gl, resources.vs_particle, resources.fs_particle);

  floorTextureNode = new AdvancedTextureSGNode(resources.floorTexture);
  lavaTextureNode  = new AdvancedTextureSGNode(resources.lavaTexture);
  diceTextureNode = new AdvancedTextureSGNode(resources.diceTexture);
  diceTextureNode.wrapS = gl.CLAMP_TO_EDGE;
  diceTextureNode.wrapT = gl.CLAMP_TO_EDGE;
  cobbleTextureNode = new AdvancedTextureSGNode(resources.cobbleTexture);
  diabloTextureNode = new AdvancedTextureSGNode(resources.diabloImage);
  diabloTextureNode.wrapS = gl.CLAMP_TO_EDGE;
  diabloTextureNode.wrapT = gl.CLAMP_TO_EDGE;
  //initRenderToTexture();

  gl.enable(gl.DEPTH_TEST);

  //create scenegraph
  root = createSceneGraph(gl, resources);

  initInteraction(gl.canvas);
}

function createSceneGraph(gl, resources) {
  //create scenegraph
  const root = new ShaderSGNode(createProgram(gl, resources.vs_lighting, resources.fs_lighting));

  particleNodes = new ShaderSGNode(particleShaderProgram);
  lightingNodes = new LightingSGNode();

  root.append(lightingNodes);

  //light debug helper function
  function createLightSphere() {
    return new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single), [
      new RenderSGNode(makeSphere(.2,10,10))
    ]);
  }

  {
    /*Init Particles*/
    let torchFireParticleNode  = new FireSGNode(100, [0.1,0.05,0.1]);
    particleNodes.append(torchFireParticleNode);

    /*PARTICLE TEST NODES*/
    let fireNode = new FireSGNode(300, [0.5,0.2,0.5]);
    particleNodes.append(fireNode);
    let staticFireNode = new FireSGNode(300, [0.5,0.2,0.5]);
    particleNodes.append(staticFireNode);

    /*Init Light*/
    let torchNode = new TorchSGNode();
    torchNode.ambientOrig = [0.01,0.01,0.01,1];
    torchNode.diffuseOrig = [0.6,0.3,0.05,1];
    torchNode.specularOrig = [0,0,0,1];
    torchNode.position = [0, 0, 0];
    torchNode.shininess = 0;


    /*LIGHT TEST NODES*/
    let lightNode = new TorchSGNode();
    lightNode.ambientOrig = [0.0,0.0,0.0,1];//[0.2, 0.2, 0.2, 1];
    lightNode.diffuseOrig = [0.6,0.3,0.05,1];//[0.5, 0.5, 0.5, 1];
    lightNode.specularOrig = [0.0,0.0,0.0,1];//[1, 1, 1, 1];
    lightNode.position = [0, 0, 0];

    let lightTest = new TorchSGNode();
    lightTest.ambientOrig = [0.0,0.0,0.0,1];//[0.2, 0.2, 0.2, 1];
    lightTest.diffuseOrig = [0.6, 0.3, 0.05, 1];
    lightTest.specularOrig = [0, 0, 0, 1];

    /*Init Light Positions*/
    translateTorch = new TransformationSGNode(glm.translate(0, 0, 0));
    translateTorch.append(torchNode);
    translateTorch.append(torchFireParticleNode.getPositionSGNode());
    lightingNodes.append(translateTorch);

    /*POSITION TEST NODES*/
    rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(0,3,8)); //translating the light is the same as setting the light position
    translateLight.append(lightNode);
    translateLight.append(fireNode.getPositionSGNode());
    rotateLight.append(translateLight);
    lightingNodes.append(rotateLight);

    let fireTransNode = new TransformationSGNode(glm.translate(-3, 1, 2));
    translateLight.append(new ShaderSGNode(particleShaderProgram, fireNode));
    fireTransNode.append(staticFireNode.getPositionSGNode());
    fireTransNode.append(lightTest);
    lightingNodes.append(fireTransNode);
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
  diabloTextureNode.append(rotateNode);

  lightingNodes.append(cube)
}

/*Place the Dungeon Layout, e.g. walls, floor,...*/
{
  //initialize map floor
  floorTextureNode.append(new RenderSGNode(resources.modelMapFloor));
  let mapFloor = new MaterialSGNode(floorTextureNode);
  mapFloor.ambient = [0.24725, 0.1995, 0.0745, 1];
  mapFloor.diffuse = [0.75164, 0.60648, 0.22648, 1];
  mapFloor.specular = [1, 0.555802, 0.366065, 1];
  mapFloor.shininess = 1;
  lightingNodes.append(mapFloor);

  //initialize map floor
  cobbleTextureNode.append(new RenderSGNode(resources.modelMapCobble));
  let mapCobble = new MaterialSGNode(cobbleTextureNode);
  mapCobble.ambient = [0.24725, 0.1995, 0.0745, 1];
  mapCobble.diffuse = [0.75164, 0.60648, 0.22648, 1];
  mapCobble.specular = [0.628281, 0.555802, 0.366065, 1];
  mapCobble.shininess = 1;
  lightingNodes.append(mapCobble);
}

/*Add diablo*/
{
  let diablo = new MaterialSGNode(diabloTextureNode);
  diablo.ambient = [0.6, 0.6, 0.6, 1];
  diablo.diffuse = [0.5, 0.5, 0.5, 1];
  diablo.specular = [0.1, 0.1, 0.1, 1];
  diablo.shininess = 1.0;

  diabloSGNode = new TransformationSGNode(glm.transform({ translate: [-9.5,3,0], rotateY: 90, rotateX: 180, scale: 1.5}), [
    new RenderSGNode(makeFloor(2, 2, 1))
  ]);
  diabloTextureNode.append(diabloSGNode);
  lightingNodes.append(diablo);
}

  root.append(particleNodes);
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
    //if waypoint is reached
    objectMatrix[12] = wx;
    objectMatrix[13] = wy;
    objectMatrix[14] = wz;
    waypointIndex++;
  } else {
    //console.log("x changed from "+objectMatrix[12]);
    objectMatrix[12] += dx*f;
    //console.log("to "+objectMatrix[12]);
    objectMatrix[13] += dy*f;
    objectMatrix[14] += dz*f;
  }
  return waypointIndex;
}

function deg2rad(degrees) {
  return degrees * Math.PI / 180;
}

//a scene graph node for setting texture parameters
function render(timeInMilliseconds) {
  checkForWindowResize(gl);

  //update animations
  //rotateNode.matrix = glm.rotateY(timeInMilliseconds*-0.01);
  rotateNode.matrix = mat4.rotateY(mat4.create(), rotateNode.matrix, deg2rad(10));
  rotateLight.matrix = glm.rotateY(timeInMilliseconds*0.05);
  //rotateNode.matrix[13] = 5;
  //console.log("before: "+rotateNode.matrix[12]);
  cubeWaypointIndex = moveUsingWaypoints(rotateNode.matrix, cubeWaypoints, cubeWaypointIndex, 0.1);
  if(cubeWaypointIndex == cubeWaypoints.length) {
    cubeWaypointIndex = 0;
  }
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
  let crossLookAtVector = vec3.cross(vec3.create(), lookAtVector, [0, 1, 0]);
  if(camera.movement.forward == 1) {
    cameraPosition = vec3.subtract(vec3.create(), cameraPosition, vec3.scale(vec3.create(), lookAtVector, 0.25));
  }
  if(camera.movement.backward == 1) {
    cameraPosition = vec3.scaleAndAdd(vec3.create(), cameraPosition, lookAtVector, 0.25);
  }
  if(camera.movement.left == 1) {
    cameraPosition = vec3.scaleAndAdd(vec3.create(), cameraPosition, crossLookAtVector, 0.25);
  }
  if(camera.movement.right == 1) {
    cameraPosition = vec3.subtract(vec3.create(), cameraPosition, vec3.scale(vec3.create(), crossLookAtVector, 0.25));
  }
  context.viewMatrix = mat4.multiply(mat4.create(), mouseRotateMatrix, glm.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]));

  //get inverse view matrix to allow computing eye-to-light matrix
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  diabloSGNode.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0.5, -0.5, -2.5));
  diabloSGNode.matrix = mat4.multiply(mat4.create(), diabloSGNode.matrix, glm.transform({ translate: [0,0,0], rotateX: 180, scale: 0.0675}));

  translateTorch.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0.05, -0.2, -5.0));

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
    if (mouse.leftButtonDown) {
      //add the relative movement of the mouse to the rotation variables
  		camera.rotation.x += delta.x*.25;
  		camera.rotation.y += delta.y*.25;
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
    if (event.code === 'KeyR') {
      camera.rotation.x = 0;
  		camera.rotation.y = 0;
    }
  });
  document.addEventListener('keydown', function(event) {
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
    }
  });

  document.addEventListener('keyup', function(event) {
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
    }
  });
}
