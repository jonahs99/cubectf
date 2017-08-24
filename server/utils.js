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

module.exports = {
	rand: rand,
	randInt: randInt,
	clamp: clamp,
};