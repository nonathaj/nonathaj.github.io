
MissileCommand.TextDisplay = function(game){
    this.game = game;
};

MissileCommand.TextDisplay.prototype = {
	
	init: function(nextState, text, lengthToDisplay) {
		this.nextState = nextState;
		this.text = text;
		this.lengthToDisplay = lengthToDisplay ? lengthToDisplay : 6000;
	},
    
    preload: function() {
        //load game assets here
        imagesFolder = "images/";
        this.game.load.image('background', imagesFolder + 'space.jpg');
    },
    
    create: function() {
        //in the future we'll create buttons to start the game here.
        // for now we will just display a quote and start the game
        this.bg = this.game.add.sprite(0, 0, 'background');
        this.bg.width = this.game.width;
        this.bg.height = this.game.height;
		
		//create the text to represent the quote
		var quoteText = this.game.add.text(this.game.width/2, this.game.height/2, this.text, {
			fontSize: "32px",
			fill: 'white', 
			stroke: "white",
			align: "left",
			wordWrap: true,
			wordWrapWidth: this.game.width * .9
		});
		quoteText.anchor.setTo(.5, .5);
        this.game.input.onDown.add(this.startNextState, this);
		this.game.time.events.add(this.lengthToDisplay, this.startNextState, this);
    },
    startNextState: function() {
		this.game.state.start(this.nextState);
    }
}