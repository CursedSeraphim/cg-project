
attribute vec3 a_position;
attribute vec4 a_color;

uniform float v_heat;
varying   vec4  v_Color;

uniform mat4 u_veloMat;
uniform mat4 u_modelView;
uniform mat4 u_projection;

void main(void) {

  //compute vertex position in eye space
	vec4 eyePosition = u_modelView * u_veloMat * vec4(a_position,1);


  v_Color       = a_color;
	gl_Position = u_projection * eyePosition;
  //gl_Position = eyePosition;
  //gl_Position  = mvpMatrix * vec4(a_position, 1.0);
  gl_PointSize = v_heat;
}
