MissileCommand.Missile = function(game, launcher, launchPoint, targetPoint, parentObject) 
{
    this.game = game;
    this.launcher = launcher;
    this.launchPoint = launchPoint;
    this.destination = targetPoint;
	
	this.parentObject = parentObject;
    
    //Set up this object
    Phaser.Sprite.call(this, game, launchPoint.x, launchPoint.y, 'missile', 0);
    this.anchor.setTo(.5, .5);
    this.scale.setTo(1);
	
	//how fast the missile will rotate, and in what direction
	this.rotationSpeed = this.game.rnd.realInRange(-2, 2);
    
    //add this item to the game or its parent object
	if(this.parentObject === undefined)
    	this.game.add.existing(this);
	else
		this.parentObject.add(this);
	
	this.x = this.launchPoint.x;
	this.y = this.launchPoint.y;
}

MissileCommand.Missile.prototype = Object.create(Phaser.Sprite.prototype);
MissileCommand.Missile.prototype.constructor = MissileCommand.Missile;

MissileCommand.Missile.prototype.update = function()
{
	this.angle += this.rotationSpeed;
	
	this.checkAndDoOrbitalMovment();
	
    //if this object is within the planet, or it is at it's destination, destroy it
    if( Phaser.Point.distance(this.world, MissileCommand.Game.planet.position) <= (MissileCommand.Game.planet.radius + this.width/2) - 5 )
    {
        MissileCommand.Game.planet.reportDamage();
        this.explode();
    }
    else if(this.world.x == this.destination.x && this.world.y == this.destination.y)
    {
        this.explode();
    }
}

MissileCommand.Missile.prototype.getRectBounds = function()
{
    return new Phaser.Rectangle(this.world.x - this.width/2, this.world.y - this.height/2, this.width, this.height);
}

MissileCommand.Missile.prototype.explode = function()
{
	if(this.parentObject !== undefined)
		this.parentObject.removeMissile(this);						//if the missile is part of a group, remove it from the group
    this.launcher.removeMissile(this);                            //remove the missile first
    new MissileCommand.Explosion(this.game, this.world, this.launcher, 20, 40, 1000);    //create an explosion (always after removing
    this.destroy();                                               //destroy this object
}

MissileCommand.Missile.prototype.speedUpdate = function(newSpeed)
{
    this.distanceToTarget = Phaser.Point.distance(this.destination, this.world);
    this.speed = newSpeed;
    this.timeToDestination = (this.distanceToTarget/this.speed) * 1000; //milliseconds
   
    //move this missile from it's current position to the destination over time
    this.tween = this.game.add.tween(this);
    this.tween.to({x: this.destination.x, y: this.destination.y}, this.timeToDestination);
    this.tween.start();
}

MissileCommand.Missile.prototype.giveOrbitalMovement = function(speed)
{
    this.orbitalMovement = true;
	var orbitalAngleMaximum = 80;
	var orbitalAngleMinimum = 45;
	this.orbitalAngle = MissileCommand.Game.game.game.rnd.realInRange(orbitalAngleMinimum, orbitalAngleMaximum);
	this.orbitalSpeed = (speed === undefined) ? 1.2 : speed;
    this.tween = this.game.add.tween(this);
}

//if this object has orbital movment, apply the movement to the object
MissileCommand.Missile.prototype.checkAndDoOrbitalMovment = function()
{
    if(this.orbitalMovement)
	{
		var movementDirection = Phaser.Point.subtract(this.destination, this.world);
		movementDirection = Phaser.Point.rotate(movementDirection, 0, 0, this.orbitalAngle, true);
		movementDirection.setMagnitude(this.orbitalSpeed);
		
		this.x += movementDirection.x;
		this.y += movementDirection.y;
		
		if(this.world.distance(this.destination) < 2)
			this.explode();
	}
}