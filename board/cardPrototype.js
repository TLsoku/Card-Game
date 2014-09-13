// The base card that other cards are made from

function Card(original) { //Object to represent a card.  Pass in the original card object from the cards data file
    this.name = original.name;
    this.cost = original.cost;
    this.text = original.text;
    this.image = original.image;

    this.owner; //Stores the owner of the card, valid regardless of where the card is
}

Card.prototype.toString = function(){
    return "A card called " + this.name;
}

//
//  Spell prototype

function Spell(original){  //Tentatively representing a spell
    Card.call(this, original);
    //this.effect = original.effect;

    //TESTING: ALL SPELLS ARE a test spell
    this.text = "Deal 20 damage to target creature.";
    this.effect = function() {GAME.chooseTarget(function(target) {this.dealDamage(target, 20);}, this);};
}

Spell.prototype = Object.create(Card.prototype);

Spell.prototype.play = function() {
    this.effect();
    events.trigger("log", "Played a " + this.name);
}

Spell.prototype.dealDamage = function(target, amount) {
    console.log(target);
    target.takeDamage(amount);
    console.log("dealt");
}

//
//  Creature prototype

function Creature(original, state) { //Object to represent a single Creature in the game.  Inherits from Card.
    /* name: The Creature's name
     * hp: The Creature's max hp
     * atk: The Creature's attack
     * state: Where the Creature is.  Graveyard, hand, field, exile, deck, maybe others
     * special: The functions that should be called for special events: ETB, death, EoT, etc
     */

    Card.call(this, original); //Calls parent constructor

    this.maxHP = original.defense;
    this.HP = original.defense;
    this.atk = original.attack;
    this.state = state || "";
    this.controller; //Variable to store the controller of the creature, only valid while it is in play

    //Stores special functions related to the Creature, such as what happens on ETB, death, EoT, etc
    this.func = original.special || [];
}

Creature.prototype = Object.create(Card.prototype); //Inheriting line

Creature.prototype.fight = function(opp) {
    events.trigger("log", this.name + " and " + opp.name + " fight!");
    this.takeDamage(opp.atk);
    opp.takeDamage(this.atk);

}

Creature.prototype.takeDamage = function(amount) {
    this.HP = this.HP - amount;
    if (this.HP <= 0)
        this.die();
}

Creature.prototype.die = function() {
    if (this.func["die"] != undefined)  //Has a special death function which should specify eventual state and other things
        this.state = this.func["die"].call(this);
    else {
        this.state = "graveyard";
        this.controller.removeFromCreatures(this);
    }

    events.trigger("log", this.name + " has died");
}

Creature.prototype.play = function(){
    this.state = "field";
    events.trigger("log", this.owner.name + " played a " + this.name);
    if (this.func["play"])
        this.func["play"].call(this);
}

Creature.prototype.turnEnd = function() {
    if (this.func["end"])
        this.func["end"].call(this);
}

//Returns a function that controls what happens to the creature at the start of the turn.
Creature.prototype.turnStart = function(){
    var c = this;    
    return function(){
        if (c.func["start"])
            return c.func["start"].call(c);
        return false;
    }
}

Creature.prototype.toString = function() {
    return this.name + ":  " + this.atk + " attack, " + this.HP + "/" + this.maxHP + " health.  Costs " + this.cost;
}
