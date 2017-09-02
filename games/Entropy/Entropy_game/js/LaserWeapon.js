MissileCommand.LaserWeapon = function(game, planet, planetGroup, weaponNum, totalWeapons, weaponStyles)
{
    this.game = game;
	this.planet = planet;
	this.weaponNum = weaponNum;
	this.hits = 0;      //the number of times this weapon has destroyed a missile
    
    var weaponAng = ( (2*Math.PI) / totalWeapons ) * weaponNum;     //the angle the weapon appears next to the planet, in radians
    var x = planet.radius * Math.cos( weaponAng );
    var y = planet.radius * Math.sin( weaponAng );
    
    this.weaponAng_degrees = weaponAng * (180/Math.PI);
    
    this.barrelSprite = planetGroup.create(x, y, 'laser_barrel');
    this.barrelSprite.anchor.setTo(.15, .5);                        //sets the anchor to the middle of the sprite
    this.barrelSprite.scale.setTo(.2);                              //TODO adjust scale appropriately based on sprite
    this.barrelSprite.angle = this.weaponAng_degrees;
    
    this.baseSprite = planetGroup.create(x,y, 'laser_base');
    this.baseSprite.angle = this.weaponAng_degrees;
    this.baseSprite.anchor.setTo(.5, .5);
    this.baseSprite.scale.setTo(.07, .2);
    
    this.reticleSprite = this.game.add.sprite(-100, -100, 'laser_reticle');
    this.reticleSprite.anchor.setTo(.5, .5);
    this.reticleSprite.scale.setTo(.5);                                  //TODO adjust scale of this reticle
    
    this.laserSprite = this.game.add.sprite(-100, -100, 'laser');
    this.laserSprite.anchor.setTo(0, .5);
    this.laserSprite.height = 10;
    this.laserSprite.tint = 0xff00ff;
    this.laserSprite.visible = false;
	this.game.world.sendToBack(this.laserSprite);
    
    this.firingStarted = 0;     //the time the weapon started firing
    this.fireLength = 600;      //the time in millis the weapon is allowed to be fired
}

MissileCommand.LaserWeapon.prototype = {
    update: function()
    {
        //mark this weapon's position the same as the base sprite's world position
        this.x = this.baseSprite.world.x;
        this.y = this.baseSprite.world.y;
        this.laserSprite.visible = false;
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
        if(MissileCommand.Game.game.game.time.elapsedSince(this.firingStarted) < this.fireLength)
        {
            //set up the sprite that represents the laser
            this.laserSprite.x = this.baseSprite.world.x;
            this.laserSprite.y = this.baseSprite.world.y;
            targetPoint = new Phaser.Point(targetx, targety);
            this.laserSprite.width = this.baseSprite.world.distance(targetPoint);
            this.laserSprite.visible = true;
            this.laserSprite.bringToTop();
            this.laserSprite.angle = MissileCommand.Game.game.game.math.radToDeg( MissileCommand.Game.game.game.math.angleBetweenPoints(this.baseSprite.world, MissileCommand.Game.game.game.input.activePointer.position) );// + this.baseSprite.parent.angle;

            //only the tip of the laser is actually dangerous
            var tipRadius = this.laserSprite.height;
            var tipCircle = new Phaser.Circle(MissileCommand.Game.game.game.input.activePointer.position.x, MissileCommand.Game.game.game.input.activePointer.position.y, tipRadius);
            var missiles = MissileCommand.Game.missileLauncher.missiles;
            for(var x = 0;x < missiles.length; x++)
            {
                if(missiles[x] != null && Phaser.Circle.intersectsRectangle(tipCircle, missiles[x].getRectBounds()))
                {
                    this.reportKill();
                    missiles[x].explode();
                }
            }
        }
    },
    clickAt: function(targetx, targety)
    {
        this.firingStarted = MissileCommand.Game.game.game.time.now;
    },
    releaseAt: function(targetx, targety)
    {
        
    },
	getName: function()
	{
		return "Laser";
	}
}