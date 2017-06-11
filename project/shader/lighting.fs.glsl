precision mediump float;

#define LIGHT_NODES 10

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
	float spotAngle;
	vec3 lookAt;
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

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor, int numberOfLights) {
	vec3 lVec = lightVec;

	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);
	light.lookAt = normalize(light.lookAt);

	vec4 c_amb  = vec4(0.0,0.0,0.0,0.0);
	vec4 c_diff = vec4(0.0,0.0,0.0,0.0);
	vec4 c_spec = vec4(0.0,0.0,0.0,0.0);

	//if(u_enableObjectTexture)
	{
		material.diffuse = textureColor;
		material.ambient = textureColor;
	}

	float angle = -361.0;
	float distanceFactor = 10.0;
	float radiusDistance = 1.0;

	/*calculate angle*/
	if(light.spotAngle > 0.0) {
		angle = acos(dot(lightVec, light.lookAt));
		distanceFactor *= (6.2832/light.spotAngle);
		float angleDifference = min(1.0, (angle / light.spotAngle));
		radiusDistance = 1.0 - angleDifference * angleDifference;
	}
	if(angle < light.spotAngle) {

		float distanceToLight = max(length(lVec)/distanceFactor,1.0);
		float diffuse = max(dot(normalVec,lightVec),0.0) / (distanceToLight*distanceToLight);

		vec3 reflectVec = reflect(-lightVec, normalVec);
		float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

		c_diff += clamp(radiusDistance * diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
		c_spec += clamp(radiusDistance * spec * light.specular * material.specular, 0.0, 1.0);
		c_amb  += clamp(radiusDistance * light.ambient * material.ambient, 0.0, 1.0);
	}

	vec4 c_em = material.emission;
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

	vec4 fragColor = vec4(0,0,0,0);
	for(int i = 0; i < LIGHT_NODES; i++) {
		if(i > u_nrOfLights)
			break;
		fragColor += calculateSimplePointLight(u_light[i], u_material, v_lightVec[i], v_normalVec, v_eyeVec, textureColor, u_nrOfLights);
	}
	gl_FragColor = fragColor;
	gl_FragColor[3] = textureColor.a;

}
