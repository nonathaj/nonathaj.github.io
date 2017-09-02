
MissileCommand.Menu = function(game){
    this.game = game;
	this.game_stats = null;
};

MissileCommand.Menu.prototype = {
	
	init: function(game_stats) {
		if(game_stats != undefined)
		{
			this.game_stats = game_stats;
		}
	},    
    preload: function() {
        //load game assets here
        imagesFolder = "images/";
        this.game.load.image('background', imagesFolder + 'space.jpg');
        this.game.load.image('logo', imagesFolder + 'entropyLogo.png');
        this.game.load.image('play_button', imagesFolder + 'play_button.png');
        this.game.load.image('menu_cursor', imagesFolder + 'BasicReticle.png');
    },
    create: function() {
        //in the future we'll create buttons to start the game here.
        // for now we will just display a quote and start the game
        this.bg = this.game.add.sprite(0, 0, 'background');
        this.bg.width = this.game.width;
        this.bg.height = this.game.height;
		
		this.logo = this.game.add.sprite(this.game.width/2, this.game.world.height/3, 'logo');
		this.logo.anchor.setTo(.5, .5);
		
		this.play_button = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'play_button', this.goToGame, this);
		this.play_button.anchor.setTo(.5, .5);
		this.play_button.scale.setTo(.2);
        
		this.cursor = this.game.add.sprite(100, 100, "menu_cursor");
    	this.cursor.anchor.setTo(.5, .5);
		this.cursor.scale.setTo(.5);
		
		if(this.game_stats != null)
		{
			this.logo.y = this.game.height/6;
            this.play_button.y = this.game.height/6 * 2;
			this.stats_text = this.game.add.text(this.game.width/2, this.game.height/2, this.getGameStatsText(), {
				font: "40px Motorwerk",
				fill: 'white', 
				stroke: "white",
				align: "left",
				wordWrap: true,
				wordWrapWidth: this.game.width * .9
			});
			this.stats_text.anchor.setTo(.5, 0);
		}
		else
		{
			//create the text to represent the quote
			var quoteText = this.game.add.text(this.game.world.centerX, this.game.height/4*3, MissileCommand.Quote.quotes[0], {
				font: "40px Motorwerk",
				fill: 'white', 
				stroke: "white",
				align: "left",
				wordWrap: true,
				wordWrapWidth: this.game.width * .9
			});
			quoteText.anchor.setTo(.5, .5);	
		}
    },
    update: function() {
		if(this.play_button.visible)
		{
			this.cursor.x = this.game.input.mousePointer.x;
			this.cursor.y = this.game.input.mousePointer.y;
		}
    },
    goToGame: function() {
		this.game.state.start("Game", true, true);
        //this.game.state.start("TextDisplay", true, true, "Game", MissileCommand.Quote.getRandomQuote().toString());
    },
	getGameStatsText: function() {
		var stats_string = "Previous Game Stats\n------------------------------\n";
		stats_string += "Score: " + this.game_stats.player_score + "\n";
		stats_string += "Enemies Launched: " + this.game_stats.missiles_launched + "\n";
		for (var weapon_name in this.game_stats.weapon_stats)
		{
			stats_string += weapon_name + " kills: " + this.game_stats.weapon_stats[weapon_name] + "\n";
		}
		return stats_string;
	}
}