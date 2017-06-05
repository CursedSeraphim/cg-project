// Phong Fragment Shader
// Disclaimer: This phong shader implementation is neither performance optimized nor beautifully coded.
// It shows the basic priciples in a simple way and is sufficient for our lab exercises.
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
uniform bool u_enableObjectTexture;
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

	if(u_enableObjectTexture)
	{
		//replace diffuse and ambient matrial with texture color if texture is available
		material.diffuse = textureColor;
		material.ambient = textureColor;
		//Note: an alternative to replacing the material color is to multiply it with the texture color
	}
	//compute diffuse term
	for(int i = 0; i < LIGHT_NODES; i++) {
		if(i > u_nrOfLights)
			break;
		float distanceToLight = max(length(lVec[i])/10.0,1.0);
		float diffuse = max(dot(normalVec,lightVec[i]),0.0) / (distanceToLight*distanceToLight);
		//compute specular term
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

	//Note: You can directly use the shadow related varying/uniform variables in this example since we only have 1 light source.
	//Normally you should pass them to the calculateSimplePointLight function as parameters since they change for each light source!



//   float shadowCoeff = 1.0; //set to 1 if no shadow!
// 	//TASK 2.4: look up depth in u_depthMap and set shadow coefficient (shadowCoeff) to 0 based on depth comparison
// 	/*float zShadowMap = texture2D(u_depthMap, shadowMapTexCoord3D.xy).r;
// 	if(shadowMapTexCoord3D.z > zShadowMap)
// 		shadowCoeff = 0.0;*/
//
//   //EXTRA TASK: Improve shadow quality by sampling multiple shadow coefficients (a.k.a. PCF)
// 	float sumShadowCoeff = 0.0;
// 	if(shadowMapTexCoord3D.x < 1.0 && shadowMapTexCoord3D.x > -1.0  && shadowMapTexCoord3D.y < 1.0 && shadowMapTexCoord3D.y > -1.0) {
// 	for(float dx=-1.0; dx <= 1.0; dx++)
// 	{
// 		for(float dy=-1.0; dy <= 1.0; dy++)
// 		{
//     //TODO was 1 before -> 0.5 helps with finding shadow problem. it can be seen that the semi transparent trapezoid is sometimes partially filled
// 			float subShadowCoeff = 1.0; //set to 1 if no shadow!
// 			float zShadowMap = texture2D(u_depthMap, shadowMapTexCoord3D.xy+vec2(dx/u_shadowMapWidth,dy/u_shadowMapHeight)).r;
// 			if(shadowMapTexCoord3D.z > zShadowMap)
// 				subShadowCoeff = 0.0;
//
// 			sumShadowCoeff += subShadowCoeff;
// 		}
// 	}
// 	shadowCoeff = sumShadowCoeff/9.0;
// }
// else {
// 	shadowCoeff = 1.0;
// }
  //TASK 2.5: apply shadow coefficient to diffuse and specular part
  //return c_amb + (c_diff + c_spec) + c_em;
	return c_amb + c_diff + c_spec + c_em;
}

void main (void) {
	/*Check if array gets too small*/
	if(u_nrOfLights >= LIGHT_NODES) {
		gl_FragColor = vec4(1,0,0,1);
		return;
	}

  vec4 textureColor = vec4(0,0,0,1);
  if(u_enableObjectTexture)
  {
    textureColor = texture2D(u_tex,v_texCoord);
  }

	gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor, u_nrOfLights);

}
