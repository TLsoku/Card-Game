var CardUtils = {

thumb: $("<span class='thumbnail' > <img style='height:100%; width:100%' src='/images/cardBase.png'/>  <img class='cardart'/></span>"),
       makeThumbnail: function(name) {
           var cardData = _.findWhere(allCards, {'name': name})
               , theCard = this.thumb.clone(true)
               , t = this;

           theCard.find("img.cardart").attr("src", cardData.image);
           if  (cardData.type.match("Spell")) theCard.find("img:first").attr("src", '/images/spellBase.png');
           theCard.mouseover(function(e) {t.magnifyCard(cardData, e.pageX+5, e.pageY+5);})
               .mouseout(function() {t.magnifyCard();})
               .click(function() { DeckBuilder.addToDeck(cardData); DeckBuilder.addToList(cardData);});
           return theCard;	
       },
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

tileCards: function(div, cardList) {
               //Cardlist should be sorted as desired for display, div should be jquery selection for the div to tile within
               var t = this;
               div.find(".thumbnail").remove();
               cardList.forEach(function(c) {
                       div.append(t.makeThumbnail(c));
                       });
           },
}
