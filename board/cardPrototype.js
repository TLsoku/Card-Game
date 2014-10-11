// The base card that other cards are made from

function Card(original, id) { //Object to represent a card.  Pass in the original card object from the cards data file
    this.name = original.name;
    this.cost = original.cost;
    this.text = original.text;
    this.image = original.image;

    //Stores special functions related to the card, such as what happens on ETB, death, EoT, etc
    this.func = original.special || [];
    Card.cardInitCount++;

    // Each card generated on your side gets a unique positive ID number.  Each card generated on the opponent's side gets a unique negative
    //  number.   This makes it easy to specify a card when messaging from player to player.
    this.id = id || Card.cardInitCount;
    this.owner; //Stores the owner of the card, valid regardless of where the card is
    GAME.cards.push(this);
}

Card.prototype.toString = function(){
    return "A card called " + this.name;
}

//Was considering adding triggers like this, but decided on another way to do it.  Still in here just in case I need to go back to this old way
/*Card.prototype.addTriggers = function(){
    var t = this;
    for (ev in t.func)
        events.on(ev + '.' +  t.id , function(){t.func[ev].call(t);});
}

Card.prototype.removeTriggers = function(){
    for (ev in t.func)
        events.off(ev + '.' + this.id);
}*/

Card.cardInitCount = 0;

//
//  Spell prototype

function Spell(original){
    Card.call(this, original);
    //this.effect = original.effect;

    //TESTING: ALL SPELLS ARE A TEST SPELL
    this.text = "Deal 20 damage to target creature.";
    this.effect = function() {GAME.chooseTarget(function(target) {this.dealDamage(target, 20);}, GAME.findCreature(), this);};
}

Spell.prototype = Object.create(Card.prototype);

Spell.prototype.play = function() {
    this.effect();
    events.trigger("log", "Played a " + this.name);
}

Spell.prototype.dealDamage = function(target, amount) {
    target.takeDamage(amount);
}

//
//  Field prototype

function Field(original){
    Card.call(this, original);
    //this.effect = original.effect;

    this.text = "Field: currently not implemented.";
}

Field.prototype = Object.create(Card.prototype);

Field.prototype.play = function() {
    events.trigger("log", "Played a " + this.name);
}

//
//  Creature prototype
//
//  Creature prototype

function Creature(original, id) { //Object to represent a single Creature in the game.  Inherits from Card.
    /* name: The Creature's name
     * maxHP: The Creature's max hp
     * atk: The Creature's attack
     * special: The functions that should be called for special events: ETB, death, EoT, etc
     */

    Card.call(this, original, id); //Calls parent constructor

    this.maxHP = original.defense;
    this.HP = original.defense;
    this.atk = original.attack;
    this.state = "";
    this.controller; //Variable to store the controller of the creature, only valid while it is in play
    this.attackCount = 0; //How many times the creature has attacked this turn.  Resets every turn.
    this.intercepts = 0;
    this.maxIntercepts = 1;
}

Creature.prototype = Object.create(Card.prototype); //Inheriting line

Creature.prototype.fight = function(opp) {
    events.trigger("log", this.name + " and " + opp.name + " fight!");
    this.takeDamage(opp.atk);
    opp.takeDamage(this.atk);
}

Creature.prototype.intercept = function(opp) {
    events.trigger("log", this.name + " intercepts " + opp.name + "!");
    this.intercepts += 1;
    this.takeDamage(opp.atk);
    opp.takeDamage(Math.floor(this.atk/2));
}

Creature.prototype.takeDamage = function(amount) {
    this.HP = this.HP - amount;
    if (this.HP <= 0)
        this.die();
}

Creature.prototype.die = function() {
    if (this.func["die"] != undefined){  //Has a special death function which should specify eventual state and other things
        events.trigger("log", this.name + " had a special death");
        this.state = this.func["die"].call(this) || "graveyard"; //Special death function can return a state for the creature to be in (eg: kaguya)
    }
    else {
        this.state = "graveyard";
        this.controller.removeFromCreatures(this);
    }

    events.trigger("log", this.name + " has died");
    events.trigger("died", this.id);
}

Creature.prototype.play = function(){
    this.state = "field";
    events.trigger("log", this.owner.name + " played a " + this.name);
    if (this.func["play"])
        this.func["play"].call(this);
}

/*
Old way of checking for creature triggers, no longer in use but kept in case the new way hits a snag somewhere
Creature.prototype.turnEnd = function() {
    if (this.func["end"])
        this.func["end"].call(this);
}
*/
// Returns a function that controls what happens to the creature during an event.
// See triggerTypes.txt for a work-in-progress list of trigger names.

Creature.prototype.handleEvent = function(eventType){
    var c = this;
    if (c.func[eventType])
        return function(){return c.func[eventType].call(c);};
    return false;
}

Creature.prototype.toString = function() {
    return this.name + ":  " + this.atk + " attack, " + this.HP + "/" + this.maxHP + " health.  Costs " + this.cost;
}
