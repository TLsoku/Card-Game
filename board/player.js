//Object to represent a player in the game.

function Player(deck) {
    /*  *
     *
     *
     *
     *
     */
    this.hand = [];
    this.creatures=[];
	this.fields=[];
    this.name = "Test Player";
    //Create the deck, shuffle it, and set all the cards owners
    this.deck = deck || [];
    this.deck = _.shuffle(this.deck);
    _.each(this.deck, function(card){
        card.owner = this;
    }, this);

    this.pointEssences = [];
    this.powerEssences = [];

    this.points = 0;
    this.power = 0;
    this.life = 100;

    this.turn = {
        player: this,
        active: false,
        start: function() {
            this.active = true;
            this.player.upkeep();
            this.player.playedPoints = false;
            this.player.playedPower = false;
            $(".menubuttons button").css("display", "block"); //A bit of display code in here, should probably get moved
        },
        end: function() {
            this.active = false;
            $(".menubuttons button").css("display", "none");
        }
    }

}

Player.prototype.upkeep = function(){
    this.points += this.pointEssences.length;
    this.power += this.powerEssences.length;
    if (this.creatures) this.creatures.forEach(function(c) {c.attackCount = 0; c.intercepts = 0;});
    events.trigger("event", "upkeep"); //Trigger an event for upkeep to signal other player and signal your own creatures
    this.draw(1);
    events.trigger("resource", this);
}

Player.prototype.draw = function(number) {
    for (var i = 0; i < number; i++){
        if (this.deck.length == 0) {console.log("out of deck"); return;} //Can't draw more than in your deck
        var nextCard = this.deck.shift();
        this.addToHand(nextCard);
    }
    events.trigger("deck", this);
}

Player.prototype.addToHand = function(card){ //Adds a card to a player's hand.  Pass in the card object as a variable (not just card name)
    card.state = "hand";
    this.hand.push(card);
    Display.addToHand(card);
}

Player.prototype.removeFromHand = function(card) {  //Removes the specified card from the player's hand
    this.hand = _.without(this.hand, card);
}

//
// Playing as power essence and point essence could maybe be condensed into 2 functions rather than 4

Player.prototype.playAsPoint = function(id) { //Plays a card as a points resource
    if (this.playedPoints) return false; //Can only play one point resource per turn
    var card = GAME.getCardByID(id);
    this.removeFromHand(card);
    this.playedPoints = true;
    this.addPointToBoard(card);
    return true;
}

// Puts a card onto the board as a point resource.  NOTE: Not the same as playing a point resource from hand.
// Playing a point resource from hand will use this, but also cards like Kanako.
Player.prototype.addPointToBoard = function(card){
    card.state = "land";
    this.pointEssences.push(card);
    events.trigger("essence", this);
}

Player.prototype.playAsPower = function(id) { //Plays a card as a power resource
    if (this.playedPower) return false;
    var card = GAME.getCardByID(id);
    this.removeFromHand(card);
    this.playedPower = true;
    this.addPowerToBoard(card);
    return true;
}

//Puts a card onto the board as a power resource.  NOTE: Not the same as playing a power resource from hand.
Player.prototype.addPowerToBoard = function(card){
    card.state = "land";
    this.powerEssences.push(card);
    events.trigger("essence", this);
}

Player.prototype.addToCreatures = function(card) {
    card.state = "board";
    card.controller = this;
    this.creatures.push(card);
    events.trigger("newCard", card);
    //card.addTriggers();
}

Player.prototype.addToFields = function(card) {
	card.state = "board";
	card.controller = this;
	this.fields.push(card);
	events.trigger("newCard", card);
}

Player.prototype.removeFromCreatures = function(card) {
    this.creatures = _.without(this.creatures, card);
    Display.removeFromBoard(card);
    //card.removeTriggers();
}

Player.prototype.playCreature = function(id) {
    var card = GAME.getCardByID(id);
    if (this.points >= card.cost) {//Have enough to play the card
        this.points -= card.cost;
        this.removeFromHand(card);
        this.addToCreatures(card);
        card.play();
        events.trigger("resource", this);
        return true;

    }
    else
        events.trigger("log", "not enough points to play " + card.name);
}

Player.prototype.playField = function(id) {
	var card = GAME.getCardByID(id);
	
	// First, check if it's possible to pay with either points or power. If it's possible,
	// then see how the player wants to pay it. They also have the option to cancel.
	if (this.points >= card.cost || this.power >= card.cost)
	{
		// note that we can send "this" for the player who is paying for it, since this is method under Player
		GAME.promptResourcePayment("You must pay (" + card.cost + ") for " + card.name + ".", card.cost, this,
			function()
			{
				// cost is handled by promptResourcePayment, so no need to do it here
				this.removeFromHand(card);
				this.addToFields(card);
				card.play();
				events.trigger("resource", this);
				return true;
			},
			this, true);
	}
	else
	{
		events.trigger("log", "Not enough resources to play " + card.name);
	}
}

Player.prototype.attack = function(attacker, target){
    attacker.attackCount += 1;
    events.trigger("event", "attack");
    events.trigger("attack", [attacker.id, target.id]);
    events.trigger("log", "Attacking " + target.name + " with " + attacker.name);
    events.one("intercept", function(event, interceptor){
        if (!interceptor){ //They chose not to intercept
            attacker.fight(target);
        }
        else {
            attacker.fight(interceptor);
        }
    });
}

Player.prototype.playSpell = function(id) {
    var card = GAME.getCardByID(id);
    if (this.power >= card.cost) {//Have enough to play the card
        this.power -= card.cost;
        this.removeFromHand(card);
        card.play();
        events.trigger("resource", this);
        return true;
    }

    else
        events.trigger("log", "not enough power to play " + card.name);
}

Player.prototype.gainLife = function(amount){
    this.life += amount;
    events.trigger("life", this);
}

Player.prototype.toString = function() {
    return "HAND: \n" + this.hand.join("\n") + "\nCREATURES: \n" + this.creatures.join("\n") + "\nPoints: " + this.points + "\tPower: " + this.power;
}

//Packs up a bunch of stats about the player so that they can update the display or be sent to the other player.
Player.prototype.getStats = function() {
    var stats = {};
    stats["hand size"] = this.hand.length;
    stats["points"] = this.points;
    stats["power"] = this.power;
    stats["point essences"] = this.pointEssences.length;
    stats["power essences"] = this.powerEssences.length;
    stats["life"] = this.life;
    stats["deck size"] = this.deck.length;
    stats["player"] = 'you';
    return stats;
}

//Triggers all the effects for a certain phase/event.  Has to be managed by the player rather than each individual creature to ensure correct order.
Player.prototype.creatureEvents = function(eventType) {
    var abilityList = [];
    this.creatures.forEach(function(creature) {abilityList.push(creature.handleEvent(eventType));});
    GAME.sequentialAbilityTriggers(abilityList);
}

//Triggers all the effects for a certain phase/event.  Has to be managed by the player rather than each individual field to ensure correct order.
Player.prototype.fieldEvents = function(eventType) {
    var abilityList = [];
    this.fields.forEach(function(field) {abilityList.push(field.handleEvent(eventType));});
    GAME.sequentialAbilityTriggers(abilityList);
}
