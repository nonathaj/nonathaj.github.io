
MissileCommand.MissileGroup = function(game, launcher, launchPoint, targetPoint, shape)
{
	Phaser.Group.call(this, game);
	
    this.game = game;
    this.launcher = launcher;
    this.launchPoint = launchPoint;
    this.destination = targetPoint;
	
	this.rotationSpeed = 0;
	
	this.x = this.launchPoint.x;
	this.y = this.launchPoint.y;
	
	this.missiles = [];
	var points = MissileCommand.MissileGroup.getPointsForShape(shape);
	for(var x = 0; x < points.length; x++)
	{
		//add the missiles to the group
		this.missiles.push(new MissileCommand.Missile(this.game, this.launcher, points[x], this.destination, this));
		
		//add references to the missiles to the launcher
		this.launcher.totalMissilesLaunched++;
		this.launcher.missiles.push(this.missiles[x]);
	}
}

MissileCommand.MissileGroup.prototype = Object.create(Phaser.Group.prototype);
MissileCommand.MissileGroup.prototype.constructor = MissileCommand.MissileGroup;

MissileCommand.MissileGroup.prototype.update = function()
{
	this.angle += this.rotationSpeed;

	this.checkAndDoOrbitalMovement();
}

MissileCommand.MissileGroup.prototype.removeMissile = function(missile)
{
	this.missiles.splice(this.missiles.indexOf(missile), 1);

	if(this.missiles.length == 0)
		this.destroy();
}

MissileCommand.MissileGroup.prototype.setRotationSpeed = function()
{
	this.rotationSpeed = this.game.rnd.realInRange(-2, 2);	
}

MissileCommand.MissileGroup.prototype.setLinearMovement = function(speed)
{
	var distanceToTarget = Phaser.Point.distance(this.destination, new Phaser.Point(this.x, this.y));
	this.speed = speed;
	timeToDestination = (distanceToTarget/this.speed) * 1000; //milliseconds
	
	//move this missile from it's current position to the destination over time
	this.tween = this.game.add.tween(this);
	this.tween.to({x: this.destination.x, y: this.destination.y}, timeToDestination);
	this.tween.start();
}

MissileCommand.MissileGroup.prototype.setOrbitalMovement = function(speed)
{
	this.orbitalMovement = true;
	var orbitalAngleMaximum = 80;
	var orbitalAngleMinimum = 60;
	this.orbitalAngle = MissileCommand.Game.game.game.rnd.realInRange(orbitalAngleMinimum, orbitalAngleMaximum);
	this.orbitalSpeed = (speed === undefined) ? 1.2 : speed;
	this.tween = this.game.add.tween(this);
}

MissileCommand.MissileGroup.prototype.checkAndDoOrbitalMovement = function()
{
	if(this.orbitalMovement)
	{
		var worldPos = new Phaser.Point(this.x, this.y);
		var movementDirection = Phaser.Point.subtract(this.destination, worldPos);
		movementDirection = Phaser.Point.rotate(movementDirection, 0, 0, this.orbitalAngle, true);
		movementDirection.setMagnitude(this.orbitalSpeed);

		this.x += movementDirection.x;
		this.y += movementDirection.y;

		if(worldPos.distance(this.destination) < 2)
			this.explode();
	}
}

//not instance, static stuff

MissileCommand.MissileGroup.getPointsForShape = function(shape)
{
	var points = [];
	var distanceFromCenter = 20 + (shape * 10);
	for(var x = 0;x < shape; x++)
	{
		var pointAng = ( (2*Math.PI) / shape ) * x;
		var xPos = distanceFromCenter * Math.cos(pointAng);
		var yPos = distanceFromCenter * Math.sin(pointAng);
		points.push(new Phaser.Point(xPos, yPos));
	}
	return points;
}

MissileCommand.MissileGroup.Shapes = {
	TRIANGLE:	3, 
	SQUARE: 	4,
	PENTAGON:	5,
	HEXAGON:	6,
	OCTOGON:	8,
}