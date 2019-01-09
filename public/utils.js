function rand(min, max) {
	return Math.random() * (max - min) + min;
}

function randInt(min, max) {
	return Math.floor(rand(min, max));
}

function clamp(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

function lerp(a, b, delta) {
	return a * (1 - delta) + b * delta;
}

function lerpArray(a, b, delta) {
	return a.map(function(val, i) {
		return lerp(val, b[i], delta);
	});
}