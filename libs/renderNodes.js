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

class FireSGNode extends TransformationSGNode {

  constructor(partCnt, partSize, fuelWidth, velocity, position, children) {
    super(position, children);

    this.partCnt = partCnt;
    this.partSize = partSize;
    this.initializes = false;

    this.scalefactor = partSize/100

    this.fuelWidth = vec3.scale(vec3.create(), fuelWidth, this.scalefactor);
    this.velocity = vec3.scale(vec3.create(), velocity, this.scalefactor);

    var particles = [];
    var position = [];
    var color = [];
    var freePart = [];

    for(var i = 0; i < this.partCnt; i++) {
      particles[i] = {};
      particles[i].translate = [0.0,0.0,0.0];
      particles[i].velocity = [0.0,0.0,0.0];
      particles[i].heat = Math.random()*this.partSize;
      /*get a small random start-position*/
      position.push(this.fuelWidth[0]*Math.random()-this.fuelWidth[0]/2,
                    this.fuelWidth[1]*Math.random()-this.fuelWidth[1]/2,
                    this.fuelWidth[2]*Math.random()-this.fuelWidth[2]/2);
      //position.push(0.0,3.0,5.0);
      color.push(Math.random()*0.5+0.5, Math.random()*0.5, Math.random()*0.1, 1);
      //color.push(1.0,0.0,0.0, 1.0);
      freePart[i] = i;
    }
    this.particles = particles;
    this.position = position;
    this.color = color;
    this.freePart = freePart;
    this.active = [];
  }

  render(context) {
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    var posShader = gl.getAttribLocation(context.shader, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    var pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    var arr = new Float32Array(this.position);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posShader);
    gl.vertexAttribPointer(posShader, 3, gl.FLOAT, false, 0, 0);

    var colShader = gl.getAttribLocation(context.shader, 'a_color');
    var col = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, col);
    var arr2 = new Float32Array(this.color);
    gl.bufferData(gl.ARRAY_BUFFER, arr2, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colShader);
    gl.vertexAttribPointer(colShader, 4, gl.FLOAT, false, 0, 0);

    var modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_projection'), false, context.projectionMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_modelView'), false, modelViewMatrix);
    /*get some free particles*/
    for(var i = 0; i < 100; i++){
        if(this.freePart.length <= 0)
         break;
        var index = this.freePart.pop();

        this.active.push(index);
        this.particles[index].translate = [0.0, 0.0, 0.0];
        this.particles[index].velocity = [Math.random()*this.velocity[0]-this.velocity[0]/2,
                                          Math.random()*0.1*this.scalefactor-0.07*this.scalefactor,
                                          Math.random()*this.velocity[2]-this.velocity[0]/2];
        this.particles[index].heat = Math.random()*this.partSize + this.partSize*0.4;
    }

    var partHeat = gl.getUniformLocation(context.shader, 'v_heat');
    var veloMat = gl.getUniformLocation(context.shader, 'u_veloMat');

    var i = this.active.length;
    while(i--){
        var index = this.active[i];
        var particle = this.particles[index];
        particle.translate[0] += particle.velocity[0];
        particle.translate[1] += particle.velocity[1];
        particle.translate[2] += particle.velocity[2];

        particle.velocity[0] += -(this.position[index*3]+particle.translate[0])/(particle.heat);
        particle.velocity[1] += this.velocity[1];
        particle.velocity[2] += -(this.position[index*3+2]+particle.translate[2])/(particle.heat);
        particle.heat -= 3.5*this.scalefactor;

        if(particle.heat < 0){
            this.active.splice(i,1);
            this.freePart.push(index);
            continue;
        }


        var velo = mat4.translate(mat4.create(), mat4.create(), particle.translate);
        //var finalViewMatrix = mat4.multiply(mat4.create(), modelViewMatrix, velo);

        gl.uniform1f(partHeat, particle.heat);
        gl.uniformMatrix4fv(veloMat, false, velo);

        gl.drawArrays(gl.POINTS, 0, this.particles.length);
    }

    gl.disable(gl.BLEND);
    super.render(context);

  }
}
