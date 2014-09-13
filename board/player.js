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
            $(".menubuttons button").css("display", "block");
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
    var turnStartAbilities = [];
    this.creatures.forEach(function(creature) {turnStartAbilities.push(creature.turnStart());});
    GAME.sequentialAbilityTriggers(turnStartAbilities);
    this.draw(1);
    events.trigger("resource", this);
}

Player.prototype.draw = function(number) {
    for (var i = 0; i < number; i++){
        var nextCard = this.deck.shift();
        this.addToHand(nextCard);
    }
    events.trigger("deck", this);
}

Player.prototype.addToHand = function(card){ //Adds a card to a player's hand.  Pass in the card (creature or spell) as a variable
    card.state = "hand";
    this.hand.push(card);
    Display.addToHand(card);
}

Player.prototype.removeFromHand = function(card) {  //Removes the specified card from the player's hand
    this.hand = _.without(this.hand, card);
}

Player.prototype.playAsPoint = function(card) { //Plays a card as a points resource
    if (this.playedPoints) return false; //Can only play one point resource per turn
    this.removeFromHand(card);
    this.playedPoints = true;
    this.addPointToField(card);
    return true;
}

//Puts a card onto the field as a point resource.  NOTE: Not the same as playing a point resource from hand.
Player.prototype.addPointToField = function(card){
    card.state = "land";
    this.pointEssences.push(card);
    events.trigger("essence", this);
}

Player.prototype.playAsPower = function(card) { //Plays a card as a power resource
    if (this.playedPower) return false;
    this.removeFromHand(card);
    this.playedPower = true;
    this.addPowerToField(card);
    return true;
}

//Puts a card onto the field as a power resource.  NOTE: Not the same as playing a power resource from hand.
Player.prototype.addPowerToField = function(card){
    card.state = "land";
    this.powerEssences.push(card);
    events.trigger("essence", this);
}

Player.prototype.addToCreatures = function(card) {
    card.state = "field";
    card.controller = this;
    this.creatures.push(card);
}

Player.prototype.removeFromCreatures = function(card) {
    this.creatures = _.without(this.creatures, card);
    Display.removeFromField(card);
}

Player.prototype.playCreature = function(card) {
    if (this.points >= card.cost) {//Have enough to play the card
        this.points -= card.cost;
        this.removeFromHand(card);
        this.addToCreatures(card);
        events.trigger("newCard", card);
        card.play();
        events.trigger("resource", this);
        return true;

    }
    else
        events.trigger("log", "not enough points to play " + card.name);
}

Player.prototype.playSpell = function(card) {
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
    return "HAND: \n" + this.hand.join("\n") + "\nFIELD: \n" + this.creatures.join("\n") + "\nPoints: " + this.points + "\tPower: " + this.power;
}

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
