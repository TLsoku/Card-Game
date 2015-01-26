//------Sockets--------
var socket = io.connect();

socket.on('turn', function(data) {
    alert("your turn");
    GAME.yourTurn = true;
    GAME.players[0].turn.start();
});

socket.on('stats', function(data) {Display.updatePlayerStats(data);});

socket.on('addToBoard', function(card, id) {
    console.log(card + " -- " + id);
    var card = CardUtils.createCard(card, id);
    card.controller = GAME.players[1];
    Display.addToBoard(card, false);
});

socket.on('event', function(type){
    GAME.players[0].creatureEvents(type);
    GAME.players[0].fieldEvents(type);
});

socket.on('died', function(id){
    var card = GAME.getCardByID(id);
    card.controller.removeFromCreatures(card);
});

socket.on('attack', function(a, t){
    var attacker = GAME.getCardByID(a);
    var target = GAME.getCardByID(t);
    alert(attacker.name + " is attacking " + target.name);

    GAME.chooseTarget(function(interceptor){
        if (interceptor == target){
            socket.emit('combat', {intercept: false, attackerID: attacker.id, targetID: target.id});
            target.fight(attacker);
        }
        else {
            interceptor.intercept(attacker);
            socket.emit('combat', {intercept: true, attackerID: attacker.id, targetID: interceptor.id});
        }
        Display.updateCreatureStats(attacker);
        Display.updateCreatureStats(interceptor);
    }, GAME.findInterceptor(), attacker);
});

socket.on('combat', function(data) {
    var attacker = GAME.getCardByID(data.attackerID);
    var target = GAME.getCardByID(data.targetID);
    if (data.intercept)
        target.intercept(attacker);
    else
        target.fight(attacker);
    Display.updateCreatureStats(attacker);
    Display.updateCreatureStats(target);
});

socket.on('updateCreature', function(id, changes) {
    var card = GAME.getCardByID(id);
    
    // merge
    $.extend(card, changes);
    
    Display.updateCreatureStats(card);
});



//------Events----------

var events = $({});

function statsChanged(stats){
    Display.updatePlayerStats(stats);
    socket.emit('stats', stats);
}

// Whenever a creature is damaged, run through all creatures on the board and
// call their "onCreatureDamage"  method which is the special actions they need
// to take whenever any creature is damaged
events.on('creatureDamage', function(e, creatureDamaged, amount) {
    GAME.players[0].creatures.forEach(function (creature) {
        if (creature.onCreatureDamage) {
            creature.onCreatureDamage(creatureDamaged, amount);
        }
    });
    GAME.players[1].creatures.forEach(function (creature) {
        if (creature.onCreatureDamage) {
            creature.onCreatureDamage(creatureDamaged, amount);
        }
    });
    events.trigger("updateCreature", [creatureDamaged, {HP: creatureDamaged.HP}]);
});

events.on('creatureHeal', function(e, creatureHealed, amount) {
    GAME.players[0].creatures.forEach(function (creature) {
        if (creature.onCreatureHeal) {
            creature.onCreatureHeal(creatureHealed, amount);
        }
    });
    GAME.players[1].creatures.forEach(function (creature) {
        if (creature.onCreatureHeal) {
            creature.onCreatureHeal(creatureHealed, amount);
        }
    });
    events.trigger("updateCreature", [creatureHealed, {HP: creatureHealed.HP}]);
});

//Sends a signal to other player to update the board when new cards appear on it
events.on('newCard', function(e, card) {
    Display.addToBoard(card, true);
    console.log(card.name + "  -- " + card.id);
    socket.emit('addToBoard', card.name, card.id);
});

events.on('updateCreature', function(e, card, changes) {
    Display.updateCreatureStats(card);
    socket.emit('updateCreature', card.id, changes);
});

//A bunch of events to update stats, separated by type in case they should be different later
events.on('resource', function(e, player) {statsChanged(player.getStats());});
events.on('life', function(e, player) {statsChanged(player.getStats());});
events.on('essence', function(e, player) {statsChanged(player.getStats());});
events.on('deck', function(e, player) {statsChanged(player.getStats());});
events.on('playerDamage', function(e, player) {statsChanged(player.getStats());});

// Event that triggers on a variety of game events.  Will signal the other player
//  it occured, as well as trigger the abilities for that event for all creatures
//  you control.  Your creature abilities trigger before your opponent's.
events.on('event', function(e, type) {
    GAME.players[0].creatureEvents(type);
    GAME.players[0].fieldEvents(type);
    socket.emit("event", type);
})

//Logging event, currently logs to console and chat
events.on('log', function(e, message) {
    $("div.chat").append($("<p>"+message+"</p>"));
     console.log(message);
});

//Attack event, sends attack signal to other player
events.on('attack', function(e, attacker, target) {
   socket.emit("attack", attacker, target);
});

events.on('died', function(e, id) {
   socket.emit("died",id);
});

function endTurn(){
    GAME.players[0].turn.end();
    GAME.yourTurn = false;
    socket.emit('turn', 1);
}

//------------- The Display, how things look on the screen and control of visual aspects ----
var Display = {
    details: $("#gameScreen .detailed"),
    thumbnail: null,
    init: function() {
        var t = this;
        var thumb = $("<div class='thumbnail'> <img style='height:100%; width:100%'/> <span></span> </div>");
        thumb.mouseover(function() {t.showDetails($(this).data());})
            .mouseout(function() {t.showDetails();});
        this.thumbnail = thumb;
        $("<button> End turn </button>").appendTo($('.menubuttons')).click(endTurn);
    },

    // Adds the visual for a card to your hand, and sets up click handlers for it
    // TODO: Click handlers in a separate function rather than inline?
    addToHand: function(card){
        var t = this;
        var i = new Image();
        i.src = card.image;
        i.onload = function(){
            t.thumbnail.clone(true).appendTo($("#gameScreen .hand")).data(card)
                .click(function(e) {
                    if (!card.owner.turn.active) return false;
                    var playedSuccess = false;
                    var that = this;
                    card.clickInHand(function(){console.log(that); t.removeFromHand(that);});
/*
                    //Play as an essence
                    if (e.ctrlKey) playedSuccess = card.owner.playAsPoint(card.id);
                    else if (e.altKey) playedSuccess = card.owner.playAsPower(card.id);
                    //TODO: Playing essences should be done with drag and click
                    
                    else playedSuccess = card.owner.playCard(card);
  */                  if (playedSuccess) t.removeFromHand(this);
                })
                .find("img").attr("src", card.image);
            t.positionThumbnails($("#gameScreen .hand"));
        };
    },

    // Removes the visual for a card from your hand, passing in a div.  Doesn't have to be a card, since you remove by clicking something
    removeFromHand: function(div){
        $(div).remove();
        this.positionThumbnails($("#gameScreen .hand"));
    },

    // Pass in a card and either true(player's side) or false(opponent's side) to
    //  put the card onto that player's field
    addToBoard: function(card, player){
        t = this;
        var $placement = $("#gameScreen .board." + (player ? "player" : "opponent")); //Div where the card should be placed
        (card.div = this.thumbnail.clone(true)).appendTo($placement).data(card)
            .find("img").attr("src", card.image);
        if (player) { //You can only use your own creatures to attack or use abilities
            card.div.click(function(e){
               if (GAME.yourTurn && card.attackCount < card.maxAttacks) GAME.chooseTarget(function(target){card.controller.attack(this, GAME.getCardByID(target.id));}, GAME.findOppCreature(), card);
            });
        }
        
        // if it's a Creature card, show stats
        if (card instanceof Creature)
        {
            this.updateCreatureStats(card);
        }
        this.positionThumbnails($placement);
    },

    // Removes the visual for a card from the board
    // TODO: Why does this take a card, while removeFromHand takes a div?
    removeFromBoard: function(card){
        card.div.remove();
        this.positionThumbnails($("#gameScreen .board.opponent"));
        this.positionThumbnails($("#gameScreen .board.player"));
    },

    // Shows details about a card (eg: large version of the card displayed as a sort of pop up)
    //Pass in nothing to hide the details that are currently displaying
    showDetails: function(card) {

    // TODO: Maybe give details a class rather than directly manipulating css
        if (card == undefined){
            this.details.css("display", "none");
            return;
        }

        this.details.find("img").attr("src", card.image);
        this.details.find(".title").html(card.name);
        this.details.find(".description").html(card.text);
        this.details.css("display", "block");
    },

    // Arranges cards in a div to prevent holes.
    // Pass in a div or the jquery selection of a div to position its children
    positionThumbnails: function($div){
        THUMBNAIL_SIZE = 10; //Thumbnails are 10% width of parent

        if (!($div instanceof jQuery)) $div = $($div);

        $div.children("div.thumbnail").each(function(index){
            $(this).css("left", (index*THUMBNAIL_SIZE) + "%");
        });
    },

    // Highlights cards for targetting and binds a target event to them
    // Valid targets: A list of the IDs of all cards which should get the targetting highlight
    showTargetting: function(validTargets){
        $(".board .thumbnail").each(function(){
            var $this = $(this);
            if (_.contains(validTargets, $this.data().id))
                $this.toggleClass("glow", true).on("click.target", function(){
                    events.trigger("target", $this.data().id);
                    $(".board .thumbnail").toggleClass("glow", false).off("click.target");
                });
            });
    },

    // Updates the display of a player's stats
    // TODO: Change to match more visual stat display (once that's done)
    updatePlayerStats: function(stats){
        var statContainer;
        if (stats.player == 'you') statContainer = $(".stats.player").html('');
        else if (stats.player == 'opponent') statContainer = $(".stats.opponent").html('');
        for (key in stats)
            statContainer.append($("<p>" + key + ":  " + stats[key] + "</p>"));
    },

    // Updates the display of a  creature's stats, call whenever stats change
    // TODO: Display creature stats in a nice format instead of just text on the card
    updateCreatureStats: function(card){
        card.div.find("span").html(card.atk + " -- " + card.HP + "/" + card.maxHP);
    }
}




//------------- The GAME object, stores general data (players, cards) and provides game related utility ----

var GAME = {
    cards: [],
    players: [],
    yourTurn: false,
    damageToCreatureRate: 1.0,
    damageToCreatureFlat: 0.0,
    damageFromCreatureRate: 1.0,
    damageFromCreatureFlat: 0.0,
    damageFromSpellRate: 1.0,
    damageFromSpellFlat: 0.0,
    damageToPlayerRate: 1.0,
    damageToPlayerFlat: 0.0,
    
    healToCreatureRate: 1.0,
    
    // these are arrays of creatures that we call their special function
    // whenever a certain "general" event occurs
    // eg. "Whenever a creature is dealt damage" or "Whenever a creature dies"
    whenCreatureDies: [],
    
    init: function() {
        if (!(localStorage['My deck'])) { //TODO: Let them load a deck of their choice
           alert("Save a deck with the name 'My deck' in order to play. (The default deck name)");
           location.href = '../deckbuilder/deck.html';
        }

        // TODO: Remove these instructions once playing essences is improved
        events.trigger("log", "Use ctrl+click to play as a point essence.");
        events.trigger("log", "Use alt+click to play as a power essence.");

        var storedDeck = JSON.parse(localStorage['My deck']);

        // Create a card object for each thing in the deck
        var deck = [];
        for (name in storedDeck)
            for (var i = 0; i < storedDeck[name]; i++)
                deck.push(CardUtils.createCard(name));
        
        // Sets up initial values for yourself (hand, resources)
        this.players.push(new Player(deck));
        this.players[0].points = 100; // for testing purposes
        this.players[0].power = 100;
        this.players[0].draw(7);

        // Add a second player (opponent) but don't give him any stats yet
        this.players.push(new Player());
    },

    // These functions determine how much damage are dealt from creatures/spells to creatures/players
    //
    // Examples:
    // "Creatures deal 2x damage" would modify damageFromCreatureRate
    // "Creatures take 2x damage" would modify damageToCreatureRate
    // "All damage is doubled" would modify damageRate
    // "Whenever a spell deals damage, it deals 5 more damage" would modify damageFromSpellFlat
    //
    // NOTE: damageRate is only calculated when to a creature or player, so that they are not
    //       double-counted when calculating from a creature or spell
    //
    // TODO: Implement calculations of Flat constants. However, to do so, need to
    //       first implement order of operations (aka stack). I also think we'll
    //       eventually need even more of these, like "damageFromCreatureToPlayer"
    //       eg. "Whenever a creature deals damage to a player, 4x damage!!"
    
    damageToCreature: function(amount) {
        return amount * this.damageToCreatureRate;
    },
    damageFromCreature: function(amount) {
        return amount * this.damageFromCreatureRate;
    },
    damageFromSpell: function(amount) {
        return amount * this.damageFromSpellRate;
    },
    damageToPlayer: function(amount) {
        return amount * this.damageToPlayerRate;
    },
    
    
    healToCreature: function(amount) {
        return amount * this.healToCreatureRate;
    },
    
    // Prompt the player to choose a target and call the callback function on the chosen target
    // callback is the function to call, will be passed the target as a parameter
    // validTargets is an array of cards which can be targetted
    // context will be the value of "this" in the callback function
    chooseTarget: function(callback, validTargets, context) { 
        if (!validTargets) return; // No targets = no prompt or highlighting.
        events.trigger("log", "choose a target");
        Display.showTargetting(validTargets);

        // Clicking a possible target triggers the "target" event, which is bound
        //  here with "events.one" so that the following lines happen only once
        events.one("target", function(event, id) {
            var target = GAME.getCardByID(id);
            callback.call(context,target);
            events.trigger("log", "Targetted " + target);
        });
    },

    //Makes a choice prompt box, has 3 arguments.
    //First is the text for the prompt
    //Second is an array of functions where the key is what is displayed on the button
    //Third is the context (this) for the called function
    promptChoice: (function() {
        // TODO: CSS should be separated from these choice boxes instead of inline
        var $choiceBox = $("<div style='background-color: white; border: thick solid black; position: absolute; left:35%; top: 30%; width: 30%; height: 20%; z-index:10'> </div>");
        var $choiceText = $("<div style='border: none; position:absolute; left:25%; top:35%;'> Here is the choice text </div>");
        var $buttonsRow = $("<div style='border:none; position:absolute; top:60%; width: 100%; text-align:center;'></div>");

        $choiceBox.append($choiceText).append($buttonsRow);
        return function(text, choices, context) {

            $("#shader").css("display", "block");
            $choiceText.html(text);
            $buttonsRow.html("");

            _.keys(choices).forEach(function(choice) {
                //Creates a bunch of buttons, each one calling one of the passed functions.
                $button = $("<button style='margin: 5px;  display: inline; '>" + choice + "</button>");
                $button.click(function() {
                    choices[choice].call(context);
                    $("#shader").css("display", "none");
                    $choiceBox.remove();
                    events.trigger("madeChoice")
                });
                $buttonsRow.append($button);
            });

            $("body").append($choiceBox);
        }
    })(),

    // Makes a prompt to pay resources for an ability (points and power), has 6 arguments
    // First is the text for the prompt
    // Second is the cost of the ability
    // Third is the player who is paying for the ability
    // Fourth is a function that will be called if the payment is completed
    // Fifth is the context (value of this) within the called function.
    // Sixth is purity, true = can only pay with 1 resource, false = can pay with mix of both resources
    promptResourcePayment: (function() {

        // TODO: CSS should be separated from these choice boxes instead of inline
        var $paymentBox = $("<div style='background-color: white; border: thick solid black; position: absolute; left:35%; top: 30%; width: 30%; height: 20%; z-index:10'> </div>");
        var $paymentText = $("<div style='border: none; position:absolute; left:25%; top:35%;'> Here is the choice text </div>");
        var $paymentRow = $("<div style='border:none; position:absolute; top:50%; width: 100%; text-align:center;'></div>");
        var $payPoints = $("<input type='number' size='5' value='0' min='0'>");
        var $payPower = $("<input type='number' size='5' value='0' min='0'>");

        var $buttonsRow = $("<div style='border:none; position:absolute; top:65%; width: 100%; text-align:center;'></div>");
        var $confirmButton = $("<button> Confirm </button>");
        var $cancelButton = $("<button> Cancel </button>");

        $paymentRow.append(($("<span>Point amount:</span>")).append($payPoints));
        $paymentRow.append(($("<span>Power amount:</span>")).append($payPower));
        $buttonsRow.append($confirmButton).append($cancelButton);

        $paymentBox.append($paymentText).append($paymentRow).append($buttonsRow);

        return function(text, cost, player, effect, context, purity) {

            $("#shader").css("display", "block");
            $paymentText.html(text);

            $confirmButton.click(function() {
                var pointsPaid = parseInt($payPoints.val(), 10);
                var powerPaid = parseInt($payPower.val(),10);
                if (pointsPaid <= player.points && pointsPaid >= 0 && powerPaid >= 0 && powerPaid <= player.power && pointsPaid + powerPaid == cost) {
                    
                    // purity check
                    if (!purity || pointsPaid == cost || powerPaid == cost)
                    {
                        player.points -= pointsPaid;
                        player.power -= powerPaid;
                        effect.call(context);
                        $("#shader").css("display", "none");
                        $paymentBox.remove();
                        events.trigger("madeChoice");
                    }
                }
            });

            $cancelButton.click(function() {
                $("#shader").css("display", "none");
                $paymentBox.remove();
                events.trigger("madeChoice")
            });

            $("body").append($paymentBox);
        }
    })(),

    // Utility for calling a series of functions in a specified order, ensuring that they occur in that order
    // even if some require waiting for user input.
    // How to use: Pass in an array of functions of any size, in the order they should execute.
    //             Functions that require waiting for user input should return true, other functions should return false
    // Calling the function with no argument or an empty list will not cause crashes, but will have no effect.
    sequentialAbilityTriggers: (function(){

        function ability(effect, after, wait){
            if (wait)
                events.one("madeChoice", function(){var shouldWait = effect(); after && after(shouldWait);});
            else{
                var shouldWait = effect();
                after && after(shouldWait);
            }
        }

        return function(abilities){
            abilities = _.compact(abilities);
            if (!abilities || abilities.length == 0) return;
            var after = [];
            after[abilities.length-1] = null;
            for (var i = abilities.length-2; i >= 0; i--){
                after[i] = (function(i){return function(w){ability(abilities[i+1], after[i+1], w);};})(i);
            }
            ability(abilities[0],after[0], false);
        }
    })(),

    // Pass in an ID number for a card (each card gets a unique one), get back the card itself.  Simple.
    getCardByID: function(id){
        var foundCard = _.find(this.cards, function(c){return c.id == id;});
        if (foundCard) return foundCard;
        events.trigger("log", "Card with id " + id + " was not found.");
        return false;
    },

    // Used to made a function run a single time when clicking something.  
    // selector should be a jquery selector string for what should be clicked (e.g. '#board' or '.stats')
    // action should be a function which is called on click.  It takes no parameters.
    // It will glow until clicked, and then clicking will disable ALL glowing elements
    addSingleClick: function(selector, action){
        $(selector).toggleClass("glow", true).on("click.singleClick", function(){
            action();
            $(".glow").toggleClass("glow", false).off("click.singleClick");
        });
    },

    //Pass in a collection of cards (all, hand, creatures, etc) and a function that
    //      returns true for cards which should be targetable and false for ones that should not
    //      Alternatively, don't pass any function to find all the passed-in cards
    //This function will return a list of IDs for cards that match
    findTargets:  function(cards, f){
        if (typeof f == 'undefined')
            return _.pluck(cards, "id");
        return _.pluck(_.filter(cards, f), "id");
    },

    //------Some premade findTargets calls for common usage

    // Finds creatures you don't control
    findOppCreature: function(){
        return this.findTargets(this.cards, function(c) {return c.controller == GAME.players[1];});
    },

    // Finds creatures you control that are capable of intercepting
    findInterceptor: function(){
        return this.findTargets(this.players[0].creatures, function(c) {return c.intercepts < c.maxIntercepts;});
    },

    // Finds creatures, can pass in a function to filter further
    findCreature: function(f){
        if (f)
            return this.findTargets(this.cards, function(c) {return c instanceof Creature && f(c);});
        return this.findTargets(this.cards, function(c) {return c instanceof Creature;});
    },
}

Display.init();
GAME.init();
