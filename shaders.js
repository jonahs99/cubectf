var shader = {
    vs:
`#version 300 es
in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_normal;
uniform lowp vec4 u_color;
uniform vec3 u_light;

out lowp vec4 vColor;

void main(void) {
	vec4 transformedNormal = u_normal * vec4(a_normal, 1.0);
	float ambient = 0.8;
	float directional = max(0.5 + dot(transformedNormal.xyz, u_light), 0.0) / 1.5 * (1.0 - ambient);
	float brightness = directional + ambient;

	gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
	vColor = brightness * u_color;
}
`,
    fs:
`#version 300 es
in lowp vec4 vColor;
out lowp vec4 frag_color;

void main(void) {
	frag_color = vColor;
}
`
};