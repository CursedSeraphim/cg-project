/**
 * a light node represents a light including light position and light properties (ambient, diffuse, specular)
 * the light position will be transformed according to the current model view matrix
 */

class TorchSGNode extends LightSGNode {

  constructor(position, children) {
    super(null, children);

    this.ambientOrig = this.ambient;
    this.diffuseOrig = this.diffuse;
    this.specularOrig = this.specular;

    this.counter = 0;
  }

  render(context) {
    /*get some random flickering into this*/
    var flicker = 1 + Math.cos(this.counter)/10;
    flicker *= (1.0 + Math.random()/10);
    this.ambient = vec4.scale(vec4.create(), this.ambientOrig, flicker);
    this.diffuse = vec4.scale(vec4.create(), this.diffuseOrig, flicker);
    this.specular = vec4.scale(vec4.create(), this.specularOrig, flicker);

    //this.counter+=0.16;
    this.counter+=Math.random()/2;
    super.render(context);
  }
}

class TextureSGNode extends SGNode {
  constructor(texture, textureunit, children ) {
      super(children);
      this.texture = texture;
      this.textureunit = textureunit;
  }

  render(context)
  {
    //tell shader to use our texture
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 1);

    /*defines number of lightsources*/
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_nrOfLights'), LightSGNode.nr);

    //set additional shader parameters
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_tex'), this.textureunit);

    //activate and bind texture
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    //render children
    super.render(context);

    //clean up
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, null);

    //disable texturing in shader
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 0);
  }
}

//a scene graph node for setting shadow parameters
class ShadowSGNode extends SGNode {
  constructor(shadowtexture, textureunit, width, height, children) {
      super(children);
      this.shadowtexture = shadowtexture;
      this.textureunit = textureunit;
      this.texturewidth = width;
      this.textureheight = height;

      this.lightViewProjectionMatrix = mat4.create(); //has to be updated each frame
  }

  render(context) {
    //set additional shader parameters
    gl.uniform1i(gl.getUniformLocation(context.shader, 'u_depthMap'), this.textureunit);

    //pass shadow map size to shader (required for extra task)
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_shadowMapWidth'), this.texturewidth);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_shadowMapHeight'), this.textureheight);

    //TASK 2.1: compute eye-to-light matrix by multiplying this.lightViewProjectionMatrix and context.invViewMatrix
    //Hint: Look at the computation of lightViewProjectionMatrix to see how to multiply two matrices and for the correct order of the matrices!
    var eyeToLightMatrix = mat4.multiply(mat4.create(),this.lightViewProjectionMatrix,context.invViewMatrix);
    //var eyeToLightMatrix = mat4.create();
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_eyeToLightMatrix'), false, eyeToLightMatrix);

    //activate and bind texture
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowtexture);

    //render children
    super.render(context);

    //clean up
    gl.activeTexture(gl.TEXTURE0 + this.textureunit);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

function time() {
  var d = new Date();
  var n = d.getTime();
  return n;
}

class FireSGNode extends TransformationSGNode {

  constructor(partSize, fuelSize, position, children) {
    super(position, children);

    this.partSize = partSize;

    //this.scalefactor = partSize/100
    // this.fuelSize = vec3.scale(vec3.create(), fuelSize, this.scalefactor);
    this.fuelSize = fuelSize;
    this.fireParticles = [];
    this.sparkParticles = [];
    this.isInit = false;
    this.lastTime = time();
    this.emmitAngle = 2;
    this.sparkEmmitAngle = 1;
    this.fireSpeed = 2.5;
    this.sparkSpeed = 2.5;
    this.speedVariance = 0.2;
    this.sizeVariance = 0.5;
    this.sparkEmmitRate = 0.97;
    this.fireHeatDegreeRate = 0.015;
    this.sparkHeatDegreeRate = 0.01;
    this.fireCenterHeatDegreeRate = 0.09;
    this.particleSizeReduction = 50.0;
    this.fireRiseFactor = 0.1;
    this.sparkRiseFactor = 0.005;
  }

  getRandomColor() {
    return [Math.random()*0.5+0.5, Math.random()*0.5, Math.random()*0.1, 1.0];
  }

  getRandomPosition(limits) {
    return [limits[0]*Math.random()-limits[0]/2,
            limits[1]*Math.random()-limits[1]/2,
            limits[2]*Math.random()-limits[2]/2];
  }

  getRandomVec3Upward(emmitAngle, scale) {
    /*get a minimum uprising vector*/
    var out = vec3.create();
    out[0] = Math.random() * 2 - 1;
    out[1] = emmitAngle + Math.random();
    out[2] = Math.random() * 2 - 1;

    vec3.normalize(out, out);
    vec3.scale(out, out, scale);
    return out;
  }

  createParticle(limits, size, sizeVariance, speed, emmitAngle) {
    var particle = {};
    var speed = speed + Math.random() * speed * this.speedVariance;
    particle.size = size + Math.random() * size * sizeVariance;
    particle.color = this.getRandomColor();
    particle.position = this.getRandomPosition(limits);
    particle.velocity = this.getRandomVec3Upward(emmitAngle, speed);

    return particle;
  }

  getPosition(sceneMatrix) {
    var pos = vec4.transformMat4(vec4.create(), vec4.fromValues(0.0,0.0,0.0,1.0), sceneMatrix);
    return vec3.fromValues(pos[0], pos[1], pos[2]);
  }

  riseVectorUp(vector, factor) {
    var oldSize = vec3.length(vector);
    vector[1] += (vector[1]*factor);
    var newSize = vec3.length(vector);
    vec3.scale(vector, vector, oldSize/newSize);

    return vector;
  }

  init(context) {
    if(!this.isInit) {
        this.isInit = true;
        this.posBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.sizeBuffer = gl.createBuffer();
        this.a_position =  gl.getAttribLocation(context.shader, 'a_position');
        this.a_color =  gl.getAttribLocation(context.shader, 'a_color');
        this.a_size =  gl.getAttribLocation(context.shader, 'a_size');
        this.u_modelView = gl.getUniformLocation(context.shader, 'u_modelView');
        this.u_projection = gl.getUniformLocation(context.shader, 'u_projection');

        this.u_moveCompensation = gl.getUniformLocation(context.shader, 'u_moveCompensation');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(this.a_color);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.enableVertexAttribArray(this.a_position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
        gl.enableVertexAttribArray(this.a_size);

        this.moveVec = vec3.create();
        this.oldPos = this.getPosition(context.sceneMatrix);
    }
  }

  addToGlBuffer(particle, posBuffer, colorBuffer, sizeBuffer) {
    posBuffer.push(particle.position[0],particle.position[1],particle.position[2]);
    colorBuffer.push(particle.color[0],particle.color[1],particle.color[2],particle.color[3]);
    sizeBuffer.push(particle.size);
  }

  render(context) {
    this.init(context);

    //gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    var timeDiff = (time() - this.lastTime);

    if(timeDiff > 100)
      timeDiff = 100;

    var timeS = timeDiff/1000.0;

    var partPosGlBuffer = [];
    var colorGlBuffer = [];
    var sizeGlBuffer = [];

    /*create new particles*/
    for(var i = 0; i < 500*timeS; i++){
      this.fireParticles.push(this.createParticle(this.fuelSize ,this.partSize, this.sizeVariance, this.fireSpeed, this.emmitAngle));
    }

    if(Math.random() > this.sparkEmmitRate)
      this.sparkParticles.push(this.createParticle(this.fuelSize, this.partSize/5, this.sizeVariance, this.sparkSpeed, this.sparkEmmitAngle));

    //calculate the center of the fire, so particles far away from the center
    //die sooner, since there is less "heat"
    var center = vec3.create();
    for(var i = 0; i<this.fireParticles.length;i++) {
      vec3.add(center, center, this.fireParticles[i].position);
    }
    vec3.scale(center, center, 1.0/this.fireParticles.length);

    //move all particles in der direction
    for(var i = 0; i<this.fireParticles.length;i++) {
      var particle = this.fireParticles[i];

      //TODO generate some random wind for each particle
      var wind = vec3.create();
      vec3.add(particle.velocity, particle.velocity, wind);

      //add constant uprising but speed stays the same (length)
      particle.velocity = this.riseVectorUp(particle.velocity, this.fireRiseFactor);

      var vel = vec3.add(vec3.create(), particle.velocity, this.moveVec);
      //change position of the particle
      vec3.add(particle.position, particle.position, vec3.scale(vec3.create(), vel, timeS));

      var xDistance = particle.position[0] - center[0];
      var zDistance = particle.position[2] - center[2];

      //when the particle distances itself from the center, it gets less bright
      //correct solution
      var distanceToCenter = Math.sqrt((xDistance*xDistance + zDistance*zDistance));
      //fast solution
      //var distanceToCenter = xDistance + zDistance;
      particle.color[3] -= (this.fireHeatDegreeRate + Math.abs(distanceToCenter)*this.fireCenterHeatDegreeRate);
      particle.size -= (particle.size/this.particleSizeReduction + Math.abs(distanceToCenter)*particle.size/(this.particleSizeReduction*2));

      //if particle gets invisible e.g. all its energy is used, remove it
      if(particle.color[3] <= 0.0 || particle.size <= 0.0) {
        this.fireParticles.splice(i, 0.5);
      }else {
        this.addToGlBuffer(particle, partPosGlBuffer, colorGlBuffer, sizeGlBuffer);
      }
    }

    //move all particles in der direction
    for(var i = 0; i<this.sparkParticles.length;i++) {
      var particle = this.sparkParticles[i];

      //TODO generate some random wind for each particle
      var wind = vec3.fromValues(0,0,0);
      //add wind to velocity
      vec3.add(particle.velocity, particle.velocity, wind);

      particle.velocity = this.riseVectorUp(particle.velocity, this.sparkRiseFactor);

      //let the particles randomly flicker around a bit
      //vec3.add(particle.velocity, particle.velocity, vec3.random(vec3.create(), 0.001));
      vec3.add(particle.position, particle.position, vec3.scale(vec3.create(), particle.velocity, timeS));

      particle.color[3] -= (this.sparkHeatDegreeRate + this.sparkHeatDegreeRate * Math.random());

      //if particle becomes invisible e.g. all its energy is used, remove it
      if(particle.color[3] <= 0.0) {
        this.sparkParticles.splice(i, 1);
      }else {
        this.addToGlBuffer(particle, partPosGlBuffer, colorGlBuffer, sizeGlBuffer);
      }
    }

    //calculate the movement since last
    var actPosition = this.getPosition(context.sceneMatrix);
    var moveVec = vec3.subtract(vec3.create(), this.oldPos, actPosition);
    vec3.scale(moveVec, moveVec, 1);

    this.oldPos = actPosition;
    this.moveVec = moveVec;

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

    var modelViewMatrix = mat4.multiply(mat4.create(),mat4.create()/* glm.translate(moveVec[0],moveVec[1], moveVec[2])*/, context.sceneMatrix);
    modelViewMatrix = mat4.multiply(modelViewMatrix, context.viewMatrix, modelViewMatrix);
    gl.uniformMatrix4fv(this.u_projection, false, context.projectionMatrix);
    gl.uniformMatrix4fv(this.u_modelView, false, modelViewMatrix);

    gl.drawArrays(gl.POINTS, 0, sizeGlBuffer.length);

    this.lastTime = time();

    super.render(context);

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }
}
