
MissileCommand.CollisionBullet = function(game, weapon, startPos, goalPos, bulletTravelSpeed)
{
    this.game = game;
    this.weapon = weapon;
    
    //Set up this object
    Phaser.Sprite.call(this, this.game, startPos.x, startPos.y, 'bullet', 0);
    this.anchor.setTo(.5, .5);
    this.scale.setTo(.1);
    //TODO rotate the bullet based on the direction it is heading
    
    this.destination = new Phaser.Point(goalPos.x, goalPos.y);
    this.distanceToTarget = Phaser.Point.distance(this.destination, this.world);
    this.speed = bulletTravelSpeed ? bulletTravelSpeed : 300;
    this.timeToDestination = (this.distanceToTarget/this.speed) * 1000; //milliseconds
    
    this.tween = this.game.add.tween(this);
    this.tween.to({x:goalPos.x, y:goalPos.y}, this.timeToDestination);
    this.tween.start();
    
    this.collisionCircle = new Phaser.Circle(this.x, this.y, this.width);
    
    //add this item to the game
    this.game.add.existing(this);
	this.game.world.sendToBack(this);
}

MissileCommand.CollisionBullet.prototype = Object.create(Phaser.Sprite.prototype);
MissileCommand.CollisionBullet.prototype.constructor = MissileCommand.CollisionBullet;

MissileCommand.CollisionBullet.prototype.update = function()
{
    this.collisionCircle.x = this.x;
    this.collisionCircle.y = this.y;
    
    var missiles = MissileCommand.Game.missileLauncher.missiles;
    for(var x = 0;x < missiles.length; x++)
    {
        if( missiles[x] != null && Phaser.Circle.intersectsRectangle(this.collisionCircle, missiles[x].getRectBounds()) )
        {
            this.weapon.reportKill();
            missiles[x].explode();
            this.destroy();
            return;
        }
    }
    
    //if this bullet has reached it's destination, destroy it!
    if(this.x == this.destination.x && this.y == this.destination.y)
    {
        this.destroy();
    }
}

MissileCommand.CollisionBullet.prototype.getRectBounds = function()
{
    return new Phaser.Rectangle(this.x, this.y, this.width, this.height);
}

MissileCommand.CollisionBullet.prototype.doDestroy = function()
{
    this.destroy();
}

MissileCommand.CollisionBullet.prototype.applyTint = function(tint)
{
    this.tint = tint;
}