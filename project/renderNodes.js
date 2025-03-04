console.log('in main.js')
/**
 * a light node represents a light including light position and light properties (ambient, diffuse, specular)
 * the light position will be transformed according to the current model view matrix
 */

/*
* Node to set the uniform for lightingShader with
* numbers of lights used
*/
class LightingSGNode extends SGNode {
  constructor(children) {
      super(children);
  }
  render(context)
  {
    /*defines number of lightsources*/
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_nrOfLights'), AdvancedLightSGNode.nr);
    super.render(context);
  }
}

/**
* a node which triggers a given function once when the camera is within a given radius of the node
*/
class ObjectTriggerSGNode extends TransformationSGNode {
  constructor(radius, triggeringObjectMatrix, matrix, triggeredFunction, children) {
    super(matrix, children);
    this.radius = radius;
    this.triggeringObjectMatrix = triggeringObjectMatrix;
    if(triggeredFunction == null) {
      this.triggeredFunction = function(){console.log("node for point " + matrix + " triggered but no function set")};
    } else {
      this.triggeredFunction = triggeredFunction;
    }
    var triggered = 0;
  }
  render(context)
  {
    var dx = this.triggeringObjectMatrix[12] - this.matrix[12];
    var dy = this.triggeringObjectMatrix[13] - this.matrix[13];
    var dz = this.triggeringObjectMatrix[14] - this.matrix[14];
    var distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if(distance <= this.radius && !this.triggered) {
      this.triggeredFunction();
      this.triggered = 1;
    }
  }
  setTriggerFunction(triggeredFunction) {
    this.triggeredFunction = triggeredFunction;
  }
}

/**
* a node which triggers a given function once when the camera is within a given radius of the node
*/
class TriggerSGNode extends TransformationSGNode {
  constructor(radius, matrix, triggeredFunction, children) {
    super(matrix, children);
    this.radius = radius;
    if(triggeredFunction == null) {
      this.triggeredFunction = function(){console.log("node for point " + matrix + " triggered but no function set")};
    } else {
      this.triggeredFunction = triggeredFunction;
    }
    var triggered = 0;
  }
  render(context)
  {
    var dx = context.invViewMatrix[12] - this.matrix[12];
    var dy = context.invViewMatrix[13] - this.matrix[13];
    var dz = context.invViewMatrix[14] - this.matrix[14];
    var distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if(distance <= this.radius && !this.triggered) {
      this.triggeredFunction();
      this.triggered = 1;
    }
  }
  setTriggerFunction(triggeredFunction) {
    this.triggeredFunction = triggeredFunction;
  }
}

/*
* Lightnode with additional numbering for lightingShader.
* Adds a lightReduction over distance factor
* and some flicker (more less brighter) can be enabled
* Capable of beeing a Spot-Light
*/
class AdvancedLightSGNode extends LightSGNode {

  constructor(flicker, spotAngle, lookAt, position, children) {
    super(position, children);

    this.flicker = (flicker || false);

    this.spotAngle = spotAngle || 0;
    this.lookAt =  lookAt || [1,0,0];

    vec3.normalize(this.lookAt, this.lookAt);
    this.spotAngle *= Math.PI/180;

    /*increase nr of lights*/
    AdvancedLightSGNode.nr = (AdvancedLightSGNode.nr + 1 || 0);
    /*set number for this object*/
    this.nr = AdvancedLightSGNode.nr;

    this.origUniform = this.uniform;
    /*change uniform, so an array access can be made*/
    this.uniform = this.uniform + '['+ this.nr + ']';

    this.decreaseRate = 15.0; /*how fast light reduces over distance to lightsource*/
    this.flickerSize = 8; /*determines how strong the flickering is*/
    this.counter = 0; /*flicker-runtime-variable*/
  }

  /*override Original call so the array gets used properly*/
  setLightPosition(context) {
    const gl = context.gl;

    if (!context.shader || !isValidUniformLocation(gl.getUniformLocation(context.shader, this.origUniform+'Pos'+'[' + this.nr + ']'))) {
      return;
    }

    const position = this._worldPosition || this.position;
    /*store the position of the light in the array on position nr*/
    gl.uniform3f(gl.getUniformLocation(context.shader, this.origUniform+'Pos'+'[' + this.nr + ']'), position[0], position[1], position[2]);
  }

  render(context) {
    /*get some random flickering into this*/
    if(this.flicker) {
      /*calculate flicker*/
      var flicker = 1 + Math.cos(this.counter)/this.flickerSize;
      flicker *= (1.0 + Math.random()/this.flickerSize);

      /*store original color*/
      this.ambientOrig = this.ambient.slice(0);
      this.diffuseOrig = this.diffuse.slice(0);
      this.specularOrig = this.specular.slice(0);

      /*set flickered color*/
      this.ambient = vec4.scale(vec4.create(), this.ambientOrig, flicker);
      this.diffuse = vec4.scale(vec4.create(), this.diffuseOrig, flicker);
      this.specular = vec4.scale(vec4.create(), this.specularOrig, flicker);
    }

    /*transform lookAt position for the spotlight into view-world*/
    const modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
    const viewNormalMatrix = mat3.normalFromMat4(mat3.create(), modelViewMatrix);

    var lookAt = vec3.transformMat3(vec3.create(), this.lookAt, viewNormalMatrix);
    vec3.normalize(lookAt, lookAt); //normalize after transform

    /*Update uniforms for spotlight*/
    gl.uniform1f(gl.getUniformLocation(context.shader, this.uniform+'.spotAngle'), this.spotAngle);
    gl.uniform3fv(gl.getUniformLocation(context.shader, this.uniform+'.lookAt'), lookAt);
    gl.uniform1f(gl.getUniformLocation(context.shader, this.uniform+'.decreaseRate'), this.decreaseRate);

    /*increase counter-value for next flicker-value*/
    this.counter += Math.random() / 2;

    super.render(context);

    /*restore the original color*/
    if(this.flicker) {
      this.ambient = this.ambientOrig;
      this.diffuse = this.diffuseOrig;
      this.specular = this.specularOrig;
    }
  }
}

/**
* TextureSGNode that is capable of rendering
* an array of textures altering between them
*/
class AnimatedTextureSGNode extends SGNode {
  constructor(texture, textureunit, animationSpeed, children) {
      super(children);
      this.texture = texture;
      this.textureunit = textureunit;
      this.lastTime = time();
      this.currentTime = time();
      this.animationIndex = 0;
      this.animationSpeed = animationSpeed;
  }

  render(context)
  {
    //set the texture shader parameter
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex'), this.textureunit);

    this.currentTime = time();

    //activate and bind texture
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);

    /*rotate throw the array with animation speed*/
    if(this.lastTime + this.animationSpeed <= this.currentTime) {
      this.animationIndex++;
      this.lastTime = this.currentTime;
      if(this.animationIndex >= this.texture.length) {
        this.animationIndex = 0;
      }
    }
    var tex = this.texture[this.animationIndex]
    gl.bindTexture(gl.TEXTURE_2D, tex);
    //render children
    super.render(context);

    //clean up
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

class ToggleSGNode extends SGNode {
  constructor(enabled, children) {
    super(children);
    this.enabled = enabled;
  }
  disable() {
    this.enabled = 0;
  }
  enable() {
    this.enabled = 1;
  }
  setRender(enabled) {
    this.enabled = enabled;
  }
  toggle(){
    if(this.enabled) {
      this.enabled = 0;
    } else {
      this.enabled = 1;
    }
  }
  render(context){
    if(this.enabled) {
      super.render(context);
    }
  }
}

/*
* used to create Billboards that always look towards the camera (ignoring Y axis so they stand upright)
*/
class BillboardSGNode extends TransformationSGNode {
  constructor (matrix, children) {
    super(matrix, children);
  }

  render(context) {
    var prevMat = this.matrix;

    var lookAt = mat4.lookAt(mat4.create(), [this.matrix[12], 0, this.matrix[14]], [context.invViewMatrix[12], 0, context.invViewMatrix[14]], [0, -1, 0]);

    for(var i = 0; i < 12; i++) {
      this.matrix[i] = lookAt[i];
    }
    super.render(context);

    this.matrix = prevMat;
  }
}

class ParticleSGNode extends SGNode {

  constructor(partSize, fuelSize, colorMult, colorMin, children) {
    super(children);

    /*parameters to change particle look*/
    this.emmitModifier = 1;
    this.partSize = partSize;
    this.scalefactor = 300/partSize;
    this.invScalefactor = partSize/300;
    this.fuelSize = fuelSize;
    this.fireParticles = [];
    this.sparkParticles = [];
    this.isInit = false;
    this.lastTime = time();
    this.fireEmmitAngle = 2;
    this.sparkEmmitAngle = 1;
    this.speedVariance = 0.2;
    this.sizeVariance = 0.5;
    this.sparkEmmitRate = 0.97;
    this.fireHeatDegreeRate = 0.5*this.scalefactor;
    this.sparkHeatDegreeRate = 0.01*this.scalefactor;
    this.fireCenterHeatDegreeRate = 5*this.scalefactor;
    this.particleSizeReduction = 70.0;
    this.fireRiseFactor = 0.3;
    this.sparkRiseFactor = 0.005;
    this.movementScaling = 5;
    this.maxMovement = 100;
    this.maxDistanceFromStart = 100;
    this.fireSpeed = 2.5*this.invScalefactor;
    this.sparkSpeed = 0.5*(this.invScalefactor*5);
    this.particleColorMult = (colorMult || vec3.fromValues(0.5,0.5,0.1));
    this.particleColorMin = (colorMin ||vec3.fromValues(0.5,0,0));
    this.windStrength = 0.3;
    this.newSpawns = 200;
    this.variance = 0;
    this.spawnVariance = 0;
    this.varianceOffset = 0.9;
    this.randomVariance = 0;
  }

  /*Generate a random color within the given parameters
    for a particle*/
  getRandomColor() {
    return [Math.random()*this.particleColorMult[0]+this.particleColorMin[0],
            Math.random()*this.particleColorMult[1]+this.particleColorMin[1],
            Math.random()*this.particleColorMult[2]+this.particleColorMin[2], 1.0];
  }

/*Get a random starting position in the given cube*/
  getRandomPosition(limits) {
    return [limits[0]*Math.random()-limits[0]/2,
            limits[1]*Math.random()-limits[1]/2,
            limits[2]*Math.random()-limits[2]/2];
  }

/*Get a random start direction for the particles
  it always points towards a positive y-direction*/
  getRandomVec3Upward(emmitAngle, scale, emmitModifier) {
    /*get a minimum uprising vector*/
    const out = vec3.create();
    out[0] = Math.random() * 2 - 1;
    out[1] = emmitAngle + emmitModifier * Math.random();
    out[2] = Math.random() * 2 - 1;

    vec3.normalize(out, out);
    vec3.scale(out, out, scale);
    return out;
  }

/*Spawns a new particle*/
  createParticle(limits, size, sizeVariance, speed, emmitAngle) {
    var particle = {};
    var speed = speed + Math.random() * speed * this.speedVariance;
    particle.size = size + Math.random() * size * sizeVariance;
    particle.color = this.getRandomColor();
    particle.position = this.getRandomPosition(limits);
    particle.startPosition = particle.position.slice(0);
    particle.velocity = this.getRandomVec3Upward(emmitAngle, speed, this.emmitModifier);

    return particle;
  }

/*gets the actual position of the particleNode in the Scene
  by using the sceneMatrix*/
  getPosition(sceneMatrix) {
    const pos = vec3.transformMat4(vec3.create(), vec3.create(), sceneMatrix);
    return pos;
  }

  /*calculates the movement of the particleSpot from
  posVec and oldPosVec*/
  getMovement(posVec, oldPosVec, sceneMatrix) {
    /*we need negative direction (wind)*/
    const moveVec = vec4.fromValues(oldPosVec[0] - posVec[0],
                                  oldPosVec[1] - posVec[1],
                                  oldPosVec[2] - posVec[2],
                                  1);

    /*multiply the vector with the inverse scene matrix
      doing this will result in the movement from the pixel point of view
      but this also includes the translations*/
    var invSceneMatrix = mat4.invert(mat4.create(), sceneMatrix);

    /*convert moveVec to objectViewVector containing translations*/
    vec4.transformMat4(moveVec, moveVec, invSceneMatrix);

    /*get the translations out of the inverseMatrix*/
    const translations = vec4.fromValues(invSceneMatrix[12],invSceneMatrix[13],invSceneMatrix[14],1);

    /*subtract the translation-part from the movevector*/
    vec4.subtract(moveVec, moveVec, translations);

    /*do some scaling, this values are pretty small*/
    vec4.scale(moveVec, moveVec, this.movementScaling);
    const length = vec3.length(moveVec);
    if(length > this.maxMovement) {
      vec4.scale(moveVec, moveVec, this.maxMovement / length);
    }

    return vec3.fromValues(moveVec[0],moveVec[1],moveVec[2]);
  }

  /*creates a vector that has the same length as the given, but it
  points by factor more in y-direction*/
  riseVectorUp(vector, factor) {
    var oldSize = vec3.length(vector);
    vector[1] += (vector[1]*factor);
    var newSize = vec3.length(vector);

    /*dont let the speed increase*/
    vec3.scale(vector, vector, oldSize/newSize);

    return vector;
  }

  /*slowly change wind direction on a random basis*/
  alterWind() {
    var change = Math.random() * 0.1;
    if(Math.random() > 0.5)
      change *= -1;

    if(Math.random() > 0.6)
      this.wind[0] += change;
    else
      this.wind[2] += change;
      vec3.normalize(this.wind, this.wind);

      vec3.scale(this.wind, this.wind, this.windStrength);
  }

  /*add some random change for each particle*/
  getWindDir() {
    var rndWind = vec3.create();
    var change = Math.random() * 0.1
    if(Math.random() > 0.6)
      rndWind[0] += change;
    else
      rndWind[2] += change;

    vec3.add(rndWind, rndWind, this.wind);
    return rndWind;
  }

  /*one time call in renderer, sets up all attributes
  and uniforms, binds */
  init(context, sceneMatrix) {
    if(!this.isInit) {
        this.isInit = true;
        this.posBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.sizeBuffer = gl.createBuffer();

        /*set the attributes uniforms*/
        this.a_position =  gl.getAttribLocation(context.shader, 'a_position');
        this.a_color =  gl.getAttribLocation(context.shader, 'a_color');
        this.a_size =  gl.getAttribLocation(context.shader, 'a_size');
        this.u_modelView = gl.getUniformLocation(context.shader, 'u_modelView');
        this.u_projection = gl.getUniformLocation(context.shader, 'u_projection');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(this.a_color);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.enableVertexAttribArray(this.a_position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
        gl.enableVertexAttribArray(this.a_size);

        this.wind = vec3.fromValues(0,0,0);

        this.moveVec = vec3.create();
        this.oldPos = this.getPosition(sceneMatrix);
    }
  }

  /*adds a particle to the gl-buffer, so it will be drawn in the particle-shaders*/
  addToGlBuffer(particle, posBuffer, colorBuffer, sizeBuffer) {
    posBuffer.push(particle.position[0],particle.position[1],particle.position[2]);
    colorBuffer.push(particle.color[0],particle.color[1],particle.color[2],particle.color[3]);
    sizeBuffer.push(particle.size);
  }

  render(context) {
    const sceneMatrix = context.sceneMatrix;

    this.init(context, sceneMatrix);

    /*disable the z-buffer access, so there is no
    z-buffer-test for the particles (all of them should be drawn for
    a good blending result)*/
    gl.depthMask(false);

    /*check how much time passed since last time*/
    var timeDiff = (time() - this.lastTime);
    /*based on that, calculate movement of particles*/
    var timeS = timeDiff/1000.0;

    const partPosGlBuffer = [];
    const colorGlBuffer = [];
    const sizeGlBuffer = [];

    /*calculate amount of particles to spawn*/
    var toSpawn = this.newSpawns;
    if(this.variance > 0) {
      toSpawn *= (Math.sin(this.spawnVariance)+ this.varianceOffset);
      this.spawnVariance += this.variance + this.randomVariance;
    }

    /*create new particles*/
    for(var i = 0; i < toSpawn*(timeDiff > 100?0.1:timeS); i++){
      this.fireParticles.push(this.createParticle(this.fuelSize ,this.partSize, this.sizeVariance, this.fireSpeed, this.fireEmmitAngle));
    }

    /*roll if a new spark should be spawned*/
    if(this.sparkParticles.length < 100 && Math.random() > this.sparkEmmitRate)
      this.sparkParticles.push(this.createParticle(this.fuelSize, this.partSize/5, this.sizeVariance, this.sparkSpeed, this.sparkEmmitAngle));

    //calculate the center of the fire, so particles far away from the center
    //die sooner, since there is less "heat"
    var center = vec3.create();
    for(var i = 0; i<this.fireParticles.length;i++) {
      vec3.add(center, center, this.fireParticles[i].position);
    }

    /*only divide if length is at least 1*/
    if(this.fireParticles.length > 0)
      vec3.scale(center, center, 1.0 / this.fireParticles.length);

    //calculate the movement since last render-call
    const actPosition = this.getPosition(sceneMatrix);
    const moveVec = this.getMovement(actPosition, this.oldPos, sceneMatrix);

    /*change the wind direction softly each call*/
    this.alterWind();

    //move all particles in their direction
    for(var i = 0; i<this.fireParticles.length;i++) {
      const particle = this.fireParticles[i];

      //add constant uprising but speed stays the same (length)
      particle.velocity = this.riseVectorUp(particle.velocity, this.fireRiseFactor);

      //generate some random wind for each particle, but based on alterWind()
      const wind = this.getWindDir();

      //add moved-vector to the velocity of the particle
      var vel = vec3.add(vec3.create(), particle.velocity, moveVec);
      vec3.add(vel, vel, wind); //also add wind
      //change position of the particle
      vec3.add(particle.position, particle.position, vec3.scale(vec3.create(), vel, timeS));

      const xDistance = particle.position[0] - center[0];
      const zDistance = particle.position[2] - center[2];

      //when the particle distances itself from the center, it gets less bright
      //correct solution
      const distanceToCenter = Math.sqrt((xDistance*xDistance + zDistance*zDistance));
      //fast solution
      //var distanceToCenter = xDistance + zDistance;

      /*reduce the visibility of each particle as they rise away*/
      particle.color[3] -= (this.fireHeatDegreeRate*timeS + Math.abs(distanceToCenter)*this.fireCenterHeatDegreeRate*timeS);
      /*also reduce particle size during a particle lifespan*/
      if(this.particleSizeReduction > 0)
        particle.size -= (particle.size/this.particleSizeReduction*timeS + Math.abs(distanceToCenter)*particle.size/(this.particleSizeReduction*2)*timeS);

      var pos = particle.position.slice(0);
      pos[1] = pos[1] / 2;
      var sPos =particle.startPosition.slice(0);
      sPos[1] = sPos[1] / 2;

      /*calculate distance from the start position*/
      const distanceFromStart = vec3.length(vec3.subtract(vec3.create(),
                                            pos,
                                            sPos));

      //if particle gets invisible e.g. all its energy is used, remove it
      //or if its size is to small, or if it has travelled to far away from start
      if(particle.color[3] <= 0.0 || particle.size <= 0.0 || distanceFromStart > this.maxDistanceFromStart) {
        this.fireParticles.splice(i, 1);
      }else {
        this.addToGlBuffer(particle, partPosGlBuffer, colorGlBuffer, sizeGlBuffer);
      }
    }

    //move all particles in der direction
    for(var i = 0; i<this.sparkParticles.length;i++) {
      const particle = this.sparkParticles[i];

      particle.velocity = this.riseVectorUp(particle.velocity, this.sparkRiseFactor);

      var vel = vec3.add(vec3.create(), particle.velocity, moveVec);
      //let the particles randomly flicker around a bit
      //vec3.add(particle.velocity, particle.velocity, vec3.random(vec3.create(), 0.001));
      vec3.add(particle.position, particle.position, vec3.scale(vec3.create(), vel, timeS));

      particle.color[3] -= (this.sparkHeatDegreeRate + this.sparkHeatDegreeRate * Math.random());

      //if particle becomes invisible e.g. all its energy is used, remove it
      if(particle.color[3] <= 0.0) {
        this.sparkParticles.splice(i, 1);
      }else {
        this.addToGlBuffer(particle, partPosGlBuffer, colorGlBuffer, sizeGlBuffer);
      }
    }

    this.oldPos = actPosition;

    if(sizeGlBuffer.length > 0) {
      //Bind buffers used
      gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
      gl.vertexAttribPointer(this.a_position, 3, gl.FLOAT, false, 0, 0);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(partPosGlBuffer), gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.vertexAttribPointer(this.a_color, 4, gl.FLOAT, false, 0, 0);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorGlBuffer), gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
      gl.vertexAttribPointer(this.a_size, 1, gl.FLOAT, false, 0, 0);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizeGlBuffer), gl.STATIC_DRAW);

      const modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, sceneMatrix);

      gl.uniformMatrix4fv(this.u_projection, false, context.projectionMatrix);
      gl.uniformMatrix4fv(this.u_modelView, false, modelViewMatrix);

      gl.drawArrays(gl.POINTS, 0, sizeGlBuffer.length);
    }

    this.lastTime = time();

    super.render(context);

    /*reenable depthtest-access*/
    gl.depthMask(true);
  }
}

/*This node sorts all its nodes according to their position,
  starting with the one closest to the camera, and renders
  its child in this order*/
class Back2FrontSGNode extends SGNode {
  constructor(children) {
    super(children);
  }

  /*resorts the children to the render order*/
  getRenderOrder(context, children) {
    const renderListSort = [];

    /*prepare a list of childs combined with
     *the distance to the camera*/
    for(var i = 0; i < children.length; i++) {
      renderListSort.push({
        distance: this.getDistanceToCamera(context, children[i]),
        child: children[i]
      });
    }

    /*sort the array now according to distance*/
    renderListSort.sort(function(a,b) {
      return b.distance - a.distance;
    });

    return renderListSort;
  }

  /*calculates the distance of a child to the camera by
  searching through all the TransformationSGNodes*/
  getDistanceToCamera(context, child) {
    const matrix = mat4.copy(mat4.create(), context.sceneMatrix);

    /*get the combined transform-matrices of the child*/
    this.getChildSceneMatrix(child, matrix);

    /*get position*/
    const pos = vec3.fromValues(  matrix[12],
                                  matrix[13],
                                  matrix[14]);

    /*get cameraPosition*/
    const camPos = vec3.fromValues( context.invViewMatrix[12],
                                  context.invViewMatrix[13],
                                  context.invViewMatrix[14]);

    /*calculate distance*/
    vec3.subtract(pos, pos, camPos);
    var distance = vec3.length(pos);

    /*if the point is behind the camera, it has a negative distance*/
    if(vec3.dot(context.lookAtVector, pos) < 0.0)
      distance *= -1;

    return distance;
  }

  /*recursively go through all childnodes and
   extract the matrices*/
  getChildSceneMatrix(child, matrix) {
    if(child.matrix != null) {
      mat4.multiply(matrix, matrix, child.matrix);
    }
    parent = this;
    child.children.forEach(function(c) {
      parent.getChildSceneMatrix(c, matrix);
    });
  }

  render(context) {
    const renderList = this.getRenderOrder(context, this.children);
    /*clear all childs*/
    this.children = [];

    const parent = this;

    /*add new sorted nodes to the child*/
    renderList.forEach(function(c) {
      parent.children.push(c.child);
    });

    /*render childs now*/
    super.render(context);
  }
}

/*Enables Blending sets the given function
calls its childs and then restores the oldPos
blend-settings*/
class BlendSgNode extends SGNode {
  constructor(srcFunc, destFunc, children) {
    super(children);
    this.srcFunc = srcFunc;
    this.destFunc = destFunc;
  }

  render(context) {
    const gl = context.gl;
    /*store old blend settings*/
    var enaDis = gl.getParameter(gl.BLEND);
    var src = gl.getParameter(gl.BLEND_SRC_ALPHA);
    var dest = gl.getParameter(gl.BLEND_DST_ALPHA);

    gl.enable(gl.BLEND);
    gl.blendFunc(this.srcFunc, this.destFunc);
    super.render(context);


    /*restore old blend settings*/
    gl.blendFunc(src, dest);
    if(!enaDis)
      gl.disable(gl.BLEND);
  }
}
