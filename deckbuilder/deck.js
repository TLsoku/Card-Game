function prepList(list){
    console.log('prep');
    var filteredList = list;

    //Filters
    if (!document.getElementById('creatures').checked)
        filteredList = _.filter(filteredList, function(c) {return c.type != 'Creature';});
    if (!document.getElementById('spells').checked)
        filteredList = _.filter(filteredList, function(c) {return !c.type.match('Spell');});
    if (!document.getElementById('fields').checked)
        filteredList = _.filter(filteredList, function(c) {return c.type != 'Field';});

    //Sort
    var sortType = $('#filters option:selected').html();
    switch (sortType) {
        case ('Alphabetical'):
            filteredList = _.sortBy(filteredList, function(c) {return c.name;});
            break;
        case ('Cost'):
            filteredList = _.sortBy(filteredList, function(c) {return c.cost;});
            break;
        default:
            break;
    }

    //Search
    var searchTerm = $('#filters input[type="text"]').val();
    console.log(searchTerm);
    if (searchTerm)
        filteredList = _.filter(filteredList, function(c) {return c.name.match(new RegExp('(?:^|\\s|\")' + searchTerm, 'i'));});
    return (_.pluck(filteredList, 'name'));
}

var d = $("#cardpool");	
CardUtils.tileCards(d,prepList(allCards));	

$("#filters input[type='checkbox']").click(function() { CardUtils.tileCards(d, prepList(allCards));});
$("#filters select").change(function() { CardUtils.tileCards(d, prepList(allCards));});
$("#filters input[type='text']").on('input',function() { CardUtils.tileCards(d, prepList(allCards));});

var DeckBuilder = {
    //Variables
cards: allCards,
       details: $(".detailed"), //The canvas to draw magnifications on
       textRow: $("<p></p>").append($("<span class='name'></span>")).append($("<button class='more'> + </button>")).append($("<button class='less'> - </button>")).append($("<span class='amount'>1</span>")),
       deck: {},
       deckSize: 0,
       thumb: $("<div class='thumbnail' style='position: absolute; top:0; left:0;'> <img style='height:100%; width:100%'/> </div>"),

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

makeCardList: function() {
                  var t = this;
                  allCards.forEach(function(card) {
                          $("<option>" + card.name + "</option>").appendTo($("select")).data(card);});
                  $("select").change(function() {
                          var choice = $(this).find("option:selected").data();
                          t.addToDeck(choice);
                          t.addToList(choice);
                          });

              },

addToDeck: function(card){
               if (!this.deck[card.name])
                   this.deck[card.name] = 1;
               else if (this.deck[card.name] == 4)
                   return;
               else
                   this.deck[card.name]++;

               //Add the card image to the tabletop, classed with its name for easy finding
               /*var theCard = this.thumb.clone(true);
                 theCard.css({"top": ((this.deckSize % 6) * 20), "left": (Math.floor(this.deckSize/6) * 130)});
                 theCard.toggleClass(card.name.replace(/[\s'"]/g, ''));
                 theCard.find("img").attr("src", card.image);
                 theCard.draggable({stack: ".thumbnail", containment: 'parent' });
                 $("#deckDisplay").append(theCard);*/
               this.deckSize++;
               $("#count").html(this.deckSize);
           },

removeFromDeck: function(card){
                    console.log(card);
                    if (!this.deck[card.name])
                        return;
                    else
                        this.deck[card.name]--;
                    if (this.deck[card.name] == 0)
                        delete this.deck[card.name];

                    $("#deckDisplay").find("." + card.name.replace(/[\s'"]/g, '') + ":first").remove();
                    this.deckSize--;
                    $("#count").html(this.deckSize);
                },

addToList: function(card){
               if ($('#deckListing .' + card.name.replace(/[\s'"]/g, '')).length) {
                   $('#deckListing .' + card.name.replace(/[\s'"]/g, '') + ' .amount').html(this.deck[card.name]);
               return;
           }
           var newRow = this.textRow.clone(true).toggleClass(card.name.replace(/[\s'"]/g, ''), true);
           var t = this;
           newRow.find(".name").html(card.name)
               .mouseover(function(e) {CardUtils.magnifyCard(card, e.pageX+5, e.pageY+5);})
               .mouseout(function() {CardUtils.magnifyCard();});

           newRow.find(".more").click(function() { //Button to add more copies, disappears at 4
                   t.addToDeck(card);
                   if (t.deck[card.name] == 4)
                   this.style.display = "none";
                   this.nextSibling.nextSibling.innerHTML = t.deck[card.name];
                   });

           newRow.find(".less").click(function() { //Button to remove copies, should make add button reappear or entire row disappear if last copy is removed
                   t.removeFromDeck(card);
                   if (t.deck[card.name] < 4)
                   this.previousSibling.style.display = "inline";
                   if (!t.deck[card.name])
                   $(this).parent().remove();
                   this.nextSibling.innerHTML = t.deck[card.name];
                   });
           $("#deckListing").append(newRow);

           },

clear: function(){
           $("#deckListing").html('');
           for (var n in this.deck)
               for (var i = 0; i < this.deck[n]; i++)
                   this.removeFromDeck(_.findWhere(allCards, {'name': n}));
       },

save: function(name){
          localStorage[name] = JSON.stringify(this.deck);
          alert("Saved deck with name " + name);
          $.post("decksave", JSON.stringify(this.deck));
      },

load: function(name){
          if (typeof localStorage[name] == undefined) return;

          var toLoad = JSON.parse(localStorage[name]);
          this.clear();
          for (n in toLoad) 
              for (var i = 0; i < toLoad[n]; i++){
                  var addingCard = _.findWhere(allCards, {'name': n})
                      this.addToDeck(addingCard);
                  this.addToList(addingCard);
              }
      }

}

var Deck = {
cards: [],
       addCard: function(){



       },
removeCard: function(){
                this.cards.splice()


            },
}

//DeckBuilder.makeCardList();
$("#save").click(function() { DeckBuilder.save($("#deckName").val());});
$("#load").click(function() { DeckBuilder.load($("#deckName").val());});
$("#export").click(function() { 
        $("textarea").remove();
        var text ='';
        for (name in DeckBuilder.deck) {
        text += DeckBuilder.deck[name] + ' ' + name + '\n';
        }
        $("body").append($("<textarea>" + text + "</textarea>"));
        });
