//------Sockets--------
var socket = io.connect();
socket.on('turn', function(data) {alert("your turn"); GAME.players[0].turn.start();});
socket.on('stats', function(data) {Display.updateStats(data);});
socket.on('addToField', function(card) {var card = GAME.createCard(card);  card.controller = GAME.players[1];  Display.addToField(card, false);});

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

function packCard(card){  //Removes circular references from card so it can be passed to the other player across sockets
    newCard = jQuery.extend({}, card, {controller: "opponent", owner: "opponent", div: null}); //Clone object but remove circular references
    return newCard;
}

//Sends a signal to other player to update the field when new cards appear on it
events.on('newCard', function(e, card) {
    Display.addToField(card, true);
    socket.emit('addToField', card.name);
});

//A bunch of events to update stats, separated by type in case they should be different later
events.on('resource', function(e, player) {statsChanged(player.getStats());});
events.on('life', function(e, player) {statsChanged(player.getStats());});
events.on('essence', function(e, player) {statsChanged(player.getStats());});
events.on('deck', function(e, player) {statsChanged(player.getStats());});

//Logging event, currently logs to console and chat
events.on('log', function(e, message) {$("div.chat").append($("<p>"+message+"</p>")); console.log(message);});



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
                        if (e.ctrlKey) playedSuccess = card.owner.playAsPoint(card);
                        else if (e.altKey) playedSuccess = card.owner.playAsPower(card);
                        //Should be replaced with buttons at some point


                        else if (card instanceof Creature) playedSuccess = card.owner.playCreature(card);
                        else playedSuccess = card.owner.playSpell(card);
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
            console.log($(this));
            events.trigger("target", $(this).data());
            $(".field .thumbnail").toggleClass("glow", false);
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
Display.init();

var GAME = {
    cards: [],
    players: [],
    init: function() {
        if (!(localStorage['My deck'])) {
           alert("Save a deck with the name 'My deck' in order to play. (The default deck name)");
           location.href = '/deck.html';
        }

        var storedDeck = JSON.parse(localStorage['My deck']);

        //Create a card object for each thing in the deck
        var deck = [];
        for (name in storedDeck)
            for (var i = 0; i < storedDeck[name]; i++)
                deck.push(this.createCard(name));

        this.players.push(new Player(deck));
        this.players[0].points = 0;
        this.players[0].power = 0;
        this.players[0].draw(7);

        this.players.push(new Player());
    },
    chooseTarget: function(callback, context) { //Prompts the player to choose a target, then calls the callback function on the chosen target
        events.trigger("log", "choose a target");
        Display.showTargetting();
        events.one("target", function(event, target) {callback.call(context,target); events.trigger("log", "Targetted " + target); }); //Simulates waiting for user input by pausing for 2 seconds
    },
    promptChoice: (function() {
        //Makes a choice prompt box, has 4 arguments.
        //First is the text for the prompt
        //Second is an array of functions where the key is what is displayed on the button
        //Third is the context (this) for the called function
        //Fourth is a function to get called after the choice, regardless of what it is.  Optional.
        var $choiceBox = $("<div style='background-color: white; border: thick solid black; position: absolute; left:35%; top: 30%; width: 30%; height: 20%; z-index:10'> </div>");
        var $choiceText = $("<div style='border: none; position:absolute; left:25%; top:35%;'> Here is the choice text </div>");
        var $buttonsRow = $("<div style='border:none; position:absolute; top:60%; width: 100%; text-align:center;'></div>");

        $choiceBox.append($choiceText).append($buttonsRow);
        return function(text, choices, context, after) {

            $("#shader").css("display", "block");
            $choiceText.html(text);
            $buttonsRow.html("");

            _.keys(choices).forEach(function(choice) {
                //Creates a bunch of buttons, each one calling one of the passed functions.
                $button = $("<button style='margin: 5px;  display: inline; '>" + choice + "</button>");
                $button.click(function() { choices[choice].call(context);  after && after();});
                $button.click(function() {$("#shader").css("display", "none"); $choiceBox.remove();});
                $buttonsRow.append($button);
            });

            $("body").append($choiceBox);
        }
    })(),
    createCard: function(name){
        var template = _.find(allCards, function(c) {return c.name === name;});
        if (template.type == "Creature") return (new Creature(template));
        else return (new Spell(template));
    }
}
GAME.init();
