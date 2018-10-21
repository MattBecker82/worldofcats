import Player from "./Player.js";
import Sounds from "./Sounds.js";
import StatusBar from "./StatusBar.js";

export default class TutorialScene extends Phaser.Scene
{
  constructor() {
    super();
    this.sounds = new Sounds(this);
  }

  preload() {
    this.load.image('background0', 'assets/far-background.png');
    this.load.image('background1', 'assets/near-background.png');
    this.load.image('cathead', 'assets/cathead.png');

    this.load.tilemapTiledJSON('map', 'assets/cattutorial.json?v=0');

    var tileFrameDims = { frameWidth: 64, frameHeight: 64 };
    this.load.spritesheet('blocks', 'assets/blocks.png', tileFrameDims);

    this.load.spritesheet('player', 'assets/cat2-spritesheet.png?v=3',
      { frameWidth: 120, frameHeight: 130 });
    this.load.spritesheet('mouse', 'assets/mouse-spritesheet.png?v=1',
      { frameWidth: 80, frameHeight: 60 });

    this.sounds.preload();
  }

  create() {
    this.physics.world.TILE_BIAS = 32;

    var map = this.createMap();
    this.createBackground();
    this.player = new Player(this, 100, 590);
//    createEnemies();
    this.initCamera();
    this.sounds.create();
    this.statusBar = new StatusBar(this);
    this.statusBar.update(this.player);

    this.touchedBlueBlocks = [];

    this.setCollisions();

    this.sounds.meow.play();
  }

  createMap() {
    console.log('createMap()');

    var map = this.make.tilemap({key: 'map'});

    var blocksTileset = map.addTilesetImage('blocks');
    this.blocksLayer = map.createDynamicLayer('blocks', blocksTileset, 0, 0);
    this.blocksLayer.depth = 0;

    this.worldWidth = this.blocksLayer.width;
    this.worldHeight = this.blocksLayer.height;

    this.physics.world.bounds.width = this.worldWidth;
    this.physics.world.bounds.height = this.worldHeight;

    return map;
  }

  createBackground() {
    console.log('createBackground()');

    var background0 = this.add.image(0, 0, 'background0');
    background0.setOrigin(0, 0);
    background0.depth = -1;
    background0.setPosition(0, -400);
    background0.setScale(this.worldWidth / background0.width);
    background0.setScrollFactor(0.5);

    var background1 = this.add.tileSprite(0, 0, 5120 * 2, 2880, 'background1');
    background1.setOrigin(0, 0);
    background1.depth = -1;
    background1.setPosition(0, 0);
    background1.setScale(this.worldWidth / background1.width);

    //background.setScrollFactor(0.3 * background.width / worldWidth,
    //  0.3 * background.height / worldHeight);
  }

  initCamera() {
    console.log('initCamera()');

    // set bounds so the camera won't go outside the game world
    var camera = this.cameras.main;
    camera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    // make the camera follow the player
    camera.startFollow(this.player.sprite);
  }

  setCollisions() {
    console.log('setCollisions()');
    this.blocksLayer.setCollisionByExclusion([-1,5]);
    this.blocksLayer.setTileIndexCallback(3, this.collideOrangeBlock, this);
    this.blocksLayer.setTileIndexCallback(4, this.collideGreenBlock, this);
    this.blocksLayer.setTileIndexCallback(5, this.collideBlueBlock, this);
    this.physics.add.collider(this.blocksLayer, this.player.sprite);
  }

  collideOrangeBlock(sprite, tile) {
    const parent = sprite.parent;
    parent.collideOrangeBlock.call(parent, tile);
  }

  collideGreenBlock(sprite, tile) {
    const parent = sprite.parent;
    parent.collideGreenBlock.call(parent, tile);
  }

  collideBlueBlock(sprite, tile) {
    const parent = sprite.parent;
    parent.collideBlueBlock.call(parent, tile);
  }

  update(time, delta) {
    this.updateBlueBlocks();

    this.player.update(time, delta);
  }

  updateBlueBlocks() {
    const touchedBlueBlocks = this.touchedBlueBlocks;

    // Check if any touched blue blocks are exiting
    var i = 0;
    while (i < touchedBlueBlocks.length)
    {
      var tile = touchedBlueBlocks[i];
      if (!this.isTouching(this.player.sprite, tile))
      {
        // Change the tile to red and remove it from the list
        this.blocksLayer.fill(2, tile.x, tile.y, 1, 1, true);
        this.sounds.shut.play();
        touchedBlueBlocks.splice(i, 1);
      }
      else
      {
        ++i;
      }
    }
  }

  touchBlueBlock(tile) {
    if (!this.touchedBlueBlocks.includes(tile))
      this.touchedBlueBlocks.push(tile);
  }

  isTouching(sprite, tile)
  {
    const tolerance = 10;

    const spriteTop = sprite.body.top;
    const spriteBottom = sprite.body.bottom;
    const spriteLeft = sprite.body.left;
    const spriteRight = sprite.body.right;

    const camera = this.cameras.main;
    const tileTop = tile.getTop(camera);
    const tileBottom = tile.getBottom(camera);
    const tileLeft = tile.getLeft(camera);
    const tileRight = tile.getRight(camera);

    const touchingTop = spriteBottom >= tileTop - tolerance;
    const touchingBottom = spriteTop <= tileBottom + tolerance;
    const touchingLeft = spriteRight >= tileLeft - tolerance;
    const touchingRight = spriteLeft <= tileRight + tolerance;

    return touchingTop && touchingBottom && touchingLeft && touchingRight;
  }


}
