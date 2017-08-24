var res = res || {};
res.shader = res.shader || {};

res.shader.vs = 
`#version 300 es
in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_eye;
uniform mat4 u_normal;
uniform lowp vec4 u_color;
uniform lowp vec3 u_light;

out lowp vec4 v_color;

void main(void) {
	vec4 transformedNormal = u_normal * vec4(a_normal, 1.0);
	float ambient = 0.6;
	float directional = max(1.0 + dot(transformedNormal.xyz, u_light), 0.0) / 2.0 * (1.0 - ambient);
	float brightness = directional + ambient;

	gl_Position = u_eye * u_model * vec4(a_position, 1.0);
	v_color = vec4(brightness * u_color.rgb, u_color.w);
}
`;

res.shader.fs = 
`#version 300 es
in lowp vec4 v_color;
out lowp vec4 frag_color;

void main(void) {
	frag_color = v_color;
}
`;