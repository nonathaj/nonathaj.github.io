
MissileCommand.Explosion = function(game, loc, source, startRadius, explosionRadius, explosionTimeMillis)
{
    this.game = game;
    this.source = source;
    
    //Set up this object
    Phaser.Sprite.call(this, MissileCommand.Game.game.game, loc.x, loc.y, 'explosion', 0);
    this.anchor.setTo(.5, .5);
    this.x = loc.x;
    this.y = loc.y;
	this.angle = MissileCommand.Game.game.game.rnd.angle();

    this.targetRadius = explosionRadius;
    this.width = startRadius;
    this.height = startRadius;
    
    this.tween = this.game.add.tween(this);
    this.tween.to({width:this.targetRadius*2, height:this.targetRadius*2}, explosionTimeMillis);
    this.tween.onComplete.add(this.destroy, this);
    this.tween.start();
	
	var r = 255;
	var g = MissileCommand.Game.game.game.rnd.integerInRange(0, 255);
	var b = 0;
	this.tint = r << 16 | g << 8 | b;
    
    //add this item to the game
    this.game.add.existing(this);
}

MissileCommand.Explosion.prototype = Object.create(Phaser.Sprite.prototype);
MissileCommand.Explosion.prototype.constructor = MissileCommand.Explosion;

MissileCommand.Explosion.prototype.update = function()
{
	//using the explosion radius, destroy any objects that we would hit
    this.explosionCircle = new Phaser.Circle(this.x, this.y, this.width);
    var missiles = MissileCommand.Game.missileLauncher.missiles;
    for(var x = 0;x < missiles.length; x++)
    {
        if(missiles[x] != null && Phaser.Circle.intersectsRectangle(this.explosionCircle, missiles[x].getRectBounds()))
        {
            this.source.reportKill();
            missiles[x].explode();
        }
    }
}