
MissileCommand.Planet = function(game)
{
    this.game = game;
    this.radius = game.height < game.width ? game.height * 0.1 : game.width * 0.1;
    this.playerKills = 0;       //the total number of missiles the player has shot down
    this.damage = 0;            //the number of missiles that have hit the planet
	this.maxHealth = 15;		//the number of shots the planet can take
    this.rotationSpeedClickIncrease = 1;        //how much the planet rotation speeds up when clicked
    
    //set up the sprite group (group include planet and gun )
    this.planetGroup = game.add.group();
    this.planetGroup.x = this.x = game.width/2;
    this.planetGroup.y = this.y = game.height/2;
    this.planetGroup.maxRotationSpeed = 6;
    this.planetGroup.normalRotationSpeed = .08;
    this.planetGroup.rotationSpeed = this.planetGroup.normalRotationSpeed;
    this.planetGroup.update = function() {
        this.angle -= this.rotationSpeed;
    }
    //the tween used to return the rotation of the planet back to normal
    this.planetRotationTween = this.game.add.tween(this.planetGroup);
    this.planetRotationTween.to({rotationSpeed:this.planetGroup.normalRotationSpeed}, 4000);
    
    //the rotation reticle sprite
    this.rotationReticleSprite = this.game.add.sprite(-100, -100, "rotation_reticle");
    this.rotationReticleSprite.anchor.setTo(.5, .5);
    this.rotationReticleSprite.scale.setTo(.05);
    
    //Set up planet sprite
    this.SetPlanetSprite();
    
    //set up the weapons
    var numWeapons = 4;		//the number of weapons attached to the planet
    this.weapons = [];
    this.weapons.push( new MissileCommand.LaserWeapon(this.game, this, this.planetGroup, 0, numWeapons) );
    this.weapons.push( new MissileCommand.Weapon(this.game, this, this.planetGroup, 1, numWeapons) );
    this.weapons.push( new MissileCommand.FlameThrower(this.game, this, this.planetGroup, 2, numWeapons) );
    this.weapons.push( new MissileCommand.FireworkWeapon(this.game, this, this.planetGroup, 3, numWeapons) );
    
	//used by the missiles to detect collisions with the planet
	this.position = this.planetSprite.world;
	
    //the circle we are not allowed to fire bullets into
    this.safetyCircle = new Phaser.Circle(this.planetGroup.x, this.planetGroup.y, (this.radius*2) * 1.2);
    
	//set the draw order of the planet sprites
	this.planetSprite.bringToTop();
	
	this.game.world.bringToTop(this.planetGroup);
	this.game.world.bringToTop(this.rotationReticleSprite);
	
    //add this item to the game
    game.add.existing(this.planetGroup);
}

MissileCommand.Planet.prototype = {
    update: function()
    {
        this.weapons.forEach(function(weap){
            weap.update();
        });
    },
    getClosestWeapon: function(x, y)
    {
        var minDist = 9999999;
        var weapon = null;
        this.weapons.forEach(function(weap){
            var dist = Phaser.Point.distance(new Phaser.Point(x, y), weap.baseSprite.world);
            if(dist < minDist)
            {
                minDist = dist;
                weapon = weap;
            }
        });
        return weapon;
    },
    aimAt: function(x, y)
    {
        //shade all weapons and disable the reticle
        this.rotationReticleSprite.visible = false;
        this.weapons.forEach(function(weap){
                weap.disableReticle();
                weap.tintWeapon(true);
        });
        
        //draw a reticle if the cursor is outside the planet
        if(!Phaser.Circle.contains(this.safetyCircle, x, y))
        {
            var weap = this.getClosestWeapon(x, y);
            weap.activateReticle(x, y);
            weap.tintWeapon(false);
        }
        else        //else draw the rotation sprite
        {
            this.rotationReticleSprite.visible = true;  
            this.rotationReticleSprite.x = x;
            this.rotationReticleSprite.y = y;   
        }
    },
    holdAt: function(x, y)      //the mouse button is held down
    {
        if(Phaser.Circle.contains(this.safetyCircle, x, y))
        {
           
        }
        else
        {
            var weapon = this.getClosestWeapon(x, y);
            if(weapon != null)
                weapon.holdAt(x, y);
        }
    },
    clickAt: function(x, y)
    {
        if(Phaser.Circle.contains(this.safetyCircle, x, y))
        {
            //you must click in order to speed up the planet rotation
            if(this.planetGroup.rotationSpeed < this.planetGroup.maxRotationSpeed)
                this.planetGroup.rotationSpeed += this.rotationSpeedClickIncrease;
            this.planetRotationTween.start();
        }
        else
        {
            var weapon = this.getClosestWeapon(x, y);
            if(weapon != null)
                weapon.clickAt(x, y);
        }
    },
    releaseAt: function(x, y)
    {
        if(Phaser.Circle.contains(this.safetyCircle, x, y))
        {
            
        }
        else
        {
            var weapon = this.getClosestWeapon(x, y);
            if(weapon != null)
                weapon.releaseAt(x, y);
        }
    },
    getPos: function()
    {
        return new Phaser.Point(this.x, this.y);   
    },
    reportKill: function()
    {
        this.playerKills++;
		MissileCommand.Game.game.reportPlayerScore();
    },
    reportDamage: function()
    {
        this.damage++;
        this.SetPlanetSprite();
    },
	getHealth: function() 
	{
		return this.maxHealth - this.damage;	
	},
    SetPlanetSprite: function()
    {
		if(this.damage == 0)
			this.setPlanetSpriteByName('planet');
        if(this.damage > 1 && this.damage <= 4)
			this.setPlanetSpriteByName('planet_2_damage');
        else if (this.damage > 4 && this.damage <= 7)
			this.setPlanetSpriteByName('planet_3_damage');
        else if (this.damage > 7 && this.damage <= 10)
			this.setPlanetSpriteByName('planet_4_damage');
        else if (this.damage > 10)
			this.setPlanetSpriteByName('planet_5_damage');
    },
	setPlanetSpriteByName: function(spriteName)
	{
		if(this.planetSprite === undefined || this.planetSprite.name != spriteName)
		{
			if(this.planetSprite !== undefined)
				this.planetSprite.destroy();
			this.planetSprite = this.planetGroup.create(0,0, spriteName);
			this.planetSprite.anchor.setTo(.5, .5);
			this.planetSprite.scale.setTo((this.radius * 2) / this.planetSprite.height);
			this.planetSprite.name = spriteName;
		}
	},
	reportWeaponStats: function()
	{
		weapon_stats = [];
		for(var x = 0;x < this.weapons.length; x++)
			weapon_stats[this.weapons[x].getName()] = this.weapons[x].hits;
		return weapon_stats;	
	}
}