/**
 * Created by Clemens Birklbauer on 22.02.2016.
 */
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
var cameraPosition = vec3.create();

//scene graph nodes
var root = null;
var rootnofloor = null;
var translateLight;
var rotateLight;
var lightNode;
var rotateNode;
var shadowNode;
var lightTest;
var cobbleTextNode;
//TODO
var rotateCamera;
var translateCamera;
var torchNode;
var translateTorch;
var translateLightTest;

var fireNode;

var translate;
var renderFloor;

//textures
var envcubetexture;
var renderTargetColorTexture;
var renderTargetDepthTexture;
var diceTexture;
var floorTexture;
var cobbleTexture;
var lavaTexture;
var diabloImage;
var diabloSGNode;

//framebuffer variables
var renderTargetFramebuffer;
var framebufferWidth = 1024;
var framebufferHeight = 1024;

var lightViewProjectionMatrix;

//load the required resources using a utility function
loadResources({
  vs_shadow: 'shader/shadow.vs.glsl',
  fs_shadow: 'shader/shadow.fs.glsl',
  vs_single: 'shader/single.vs.glsl',
  fs_single: 'shader/single.fs.glsl',
  vs_fire:  'shader/fire.vs.glsl',
  fs_fire:  'shader/fire.fs.glsl',
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
  cameraPosition = vec3.set(vec3.create(), 3, -1, -10);
  //cameraPosition = vec3.set(vec3.create(), 0, 0, 0);

  floorTexture = initTextures(resources.floorTexture, gl.REPEAT);
  lavaTexture  = initTextures(resources.lavaTexture , gl.REPEAT);
  diceTexture = initTextures(resources.diceTexture, gl.CLAMP_TO_EDGE);
  cobbleTexture = initTextures(resources.cobbleTexture, gl.REPEAT);
  diabloImage = initTextures(resources.diabloImage, gl.CLAMP_TO_EDGE);
  //initRenderToTexture();

  gl.enable(gl.DEPTH_TEST);

  //create scenegraph
  root = createSceneGraph(gl, resources);

  initInteraction(gl.canvas);
}

function createSceneGraph(gl, resources) {
  //create scenegraph
  const root = new ShaderSGNode(createProgram(gl, resources.vs_shadow, resources.fs_shadow));
  //const root = new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single));
  //add node for setting shadow parameters
  shadowNode = new TransformationSGNode(mat4.create());

  //light debug helper function
  function createLightSphere() {
    return new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single), [
      new RenderSGNode(makeSphere(.2,10,10))
    ]);
  }

  {
    //initialize light
    lightNode = new TorchSGNode(); //use now framework implementation of light node
    lightNode.ambientOrig = [0.0,0.0,0.0,1];//[0.2, 0.2, 0.2, 1];
    lightNode.diffuseOrig = [0.6,0.3,0.05,1];//[0.5, 0.5, 0.5, 1];
    lightNode.specularOrig = [0.0,0.0,0.0,1];//[1, 1, 1, 1];
    lightNode.position = [0, 0, 0];

    rotateLight = new TransformationSGNode(mat4.create());

    translateLight = new TransformationSGNode(glm.translate(0,3,8)); //translating the light is the same as setting the light position

    //TODO
    rotateCamera = new TransformationSGNode(mat4.create());
    translateCamera = new TransformationSGNode(glm.translate(0, 0, 0));

    translateTorch = new TransformationSGNode(glm.translate(0, 0, 0));
    torchNode = new TorchSGNode();
    torchNode.ambientOrig = [0.01,0.01,0.01,1];//[0.2, 0.2, 0.2, 1];
    torchNode.diffuseOrig = [0.6,0.3,0.05,1];//[0.9, 0.8, 0.6, 1];
    torchNode.specularOrig = [0.0,0.0,0.0,1];//[0.9, 0.8, 0.6, 1];
    torchNode.position = [0, 0, 0];

    lightTest = new TorchSGNode();
    lightTest.ambientOrig = [0.0,0.0,0.0,1];//[0.2, 0.2, 0.2, 1];
    lightTest.diffuseOrig = [0.6, 0.3, 0.05, 1];
    lightTest.specularOrig = [0, 0, 0, 1];

    //rotateCamera.append(translateCamera;
    //translateCamera.append(translateTorch);
    //rotateCamera.append(translateTorch);
    //translateCamera.append(rotateCamera);
    translateTorch.append(torchNode);
    //translateTorch.append(createLightSphere()); //for debugging
    shadowNode.append(translateCamera);
    shadowNode.append(translateTorch);

    rotateLight.append(translateLight);
    translateLight.append(lightNode);
    //translateLight.append(createLightSphere()); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
    //shadowNode.append(rotateLight);

    fireNode = new FireSGNode(60, [0.5,0.2,0.5]);
    var fireShaderNode = new ShaderSGNode(createProgram(gl, resources.vs_fire, resources.fs_fire));

    var staticFireNode = new FireSGNode(60, [0.5,0.2,0.5]);
    var fireTransNode = new TransformationSGNode(glm.translate(-3, 1, 2));
    var fireShaderNode = new ShaderSGNode(createProgram(gl, resources.vs_fire, resources.fs_fire));
    //fireTransNode.append(fireNode);
    //fireShaderNode.append(fireTransNode);
    //root.append(fireShaderNode);
    translateLight.append(new ShaderSGNode(createProgram(gl, resources.vs_fire, resources.fs_fire),fireNode));

    fireTransNode.append(lightTest);
    fireShaderNode.append(staticFireNode);
    fireTransNode.append(fireShaderNode);

    root.append(shadowNode);
    root.append(fireTransNode);
    root.append(rotateLight);


    //shadowNode.append(translateLight);
  }

  /*
  {
    //initialize C3PO
    let c3po = new MaterialSGNode([ //use now framework implementation of material node
      new RenderSGNode(resources.model)
    ]);
    //gold
    c3po.ambient = [0.24725, 0.1995, 0.0745, 1];
    c3po.diffuse = [0.75164, 0.60648, 0.22648, 1];
    c3po.specular = [0.628281, 0.555802, 0.366065, 1];
    c3po.shininess = 0.4;

    rotateNode = new TransformationSGNode(mat4.create(), [
      new TransformationSGNode(glm.translate(0,-1.5, 0),  [
        c3po
      ])
    ]);
    shadowNode.append(rotateNode);
  }
*/
{
  //initialize d4
  let d4 = new MaterialSGNode([ //use now framework implementation of material node
    new TextureSGNode(lavaTexture, 0, new RenderSGNode(resources.modelCube))

  ]);
  //gold
  d4.ambient = [0.24725, 0.1995, 0.0745, 1];
  d4.diffuse = [0.75164, 0.60648, 0.22648, 1];
  d4.specular = [0.628281, 0.555802, 0.366065, 1];
  d4.shininess = 1;

  //initialize cube
  let cube = new MaterialSGNode([ //use now framework implementation of material node
    new TextureSGNode(diceTexture, 0, new RenderSGNode(resources.modelCube))

  ]);
  //gold
  cube.ambient = [0.24725, 0.1995, 0.0745, 1];
  cube.diffuse = [0.75164, 0.60648, 0.22648, 1];
  cube.specular = [0.628281, 0.555802, 0.366065, 1];
  //cube.specular = [0.3, 0.3, 0.3, 1];
  cube.shininess = 1;

  //initialize map floor
  let mapFloor = new MaterialSGNode([ //use now framework implementation of material node
    new TextureSGNode(floorTexture, 0, new RenderSGNode(resources.modelMapFloor))

  ]);
  mapFloor.ambient = [0.24725, 0.1995, 0.0745, 1];
  mapFloor.diffuse = [0.75164, 0.60648, 0.22648, 1];
  mapFloor.specular = [0.628281, 0.555802, 0.366065, 1];
  mapFloor.shininess = 1;

  //initialize map floor
  let cobbleTextNode = new TextureSGNode(cobbleTexture, 0, new RenderSGNode(resources.modelMapCobble));
  let mapCobble = new MaterialSGNode([ //use now framework implementation of material node
    cobbleTextNode

  ]);
  mapCobble.ambient = [0.24725, 0.1995, 0.0745, 1];
  mapCobble.diffuse = [0.75164, 0.60648, 0.22648, 1];
  mapCobble.specular = [0.628281, 0.555802, 0.366065, 1];
  mapCobble.shininess = 1;

  rotateNode = new TransformationSGNode(mat4.create(), [
    new TransformationSGNode(glm.translate(0, 0, 0),  [

    ])
  ]);
  shadowNode.append(rotateNode);
  shadowNode.append(mapFloor);
  shadowNode.append(mapCobble);
  rotateNode.append(  new TransformationSGNode(glm.rotateY(15) , new TransformationSGNode(glm.translate(0, 1, 0),  [
      cube
    ])));
}

  /*{
    //initialize floor
    let floor = new MaterialSGNode(
      new TextureSGNode(floorTexture, 0, new RenderSGNode(makeFloor(5, 5, 5))
                )
              );

    //dark
    floor.ambient = [0, 0, 0, 1];
    floor.diffuse = [0.7, 0.7, 0.7, 1];
    floor.specular = [0.0, 0.0, 0.0, 1];
    floor.shininess = 0;

    shadowNode.append(new TransformationSGNode(glm.transform({ translate: [0,-1,0], rotateX: -90, scale: 3}), [
      floor
    ]));
  }*/

/*
  {
    //initialize floor
    let floor = new MaterialSGNode(
      new TextureSGNode(floorTexture, 0, new RenderSGNode(resources.modelFloor20x20)
                )
              );

    //dark
    floor.ambient = [0, 0, 0, 1];
    floor.diffuse = [0.7, 0.7, 0.7, 1];
    floor.specular = [0.0, 0.0, 0.0, 1];
    floor.shininess = 0;

    shadowNode.append(new TransformationSGNode(glm.transform({ translate: [0,-1,0], rotateX: 0, scale: 3}), [
      floor
    ]));
  }
*/

{
  let diablo = new MaterialSGNode(new TextureSGNode(diabloImage, 0, new RenderSGNode(makeFloor(2, 2, 1))));//asdasdasd
  diablo.ambient = [0.6, 0.6, 0.6, 1];
  diablo.diffuse = [0.5, 0.5, 0.5, 1];
  diablo.specular = [0.1, 0.1, 0.1, 1];
  diablo.shininess = 1.0;

  diabloSGNode = new TransformationSGNode(glm.transform({ translate: [-9.5,3,0], rotateY: 90, rotateX: 180, scale: 1.5}), [
    diablo
  ]);
  shadowNode.append(diabloSGNode);
}
/*
  {
    //initialize wall
    let wall = new MaterialSGNode(
                new TextureSGNode(cobbleTexture, 0, new RenderSGNode(makeFloor(5, 1, 3))
                )
              );

    //dark
    wall.ambient = [0.6, 0.6, 0.6, 1];
    wall.diffuse = [0.5, 0.5, 0.5, 1];
    wall.specular = [0.1, 0.1, 0.1, 1];
    wall.shininess = 100.0;

    shadowNode.append(new TransformationSGNode(glm.transform({ translate: [0,2,15], rotateX: 180, scale: 3}), [
      wall
    ]));
    shadowNode.append(new TransformationSGNode(glm.transform({ translate: [0,2,-15], rotateX: 0, scale: 3}), [
      wall
    ]));
    shadowNode.append(new TransformationSGNode(glm.transform({ translate: [15,2,0], rotateX: 0, rotateY:-90, scale: 3}), [
      wall
    ]));
    shadowNode.append(new TransformationSGNode(glm.transform({ translate: [-15,2,0], rotateX: 0, rotateY:90, scale: 3}), [
      wall
    ]));
  }
*/
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

//a scene graph node for setting texture parameters
function render(timeInMilliseconds) {
  checkForWindowResize(gl);

  //update animations
  //Note: We have to update all animations before generating the shadow map!
  rotateNode.matrix = glm.rotateY(timeInMilliseconds*-0.01);
  rotateLight.matrix = glm.rotateY(timeInMilliseconds*0.05);

  //lightTest.flicker = 1.0 + (Math.cos(timeInMilliseconds/100)) / 10;

  //draw scene for shadow map into texture
  //renderToTexture(timeInMilliseconds);

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
  //rotateCamera.matrix = mouseRotateMatrix;
  //translateCamera.matrix = mat4.multiply(mat4.create(), rotateCamera.matrix, glm.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]));
  //context.viewMatrix = translateCamera.matrix;
  //translateTorch.matrix = mat4.invert(mat4.create(), translateCamera.matrix);
  context.viewMatrix = mat4.multiply(mat4.create(), mouseRotateMatrix, glm.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]));

  //get inverse view matrix to allow computing eye-to-light matrix
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  diabloSGNode.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0.5, -0.5, -2.5));
  diabloSGNode.matrix = mat4.multiply(mat4.create(), diabloSGNode.matrix, glm.transform({ translate: [0,0,0], rotateX: 180, scale: 0.0675}));

  translateCamera.matrix = mat4.multiply(mat4.create(), context.invViewMatrix, glm.translate(0.05, -0.2, 0));
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
    if(event.keyCode === 38 || event.code === 'KeyW') {
      camera.movement.forward = 1;
      camera.movement.backward = 0;
      console.log("uparrow pressed")
    }
    if(event.keyCode === 40 || event.code === 'KeyS') {
      camera.movement.forward = 0;
      camera.movement.backward = 1;
      console.log("downarrow pressed")
    }
    if(event.keyCode === 37 || event.code === 'KeyA') {
      camera.movement.left = 1;
      camera.movement.right = 0;
      console.log("leftarrow pressed")
    }
    if(event.keyCode === 39 || event.code === 'KeyD') {
      camera.movement.left = 0;
      camera.movement.right = 1;
      console.log("rightarrow pressed")
    }
  });

  document.addEventListener('keyup', function(event) {
    if(event.keyCode === 38 || event.code === 'KeyW') {
      camera.movement.forward = 0;
      console.log("uparrow released")
    }
    if(event.keyCode === 40 || event.code === 'KeyS') {
      camera.movement.backward = 0;
      console.log("downarrow released")
    }
    if(event.keyCode === 37 || event.code === 'KeyA') {
      camera.movement.left = 0;
      console.log("leftarrow released")
    }
    if(event.keyCode === 39 || event.code === 'KeyD') {
      camera.movement.right = 0;
      console.log("rightarrow released")
    }
  });
}
