
MissileCommand.DifficultyManager = function(game, planet, missileLauncher){
    this.game = game;
	this.planet = planet;
	this.missileLauncher = missileLauncher;
	this.delayBetweenWaves = 1000;			//1 second
	
	this.waveState = MissileCommand.WaveState.INACTIVE;
	//this.waveIsActive = false;
	
	var standardDelay = 1000;	
	this.easy_waves = {
		"alternatingMiddleBeat": [
			["setMissileSpeed", 80],
			["launchOpposites", 0, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["launchOpposites", 1, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["launchOpposites", 0, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["launchOpposites", 1, this.game.width/2, false],
		],
		"alternatingCornerBeat": [
			["setMissileSpeed", 80],
			["launchOpposites", 0, 0, false],
			["DO_DELAY", standardDelay],
			["launchOpposites", 1, 0, false],
			["DO_DELAY", standardDelay],
			["launchOpposites", 0, 0, false],
			["DO_DELAY", standardDelay],
			["launchOpposites", 1, 0, false],
		],
		"clockwiseMiddleBeat": [
			["setMissileSpeed", 80],
			["singleLaunchSide", 0, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["singleLaunchSide", 1, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["singleLaunchSide", 2, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["singleLaunchSide", 3, this.game.width/2, false],
		],
		"counterClockwiseMiddleBeatOrbit": [
			["setMissileSpeed", 80],
			["singleLaunchSide", 0, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["singleLaunchSide", 3, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["singleLaunchSide", 2, this.game.width/2, false],
			["DO_DELAY", standardDelay],
			["singleLaunchSide", 1, this.game.width/2, false],
		],
		"randomOrbits": [
			["setMissileSpeed", 100],
			["launchWave", 5, true, 3000],
		],
		"sideLaunch": [
			["setMissileSpeed", 80],
			["launchSide", 9]
		],
		"straightLine": [
			["setMissileSpeed", 80],
			["launchStraightLineSeries", 2, 6, 0],
		],
		"groupRandom": [
			["setMissileSpeed", 80],
			["launchRandomMissileGroupSeries",  5]
		],
	};
	this.medium_waves = {
		"alternatingBeat": [
			["setMissileSpeed", 100],
			["launchOpposites", 0, this.game.width/2, false],
			["DO_DELAY", standardDelay/2],
			["launchOpposites", 1, this.game.width/2, false],
			["DO_DELAY", standardDelay/2],
			["launchOpposites", 0, this.game.width/2, false],
			["DO_DELAY", standardDelay/2],
			["launchOpposites", 1, this.game.width/2, false],
			["DO_DELAY", standardDelay/2],
			["launchOpposites", 0, 0, false],
			["DO_DELAY", standardDelay/2],
			["launchOpposites", 1, 0, false],
			["DO_DELAY", standardDelay/2],
			["launchOpposites", 0, 0, false],
			["DO_DELAY", standardDelay/2],
			["launchOpposites", 1, 0, false],
		],
		"randomOrbits": [
			["launchWave", 8, true, 3000],
			["chanceForSideLaunch", 10, 5, 3000],
		],
		"lotsOfRandom": [
			["setMissileSpeed", 80],
			["launchRandomMissileSeries", 50, 3000],
		],
		"groupRandom": [
			["setMissileSpeed", 80],
			["launchRandomMissileGroupSeries",  10]
		],
		"swarmOrbital": [
			["setMissileSpeed", 80],
			["launchWave", 500, true, 3000],			
		],
	};
	
	this.hard_waves = {
		"alternatingDoubleBeat": [
			["setMissileSpeed", 90],
			["launchOpposites", 0, this.game.width/3, false],
			["launchOpposites", 0, this.game.width*2/3, false],
			["DO_DELAY", standardDelay*2],
			["launchOpposites", 1, this.game.width/3, false],
			["launchOpposites", 1, this.game.width*2/3, false],
			["DO_DELAY", standardDelay*2],
			["launchOpposites", 0, this.game.width/3, false],
			["launchOpposites", 0, this.game.width*2/3, false],
			["DO_DELAY", standardDelay*2],
			["launchOpposites", 1, this.game.width/3, false],
			["launchOpposites", 1, this.game.width*2/3, false],
		],
		"launchAll": [
			["setMissileSpeed", 80],
			["launchAllSides"],
		],
		"randomChances": [
			["setMissileSpeed", 90],
			["launchWave", 10, true, 3000],
			["launchRandomMissileSeries", 10, 3000],
			["chanceForSideLaunch", 10, 8, 3000],
			["chanceForAllSidesLaunch", 10, 3000, 60],
		],
		"swarmOrbital": [
			["setMissileSpeed", 80],
			["launchWave", 500, true, 3000],			
		],
	};
};

MissileCommand.DifficultyManager.prototype = {
    update: function() 
	{
		//this.doLaunches( this.medium_waves["alternatingMiddleBeat"] );
		if ( this.playerKillsWithinRange(0, 40) )
			this.doLaunches( this.getRandomWave(this.easy_waves) );
		else if(this.playerKillsWithinRange(40, 150))
			this.doLaunches( this.getRandomWave(this.medium_waves) );
		else if(this.playerKillsWithinRange(150))
			this.doLaunches( this.getRandomWave(this.hard_waves) );
		
		/*
        if ( this.playerKillsWithinRange(0, 5) )
        {
			this.doLaunches([
				["setMissileSpeed", 80],
				["launchWave", 5, false, 3000],
			]);
        }
        else if ( this.playerKillsWithinRange(5, 12) )
        {
			this.doLaunches([
				["setMissileSpeed", 80],
				["launchWave", 7, true, 3000],
				["chanceForSideLaunch", 10, 5, 3000],
			]);
        }
        else if ( this.playerKillsWithinRange(12, 20) )
        {
			this.doLaunches([
				["setMissileSpeed", 80],
				["launchSide", 9]
			]);
        }
        else if ( this.playerKillsWithinRange(20, 30) )
        {
			this.doLaunches([
				["setMissileSpeed", 50],
				["launchAllSides"],
			]);
        }
        else if ( this.playerKillsWithinRange(30, 50) )
        {
			this.doLaunches([
				["setMissileSpeed", 70],
				["launchWave", 10, Phaser.Math.chanceRoll(50), 3000],
			]);
        }
        else if ( this.playerKillsWithinRange(50, 100) )
        {
			this.doLaunches([
				["setMissileSpeed", 90],
				["launchWave", 10, Phaser.Math.chanceRoll(10), 3000],
				["chanceForSideLaunch", 10, 7, 3000],
				["chanceForAllSidesLaunch", 5, 3000, 60],
			]);
        }
        else if ( this.playerKillsWithinRange(100, 200) )
        {
			this.doLaunches([
				["setMissileSpeed", 90],
				["launchWave", 10, Phaser.Math.chanceRoll(10), 3000],
				["launchRandomMissileSeries", 5, 3000],
				["chanceForSideLaunch", 10, 7, 3000],
				["chanceForAllSidesLaunch", 5, 3000, 60],
			]);
        }
        else if ( this.playerKillsWithinRange(200) )
        {
			this.doLaunches([
				["setMissileSpeed", 90],
				["launchWave", 10, Phaser.Math.chanceRoll(20), 3000],
				["launchRandomMissileSeries", 10, 3000],
				["chanceForSideLaunch", 10, 8, 3000],
				["chanceForAllSidesLaunch", 10, 3000, 60],
			]);
        }
		*/
    },
	doLaunches: function(/*Accepts a variable number of wave JSONs*/)
	{
		//if a wave is currently active or launching, just leave
		if(this.waveState == MissileCommand.WaveState.LAUNCHING || this.waveState == MissileCommand.WaveState.ACTIVE)
			return;
		
		//if we make it here, we are definitely creating an active wave
		this.waveState = MissileCommand.WaveState.LAUNCHING;
		var maxDelay = 0;
		for (var i = 0; i < arguments.length; i++) 
		{
			var totalDelay = 0;
			var currentDelay = 0;
			var launchGroup = arguments[i];
			for (var k = 0; k < launchGroup.length; k++)
			{
				var launch = launchGroup[k];
				if(launch[0] == "DO_DELAY")
				{
					currentDelay += launch[1];
				}
				else
				{
					paramString = "";
					for(var x = 1; x < launch.length; x++)
					{
						paramString += launch[x];
						if(x < launch.length-1)
							paramString += ", ";
					}
					if(currentDelay == totalDelay)
						eval("this.missileLauncher." + launch[0] + "(" + paramString + ")");
					else
					{
						if(launch.length > 1)
							paramString = ", " + paramString;
						eval("this.game.time.events.add(" + currentDelay + ", this.missileLauncher." + launch[0] + ", this.missileLauncher" + paramString + ")");
						totalDelay = currentDelay;
					}
				}
			}
			if(totalDelay > maxDelay)
				maxDelay = totalDelay;
		}
		
		if(maxDelay > 0)
			this.game.time.events.add(maxDelay, this.WaveIsActive, this);
	},
	getRandomWave: function(waveMap)
	{
		var keys = Object.keys(waveMap);
  		return waveMap[keys[Math.floor(keys.length * Math.random())]];
	},
	playerKillsWithinRange: function(min, max)	//max is optional
	{
		if(max !== undefined)
			return this.planet.playerKills >= min && this.planet.playerKills <= max;
		else
			return this.planet.playerKills >= min;
	},
	OnMissileDestroy: function()				//this should be called each time a missile is destroyed
	{
		if(this.missileLauncher.missiles.length == 0)
			this.game.time.events.add(this.delayBetweenWaves, this.WaveIsOver, this);
	},
	WaveIsOver: function() {
		this.waveState = MissileCommand.WaveState.INACTIVE;
	},
	WaveIsActive: function() {
		this.waveState = MissileCommand.WaveState.ACTIVE;
	}
}

MissileCommand.DifficultyManager.DELAY = "DO_DIFFICULTY_MANGAGER_DELAY";

MissileCommand.WaveState = Object.freeze({
	INACTIVE: 0,
	LAUNCHING: 1,
	ACTIVE: 2,
});