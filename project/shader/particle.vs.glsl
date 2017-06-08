
attribute vec3 a_position;
attribute vec4 a_color;
attribute float a_size;

varying vec4 v_Color;

uniform mat4 u_modelView;
uniform mat4 u_projection;

void main(void) {

  //compute vertex position in eye space
	vec4 eyePosition = u_modelView * vec4(a_position,1);


  v_Color = a_color;
	gl_Position = u_projection * eyePosition;
  gl_PointSize = a_size / abs(length(eyePosition.xyz));
}
