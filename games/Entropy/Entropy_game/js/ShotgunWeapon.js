MissileCommand.ShotgunWeapon = function(game, planet, planetGroup, weaponNum, totalWeapons)
{
	this.game = game;
	this.planet = planet;
	this.hits = 0;      //the number of times this weapon has destroyed a missile

    this.fireRate = 1500;        //the speed at which this weapon is allowed to be fired
    this.lastFireTime = 0;      //the last time this weapon was fired

	var weaponAng = ( (2*Math.PI) / totalWeapons ) * weaponNum;     //the angle the weapon appears next to the planet, in radians
    var x = planet.radius * Math.cos( weaponAng );
    var y = planet.radius * Math.sin( weaponAng );
    
    this.weaponAng_degrees = weaponAng * (180/Math.PI);
    
    this.barrelSprite = planetGroup.create(x, y, 'shotgun_barrel');
    this.barrelSprite.anchor.setTo(.15, .5);
    this.barrelSprite.scale.setTo(.2);
    this.barrelSprite.angle = this.weaponAng_degrees;
    
    this.baseSprite = planetGroup.create(x,y, 'shotgun_base');
    this.baseSprite.angle = this.weaponAng_degrees;
    this.baseSprite.anchor.setTo(.5, .5);
    this.baseSprite.scale.setTo(.07, .2);

	this.reticleSprite = this.game.add.sprite(-100, -100, 'shotgun_reticle');	//TODO adjust name of reticle sprite for this weapon
	this.reticleSprite.anchor.setTo(.5, .5);
	this.reticleSprite.scale.setTo(1);					//TODO adjust scale of this reticle
}

MissileCommand.ShotgunWeapon.prototype = {
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
    },
    clickAt: function(targetx, targety)
    {
        //called when the player clicks for this weapon
        if(game.time.elapsedSince(this.lastFireTime) > this.fireRate)
        {
            this.lastFireTime = game.time.now;
            
            var blastRadius = 75;
            var blastCircle = new Phaser.Circle(targetx, targety, blastRadius*2);
            var numberBullets = 8;
            var bulletExplosionStartSize = 20;
            var bulletExplosionEndSize = 30;
            var bulletExplosionTime = 200;

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
                if(blastCircle.contains(point.x, point.y))
                   targets.push(point);
            }
            for(var x = 0; x < targets.length; x++)
                new MissileCommand.Bullet(this.game, this, this.baseSprite.world, targets[x], bulletExplosionStartSize, bulletExplosionEndSize, bulletExplosionTime);
        }
    },
    releaseAt: function(targetx, targety)
    {
        
    },
	getName: function()
	{
		return "Shotgun";
	}
}