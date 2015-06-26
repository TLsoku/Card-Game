function prepList(list){
    var filteredList = list;

    // Filters based on the creatures/spells/field checkboxes
    if (!document.getElementById('creatures').checked)
        filteredList = _.filter(filteredList, function(c) {return c.type != 'Creature';});
    if (!document.getElementById('spells').checked)
        filteredList = _.filter(filteredList, function(c) {return !c.type.match('Spell');});
    if (!document.getElementById('fields').checked)
        filteredList = _.filter(filteredList, function(c) {return c.type != 'Field';});

    // Sort based on the drop down menu.
    // TODO: Add more sort types?
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

    // Search based on the contents of the typed input.
    // TODO: Add more search types?
    var searchTerm = $('#filters input[type="text"]').val();
    if (searchTerm)
        filteredList = _.filter(filteredList, function(c) {
            
            var searchElement = document.getElementById("searchtype");
            var searchType = searchElement.options[searchElement.selectedIndex].text;
            
            switch (searchType) {
                case('Card Name'):
                    // Regex to filter cards based on name.  The typed string will match the
                    //  starts of words in the card's name (eg: 'maid' matches 'fairy maid')
                    return c.name.match(new RegExp('(?:^|\\s|\")' + searchTerm, 'i'));
                    break;
                case ('Card Text'):
                    // Regex to filter cards based on text.  The typed string will match the
                    //  starts of words in the card's text (eg: 'fairy' gives 'rin')
                    return c.text.match(new RegExp('(?:^|\\s|\")' + searchTerm, 'i'));
                    break;
                default:
                    break;
            }
        });

    // Pick just the card names out of the list for proper tiling
    return (_.pluck(filteredList, 'name'));
}


var DeckBuilder = {
    //Variables
    cards: allCards,
    details: $(".detailed"), //The canvas to draw magnifications on
    textRow: $("<p></p>").append($("<span class='name'></span>")).append($("<button class='more'> + </button>")).append($("<button class='less'> - </button>")).append($("<span class='amount'>1</span>")),
    deck: {},
    deckSize: 0,
    thumb: $("<div class='thumbnail' style='position: absolute; top:0; left:0;'> <img style='height:100%; width:100%'/> </div>"),
    cardPool: $("#cardpool"),

    // Refreshes the card pool based on search and filter criteria.
    refreshCardPool: function(){
        CardUtils.tileCards(this.cardPool, prepList(allCards));
    },

    //Adds a card to your deck.  If you have 4, do nothing instead of adding.
    // TODO: Make some sort of "couldn't add card, only 4 allowed" notification
    addToDeck: function(card){

        if (!this.deck[card.name])
            this.deck[card.name] = 1;
        else if (this.deck[card.name] == 4)
            return;
        else
            this.deck[card.name]++;

        // Update the deck size
        this.deckSize++;
        $("#count").html(this.deckSize);
    },

    // Remove a copy of a card from the deck, which shrinks the deck size
    removeFromDeck: function(card){
        if (!this.deck[card.name])
            return;
        else
            this.deck[card.name]--;

        if (this.deck[card.name] == 0)
            delete this.deck[card.name];

        this.deckSize--;
        $("#count").html(this.deckSize);
    },

    addToList: function(card){

        // If the card is already in the list, just increment the counter
        var inList = $('#deckListing .' + card.name.replace(/[\s'"]/g, ''));
        if (inList.length){
            inList.find(".amount").html(this.deck[card.name]);
            return;
        }

        // Otherwise, create a new row, give it the card name as a class and
        // Make it display magnified view on mouseover
        var newRow = this.textRow.clone(true).toggleClass(card.name.replace(/[\s'"]/g, ''));
        var t = this;
        newRow.find(".name").html(card.name)
            .mouseover(function(e) {CardUtils.magnifyCard(card, e.pageX+5, e.pageY+5);})
            .mouseout(function() {CardUtils.magnifyCard();});

        // Button for adding more copies
        newRow.find(".more").click(function() {
            t.addToDeck(card);
            if (t.deck[card.name] == 4)
                this.style.display = "none"; //Button disappears at 4 copies
            this.nextSibling.nextSibling.innerHTML = t.deck[card.name];
        });

        // Button for removing a copy
        newRow.find(".less").click(function() {
            t.removeFromDeck(card);

            // If there are less than 4, the add button should reappear
            if (t.deck[card.name] < 4)
                this.previousSibling.style.display = "inline";
            if (!t.deck[card.name])
                $(this).parent().remove();
            this.nextSibling.innerHTML = t.deck[card.name];
        });

        $("#deckListing").append(newRow);
    },

    // Clear the deck by removing all cards one at a time
    clear: function(){
        $("#deckListing").html('');
        for (var n in this.deck)
            for (var i = 0; i < this.deck[n]; i++)
                this.removeFromDeck(_.findWhere(allCards, {'name': n}));
    },

    // Save a deck on the server by sending a POST to /decksave with the stringified deck
    // Also saves it in localStorage for use in games
    save: function(name){
        localStorage[name] = JSON.stringify(this.deck);
        alert("Saved deck with name " + name);
        $.post("/decksave", JSON.stringify(this.deck));
    },

    // Load a deck by looking for a deck with that name in localStorage
    // TODO: Make it try to load from server as well?  Might need user accounts
    load: function(name){
        if (typeof localStorage[name] == undefined) return;

        // Clear whatever cards were in the deck before they pressed load
        this.clear();

        var toLoad = JSON.parse(localStorage[name]);
        for (n in toLoad){
            var addingCard = _.findWhere(allCards, {'name': n})
            for (var i = 0; i < toLoad[n]; i++){
                this.addToDeck(addingCard);
                this.addToList(addingCard);
            }
        }
    },
}

DeckBuilder.refreshCardPool();
$("#filters input[type='checkbox']").click(function(){DeckBuilder.refreshCardPool();});
$("#filters select").change(function(){DeckBuilder.refreshCardPool();});
$("#filters input[type='text']").on('input', function(){DeckBuilder.refreshCardPool();});

$("#save").click(function() { DeckBuilder.save($("#deckName").val());});
$("#load").click(function() { DeckBuilder.load($("#deckName").val());});

// Export to a text format for cockatrice.
// TODO: Decide if we still need this functionality and/or reformat the export
$("#export").click(function() {
    $("textarea").remove();
    var text ='';
    for (name in DeckBuilder.deck) {
        text += DeckBuilder.deck[name] + ' ' + name + '\n';
    }
    $("body").append($("<textarea>" + text + "</textarea>"));
});
