
MissileCommand.Bullet = function(game, weapon, startPos, goalPos, explosionStartSize, explosionEndSize, explosionTime, bulletTravelSpeed)
{
    this.game = game;
    this.weapon = weapon;
    
    //stuff used for the creation of the explosion from this bullet
    this.explosionStartSize = explosionStartSize;
    this.explosionEndSize = explosionEndSize;
    this.explosionTime = explosionTime;
    
    //Set up this object
    Phaser.Sprite.call(this, this.game, startPos.x, startPos.y, 'bullet', 0);
    this.anchor.setTo(.5, .5);
    this.scale.setTo(.1);
    
    //we don't want our bullet to be bigger than the final explosion
    if(this.explosionEndSize < this.width/2)
    {
        this.width = this.explosionStartSize;
        this.height = this.explosionStartSize;
    }
    
    //TODO rotate the bullet based on the direction it is heading
    
    this.destination = new Phaser.Point(goalPos.x, goalPos.y);
    this.distanceToTarget = Phaser.Point.distance(this.destination, this.world);
    this.speed = bulletTravelSpeed ? bulletTravelSpeed : 300;
    this.timeToDestination = (this.distanceToTarget/this.speed) * 1000; //milliseconds
    
    this.tween = this.game.add.tween(this);
    this.tween.to({x: goalPos.x, y: goalPos.y}, this.timeToDestination);
    this.tween.start();
    
    //add this item to the game
    this.game.add.existing(this);
	this.game.world.sendToBack(this);
}

MissileCommand.Bullet.prototype = Object.create(Phaser.Sprite.prototype);
MissileCommand.Bullet.prototype.constructor = MissileCommand.Bullet;

MissileCommand.Bullet.prototype.update = function()
{
    //if this bullet has reached it's destination, destroy it!
    if(this.x == this.destination.x && this.y == this.destination.y)
    {
        this.doDestroy();
    }
}

MissileCommand.Bullet.prototype.getRectBounds = function()
{
    return new Phaser.Rectangle(this.x, this.y, this.width, this.height);
}

MissileCommand.Bullet.prototype.doDestroy = function()
{
    new MissileCommand.Explosion(this.game, this.world, this.weapon, this.explosionStartSize, this.explosionEndSize, this.explosionTime);
    this.destroy();
}

MissileCommand.Bullet.prototype.getType = function()
{
    return MissileCommand.Bullet.ObjectType;
}