MissileCommand.Weapon = function(game, planet, planetGroup, weaponNum, totalWeapons, weaponStyles)
{
    this.game = game;
    this.planet = planet;
    this.weaponNum = weaponNum;
    this.hits = 0;      //the number of times this weapon has destroyed a missile
    
    this.fireRate = 300;        //the speed at which this weapon is allowed to be fired
    this.lastFireTime = 0;      //the last time this weapon was fired
    
    var weaponAng = ( (2*Math.PI) / totalWeapons ) * weaponNum;     //the angle the weapon appears next to the planet, in radians
    var x = planet.radius * Math.cos( weaponAng );
    var y = planet.radius * Math.sin( weaponAng );
    
    this.weaponAng_degrees = weaponAng * (180/Math.PI);
    
    this.barrelSprite = planetGroup.create(x, y, 'weapon_barrel');
    this.barrelSprite.anchor.setTo(.15, .5);
    this.barrelSprite.scale.setTo(.2);
    this.barrelSprite.angle = this.weaponAng_degrees;
    
    this.baseSprite = planetGroup.create(x,y, 'weapon_base');
    this.baseSprite.angle = this.weaponAng_degrees;
    this.baseSprite.anchor.setTo(.5, .5);
    this.baseSprite.scale.setTo(.07, .2);
    
    this.reticleSprite = this.game.add.sprite(-100, -100, "weapon_reticle");
    this.reticleSprite.anchor.setTo(.5, .5);
    this.reticleSprite.scale.setTo(.5);
}

MissileCommand.Weapon.prototype = {
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
        if(game.time.elapsedSince(this.lastFireTime) > this.fireRate)
        {
            this.lastFireTime = game.time.now;
            var bullet = new MissileCommand.Bullet(this.game, this, this.baseSprite.world, new Phaser.Point(targetx, targety), 30, 40, 1000);
        }
    },
    clickAt: function(targetx, targety)
    {
        
    },
    releaseAt: function(targetx, targety)
    {
        
    },
	getName: function()
	{
		return "Machine Gun"	
	}
}