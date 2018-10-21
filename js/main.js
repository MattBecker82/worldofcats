// meow sound: https://freesound.org/people/Department64/sounds/64006/
// hurt sound: https://freesound.org/people/InspectorJ/sounds/415209/

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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var map;

var blocksLayer;

var background;
var player;
var mice;

var camera;
var cursors;

var scene;
var phys;

var worldWidth = 4000;
var worldHeight = 650;

var meowSound, hurtSound;

function preload() {
  this.load.image('background0', 'assets/far-background.png');
  this.load.image('background1', 'assets/near-background.png');

  this.load.tilemapTiledJSON('map', 'assets/cattutorial.json?v=0');

  var tileFrameDims = { frameWidth: 64, frameHeight: 64 };
  this.load.spritesheet('blocks', 'assets/blocks.png', tileFrameDims);

  this.load.spritesheet('player', 'assets/cat2-spritesheet.png?v=3',
    { frameWidth: 120, frameHeight: 130 });
  this.load.spritesheet('mouse', 'assets/mouse-spritesheet.png?v=1',
    { frameWidth: 80, frameHeight: 60 });

  this.load.audio('meow', 'assets/meow.wav');
  this.load.audio('hurt', 'assets/hurt.wav');
}

function create() {
  scene = this;
  phys = this.physics;
  phys.world.TILE_BIAS = 32;

  createMap();
  createBackground();
  createPlayer();
  createEnemies();
  createCamera();
  createInputs();
  createSoundEffects();

  phys.world.bounds.width = worldWidth;
  phys.world.bounds.height = worldHeight;

  meowSound.play();
}

function createMap()
{
  console.log('createMap()');

  map = scene.make.tilemap({key: 'map'});

  var blocksTileset = map.addTilesetImage('blocks');
  blocksLayer = map.createDynamicLayer('blocks', blocksTileset, 0, 0);
  blocksLayer.depth = 0;
  blocksLayer.setCollisionByExclusion([-1]);

  worldWidth = blocksLayer.width;
  worldHeight = blocksLayer.height;
}

function createBackground()
{
  console.log('createBackground()');

  background0 = scene.add.image(0, 0, 'background0');
  background0.setOrigin(0, 0);
  background0.depth = -1;
  background0.setPosition(0, -400);
  background0.setScale(worldWidth / background0.width);
  background0.setScrollFactor(0.5);

  background1 = scene.add.tileSprite(0, 0, 5120 * 2, 2880, 'background1');
  background1.setOrigin(0, 0);
  background1.depth = -1;
  background1.setPosition(0, 0);
  background1.setScale(worldWidth / background1.width);

  //background.setScrollFactor(0.3 * background.width / worldWidth,
  //  0.3 * background.height / worldHeight);
}

function createPlayer()
{
  console.log('createPlayer()');

  // create the player sprite
  player = phys.add.sprite(100, 590, 'player');
  player.depth = 5;
  player.setCollideWorldBounds(true); // don't go out of the map

  player.body.setSize(player.width-60, player.height);
  player.body.setOffset(30,0);

  player.isInvincible = false;

  createPlayerAnimations();
  //resetPlayerState();

  // set player collisions
  phys.add.collider(blocksLayer, player);
}

function createPlayerAnimations()
{
  console.log('createPlayerAnimations()');

  scene.anims.create({
    key: 'idle',
    frames: [
      { key: 'player', frame: 0 },
      { key: 'player', frame: 0 },
      { key: 'player', frame: 0 },
      { key: 'player', frame: 0 },
      { key: 'player', frame: 0 },
      { key: 'player', frame: 0 },
      { key: 'player', frame: 0 },
      { key: 'player', frame: 1 },
      { key: 'player', frame: 0 },
      { key: 'player', frame: 1 },
    ],
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'hurt',
    frames: scene.anims.generateFrameNumbers('player', { start: 2, end: 2 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk',
    frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'jump',
    frames: scene.anims.generateFrameNumbers('player', { start: 8, end: 9 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'fall',
    frames: scene.anims.generateFrameNumbers('player', { start: 10, end: 11 }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'run',
    frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
    frameRate: 8,
    repeat: -1
  });
}

function createEnemies()
{
  console.log('createEnemies()');

  createMice();
}

function createMice()
{
  console.log('createMice()');

  createMouseAnimations();

  var numMice = 0; //var numMice = 5;
  var minX = 200;
  var maxX = worldWidth - 50;
  mice = [];
  for(var i = 0; i < numMice; ++i)
  {
    var x = minX + Math.random() * (maxX - minX);
    mouse = phys.add.sprite(x, 590, 'mouse');
    mouse.depth = 4;
    mouse.setCollideWorldBounds(true);
    mouse.anims.play('mouseIdle', true);

    phys.add.collider(player, mouse, collideMouse);

    mice.push(mouse);
  }
}

function createMouseAnimations()
{
  console.log('createMouseAnimations()');

  scene.anims.create({
    key: 'mouseIdle',
    frames: [
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 1 },
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 1 },
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 0 },
      { key: 'mouse', frame: 0 },
    ],
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'mouseWalk',
    frames: scene.anims.generateFrameNumbers('mouse', { start: 2, end: 3 }),
    frameRate: 8,
    repeat: -1
  });
}

function collideMouse(sprite, mouse)
{
  player.body.setVelocityX(0);
  player.body.setVelocityY(-1000);
  player.anims.play('hurt', true);
  hurtSound.play();
  isJumping = true;
  isRunJumpingLeft = false;
  isRunJumpingRight = false;
}

function createCamera()
{
  console.log('createCamera()');

  // set bounds so the camera won't go outside the game world
  camera = scene.cameras.main;
  camera.setBounds(0, 0, worldWidth, worldHeight);
  // make the camera follow the player
  camera.startFollow(player);
}

function createInputs()
{
  console.log('createInputs()');

  cursors = scene.input.keyboard.createCursorKeys();
}

function createSoundEffects()
{
  console.log('createSoundEffects()');

  meowSound = scene.sound.add('meow');
  hurtSound = scene.sound.add('hurt');
}

var isJumping = false;
var isFalling = false;
var isRunJumpingLeft = false;
var isRunJumpingRight = false;

function update(time, delta) {
  var isGrounded = player.body.onFloor();

  if (isGrounded)
  {
    isJumping = false;
    isFalling = false;
    isRunJumpingLeft = false;
    isRunJumpingRight = false;
  }

  if (cursors.left.isDown) // if the left arrow key is isDown
  {
    if (isGrounded && cursors.shift.isDown)
    {
      player.body.setVelocityX(-600); // run left
      player.anims.play('run', true);
    }
    else
    {
      if (!isRunJumpingLeft)
        player.body.setVelocityX(-400); // move left
      if (isGrounded)
        player.anims.play('walk', true); // play walk animation
    }
    isRunJumpingRight = false;
    player.flipX = true;
  }
  else if (cursors.right.isDown) // if the right arrow key is isDown
  {
    if (isGrounded && cursors.shift.isDown)
    {
      player.body.setVelocityX(600); // run right
      player.anims.play('run', true);
    }
    else
    {
      if (!isRunJumpingRight)
        player.body.setVelocityX(400); // move right
      if (isGrounded)
        player.anims.play('walk', true); // play walk animation
    }
    isRunJumpingLeft = false;
    player.flipX = false;
  }
  else {
    player.body.setVelocityX(0); // stop horizonal movement
    isRunJumpingLeft = false;
    isRunJumpingRight = false;
  }

  if ((cursors.up.isDown || cursors.space.isDown) && isGrounded)
  {
    player.body.setVelocityY(-1000); // jump
    player.anims.play('jump', true);
    isJumping = true;

    if (cursors.shift.isDown)
    {
      isRunJumpingLeft = (player.body.velocity.x < 0);
      isRunJumpingRight = (player.body.velocity.x > 0);
    }
  }

  if (!isFalling && player.body.velocity.y > 0)
  {
    player.anims.play('fall', true);
    isJumping = false;
    isFalling = true;
  }
  else if(isGrounded && !isJumping && player.body.velocity.x == 0)
  {
    player.anims.play('idle', true);
  }

  updateEnemies(time, delta);
}

function updateEnemies(time, delta)
{
  var threshold = delta * 0.001;

  for(var i = 0; i < mice.length; ++i)
  {
    var mouse = mice[i];

    var r = Math.random();
    if (r < threshold)
    {
      if (mouse.body.velocity.x == 0)
      {
        // Change direction and move
        if (mouse.flipX)
        {
          // Move left
          mouse.flipX = false;
          mouse.body.setVelocityX(-200);
        }
        else
        {
          // Move right
          mouse.flipX = true;
          mouse.body.setVelocityX(200);
        }
        mouse.anims.play('mouseWalk', true);
      }
      else
      {
        // stand still
        mouse.body.setVelocityX(0);
        mouse.anims.play('mouseIdle', true);
      }
    }
  }
}
