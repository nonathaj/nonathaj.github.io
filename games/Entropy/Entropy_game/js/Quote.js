MissileCommand.Quote = function(obj){
	for (var prop in obj) this[prop] = obj[prop];	//copy all properties from the object into our quote
}

MissileCommand.Quote.prototype.toString = function() {
    var string = "\"";        
    string += this.text + '\"\n\t\t\t\t\t\t\t\t\t\t\t~ ' + this.author;        
    if(this.date)
        string += ", " + this.date;
    return string;
}

MissileCommand.Quote.getRandomQuote = function() {
	if(MissileCommand.Quote.quotes.length == 0)
		MissileCommand.Quote.loadQuotesFromServer();
	
	return MissileCommand.Quote.quotes[Math.floor(Math.random() * MissileCommand.Quote.quotes.length)];
}

MissileCommand.Quote.loadQuotesFromServer = function() {
	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "other/quotes.json", true);
	txtFile.onreadystatechange = function() {
		if (txtFile.readyState === 4) { 
			if (txtFile.status === 200) {
				contents = txtFile.responseText;
				console.log(contents);
				quoteJSON = JSON.parse(contents || "null");
				for(var x = 0; x < quoteJSON.quotes.length; x++)
				{
					new MissileCommand.Quote(quoteJSON.quotes[x]);
				}
				console.log("fdsafds");
			}
		}
	}
	txtFile.send(null);
}

MissileCommand.Quote.displayRandomQuote = function(game, displayLengthInSeconds, displayPos) {
	if(displayPos == undefined)
		displayPos = new Phaser.Point(game.world.centerX, game.world.centerY);
	
	//create the text to represent the quote
	var quoteText = game.add.text(displayPos.x, displayPos.y, MissileCommand.Quote.getRandomQuote(), {
		font: "40px Motorwerk",
		fill: 'white', 
		stroke: "white",
		align: "left",
		wordWrap: true,
		wordWrapWidth: game.width * .9
	});
	quoteText.anchor.setTo(.5, .5);

	//display the quote for a few seconds
	game.time.events.add(displayLengthInSeconds, function(quoteText){quoteText.destroy();}, this, quoteText);
	return quoteText;
}

MissileCommand.Quote.quotes = Object.freeze([
	new MissileCommand.Quote({
		"author":"Carl Jung",
		"text":"In all chaos there is a cosmos, in all disorder a secret order.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Buddha",
		"text":"Chaos is inherent in all compounded things. Strive on with diligence.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Anton Chekhov",
		"text":"Only entropy comes easy.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"M. C. Escher",
		"text":"We adore chaos because we love to produce order.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Friedrich Nietzsche",
		"text":"One must still have chaos in oneself to be able to give birth to a dancing star.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Deepak Chopra",
		"text":"In the midst of movement and chaos, keep stillness inside of you.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Henry Miller",
		"text":"Chaos is the score upon which reality is written.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Will Durant",
		"text":"Civilization begins with order, grows with liberty and dies with chaos.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Bob Dylan",
		"text":"I accept chaos, I'm not sure whether it accepts me.",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Douglas Hostadter",
		"text":"It turns out that an eerie type of chaos can lurk just behind a facade of order - and yet, deep inside the chaos lurks an even eerier type of order",
		"date":""
	}),
	new MissileCommand.Quote({
		"author":"Henry Brooks",
		"text":"Chaos often breeds life, when order breeds habit",
		"date":""
	}),
]);
