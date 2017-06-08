precision mediump float;

#define LIGHT_NODES 16

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

//illumination related variables
uniform Material u_material;
uniform Light u_light[LIGHT_NODES];
uniform Light u_torch;
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec[LIGHT_NODES];

//texture related variables
//uniform bool u_enableObjectTexture;
uniform int u_nrOfLights;

varying vec2 v_texCoord;
uniform sampler2D u_tex;

vec4 calculateSimplePointLight(Light light[LIGHT_NODES], Material material, vec3 lightVec[LIGHT_NODES], vec3 normalVec, vec3 eyeVec, vec4 textureColor, int numberOfLights) {
	vec3 lVec[LIGHT_NODES];

	for(int i = 0; i < LIGHT_NODES; i++) {
		if(i > numberOfLights)
			break;
		lVec[i] = lightVec[i];
		lightVec[i] = normalize(lightVec[i]);
	}

	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	vec4 c_amb  = vec4(0.0,0.0,0.0,0.0);
	vec4 c_diff = vec4(0.0,0.0,0.0,0.0);
	vec4 c_spec = vec4(0.0,0.0,0.0,0.0);

	//if(u_enableObjectTexture)
	{
		material.diffuse = textureColor;
		material.ambient = textureColor;
	}
	for(int i = 0; i < LIGHT_NODES; i++) {
		if(i > u_nrOfLights)
			break;
		float distanceToLight = max(length(lVec[i])/10.0,1.0);
		float diffuse = max(dot(normalVec,lightVec[i]),0.0) / (distanceToLight*distanceToLight);

		vec3 reflectVec = reflect(-lightVec[i], normalVec);
		float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

		c_amb  += clamp(light[i].ambient * material.ambient, 0.0, 1.0);
		c_diff += clamp(diffuse * light[i].diffuse * material.diffuse, 0.0, 1.0);
		c_spec += clamp(spec * light[i].specular * material.specular, 0.0, 1.0);
	}

	c_amb  = clamp(c_amb, 0.0, 1.0);
	c_diff = clamp(c_diff, 0.0, 1.0);
	c_spec = clamp(c_spec, 0.0, 1.0);
	vec4 c_em   = material.emission;
	return c_amb + c_diff + c_spec + c_em;
}

void main (void) {
	/*Check if array gets too small*/
	if(u_nrOfLights >= LIGHT_NODES) {
		gl_FragColor = vec4(1,0,0,1);
		return;
	}

  vec4 textureColor = vec4(0,0,0,1);
  //if(u_enableObjectTexture)
  {
    textureColor = texture2D(u_tex,v_texCoord);
  }

	gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor, u_nrOfLights);

}
