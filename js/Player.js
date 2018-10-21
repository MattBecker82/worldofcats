class PlayerState {
  constructor() {
    this.isJumping = false;
    this.isFalling = false;
    this.isRunJumpingLeft = false;
    this.isRunJumpingRight = false;
    this.isInvincible = false;
    this.lives = 9;
    this.isDead = false;
  }
}

export default class Player {
  constructor(scene, x, y) {
    console.log('new Player()');

    this.scene = scene;

    this.sprite = this.createSprite(x, y);
    this.sprite.parent = this;

    //this.scene.physics.world.createDebugGraphic();

    this.createAnimations(scene.anims);
    this.createControls();

    this.state = new PlayerState();
    //this.isInvincible = false;

    // set player collisions
    //this.scene.physics.add.collider(blocksLayer, player);

    this.bounce = 0;
    this.footstepPlayedAt = 0;
  }

  createSprite(x, y) {
    // create the player sprite
    var sprite = this.scene.physics.add.sprite(x, y, 'player');
    sprite.depth = 5;
    sprite.setCollideWorldBounds(true); // don't go out of the map

    sprite.body.setSize(sprite.width-60, sprite.height-40);
    sprite.body.setOffset(30,40);

    return sprite;
  }

  createAnimations(anims) {
    console.log('Player.createAnimations()');

    anims.create({
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

    anims.create({
      key: 'hurt',
      frames: anims.generateFrameNumbers('player', { start: 2, end: 2 }),
      frameRate: 8,
      repeat: -1
    });

    anims.create({
      key: 'walk',
      frames: anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1
    });

    anims.create({
      key: 'jump',
      frames: anims.generateFrameNumbers('player', { start: 8, end: 9 }),
      frameRate: 8,
      repeat: -1
    });

    anims.create({
      key: 'fall',
      frames: anims.generateFrameNumbers('player', { start: 10, end: 11 }),
      frameRate: 8,
      repeat: -1
    });

    anims.create({
      key: 'run',
      frames: anims.generateFrameNumbers('player', { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1
    });
  }

  createControls() {
    const { LEFT, RIGHT, UP, W, A, D, SPACE, SHIFT } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.scene.input.keyboard.addKeys({
      left: LEFT,
      right: RIGHT,
      up: UP,
      w: W,
      a: A,
      d: D,
      space: SPACE,
      shift: SHIFT
    });
  }

  update(time, delta) {
    var keys = this.keys;
    var sprite = this.sprite;
    var state = this.state;
    var isGrounded = sprite.body.onFloor();

    if (state.isDead)
    {
      this.updateDead(time, delta);
      return;
    }

    if (isGrounded) {
      state.isJumping = false;
      state.isFalling = false;
      state.isRunJumpingLeft = false;
      state.isRunJumpingRight = false;
    }

    if (state.isInvincible && (time % 200) < 100)
      sprite.alpha = 0.5;
    else
      sprite.alpha = 1.0;

    if (keys.left.isDown || keys.a.isDown) // if the left arrow key is isDown
    {
      if (isGrounded && keys.shift.isDown)
      {
        sprite.body.setVelocityX(-600); // run left
        sprite.anims.play('run', true);
        this.playFootstep(time, 200);
      }
      else
      {
        if (!state.isRunJumpingLeft)
          sprite.body.setVelocityX(-400); // move left
        if (isGrounded)
        {
          sprite.anims.play('walk', true); // play walk animation
          this.playFootstep(time, 400);
        }
      }
      state.isRunJumpingRight = false;
      sprite.flipX = true;
    }
    else if (keys.right.isDown || keys.d.isDown) // if the right arrow key is isDown
    {
      if (isGrounded && keys.shift.isDown)
      {
        sprite.body.setVelocityX(600); // run right
        sprite.anims.play('run', true);
        this.playFootstep(time, 200);
      }
      else
      {
        if (!state.isRunJumpingRight)
          sprite.body.setVelocityX(400); // move right
        if (isGrounded) {
          sprite.anims.play('walk', true); // play walk animation
          this.playFootstep(time, 400);
        }
      }
      state.isRunJumpingLeft = false;
      sprite.flipX = false;
    }
    else {
      sprite.body.setVelocityX(0); // stop horizonal movement
      state.isRunJumpingLeft = false;
      state.isRunJumpingRight = false;
    }

    if (this.bounce > 0) {
      this.jump(this.bounce);
      this.bounce = 0;
    }
    else if ((keys.up.isDown || keys.w.isDown || keys.space.isDown) && isGrounded)
    {
      this.jump(1000);
      this.scene.sounds.jump.play();
      sprite.anims.play('jump', true);
    }

    if (!state.isFalling && sprite.body.velocity.y > 0)
    {
      sprite.anims.play('fall', true);
      state.isJumping = false;
      state.isFalling = true;
    }
    else if(isGrounded && !state.isJumping && sprite.body.velocity.x == 0)
    {
      sprite.anims.play('idle', true);
    }
  }

  updateDead(time, delta) {
      var scale = this.sprite.scaleY;
      scale -= 0.0005 * delta;

      if (scale < 0) {
        scale = 0;
      }

      this.sprite.setScale(1, scale);
  }

  jump(strength) {
    const keys = this.keys;
    const sprite = this.sprite;
    const state = this.state;

    sprite.body.setVelocityY(-strength);
    state.isJumping = true;

    if (keys.shift.isDown)
    {
      state.isRunJumpingLeft = (sprite.body.velocity.x < 0);
      state.isRunJumpingRight = (sprite.body.velocity.x > 0);
    }
  }

  playFootstep(time, frequency) {
    if (time - this.footstepPlayedAt >= frequency)
    {
      this.scene.sounds.footstep.play();
      this.footstepPlayedAt = time;
    }
  }

  // true if player is touching the tile from above
  isTouchingBelow(tile) {
    const tolerance = 25;

    const camera = this.scene.cameras.main;
    const tileTop = tile.getTop(camera);

    const sprite = this.sprite;

    return sprite.body.bottom <= (tileTop + tolerance);
  }

  die() {
    console.log('die');
    this.scene.sounds.moan.play();
    this.state.isDead = true;
    this.scene.physics.pause();
  }

  hurt() {
    this.sprite.tint = 0xff6060;
    this.sprite.anims.play('hurt', true);

    this.state.lives--;
    this.scene.statusBar.update(this);

    if (this.state.lives <= 0) {
      this.die();
      return;
    }

    this.scene.sounds.hurt.play();

    this.state.isInvincible = true;

    // Turn off isInvincible after 2 seconds
    this.scene.time.addEvent({
      delay: 2000,
      callback: this.unhurt,
      callbackScope: this
    });
  }

  unhurt() {
    this.sprite.tint = 0xffffff;
    this.state.isInvincible = false;
  }

  collideOrangeBlock(tile) {
    if (this.state.isInvincible)
      return;

    this.hurt();
    this.sprite.setVelocityX(0);
    this.bounce = 1000;
  }

  collideGreenBlock(tile) {
    if (this.state.isFalling && this.isTouchingBelow(tile)) {
      this.scene.sounds.bounce.play();
      this.sprite.anims.play('jump', true);
      this.bounce = 1500;
    }
  }

  collideBlueBlock(tile) {
    this.scene.touchBlueBlock.call(this.scene, tile);
  }
}
