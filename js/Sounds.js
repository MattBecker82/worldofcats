export default class Sounds
{
  constructor(scene) {
    this.scene = scene;
  }

  preload() {
    // meow sound: https://freesound.org/people/Department64/sounds/64006/
    this.scene.load.audio('meow', 'assets/meow.wav');

    // hurt sound: https://freesound.org/people/InspectorJ/sounds/415209/
    this.scene.load.audio('hurt', 'assets/hurt.wav');

    // jump sound: https://freesound.org/people/sharesynth/sounds/344500/
    this.scene.load.audio('jump', 'assets/jump.wav');

    // bounce sound: https://freesound.org/people/josepharaoh99/sounds/383240/
    this.scene.load.audio('bounce', 'assets/bounce.wav');

    // footstep sound: https://freesound.org/people/Samulis/sounds/197778/
    this.scene.load.audio('footstep', 'assets/footstep.wav');

    // shut sound: https://freesound.org/people/ronoble/sounds/276889/
    this.scene.load.audio('shut', 'assets/shut.wav');

    // moan sound: https://freesound.org/people/J.Zazvurek/sounds/353308/
    this.scene.load.audio('moan', 'assets/moan.wav');
  }

  create() {
    this.meow = this.scene.sound.add('meow');
    this.hurt = this.scene.sound.add('hurt');
    this.jump = this.scene.sound.add('jump');
    this.bounce = this.scene.sound.add('bounce');
    this.footstep = this.scene.sound.add('footstep');
    this.shut = this.scene.sound.add('shut');
    this.moan = this.scene.sound.add('moan');
  }
}
