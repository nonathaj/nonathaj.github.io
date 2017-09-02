MissileCommand.FlameThrower = function(game, planet, planetGroup, weaponNum, totalWeapons)
{
	this.game = game;
	this.planet = planet;
	this.hits = 0;      //the number of times this weapon has destroyed a missile
    this.firingStarted = 0;     //the time the weapon started firing

    this.lastFireTime = 0;
    this.range = 80;           //the range of this weapon
    this.fireLength = 1500;      //the time in millis the weapon is allowed to be fired

	var weaponAng = ( (2*Math.PI) / totalWeapons ) * weaponNum;     //the angle the weapon appears next to the planet, in radians
    var x = planet.radius * Math.cos( weaponAng );
    var y = planet.radius * Math.sin( weaponAng );
    
    this.weaponAng_degrees = weaponAng * (180/Math.PI);
    
    this.barrelSprite = planetGroup.create(x, y, 'flamethrower_barrel'); //TODO adjust name of weapon sprite
    this.barrelSprite.anchor.setTo(.15, .5);                        //sets the anchor to the middle of the sprite
    this.barrelSprite.scale.setTo(.2);                              //TODO adjust scale appropriately based on sprite
    this.barrelSprite.angle = this.weaponAng_degrees;
    
    this.baseSprite = planetGroup.create(x,y, 'flamethrower_base');
    this.baseSprite.angle = this.weaponAng_degrees;
    this.baseSprite.anchor.setTo(.5, .5);
    this.baseSprite.scale.setTo(.07, .2);

	this.reticleSprite = this.game.add.sprite(-100, -100, 'flamethrower_reticle');	//TODO adjust name of reticle sprite for this weapon
	this.reticleSprite.anchor.setTo(.5, .5);
	this.reticleSprite.scale.setTo(.5);					//TODO adjust scale of this reticle
}

MissileCommand.FlameThrower.prototype = {
    update: function()
    {
        //mark this weapon's position the same as the base sprite's world position
        this.x = this.baseSprite.world.x;
        this.y = this.baseSprite.world.y;
    },
    disableReticle: function()
    {
        this.reticleSprite.visible = false;
		this.barrelSprite.angle = this.baseSprite.angle;
    },
    activateReticle: function(x, y)
    {
        this.reticleSprite.visible = true;
        this.reticleSprite.x = x;
        this.reticleSprite.y = y;
		this.game.world.bringToTop(this.reticleSprite);
        this.barrelSprite.angle = MissileCommand.Game.game.game.math.radToDeg( MissileCommand.Game.game.game.math.angleBetweenPoints(this.baseSprite.world, MissileCommand.Game.game.game.input.activePointer.position) ) - this.baseSprite.parent.angle;
    },
    tintWeapon: function(doTint)
    {
        if(doTint)
        {
            this.baseSprite.alpha = 0.3;
            this.barrelSprite.alpha = 0.3;
        }
        else
        {
            this.baseSprite.alpha = 1;
            this.barrelSprite.alpha = 1;
        }
    },
    reportKill: function()
    {
        this.hits++;
        this.planet.reportKill();
    },
    holdAt: function(targetx, targety)
    {
        //called every frame that the player is holding the mouse button for this weapon
        if(MissileCommand.Game.game.game.time.elapsedSince(this.firingStarted) < this.fireLength)
        {
            this.lastFireTime = game.time.now;
			
			//if the target point is beyond the range, set the target point to be closer
            var targetPoint = new Phaser.Point(targetx, targety);
            var targetDirection = Phaser.Point.subtract(targetPoint, this.baseSprite.world);
            if(targetDirection.getMagnitude() > this.range)
            {
                targetDirection.normalize();
                targetDirection.x = targetDirection.x * this.range;
                targetDirection.y = targetDirection.y * this.range;
                targetDirection = Phaser.Point.add(this.baseSprite.world, targetDirection);
                targetx = targetDirection.x;
                targety = targetDirection.y;
            }
            
            var blastRadius = 50;
            var blastCircle = new Phaser.Circle(targetx, targety, blastRadius*2);
            var numberBullets = 5;
            var bulletExplosionStartSize = 10;
            var bulletExplosionEndSize = 20;
            var bulletExplosionTime = 50;

            //calculate the positions for the sub bullets to travel to
            var targets = [];
            for(var x = 0; targets.length < numberBullets - 1; x++)
            {
                //generate a potential point for the next bullet
                var point = new Phaser.Point(
                     MissileCommand.Game.game.game.rnd.integerInRange(targetx-blastRadius, targetx+blastRadius), 
                     MissileCommand.Game.game.game.rnd.integerInRange(targety-blastRadius, targety+blastRadius)
                    );
                //if it's within our blast circle, add it
                if (blastCircle.contains(point.x, point.y))
                    targets.push(point);
            }
            for(var x = 0; x < targets.length; x++)
            {
                var bullet = new MissileCommand.CollisionBullet(this.game, this, this.baseSprite.world, targets[x]);
                bullet.applyTint(this.generateRandomBulletColor());
            }
        }
    },
    clickAt: function(targetx, targety)
    {
        //called when the player clicks for this weapon
		this.firingStarted = MissileCommand.Game.game.game.time.now;
    },
    releaseAt: function(targetx, targety)
    {
        
    },
    generateRandomBulletColor: function()
    {
        var r = MissileCommand.Game.game.game.rnd.integerInRange(150, 255);
        var g = MissileCommand.Game.game.game.rnd.integerInRange(0, 0);
        var b = MissileCommand.Game.game.game.rnd.integerInRange(0, 0);
        return r << 16 | g << 8 | b;
    },
	getName: function()
	{
		return "Flamethrower";
	}
}