import TutorialScene from "./TutorialScene.js";

var config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 650,
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 2000 },
          debug: false
        }
    },
    scene: TutorialScene
};

var game = new Phaser.Game(config);
