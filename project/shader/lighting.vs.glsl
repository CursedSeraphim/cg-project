// Phong Vertex Shader

#define LIGHT_NODES 10

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform mat3 u_normalViewMatrix;

uniform vec3 u_lightPos[LIGHT_NODES];

//output of this shader
varying vec3 v_normalVec;
varying vec3 v_lightVec[LIGHT_NODES];
varying vec3 v_lightDir[LIGHT_NODES];
varying vec3 v_eyeVec;
varying vec2 v_texCoord;

void main() {

	//compute vertex position in eye space
	vec4 eyePosition = u_modelView * vec4(a_position,1);

	for(int i = 0; i < LIGHT_NODES; i++) {
		v_lightVec[i] = u_lightPos[i] - eyePosition.xyz;
	}

	//compute normal vector in eye space
  v_normalVec = u_normalMatrix * a_normal;

	//compute variables for light computation
  v_eyeVec = -eyePosition.xyz;


	//pass on texture coordinates
	v_texCoord = a_texCoord;

	gl_Position = u_projection * eyePosition;
}
