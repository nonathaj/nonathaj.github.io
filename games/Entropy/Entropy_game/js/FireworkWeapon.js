MissileCommand.FireworkWeapon = function(game, planet, planetGroup, weaponNum, totalWeapons, weaponStyles)
{
	this.game = game;
	this.planet = planet;
	this.weaponNum = weaponNum;
	this.hits = 0;      //the number of times this weapon has destroyed a missile

    this.fireRate = 600;        //the speed at which this weapon is allowed to be fired
    this.lastFireTime = 0;      //the last time this weapon was fired
    
	var weaponAng = ( (2*Math.PI) / totalWeapons ) * weaponNum;     //the angle the weapon appears next to the planet, in radians
    var x = planet.radius * Math.cos( weaponAng );
    var y = planet.radius * Math.sin( weaponAng );
    
    this.weaponAng_degrees = weaponAng * (180/Math.PI);
    
    this.barrelSprite = planetGroup.create(x, y, 'firework_barrel');
    this.barrelSprite.anchor.setTo(.15, .5);
    this.barrelSprite.scale.setTo(.2);
    this.barrelSprite.angle = this.weaponAng_degrees;
    
    this.baseSprite = planetGroup.create(x,y, 'firework_base');
    this.baseSprite.angle = this.weaponAng_degrees;
    this.baseSprite.anchor.setTo(.5, .5);
    this.baseSprite.scale.setTo(.07, .2);

	this.reticleSprite = this.game.add.sprite(-100, -100, 'firework_reticle');
	this.reticleSprite.anchor.setTo(.5, .5);
	this.reticleSprite.scale.setTo(.5);					//TODO adjust scale of this reticle
}

MissileCommand.FireworkWeapon.prototype = {
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
		this.reticleSprite.bringToTop();
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
            var bullet = new MissileCommand.Bullet(this.game, this, this.baseSprite.world, new Phaser.Point(targetx, targety), 10, 15, 1000);
            bullet.events.onDestroy.add(this.onFireworkImpact, this);
        }
    },
    onFireworkImpact: function(bullet)
    {
        var bulletPos = bullet.world;
        var secondaryBlastRadius = 50;
        var secondaryBlastCircle = new Phaser.Circle(bulletPos.x, bulletPos.y, secondaryBlastRadius*2);
        var numberSubBullets = 8;
        var subBulletExplosionStartSize = 20;
        var subBulletExplisionEndSize = 30;
        
        //calculate the positions for the sub bullets to travel to
        var secTargets = [];
        for(var x = 0; secTargets.length < numberSubBullets - 1; x++)
        {
            //generate a potential point for the next bullet
            var point = new Phaser.Point(
                MissileCommand.Game.game.game.rnd.integerInRange(bullet.x-secondaryBlastRadius, bullet.x+secondaryBlastRadius), 
                MissileCommand.Game.game.game.rnd.integerInRange(bullet.y-secondaryBlastRadius, bullet.y+secondaryBlastRadius)
            );
            //if it's within our blast circle, add it
            if(secondaryBlastCircle.contains(point.x, point.y))
               secTargets.push(point);
        }
        for(var x = 0; x < secTargets.length; x++)
            new MissileCommand.Bullet(this.game, this, bulletPos, secTargets[x], subBulletExplosionStartSize, subBulletExplisionEndSize, MissileCommand.Game.game.game.rnd.integerInRange(300, 600));
    },
    releaseAt: function(targetx, targety)
    {
        
    },
	getName: function()
	{
		return "Firework";
	}
}