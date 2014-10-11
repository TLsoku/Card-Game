//------Sockets--------
var socket = io.connect();
socket.on('turn', function(data) {alert("your turn"); GAME.players[0].turn.start();});
socket.on('stats', function(data) {Display.updateStats(data);});
socket.on('addToField', function(card, id) {var card = CardUtils.createCard(card, id);  card.controller = GAME.players[1];  Display.addToField(card, false);});

socket.on('event', function(type){
    GAME.players[0].creatureEvents(type);
});
socket.on('died', function(id){
    var card = GAME.getCardByID(id);
    card.controller.removeFromCreatures(card);
});

socket.on('attack', function(attacker, target){
    alert(GAME.getCardByID(attacker).name + " is attacking " + GAME.getCardByID(target).name);

    //TODO: Choose an interceptor in here
    GAME.getCardByID(attacker).fight(GAME.getCardByID(target));
    socket.emit('intercept');
});

socket.on('intercept', function(interceptor) {
    interceptor = (interceptor ? GAME.getCardByID(interceptor) : interceptor);
    events.trigger('intercept', interceptor);
});

function endTurn(){
    GAME.players[0].turn.end();
    socket.emit('turn', 1);
}



//------Events----------

var events = $({});

function statsChanged(stats){
    Display.updateStats(stats);
    socket.emit('stats', stats);
}

//Sends a signal to other player to update the field when new cards appear on it
events.on('newCard', function(e, card) {
    Display.addToField(card, true);
    socket.emit('addToField', card.name, card.id);
});

//A bunch of events to update stats, separated by type in case they should be different later
events.on('resource', function(e, player) {statsChanged(player.getStats());});
events.on('life', function(e, player) {statsChanged(player.getStats());});
events.on('essence', function(e, player) {statsChanged(player.getStats());});
events.on('deck', function(e, player) {statsChanged(player.getStats());});

// Event that triggers on a variety of game events.  Will signal the other player it occured, as well as trigger the abilities
// for that event for all creatures you control.  Your creature abilities trigger before your opponent's.
events.on('event', function(e, type) {
    GAME.players[0].creatureEvents(type);
    socket.emit("event", type);
})

//Logging event, currently logs to console and chat
events.on('log', function(e, message) {$("div.chat").append($("<p>"+message+"</p>")); console.log(message);});

//Attack event, sends attack signal to other player
events.on('attack', function(e, attacker, target) {
   socket.emit("attack", attacker, target);
});
events.on('died', function(e, id) {
   socket.emit("died",id);
});

//------------- The Display, how things look on the screen and control of visual aspects ---------
var Display = {
details: $("#gameScreen .detailed"),
    thumbnail: null,
    init: function() {
        var t = this;
        var thumb = $("<div class='thumbnail'> <img style='height:100%; width:100%'/> </div>");
        thumb.mouseover(function() {t.showDetails($(this).data());})
            .mouseout(function() {t.showDetails();});
        this.thumbnail = thumb;
        $("<button> End turn </button>").appendTo($('.menubuttons')).click(endTurn);
    },
    addToHand: function(card){
        var t = this;
        var i = new Image();
        i.src = card.image;
        i.onload = function(){
            t.thumbnail.clone(true).appendTo($("#gameScreen .hand")).data(card)
                .click(function(e) {
                    if (!card.owner.turn.active) return false;
                    var playedSuccess = false;

                    //Play as an essence
                    if (e.ctrlKey) playedSuccess = card.owner.playAsPoint(card.id);
                    else if (e.altKey) playedSuccess = card.owner.playAsPower(card.id);
                    //Should be replaced with buttons at some point


                    else if (card instanceof Creature) playedSuccess = card.owner.playCreature(card.id);
                    else playedSuccess = card.owner.playSpell(card.id);
                    if (playedSuccess) t.removeFromHand(this);
                })
                .find("img").attr("src", card.image);
            t.positionThumbnails($("#gameScreen .hand"));
        };
    },
    removeFromHand: function(div){
        //Removes a card from your hand, passing in a div.  Doesn't have to be a card, since you remove by clicking something
        $(div).remove();
        this.positionThumbnails($("#gameScreen .hand"));
    },
    addToField: function(card, player){
        //Pass in a card and either true(player's side) or false(opponent's side)
        t = this;
        var $placement = $("#gameScreen .field." + (player ? "player" : "opponent")); //Div where the card should be placed
        (card.div = this.thumbnail.clone(true)).appendTo($placement).data(card)
            .find("img").attr("src", card.image);
        if (player) { //You can only use your own creatures to attack or use abilities
            card.div.click(function(e){
               if (card.attackCount == 0) GAME.chooseTarget(function(target){card.controller.attack(this, GAME.getCardByID(target.id));}, card);
            });
        }
        this.positionThumbnails($placement);
    },
    removeFromField: function(card){
        //Removes a card from the field
        card.div.remove();
        this.positionThumbnails($("#gameScreen .field.opponent"));
        this.positionThumbnails($("#gameScreen .field.player"));
    },
    showDetails: function(card) {
        //Pass in nothing to hide the details that are currently displaying

        if (card == undefined){
         this.details.css("display", "none");
         return;
        }
        this.details.find("img").attr("src", card.image);
        this.details.find(".title").html(card.name);
        this.details.find(".description").html(card.text);
        this.details.css("display", "block");
    },
    positionThumbnails: function($div){
        //Arranges cards in a div to prevent holes.
        $div.children("div").each(function(index){
            $(this).css("left", (index*10) + "%");
        });
    },
    showTargetting: function(){
        $(".field .thumbnail").toggleClass("glow", true).on("click.target", function(){
            events.trigger("target", $(this).data().id);
            $(".field .thumbnail").toggleClass("glow", false).off("click.target");
        });
    },
    updateStats: function(stats){
        var statContainer;
        if (stats.player == 'you') statContainer = $(".stats.player").html('');
        else if (stats.player == 'opponent') statContainer = $(".stats.opponent").html('');
        for (key in stats)
            statContainer.append($("<p>" + key + ":  " + stats[key] + "</p>"));
    }
}

var GAME = {
    cards: [],
    players: [],
    init: function() {
        if (!(localStorage['My deck'])) { //TODO: Let them load a deck of their choice
           alert("Save a deck with the name 'My deck' in order to play. (The default deck name)");
           location.href = '../deckbuilder/deck.html';
        }

events.trigger("log", "Use ctrl+click to play as a point essence.");
events.trigger("log", "Use alt+click to play as a power essence.");//TODO: remove

        var storedDeck = JSON.parse(localStorage['My deck']);

        //Create a card object for each thing in the deck
        var deck = [];
        for (name in storedDeck)
            for (var i = 0; i < storedDeck[name]; i++)
                deck.push(CardUtils.createCard(name));

        this.players.push(new Player(deck));
        this.players[0].points = 0;
        this.players[0].power = 0;
        this.players[0].draw(7);

        this.players.push(new Player());
    },
    chooseTarget: function(callback, context) { //Prompts the player to choose a target, then calls the callback function on the chosen target
        events.trigger("log", "choose a target");
        Display.showTargetting();
        events.one("target", function(event, id) {
            var target = GAME.getCardByID(id);
            callback.call(context,target);
            events.trigger("log", "Targetted " + target);
        });
    },
    promptChoice: (function() {
        //Makes a choice prompt box, has 3 arguments.
        //First is the text for the prompt
        //Second is an array of functions where the key is what is displayed on the button
        //Third is the context (this) for the called function
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

    // Makes a prompt to pay resources for an ability (points and power), has 5 arguments
    // First is the text for the prompt
    // Second is the cost of the ability
    // Third is the player who is paying for the ability
    // Fourth is a function that will be called if the payment is completed
    // Fifth is the context (value of this) within the called function.
    promptResourcePayment: (function() {

        var $paymentBox = $("<div style='background-color: white; border: thick solid black; position: absolute; left:35%; top: 30%; width: 30%; height: 20%; z-index:10'> </div>");
        var $paymentText = $("<div style='border: none; position:absolute; left:25%; top:35%;'> Here is the choice text </div>");
        var $paymentRow = $("<div style='border:none; position:absolute; top:50%; width: 100%; text-align:center;'></div>");
        var $payPoints = $("<input type='number' size='5' value='0' min='0'>");
        var $payPower = $("<input type='number' size='5' value='0' min='0'>");

        var $buttonsRow = $("<div style='border:none; position:absolute; top:65%; width: 100%; text-align:center;'></div>");
        var $confirmButton = $("<button> Confirm </button>");
        var $cancelButton = $("<button> Cancel </button>");

        $paymentRow.append(($("<span>Point amount:</span>")).append($payPoints));
        $paymentRow.append(($("<span>  Power amount:</span>")).append($payPower));
        $buttonsRow.append($confirmButton).append($cancelButton);

        $paymentBox.append($paymentText).append($paymentRow).append($buttonsRow);

        return function(text, cost, player, effect, context) {

            $("#shader").css("display", "block");
            $paymentText.html(text);

            $confirmButton.click(function() {
                    var pointsPaid = parseInt($payPoints.val(), 10);
                    var powerPaid = parseInt($payPower.val(),10);
                    if (pointsPaid <= player.points && pointsPaid  >= 0 && powerPaid >= 0 && powerPaid <= player.power && pointsPaid + powerPaid == cost) {
                        player.points -= pointsPaid;
                        player.power -= powerPaid;
                        effect.call(context);
                        $("#shader").css("display", "none");
                        $paymentBox.remove();
                        events.trigger("madeChoice")
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
    // Currently not complete: Waits 3 seconds rather than for user input during choices.
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
}
Display.init();
GAME.init();
