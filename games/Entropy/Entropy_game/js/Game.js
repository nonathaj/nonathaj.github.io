//MissileCommand Namespace
MissileCommand = {
    //global vars that persist through state changes go here
    //this would be a good place for storing music	
	highscore: 0
}

MissileCommand.reportScore = function(score) {
	if(score > MissileCommand.highscore)
		MissileCommand.highscore = score;
}

MissileCommand.Game = function(game){
    this.game = game;
    MissileCommand.Game.game = this;
    MissileCommand.Game.missileLauncher; // enemy
	MissileCommand.Game.difficultyManager;
	
	this.gameover;
};

MissileCommand.Game.prototype = {
    
    preload: function() {
        //load game assets here
        imagesFolder = "images/";
        this.game.load.image('background', imagesFolder + 'space.jpg');
        this.game.load.image('rotation_reticle', imagesFolder + 'rotation.png');
        this.game.load.image('missile', imagesFolder + 'yellow_circle.png');
        this.game.load.image('bullet', imagesFolder + 'red_circle.png');
        this.game.load.image('explosion', imagesFolder + 'circle-orange.png');
        this.game.load.image('empty_pixel', imagesFolder + '1by1whitepixel.png');
        this.game.load.image('health_bar', imagesFolder + 'health_bar.png');
		
		//Planet images
        this.game.load.image('planet', imagesFolder + 'planet.png');
        this.game.load.image('planet_2_damage', imagesFolder + 'planet_2.png');
        this.game.load.image('planet_3_damage', imagesFolder + 'planet_3.png');
        this.game.load.image('planet_4_damage', imagesFolder + 'planet_4.png');
        this.game.load.image('planet_5_damage', imagesFolder + 'planet_5.png');
        
        //Basic Weapon Images
        this.game.load.image('weapon_base', imagesFolder + 'WeaponHighlight.png');
        this.game.load.image('weapon_barrel', imagesFolder + 'Basic.png');
        this.game.load.image('weapon_reticle', imagesFolder + 'BasicReticle.png');
        
        //Firework Weapon Images
        this.game.load.image('firework_base', imagesFolder + 'WeaponHighlight.png');
        this.game.load.image('firework_barrel', imagesFolder + 'Firework.png');
        this.game.load.image('firework_reticle', imagesFolder + 'FireworkReticle.png');
        
        //Burst Weapon Images
        this.game.load.image('burst_base', imagesFolder + 'WeaponHighlight.png');
        this.game.load.image('burst_barrel', imagesFolder + 'Basic.png');
        this.game.load.image('burst_reticle', imagesFolder + 'reticle2.png');
        
        //Flamethrower Weapon Images
        this.game.load.image('flamethrower_base', imagesFolder + 'WeaponHighlight.png');
        this.game.load.image('flamethrower_barrel', imagesFolder + 'FlameThrower.png');
        this.game.load.image('flamethrower_reticle', imagesFolder + 'FlamethrowerReticle.png');
        
        //Shotgun Weapon Images
        this.game.load.image('shotgun_base', imagesFolder + 'WeaponHighlight.png');
        this.game.load.image('shotgun_barrel', imagesFolder + 'Basic.png');
        this.game.load.image('shotgun_reticle', imagesFolder + 'reticle.png');
        
        //Sniper Weapon Images
        this.game.load.image('sniper_base', imagesFolder + 'redSquare.jpg');
        this.game.load.image('sniper_barrel', imagesFolder + 'Basic.png');
        this.game.load.image('sniper_reticle', imagesFolder + 'reticle2.png');
        
        //Laser Weapon Images
        this.game.load.image('laser_base', imagesFolder + 'WeaponHighlight.png');
        this.game.load.image('laser_barrel', imagesFolder + 'Laser.png');
        this.game.load.image('laser_reticle', imagesFolder + 'LaserReticle.png');
        this.game.load.image('laser', imagesFolder + '1by1whitepixel.png');
        
    },
    
    create: function() {
        this.bg = this.game.add.sprite(0, 0, 'background');
        this.bg.width = this.game.width;
        this.bg.height = this.game.height;
        
        //set up game objects here
        MissileCommand.Game.planet = new MissileCommand.Planet(this.game);
        MissileCommand.Game.missileLauncher = new MissileCommand.MissileLauncher(this.game);
		MissileCommand.Game.difficultyManager = new MissileCommand.DifficultyManager(this.game, MissileCommand.Game.planet, MissileCommand.Game.missileLauncher);
        
        MissileCommand.Game.game.input.onDown.add(this.OnMouseClick, this);
        MissileCommand.Game.game.input.onDown.add(this.OnMouseHold, this);
        MissileCommand.Game.game.input.onUp.add(this.OnMouseRelease, this);
		
		this.scoreText = this.game.add.text(10, 10, "Score:" + MissileCommand.Game.planet.playerKills, { 
			font: "40px Motorwerk", 
			fill: "#999999"
		});
		
		this.ScoreForQuote = 20;
		this.reportPlayerScore();
    },
    
    update: function() {
		//Make sure that the background is behind everything
		this.game.world.sendToBack(this.bg);
		
        //do updating for gameobjects
        MissileCommand.Game.planet.update();
        MissileCommand.Game.missileLauncher.update();
		MissileCommand.Game.difficultyManager.update();

        //set the reticle to the mouse position every frame
        MissileCommand.Game.planet.aimAt(this.game.input.mousePointer.x, this.game.input.mousePointer.y);        
        
        //if the mouse is held down, fire at that position continuously
        if(game.input.activePointer.isDown)
            MissileCommand.Game.planet.holdAt(this.game.input.mousePointer.x, this.game.input.mousePointer.y);
		
		//update the score display
        this.scoreText.text = "Score:" + MissileCommand.Game.planet.playerKills + "  ";

		this.checkGameover();
    },
    OnMouseClick: function() {
        //if the mouse is clicked once, fire at that position once
        MissileCommand.Game.planet.clickAt(this.game.input.mousePointer.x, this.game.input.mousePointer.y);
    },
    OnMouseHold: function() {
        MissileCommand.Game.planet.holdAt(this.game.input.mousePointer.x, this.game.input.mousePointer.y);
    },
    OnMouseRelease: function() {
        MissileCommand.Game.planet.releaseAt(this.game.input.mousePointer.x, this.game.input.mousePointer.y);   
    },
	checkGameover: function() {
		if(MissileCommand.Game.planet.getHealth() <= 0)
		{
			MissileCommand.reportScore(this.score);
			this.game.state.start("Menu", true, true, {
				"player_score": 		MissileCommand.Game.planet.playerKills,
				"missiles_launched":	MissileCommand.Game.missileLauncher.totalMissilesLaunched,
				"weapon_stats":			MissileCommand.Game.planet.reportWeaponStats()
			});
		}
	},
	reportPlayerScore: function() {
		if(MissileCommand.Game.planet.playerKills == 0)
			MissileCommand.Quote.displayRandomQuote(this.game, 6000, new Phaser.Point(this.game.width/2, this.game.height/4*3));	
	}
}