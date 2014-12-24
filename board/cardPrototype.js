// The base card that other cards are made from

function Card(original, id) { //Object to represent a card.  Pass in the original card object from the cards data file
    this.name = original.name;
    this.cost = original.cost;
    this.text = original.text;
    this.image = original.image;
    this.controller; //Variable to store the controller of the card, only valid while it is in play
    this.state = "";

    //Stores special functions related to the card, such as what happens on ETB, death, EoT, etc
    this.func = original.special || [];
    Card.cardInitCount++;

    // Each card generated on your side gets a unique positive ID number.  Each card generated on the opponent's side gets a unique negative
    //  number.   This makes it easy to specify a card when messaging from player to player.
    this.id = id || Card.cardInitCount;
    this.owner; //Stores the owner of the card, valid regardless of where the card is
    GAME.cards.push(this);
}

// Placeholder for being able to concatenate cards with strings or console.log(card)
Card.prototype.toString = function(){
    return "A card called " + this.name;
}

//TODO: Was considering adding triggers like this, but decided on another way to do it.  Still in here just in case I need to go back to this old way
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

    //TODO: Implement spells.  For now, TESTING: MOST SPELLS ARE A TEST SPELL
    this.text = "Deal 20 damage to target creature.";
    this.effect = function() {GAME.chooseTarget(function(target) {this.dealDamage(target, 20);}, GAME.findCreature(), this);};
    
    if (original.text) this.text = original.text;
    if (original.effect) {
        this.effect = original.effect;
    }
}

Spell.prototype = Object.create(Card.prototype);

Spell.prototype.play = function() {
    this.effect();
    events.trigger("log", "Played a " + this.name);
}

Spell.prototype.dealDamage = function(target, amount) {
    if (target instanceof Creature) {
        target.takeDamage(GAME.damageFromSpell(amount));
    }
}

//
//  Field prototype

function Field(original){
    Card.call(this, original);
    //this.effect = original.effect;

    this.text = "Field: currently not implemented unless Youkai Mountain and some other testing stuff.";
}

Field.prototype = Object.create(Card.prototype);

Field.prototype.play = function() {
    this.state = "board";
    events.trigger("log", this.owner.name + " played a " + this.name);
    if (this.func["play"])
        this.func["play"].call(this);
}

// Returns a function that controls what happens to the field during an event.
// See triggerTypes.txt for a work-in-progress list of trigger names.

Field.prototype.handleEvent = function(eventType){
    var c = this;
    if (c.func[eventType])
        return function(){return c.func[eventType].call(c);};
    return false;
}

Field.prototype.toString = function() {
    return this.name + ":  costs " + this.cost;
}

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
    this.attackCount = 0; //How many times the creature has attacked this turn.  Resets every turn.
    this.maxAttacks = 1;
    this.intercepts = 0;
    this.maxIntercepts = 1;
    this.interceptDamageRate = 0.5;
    
    if (original.takeDamage) this.takeDamage = original.takeDamage;
    if (original.onCreatureDamage) this.onCreatureDamage = original.onCreatureDamage;
    if (original.maxIntercepts) this.maxIntercepts = original.maxIntercepts;
    if (original.interceptDamageRate) this.interceptDamageRate = original.interceptDamageRate;
}

Creature.prototype = Object.create(Card.prototype); //Inheriting line

Creature.prototype.fight = function(opp) {
    // Sometimes, taking damage affects the creatures' attack.
    // Example: "Whenever this creature is dealt damage, it gets +5/+0."
    // Since both creatures are supposed to deal damage at the same time,
    // save their old attack value
    var currentAttack = this.atk;
    var oppAttack = opp.atk;
    
    events.trigger("log", this.name + " and " + opp.name + " fight!");
    
    this.takeDamage(GAME.damageFromCreature(oppAttack));
    opp.takeDamage(GAME.damageFromCreature(currentAttack));
}

Creature.prototype.intercept = function(opp) {
    // Sometimes, taking damage affects the creatures' attack.
    // Example: "Whenever this creature is dealt damage, it gets +5/+0."
    // Since both creatures are supposed to deal damage at the same time,
    // save their old attack value
    var currentAttack = this.atk;
    var oppAttack = opp.atk;
    
    events.trigger("log", this.name + " intercepts " + opp.name + "!");
    this.intercepts += 1;
    
    this.takeDamage(GAME.damageFromCreature(oppAttack));
    opp.takeDamage(Math.floor(GAME.damageFromCreature(currentAttack) * this.interceptDamageRate));
}

Creature.prototype.takeDamage = function(amount) {
    this.HP = this.HP - GAME.damageToCreature(amount);
    if (this.HP <= 0)
        this.die();
    events.trigger("creatureDamage", this, GAME.damageToCreature(amount));
}

Creature.prototype.heal = function(amount) {
    var beforeHealLife = this.HP;
    var afterHealLife = Math.min(this.maxHP, this.HP += GAME.healToCreature(amount));
    this.HP = afterHealLife;
    
    // note this is different from takeDamage because a creature can take any amount of damage, but a creature
    // can only be healed up to its maximum health (and thus would be considered as that much heal)
    events.trigger("creatureHeal", this, afterHealLife - beforeHealLife);
}

// this is blank, but each individual creature may have a special function
// to call when ANY creature is damaged (which is used on creatureDamage event)
// TODO: add source of damage/heal
Creature.prototype.onCreatureDamage = function(creatureDamaged, amount) {
}
Creature.prototype.onCreatureHeal = function(creatureHealed, amount) {
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
    this.state = "board";
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
