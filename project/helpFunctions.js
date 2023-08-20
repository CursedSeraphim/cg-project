console.log('in main.js')
/*creates a diamond*/
function makeDiamond() {
  var width = 1;
  var hb = 1;
  var ht = 1.2;
  var diag = 0.70710678118654752440084436210485;
  var id = 0.6035533906;
  var wt = 0.25;

  var position = [/*Kalette*/
                  0,      0,    0, /*0 center point*/
                  1,     hb,    0, /*1*/
                  diag,  hb,  diag,/*2*/
                  0,     hb,    1, /*3*/
                  -diag, hb, diag, /*4*/
                  -1,    hb,    0, /*5*/
                  -diag, hb,-diag, /*6*/
                  0,     hb,   -1, /*7*/
                  diag,  hb,-diag, /*8*/
                  /*Krone*/
                  id,    ht,   wt, /*9*/
                  wt,    ht,   id, /*10*/
                 -wt,    ht,   id, /*11*/
                 -id,    ht,   wt, /*12*/
                 -id,    ht,  -wt, /*13*/
                 -wt,    ht,  -id, /*14*/
                  wt,    ht,  -id, /*15*/
                  id,    ht,  -wt, /*16*/
                  /*Tafel*/
                  0, ht, 0         /*17*/
                ];
  var normal = [ /*Kalette*/
                 0,   -1,     0, /*0*/
                 1,    0,     0, /*1*/
                 diag, 0,  diag, /*2*/
                 0,    0,     1, /*3*/
                -diag, 0,  diag, /*4*/
                -1,    0,     0, /*5*/
                -diag, 0, -diag, /*6*/
                0,     0,    -1, /*7*/
                 diag, 0, -diag, /*8*/
                 /*Krone*/
                 0,    1,     0, /*9*/
                 0,    1,     0, /*10*/
                 0,    1,     0,  /*11*/
                 0,    1,     0,  /*12*/
                 0,    1,     0,  /*13*/
                 0,    1,     0,  /*14*/
                 0,    1,     0,  /*15*/
                 0,    1,     0,  /*16*/
                 /*Tafel*/
                 0,    1,     0,  /*17*/
              ];

  var texture = [ /*Kalette*/
                 0,     0,    /*0*/
                 1,     0,    /*1*/
                 diag,  diag, /*2*/
                 0,     1,    /*3*/
                 -diag, diag, /*4*/
                 -1,    0,    /*5*/
                 -diag, -diag,/*6*/
                 0,     -1,   /*7*/
                 diag,  -diag,/*8*/
                 /*Krone*/
                 id,    wt,   /*9*/
                 wt,    id,   /*10*/
                -wt,    id,   /*11*/
                -id,    wt,   /*12*/
                -id,   -wt,   /*13*/
                -wt,   -id,   /*14*/
                 wt,   -id,   /*15*/
                 id,   -wt,   /*16*/
                 /*Tafel*/
                 0,     0
               ];

  var index = [/*Kalette*/
               0, 1, 2,
               0, 2, 3,
               0, 3, 4,
               0, 4, 5,
               0, 5, 6,
               0, 6, 7,
               0, 7, 8,
               0, 8, 1,
               /*Krone*/
               1, 2, 9,
               2, 3, 10,
               3, 4, 11,
               4, 5, 12,
               5, 6, 13,
               6, 7, 14,
               7, 8, 15,
               8, 1, 16,
               1, 9, 16,
               2, 9, 10,
               3, 10, 11,
               4, 11, 12,
               5, 12, 13,
               6, 13, 14,
               7, 14, 15,
               8, 15, 16,
               /*Tafel*/
               17, 9,10,
               17,10,11,
               17,11,12,
               17,12,13,
               17,13,14,
               17,14,15,
               17,15,16,
               17,16,9
             ];
  return {
    position: position,
    normal: normal,
    texture: texture,
    index: index
  };
}

/*Returns current system time*/
function time() {
  var d = new Date();
  var n = d.getTime();
  return n;
}

/*used to init animation frames*/
function initAnimatedTexture(array, clampType) {
  let animationArray = [];
  for(var i = 0; i < array.length; i++) {
    animationArray.push(initTextures(array[i], clampType));
  }
  return animationArray;
}

/*creates a torch-NodeChain with some settings*/
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

/*creates a material node with default settings*/
function createDefaultMaterialNode(specular, children) {
  var node = new MaterialSGNode(children);
  node.ambient = [1, 1, 1, 1];
  node.diffuse = [1, 1, 1, 1];
  node.specular = [1*specular, 1*specular, 1*specular, 1];
  node.shininess = 1000;
  return node;
}

/*creates a billboard node-chain with position and size*/
function createBillBoard(position, size) {
  var rect = makeTexturedRect(size[0], size[1], size[2]);
  let billboard = new BillboardSGNode(glm.transform({translate: position}), [
    new RenderSGNode(rect)
  ]);
  return createDefaultMaterialNode(0.1, billboard);
}

/*creates a fireTorch by manipulation the color*/
function createFireTorch(pos) {
  var torch = createTorch([1.0,0.6,0.05,1.0],
    pos);
    torch.ambient = [0.25,0.15,0.0125,1.0];
    //torch.spotAngle = 105 * Math.PI/180;
    torch.decreaseRate = 5;
    return torch;
  }

/*creates a green torch*/
function createGreenTorch(pos) {
  var torch = createTorch([0.05,0.3,0.025,1.0],
                      pos,
                      [0.2,0.5,0.1],
                      [0,0.5,0]);
  torch.ambient = [0,0,0,1.0]
  torch.decreaseRate = 8;
  return torch;
}

/*create a rectangle with texture coordinates*/
function makeTexturedRect(x, y, a) {
  var rect = makeRect(x, y);

  /*flip the normal vector*/
  for(var i = 0; i < rect.normal.length; i++)
    rect.normal[i] = -rect.normal[i];

  rect.texture = [0, 0,   a*x/y, 0,   a*x/y, a,   0, a];
  return rect;
}

/*Initialises a texture and returns it*/
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

/*creates a particle node-chain
 shader -> blend enable -> particleNode*/
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

  //factor used to multiply with distance of each axis in order to achieve a total moved distance of "speed"
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

/*deg to rad*/
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

//used to make object look at target
function ObjectLookAtMatrix(object, targetMatrix, up) {
  var lookAt = mat4.lookAt(mat4.create(), [object.matrix[12], 0, object.matrix[14]], [targetMatrix[12], 0, targetMatrix[14]], [0, -1, 0]);

  for(var i = 0; i < 12; i++) {
    object.matrix[i] = lookAt[i];
  }
  mat4.multiply(object.matrix, object.matrix, glm.transform({rotateX:180}));
}
