game.addEventListeners();

game.initWorld();
graphics.init();

client.startBroadcasting();
requestAnimationFrame(game.gameLoop);