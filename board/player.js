//Object to represent a player in the game.

function Player(deck, name) {
    this.hand = [];
    this.creatures=[];
    this.fields=[];
    this.name = name || "Test Player";

    //Create the deck, shuffle it, and set all the cards owners
    this.deck = deck || [];
    this.deck = _.shuffle(this.deck);
    _.each(this.deck, function(card){
        card.owner = this;
    }, this);

    this.pointEssences = [];
    this.powerEssences = [];

    // NOTE: Points and power are initialized in GAME.init in board.js
    this.points = 0;
    this.power = 0;
    this.life = 100;

    this.turn = {
        player: this,
        active: false,
        start: function() {
            this.active = true;
            this.player.upkeep();
            // number of extra essences (of any type) the player can play this turn
            this.player.extraPlayableEssences = 0;
            
            // number of essences (of each type) the player can play this turn
            this.player.pointEssencesPlayable = 1;
            this.player.powerEssencesPlayable = 1;
            $(".menubuttons button").css("display", "block"); //TODO: A bit of display code in here, should probably get moved
        },
        end: function() {
            this.active = false;
            $(".menubuttons button").css("display", "none");
        }
    }
}

// What happens on the player's upkeep:
//  Points and power increased by number of essences
//  Creatures intercept and attack count is reset to 0
//  Trigger an event to trigger upkeep effects on your cards and opponent's stuff
//  Draw a card, update stats by triggering resource change
Player.prototype.upkeep = function(){
    this.points += this.pointEssences.length;
    this.power += this.powerEssences.length;

    if (this.creatures) this.creatures.forEach(function(c) {c.attackCount = 0; c.intercepts = 0;});
    events.trigger("event", "upkeep");

    this.draw(1);

    events.trigger("resource", this);
}

// Draws a card, adds it to your hand
// TODO: Maybe this should return a card, and caller should decide what to do with it?  Makes it more flexible for where the drawn card ends up
Player.prototype.draw = function(number) {
    for (var i = 0; i < number; i++){
        if (this.deck.length == 0) {console.log("out of deck"); return;} //TODO: Something should happen when you deck out?
        var nextCard = this.deck.shift();
        this.addToHand(nextCard);
    }
    events.trigger("deck", this);
}

// Pass in a card object to add it to the player's hand and update the display
Player.prototype.addToHand = function(card){
    card.state = "hand";
    this.hand.push(card);
    Display.addToHand(card);
}

// Removes a card from the player's hand.  TODO: Some sort of warning if the card was not in hand?
Player.prototype.removeFromHand = function(card) {  //Removes the specified card from the player's hand
    this.hand = _.without(this.hand, card);
}

// TODO: Playing as power/point essence could maybe be condensed into 2 functions instead of 4


// Plays a card as a point resource.  Note: Refers to actually playing the card from your hand
Player.prototype.playAsPoint = function(id) {
    if (this.pointEssencesPlayable <= 0 && this.extraPlayableEssences <= 0) return false; //Can only play one point resource per turn
    var card = GAME.getCardByID(id);
    this.removeFromHand(card);
    if (this.pointEssencesPlayable <= 0)
        this.extraPlayableEssences--;
    else
        this.pointEssencesPlayable--;
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


// Plays a card as a power resource.  Note: Refers to actually playing the card from your hand
Player.prototype.playAsPower = function(id) {
    if (this.powerEssencesPlayable <= 0 && this.extraPlayableEssences <= 0) return false;
    var card = GAME.getCardByID(id);
    this.removeFromHand(card);
    if (this.powerEssencesPlayable <= 0)
        this.extraPlayableEssences--;
    else
        this.powerEssencesPlayable--;
    this.addPowerToBoard(card);
    return true;
}

//Puts a card onto the board as a power resource.  NOTE: Not the same as playing a power resource from hand.
Player.prototype.addPowerToBoard = function(card){
    card.state = "land";
    this.powerEssences.push(card);
    events.trigger("essence", this);
}

// Adds a card to a player's list of creatures
Player.prototype.addToCreatures = function(card) {
    if (!(card instanceof Creature)) {
        events.trigger("log", "Tried to add " + card + " to creatures!  error");
    }
    card.state = "board";
    card.controller = this;
    this.creatures.push(card);
    events.trigger("newCard", card);
    //TODO: See if this can be safely removed (instead of just commented) card.addTriggers();
}

// Adds a card to a player's list of fields
Player.prototype.addToFields = function(card) {
    if (!(card instanceof Field)) {
        events.trigger("log", "Tried to add " + card + " to fields!  error");
    }
    card.state = "board";
    card.controller = this;
    this.fields.push(card);
    events.trigger("newCard", card);
}

// Removes a card from a player's list of creatures
// TODO: Maybe some state on the creature should be changed as well?
Player.prototype.removeFromCreatures = function(card) {
    this.creatures = _.without(this.creatures, card);
    Display.removeFromBoard(card);
    //card.removeTriggers();
}

// Play a creature.  Removes the creature from your hand and adds it to creatures,
//  assuming you can afford it.  Returns true if you played it, false otherwise.
// TODO: Generalize this to play creatures that aren't in your hand?  
Player.prototype.playCreature = function(id) {
    var card = GAME.getCardByID(id);
    if (this.points >= card.cost) { //Have enough to play the card
        this.points -= card.cost;
        this.removeFromHand(card);
        this.addToCreatures(card);
        card.play();
        events.trigger("resource", this);
        return true;
    }
    events.trigger("log", "not enough points to play " + card.name);
    return false;
}

// Play a spell.  Removes the spell from your hand and adds it to spells,
//  assuming you can afford it.  Returns true if you played it, false otherwise.
// TODO: Generalize this to play spells that aren't in your hand?  
Player.prototype.playSpell = function(id) {
    var card = GAME.getCardByID(id);
    if (this.power >= card.cost) {//Have enough to play the card
        this.power -= card.cost;
        this.removeFromHand(card);
        card.play();
        events.trigger("resource", this);
        return true;
    }
    events.trigger("log", "not enough power to play " + card.name);
    return false;
}

// Play a field.  Removes the field from your hand and adds it to fields,
//  assuming you can afford it.  Gives the option to play with points or power.
// TODO: Generalize this to play fields that aren't in your hand?  
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
                
                // i dont think this is necessary
                return true;
            },
            this, true);
    }
    else
    {
        events.trigger("log", "Not enough resources to play " + card.name);
    }
}

// Declaring an attack, waiting for an intercept event to decide what will fight
// attacker and target should both be cards
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

// Makes a player gain an amount of life.  Triggers a life event to update stats
Player.prototype.gainLife = function(amount){
    this.life += amount;
    events.trigger("life", this);
}

// Convert info about a player to a string so you can console.log(player)
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
