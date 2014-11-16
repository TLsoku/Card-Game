var CardUtils = {
    // Basic jquery skeleton for a card thumbnail, other thumbnails copy off this one
    thumb: $("<span class='thumbnail' > <img style='height:100%; width:100%' src=\
        '/images/cardBase.png'/>  <img class='cardart'/></span>"),

    // Give the proper attributes (image, mouseover) to a thumbnail by passing
    //  in the name of the card
    makeThumbnail: function(name) {
        var cardData = _.findWhere(allCards, {'name': name})
        , theCard = this.thumb.clone(true)
        , t = this;

        theCard.find("img.cardart").attr("src", cardData.image);
        // Spells get a different border
        if  (cardData.type.match("Spell"))
            theCard.find("img:first").attr("src", '/images/spellBase.png');
        theCard.mouseover(function(e) {t.magnifyCard(cardData, e.pageX+5, e.pageY+5);})
        .mouseout(function() {t.magnifyCard();})
        .click(function() {
            DeckBuilder.addToDeck(cardData);
            DeckBuilder.addToList(cardData);
        });
        return theCard;
    },

    // Creates a magnified image of a card at specified x and y coordinates.
    // Pass in a card from the JSON or a card name to display that card.
    // Call with no parameters or an undefined card to clear the magified display
    magnifyCard: function(card, x, y){
         var details = $("div.detailed");
         if (typeof card == "undefined") {
             details.css("display", "none");
             return;
         }
         if (typeof card == "string") card = _.findWhere(allCards, {'name': card});

         details.find("img").attr("src", card.image);
         details.find(".title").html(card.name);
         details.find(".description").html(card.text);
         details.css("display", "block");
         details.css({'top': y, 'left': x});
     },

    // Tiles cards from the list (in the order listed) in a div.
    // div should be a jquery selection of the div to tile within.
    // cardList should be a list of card names sorted in the order you want to display.
    tileCards: function(div, cardList) {
        var t = this;
        div.find(".thumbnail").remove();
        cardList.forEach(function(c) {
            div.append(t.makeThumbnail(c));
        });
    },

    // Function to create a card given the name and id, called from within
    //  the game.  Finds the card from the JSON data and calls the correct 
    //  constructor depending on whether it is a creature, field, or spell
    createCard: function(name, id){
        var template = _.find(allCards, function(c) {return c.name === name;});

        // If a template wasn't found, it must be a token rather than a card
        if (!template){
            var template = _.find(allTokens, function(c) {return c.name === name;});
            // TODO: Are tokens always creatures? Seems like a bad assumption
            if (template) return (new Creature(template));
            else return false;
        }
        if (template.type == "Creature") return (new Creature(template, id));
        else if (template.type == "Spell") return (new Spell(template, id));
        else if (template.type == "Field") return (new Field(template, id));
        else return false;
    },
}
