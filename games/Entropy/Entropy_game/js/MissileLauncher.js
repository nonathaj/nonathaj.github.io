
MissileCommand.MissileLauncher = function(game)
{
    this.game = game;
    
    this.numMissiles = 3;
    this.missiles = [];
    this.missileSpeed = 100;
	this.totalMissilesLaunched = 0;
    
    this.hits = 0;      //number of times missiles have hit the planet
    this.borderPadding = 25;        //the number of pixels of padding on the outside of the screen for spawning missiles
}
MissileCommand.MissileLauncher.prototype = {
	
	//launch a wave of randomly spawning missiles at the planet randomly over a period of time
   	launchWave: function(waveSize, orbit, millisecondsForWaveLaunch)
	{
        for(var x = 0; x < waveSize; x++)
            this.game.time.events.add(this.game.rnd.integerInRange(0, millisecondsForWaveLaunch), this.launchMissile, this, this.getRandomPoint(), this.getTargetPoint(), orbit);
    },
	
	//launch an individual missile from one point to another (optional bool for it should orbit or not)
    launchMissile: function(launchPoint, targetPoint, orbit)
    {
		this.totalMissilesLaunched++;
        this.missiles.push(new MissileCommand.Missile(this.game, this, launchPoint, targetPoint));
		if(orbit)
        	this.missiles[this.missiles.length-1].giveOrbitalMovement(this.missileSpeed/100);		//orbital movement
		else
			this.missiles[this.missiles.length-1].speedUpdate(this.missileSpeed);					//linear movement			
    },
	
	//launch a missile group of given shape from a given point to a target point, bools for applying optional rotation and orbital movement(rather than linear)
	launchMissileGroup: function(launchPoint, targetPoint, shape, rotate, orbitalMovement)
	{
		var launchPoint = this.getRandomPoint();
		var targetPoint = this.getTargetPoint();
		var shape = MissileCommand.MissileGroup.Shapes.TRIANGLE;
		var missileGroup = new MissileCommand.MissileGroup(this.game, this, launchPoint, targetPoint, shape);
		if(rotate)
			missileGroup.setRotationSpeed();
		if(orbitalMovement)
			missileGroup.setOrbitalMovement(this.missileSpeed/100);
		else
			missileGroup.setLinearMovement(this.missileSpeed);
	},
	
	launchRandomMissileGroupAtPlanet: function(shape, orbit)
	{
		shape = (shape === undefined) ? MissileCommand.MissileGroup.Shapes.TRIANGLE : shape;
		orbit = (orbit === undefined) ? Phaser.Math.chanceRoll(50) : orbit;
		this.launchMissileGroup(this.getRandomPoint(), this.getTargetPoint(), shape, true, orbit);
	},
	
	launchRandomMissileGroupSeries: function(seriesLength, shape, orbit)
	{
		for(var x = 0; x < seriesLength; x++)
			this.launchRandomMissileGroupAtPlanet(shape, orbit);
	},
	
	//launch a missile from one random position, to another random position
	launchRandomMissile: function()							//launch a missile from a random point on a random side, to another random point on another random side, always in a linear movement
	{
		this.launchMissile( this.getRandomPoint(MissileCommand.Game.game.game.rnd.integerInRange(0, 4)), this.getRandomPoint(MissileCommand.Game.game.game.rnd.integerInRange(0, 4)) );
	},
	
	//launch a series of missiles from random positions to other random positions over a period of time
	launchRandomMissileSeries: function(numMissiles, millisecondsForWaveLaunch)
	{
		for(var x = 0;x < numMissiles; x++)
			this.game.time.events.add(this.game.rnd.integerInRange(0, millisecondsForWaveLaunch), this.launchRandomMissile, this);
	},
	
	//launch a straight line of missiles at the planet from a random position
	launchStraightLine: function(numMissiles)
	{
		var launchPoint = this.getRandomPoint(MissileCommand.Game.game.game.rnd.integerInRange(0, 4));
		for(var x = 0; x < numMissiles; x++)
		{
			//1 second delay between each missile in this sequence
			this.game.time.events.add(1000 * x, this.launchMissile, this, launchPoint, this.getTargetPoint(), false);
		}
	},
	
	//launch a series of random lines at the planet from random positions
	launchStraightLineSeries: function(numStraightLines, strightLineLength, millisecondsForWaveLaunch)
	{
		for(var x = 0; x < numStraightLines; x++)
			this.game.time.events.add(this.game.rnd.integerInRange(0, millisecondsForWaveLaunch), this.launchStraightLine, this, strightLineLength);
	},
	
	//launch an bunch of missiles from an entire side at the planet
	launchSide: function(numMissiles, side, orbit)					//launches a series of missiles all from the same side, at the planet, with linear movement
	{
		var spread = this.game.width / numMissiles;		//assumes play area is square
		var side = (side === undefined) ? MissileCommand.Game.game.game.rnd.integerInRange(0, 4) : side;
		
		for(var x = 0; x < numMissiles; x++)
			this.singleLaunchSide(side, x * spread, orbit);
	},
	
	//launch 8 enemies from each side at once
	launchAllSides: function(orbit)
	{
		for(var x = 0; x < 4; x++)
			this.launchSide(8, x, orbit);
	},
	
	//launch a single missile from a side, with a given offset position on that side toward the planet
	singleLaunchSide: function(side, offsetOnSide, orbit)		//all variables are optional
	{
		side = (side === undefined) ? MissileCommand.Game.game.game.rnd.integerInRange(0, 4) : side;
		offsetOnSide = (offsetOnSide === undefined) ? MissileCommand.Game.game.game.rnd.integerInRange(0, this.game.width) : offsetOnSide;
		this.launchMissile(this.getPointOnSide(side, offsetOnSide), this.getTargetPoint(), orbit);
	},
	
	//launch a missile group from a side, with a given offset position on that side toward the planet
	groupLaunchSide: function(side, offsetOnSide, shape, rotate, orbitalMovement)		//all variables are optional
	{
		side = (side === undefined) ? MissileCommand.Game.game.game.rnd.integerInRange(0, 4) : side;
		offsetOnSide = (offsetOnSide === undefined) ? MissileCommand.Game.game.game.rnd.integerInRange(0, this.game.width) : offsetOnSide;
		this.launchMissileGroup(this.getPointOnSide(side, offsetOnSide), this.getTargetPoint(), shape, rotate, orbitalMovement);
	},
	
	//launches missiles from 1 side as if from a wave down that side
	launchSideAsWave: function(side, numInWave, orbit, leftToRightWave, millisecondsForWaveLaunch)
	{
		var offset = this.game.width / numInWave;
		if(leftToRightWave)
			for(var x = 0; x < numInWave; x++)
				this.game.time.events.add(x * (millisecondsForWaveLaunch/numInWave), this.singleLaunchSide, this, side, x * offset, orbit);
		else
			for(var x = numInWave-1; x >= 0; x--)
				this.singleLaunchSide(side, x * offset, orbit);
	},
	
	//launch 8 enemies from each side at once
	launchAllSidesAsWave: function(orbit, clockwise, timeForFullLaunch)
	{
		var timeForEachLaunch = timeForFullLaunch / 4;
		for(var x = 0; x < 4; x++)
			this.game.time.events.add(timeForEachLaunch * x, this.launchSideAsWave, this, x, 6, orbit, clockwise, timeForEachLaunch);
	},
	
	//launches 2 missiles on opposite sides of each other at the planet
	launchOpposites: function(side, offsetOnSide, orbit)		//all variables are optional
	{
		this.singleLaunchSide(side % 4, offsetOnSide, orbit);
		this.singleLaunchSide((side+2) % 4, offsetOnSide, orbit);
	},
	
	//give a % chance to launch a side
	chanceForSideLaunch: function(percentChanceToDoSideLaunch, sideLaunchSize, millisecondsForWaveLaunch)
	{
		if(Phaser.Math.chanceRoll(percentChanceToDoSideLaunch))
			this.game.time.events.add(this.game.rnd.integerInRange(0, millisecondsForWaveLaunch), this.launchSide, this, sideLaunchSize);	
	},
	
	//give a % chance to launch all sides
	chanceForAllSidesLaunch: function(percentChanceToDoLaunch, millisecondsForWaveLaunch, altSpeed)
	{		
		if(Phaser.Math.chanceRoll(percentChanceToDoLaunch))
		{
			this.game.time.events.add(this.game.rnd.integerInRange(0, millisecondsForWaveLaunch), this.launchAllSides, this);
			if(altSpeed !== undefined)
				this.setMissileSpeed(altSpeed);
		}
	},
	
    CreateMissileShapeeasy: function(waveSize)
    {
        var side = this.game.rnd.integerInRange(0, 4);
        var xy =this.game.rnd.integerInRange(0, this.game.width);
        if(side==0 || side==2)
          	waveSize=waveSize*2;
        else
            waveSize=waveSize/2;
        for(var x = 0; x < waveSize; x++)
        {
            xy=xy+100;
			this.game.time.events.add(10+waveSize*2, this.launchMissile, this, this.getPointOnSide(side,xy,waveSize), this.getTargetPoint());
		}
    },
    CreateMissileShapemed: function(waveSize)
    {
        var side = this.game.rnd.integerInRange(0, 4);
        var xy =this.game.rnd.integerInRange(0, this.game.width);
        if(side==0 || side==2)
			waveSize=waveSize*2;
        else
            waveSize=waveSize/2;
        for(var x = 0; x < waveSize; x++)
        {
            xy=xy+100;
			if(side<2)
				this.game.time.events.add(10+waveSize*2, this.launchMissile, this, this.getPointOnSide(side,xy,waveSize), this.getRandomPoint(side+2));
			else
				this.game.time.events.add(10+waveSize*2, this.launchMissile, this, this.getPointOnSide(side,xy,waveSize), this.getRandomPoint(side-2));
			this.game.time.events.add(10+waveSize*2, this.launchMissile, this, this.getPointOnSide(side,xy,waveSize), this.getTargetPoint());
			this.game.time.events.add(10, this.launchMissile, this, this.getRandomPoint(), this.getRandomPoint(side) );
        }
    },
   	CreateMissileShape: function(waveSize)
    {
        var side = this.game.rnd.integerInRange(0, 4);
        var xy =this.game.rnd.integerInRange(0, this.game.width);
        if(side==0 || side==2)
			waveSize=waveSize*2;
        else
            waveSize=waveSize/2;
        for(var x = 0; x < waveSize; x++)
        {
            xy=xy+100;
             
            if(side<2)
				this.game.time.events.add(10+waveSize*2, this.launchMissile, this, this.getPointOnSide(side,xy,waveSize), this.getRandomPoint(side+2));
			else
				this.game.time.events.add(10+waveSize*2, this.launchMissile, this, this.getPointOnSide(side,xy,waveSize), this.getRandomPoint(side-2));
            
			this.game.time.events.add(10+waveSize*2, this.launchMissile, this, this.getPointOnSide(side,xy,waveSize), this.getRandomPoint(0));
			this.game.time.events.add(10+waveSize*2, this.launchMissile, this, this.getPointOnSide(side,xy,waveSize), this.getTargetPoint());
            this.game.time.events.add(10, this.launchMissile, this, this.getRandomPoint(), this.getTargetPoint() );
            this.game.time.events.add(10, this.launchMissile, this, this.getRandomPoint(), this.getRandomPoint(side) );
		}
    },
	
	//Functions related to getting specific points
	getRandomPoint: function(side)
    {
        var side = (side === undefined) ? this.game.rnd.integerInRange(0, 4) : side;
		return this.getPointOnSide(side, this.game.rnd.integerInRange(0, this.game.width));
    },
	getPointOnSide: function(side, offsetOnSide)
	{
		if(side == 0)		//top
			return new Phaser.Point(offsetOnSide, -this.borderPadding);
		else if(side == 1)	//right
			return new Phaser.Point(this.game.width + this.borderPadding, offsetOnSide);
		else if(side == 2)	//bottom
			return new Phaser.Point(offsetOnSide, this.game.height + this.borderPadding);
		else				//left
			return new Phaser.Point(-this.borderPadding, offsetOnSide);
	},
    getTargetPoint: function()
    {
        return MissileCommand.Game.planet.getPos();
    },
	
	//General MissileLauncher Functions
    update: function()
    {
		this.missiles.forEach(function(missile){
            missile.update();
        });
    },
    removeMissile: function(missile)
    {
        this.missiles.splice(this.missiles.indexOf(missile), 1);
		MissileCommand.Game.difficultyManager.OnMissileDestroy();
    },
    reportKill: function()
    {
        this.hits++;
    },
	setMissileSpeed: function(newSpeed)
	{
		this.missileSpeed = newSpeed;
	}
}
MissileCommand.MissileLauncher.prototype.constructor = MissileCommand.MissileLauncher;