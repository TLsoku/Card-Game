allCards = [{
    name: 'Alice',
    image: 'http://i.imgur.com/iLNGGFZ.jpg',
    type: 'Creature',
    cost: 5,
    attack: 0,
    defense: 15,
    text: 'Alice gets +5/+5 for each creature you control.\n(2): Create either a 0/15 Shield Doll token, or a 10/5 Sword Doll token that cannot intercept. Use this ability only once each turn.',
},{
    name: 'Ancient Book',
    image: 'http://i.imgur.com/F9Q6hJL.jpg',
    type: 'Creature',
    cost: 4,
    attack: 5,
    defense: 40,
    text: 'Whenever Ancient Book attacks and deals combat damage to a creature, it deals that much damage to all other creatures that opponent controls.\nAncient Book cannot be the target of spells or abilities.',
},{
    name: 'Aya',
    image: 'http://i.imgur.com/UFLI5qa.jpg',
    type: 'Creature',
    cost: 4,
    attack: 12,
    defense: 25,
    text: 'When Aya deals combat damage to a player, draw a card.',
},{
    name: 'Blue Oni Red Oni',
    image: 'http://i.imgur.com/gTKD76f.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Search your deck for a card with the same name as a creature on the battlefield, reveal it, and then put it into your hand.  Shuffle your deck afterwards.',
},{
    name: 'Blue Sign "Benevolent Orleans Dolls"',
    image: 'http://i.imgur.com/jguq8ax.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Create two 0/15 Shield Doll tokens.',
    effect: function() {
        this.controller.addToCreatures(CardUtils.createCard("Shield Doll"));
        this.controller.addToCreatures(CardUtils.createCard("Shield Doll"));
    },
},{
    name: 'Brilliant Dragon Bullet',
    image: 'http://i.imgur.com/P9wrlrE.jpg',
    type: 'Spell',
    cost: 'X',
    text: 'Choose one: Brilliant Dragon Bullet deals 2X damage to each creature your opponent controls or Brilliant Dragon Bullet deals 4X damage to target creature.\n',
},{
    name: 'Byakuren',
    image: 'http://i.imgur.com/VrNDDIL.jpg',
    type: 'Creature',
    cost: 10,
    attack: 20,
    defense: 40 ,
    text: 'Whenever another non-token creature you control would attack, you may skip that attack this turn. If you do, Byakuren can attack an additional time this turn.\nWhenever Byakuren would be dealt damage, you may sacrifice a non-token creature. If you do, prevent that damage.\n            ',
},{
    name: 'Cat\'s Walk',
    image: 'http://i.imgur.com/HgCaqAs.jpg',
    type: 'Spell',
    cost: 1,
    text: 'Draw 2 cards, then discard 2 cards.\n            ',
},{
    name: 'Chen',
    image: 'http://i.imgur.com/YsAaoE3.jpg',
    type: 'Creature',
    cost: 4,
    attack: 10,
    defense: 25,
    text: 'Chen can attack an additional time each turn.',
    
    maxAttacks: 2,
},{
    name: 'Cirno',
    image: 'http://i.imgur.com/PdVb0tf.jpg',
    type: 'Creature',
    cost: 2,
    attack: 5,
    defense: 25,
    text: 'When Cirno deals damage to a creature, that creature becomes frozen (they cannot use abilities, attack, or intercept until the end of their controller\'s next turn).\nDuring your turn, Cirno gets +5/+0.\n',
},{
    name: 'Curse of Dreams and Reality',
    image: 'http://i.imgur.com/bzOoHKj.jpg',
    type: 'Spell (Equip)',
    cost: 3,
    text: 'Equipped creature heals to full health at the end of each turn, and gets -X/-0, where X is the amount it healed.',
},{
    name: 'Daiyousei',
    image: 'http://i.imgur.com/XhjM88F.jpg',
    type: 'Creature',
    cost: 1,
    attack: 5,
    defense: 10,
    text: 'When Daiyousei enters the battlefield, creatures you control heal 7 health.\n(1): Target creature heals 5 health.  Use this ability only once each turn.\n            ',
},{
    name: 'Demon Binding Array',
    image: 'http://puu.sh/7V1ET.png',
    type: 'Spell (Equip)',
    cost: 4,
    text: 'Equipped creature cannot attack or use abilities.',
},{
    name: 'Diamond Dust',
    image: 'http://i.imgur.com/Mko8mVb.jpg',
    type: 'Field',
    cost: 3,
    text: 'Duration 3 (This enters the battlefield with 3 duration counters. Remove one at the start of each of your turns. When the last is removed, sacrifice this.)\nCreatures enter the battlefield frozen (they cannot use abilities, attack, or intercept until the end of their controller\'s turn).\n            ',
},{
    name: 'Drizzle',
    image: 'http://i.imgur.com/wj3AMPJ.png',
    type: 'Field',
    cost: 4,
    text: 'Whenever a player casts a spell, Drizzle deals 8 damage to that player\'s opponent. If there were at least two other spells played this turn, sacrifice Drizzle.\n            ',
},{
    name: 'Eientei',
    image: 'http://i.imgur.com/Wu5INxt.jpg',
    type: 'Field',
    cost: 7,
    text: 'The first time an opponent attacks each turn, negate the attack.\nCondition: Take over 25 damage in one turn.\n            ',
},{
    name: 'Erin',
    image: 'http://i.imgur.com/XWhhumz.jpg',
    type: 'Creature',
    cost: 12,
    attack: 18,
    defense: 45,
    text: 'At the end of your turn, creatures you control heal 10 health.\nWhenever a creature you control heals, that creature gets +2/+3.\n',
    special: {
        "end": function() {
                    var DAMAGE_HEALED = 10;
                    
                    this.creatures.forEach(function (creature) {
                        creature.heal(DAMAGE_HEALED);
                        events.trigger("creatureHeal", creature, DAMAGE_HEALED);
                    });
               }
    }
},{
    name: 'Evil Sealing Circle',
    image: 'http://i.imgur.com/fuduoi4.jpg',
    type: 'Spell',
    cost: 8,
    text: 'Exile target creature.',
},{
    name: 'Fairy Maid',
    image: 'http://i.imgur.com/MjlLKA9.jpg',
    type: 'Creature',
    cost: 2,
    attack: 10,
    defense: 35,
    text: '',
},{
    name: 'Fantasy Nature',
    image: 'http://i.imgur.com/9QP15TP.jpg',
    type: 'Spell',
    cost: 7,
    text: 'Sacrifice all creatures you control.  You cannot play creatures this turn.\nAt the beginning of your next turn, you gain 5 power, 5 points, and you draw 3 cards.',
},{
    name: 'Flandre',
    image: 'http://i.imgur.com/s3wSwcS.jpg',
    type: 'Creature',
    cost: 9,
    attack: 25,
    defense: 30,
    text: 'Discard a card: Create 3 10/5 Flan tokens that have "At the end of your turn, sacrifice this creature." Use this ability only once each turn.',
},{
    name: 'Freeze Sign "Perfect Freeze"',
    image: 'http://i.imgur.com/dPyeP0g.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Up to two target creatures are frozen (they cannot use abilities, attack, or intercept until the end of their controller\'s next turn). Freeze Sign "Perfect Freeze" deals 18 damage to those creatures if they are already frozen.',
},{
    name: 'Future "New History of Phantasm -Next History-"',
    image: 'http://puu.sh/6Dcw8.png',
    type: 'Spell',
    cost: 4,
    text: 'If you have attacked this turn, you cannot play this spell.  You may not attack this turn.\n            Draw 2 cards.\n            ',
},{
    name: 'Geyser Eruption',
    image: 'http://i.imgur.com/1vCquDn.jpg',
    type: 'Spell',
    cost: 4,
    text: 'You may sacrifice an essence instead of paying Geyser Eruption\'s power cost.\n            Geyser Eruption deals 25 damage to target creature.',
},{
    name: 'God\'s Rice Porridge',
    image: 'http://i.imgur.com/lPzGEJF.jpg',
    type: 'Spell',
    cost: 6,
    text: 'All creatures you control get +(X-5)/+10, where X is the number of essences you control.',
},{
    name: 'Hakugyokurou',
    image: 'http://i.imgur.com/rQ2TtfY.png',
    type: 'Field',
    cost: 9,
    text: 'Hakugyokurou enters the battlefield with 3 death counters on it.\nYou can play up to one creature card from your graveyard each turn. If a creature played this way would leave the battlefield, exile it instead and remove a death counter from Hakugyokurou.\nWhen Hakugyokurou has no death counters on it, sacrifice it.',
},{
    name: 'Hakurei Shrine',
    image: 'http://i.imgur.com/HdJFGrl.png',
    type: 'Field',
    cost: 13,
    text: 'At the end of your turn, if you control no creatures and your opponent controls at least 3 creatures, or if you have 25 or less life, you may search your or your opponent\'s deck for a card and exile it. Play the exiled card without paying for its costs. That player shuffles his or her deck.\nSkip your next turn: Destroy Hakurei Shrine. Any player may use this ability.',
},{
    name: 'Hell\'s Wheel of Pain',
    image: 'http://i.imgur.com/kpsiayG.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Hell\'s Wheel of Pain deals 15 damage to each creature.',
},{
    name: 'Hourai Elixir',
    image: 'http://i.imgur.com/R5GdXAS.jpg',
    type: 'Spell (Equip)',
    cost: 6,
    text: 'When equipped creature dies, its controller returns it to the battlefield under their control.(it loses all equips).',
},{
    name: 'Kaguya',
    image: 'http://i.imgur.com/VWAv6uh.jpg',
    type: 'Creature',
    cost: 8,
    attack: 20,
    defense: 35,
    text: '(4): Put 4 age counters on target creature. That creature gets Eternity (Whenever this creature would be dealt damage or is targeted by a spell or ability, negate it and remove an age counter. When the last is removed, sacrifice this creature.)\nWhen Kaguya dies, exile her with 4 time counters. At the beginning of your turn, remove a time counter. When the last is removed, return her to her owner\'s hand.',
},{
    name: 'Kanako',
    image: 'http://i.imgur.com/Q1ODNCc.jpg',
    type: 'Creature',
    cost: 11,
    attack: 27,
    defense: 50,
    text: 'At the beginning of your turn, put the top card of your deck into play as an essence.\nSacrifice an essence: Kanako deals 8 damage to target creature.\n',
    special:{
        "upkeep": function(){
            GAME.promptChoice("Turn the top card of your deck into an essence:", {
                "Point": function() {this.controller.addPointToBoard(this.controller.deck.shift());},
                "Power": function() {this.controller.addPowerToBoard(this.controller.deck.shift());}
            }, this);
            return true;
        }
    },
},{
    name: 'Keine',
    image: 'http://i.imgur.com/5lp7UtB.jpg',
    type: 'Creature',
    cost: 4,
    attack: 7,
    defense: 30,
    text: 'At the end of your turn, remove the top card of a target player\'s deck.\nWhenever you have no cards in your hand, transform Keine into a 15/40 EX-Keine that has "You may cast cards removed by EX-Keine as if they were in your hand." (transformation: changes stats and abilities but keeps all equips, debuffs etc.).  Ex-Keine heals to full health.',
},{
    name: 'Koakuma',
    image: 'http://i.imgur.com/AZAPZG5.jpg',
    type: 'Creature',
    cost: 3,
    attack: 5,
    defense: 20,
    text: 'When you draw a card for the first time on your turn, you may pay (2). If you do, draw a card.\n',
    special:{
        "upkeep": function(){
            GAME.promptResourcePayment("You may pay (2) to draw another card.", 2, this.controller,
                function() {this.controller.draw(1);},
            this, false);
            return true;
        }
    },
},{
    name: 'Koishi',
    image: 'http://i.imgur.com/2JhVExU.jpg',
    type: 'Creature',
    cost: 9,
    attack: 15,
    defense: 45,
    text: 'Your opponent plays with the top card of their deck revealed.\n(1): Your opponent puts the top card of their deck on the bottom of their deck.\nCards your opponent cast cost (1) more.\n',
},{
    name: 'Komachi',
    image: 'http://i.imgur.com/jw5PcPT.jpg',
    type: 'Creature',
    cost: 6,
    attack: 6,
    defense: 50,
    text: '(2): Average out the damage taken between Komachi and target creature. Remainder goes to that creature. Any damage increased is considered as unpreventable damage dealt by Komachi. Any damage decreased is considered as healing.',
},{
    name: 'Konnagara',
    image: 'http://i.imgur.com/xkjbtMu.jpg',
    type: 'Creature',
    cost: 6,
    attack: 12,
    defense: 35,
    text: 'Whenever a creature takes damage, Konnagara gets +1/+0.',
    onCreatureDamage: function(creatureDamaged, amount) {
        this.atk++;
        var attackChangeObj = {atk: this.atk};
        events.trigger("updateCreature", [this, attackChangeObj]);
    },
},{
    name: 'Kurumi',
    image: 'http://i.imgur.com/WGOMUSo.jpg',
    type: 'Creature',
    cost: 3,
    attack: 0,
    defense: 27,
    text: 'Put the top card of your deck into your graveyard: Kurumi heals 5 health. You may only use this ability once each turn.\nWhen Kurumi takes damage, she gains attack equal to half the health she lost, rounded down.\n            ',
    
    /*
    var origTakeDamage = takeDamage;
    takeDamage: function (source, amount) {
        var damage = origTakeDamage.call(this, source, amount);
        var INCREASE_ATTACK_RATE = 0.5;
        
        if (damage > 0) {
            this.atk += Math.floor(damage * INCREASE_ATTACK_RATE);
        }
    },*/
},{
    name: 'Letty',
    image: 'http://i.imgur.com/4Btmqxo.jpg',
    type: 'Creature',
    cost: 3,
    attack: 5,
    defense: 27,
    text: 'When Letty deals damage to a creature, that creature becomes frozen (they cannot use abilities, attack, or intercept until the end of their controller\'s next turn).\n(3): Target creature becomes frozen. Use this ability only once each turn. Letty cannot attack and use this ability within the same turn.',
},{
    name: 'Lingering Cold',
    image: 'http://i.imgur.com/PwcQLVB.jpg',
    type: 'Spell (Equip)',
    cost: 2,
    text: 'Equipped creature becomes Frozen after using an ability or after combat (they cannot use abilities, attack, or intercept until the end of their controller\'s turn).\nWhen equipped creature dies, you may return Lingering Cold to play equipped to target creature.',
},{
    name: 'Lunasa',
    image: 'http://i.imgur.com/y11NppM.jpg',
    type: 'Creature',
    cost: 3,
    attack: 9,
    defense: 19,
    text: 'Lunasa\'s name may be treated as "Prismriver".\nCreatures you control that have the same name as another creature you control get +3/+0.\n',
},{
    name: 'Lyrica',
    image: 'http://i.imgur.com/nOiO4Vf.jpg',
    type: 'Creature',
    cost: 3,
    attack: 9,
    defense: 19,
    text: 'Lyrica\'s name may be treated as "Prismriver".\nAt the end of your turn, creatures you control that have the same name as another creature you control heal 8 health.',
},{
    name: 'Magic Milky Way',
    image: 'http://i.imgur.com/gaSZkvd.jpg',
    type: 'Spell (Equip)',
    cost: 4,
    text: 'All creatures you control get +2/+5.',
},{
    name: 'Marisa',
    image: 'http://i.imgur.com/EZzjiqT.jpg',
    type: 'Creature',
    cost: 15,
    attack: 25,
    defense: 40,
    text: 'Whenever you cast a non-Equip spell, you may copy that spell. You may choose new targets for the copy. You may only copy one spell each turn. If it was a non-"Master Spark" spell, create a 5 power cost Master Spark spell card into your hand that has "Master Spark deals 35 damage to target creature."',
},{
    name: 'Medicine',
    image: 'http://i.imgur.com/e40YQfs.jpg',
    type: 'Creature',
    cost: 5,
    attack: 5,
    defense: 20,
    text: 'Whenever Medicine deals combat damage, if it was to a creature, that creature gains Poison 3 (Poisoned creatures lose health equal to their amount of poison at the end of each turn). Otherwise, if it was to a player, that player gains Poison 2 (at the end each turn, he or she loses life equal to his or her amount of poison).\nAt the end of your turn, creatures your opponents control gain Poison 1.\nMedicine is immune to Poison.',
},{
    name: 'Meiling',
    image: 'http://i.imgur.com/mvkL5Dp.jpg',
    type: 'Creature',
    cost: 3,
    attack: 9,
    defense: 35,
    text: 'Meiling can intercept an additional time each turn. \n            Meiling\'s damage is not reduced when intercepting.',
    
    maxIntercepts: 2,
    interceptDamageRate: 1.0,
},{
    name: 'Merlin',
    image: 'http://i.imgur.com/sR6S8Fs.jpg',
    type: 'Creature',
    cost: 3,
    attack: 9,
    defense: 19,
    text: 'Merlin\'s name may be treated as "Prismriver".\nCreatures you control that have the same name as another creature you control get +0/+10.',
},{
    name: 'Mind Stopper',
    image: 'http://i.imgur.com/zwKCXcD.jpg',
    type: 'Spell (Equip)',
    cost: 2,
    text: 'Equipped creature loses all abilities.\nAny other equips placed on this creature are immediately destroyed.',
},{
    name: 'Mokou',
    image: 'http://i.imgur.com/T0r3r8A.jpg',
    type: 'Creature',
    cost: 8,
    attack: 18,
    defense: 35,
    text: 'When Mokou dies, she deals damage equal to her power to each creature. Exile her with 4 time counters. At the beginning of your turn, remove a time counter. When the last is removed, return her to her owner\'s hand.\n',
    special: {
        "die": function(){
                    var ON_DEATH_DAMAGE = this.atk;
                    
                    this.controller.creatures.forEach(function (creature) {
                                        creature.takeDamage(ON_DEATH_DAMAGE);
                                        //events.trigger("creatureDamage", creature, creature.takeDamage(ON_DEATH_DAMAGE));
                                   });
                    return true;
               }
    },
},{
    name: 'Momiji',
    image: 'http://i.imgur.com/a9TdGpz.jpg',
    type: 'Creature',
    cost: 4,
    attack: 12,
    defense: 25,
    text: '(0): Until your next turn, Momiji deals only 5 damage during combat. In each combat, prevent 20 damage that would be dealt to Momiji. Momiji cannot attack and use this ability within the same turn.',
},{
    name: 'Moon Sign "Moonlight Ray"',
    image: 'http://i.imgur.com/cIsuKtE.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Moon Sign "Moonlight Ray" deals 15 damage to target creature.  If that creature was already damaged, Moonlight Ray deals 22 damage instead.',
    effect: function() {
                var DAMAGE = 15;
                var MAX_DAMAGE = 22;
                
                GAME.chooseTarget(function(target) {
                                    var damage;
                                    if (target.HP == target.maxHP) {
                                        damage = GAME.damageFromSpell(DAMAGE);
                                    }
                                    else {
                                        damage = GAME.damageFromSpell(MAX_DAMAGE);
                                    }
                                    this.dealDamage(target, damage);
                                    events.trigger("creatureDamage", target, damage); 
                                  },
                                  GAME.findCreature(), this);
            },
},{
    name: 'Mystia',
    image: 'http://i.imgur.com/a18rs8e.jpg',
    type: 'Creature',
    cost: 2,
    attack: 8,
    defense: 23,
    text: '(2): Until your next turn, target creature your opponent controls can only attack target creature you control as long as you control that creature.',
},{
    name: 'Nuclear Furnace',
    image: 'http://i.imgur.com/6WGTFv8.jpg',
    type: 'Field',
    cost: 6,
    text: 'If a source would deal damage, it deals double that damage instead.\nPay 20 life: Destroy Nuclear Furnace.  Any player may use this ability.\n            ',
},{
    name: 'Patchouli',
    image: 'http://i.imgur.com/hzzlXJL.jpg',
    type: 'Creature',
    cost: 4,
    attack: 5,
    defense: 28,
    text: 'When Patchouli enters the battlefield, look at the top three cards of your deck. You may reveal a spell card from among them and put it into your hand. Put the rest on the bottom of your deck in any order. \n            Spells you cast cost 1 less power.  This ability does not stack with other Patchoulis.',
},{
    name: 'Pentagram Flight',
    image: 'http://i.imgur.com/pkEFfFO.png',
    type: 'Spell (Equip)',
    cost: 2,
    text: 'Whenever equipped creature attacks, it gets +5/-3.',
},{
    name: 'Poisonous Moth\'s Scales',
    image: 'http://i.imgur.com/C8Sr2Ex.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Creatures your opponent controls gain Poison 4 (Poisoned creatures lose health equal to their amount of poison at the end of each turn).\n            ',
},{
    name: 'Nazrin',
    image: '/art/nazrin.png',
    type: 'Creature',
    cost: 3,
    attack: 7,
    defense: 15,
    text: 'When Nazrin enters the battlefield, you may search your deck for a creature card costing 3 or less, reveal it, and put it into your hand, and then shuffle your deck.',
},{
    name: 'Rare Metal Detector',
    image: 'http://i.imgur.com/1Bju200.jpg',
    type: 'Spell',
    cost: 4,
    text: 'Search your deck for a spell or creature card that costs 8 or higher and put it into your hand.  Shuffle your deck afterwards.',
},{
    name: 'Reimu',
    image: 'http://i.imgur.com/ONL2foX.jpg',
    type: 'Creature',
    cost: 15,
    attack: 20,
    defense: 55,
    text: 'When Reimu enters the battlefield, create a 20/20 Orb token linked to Reimu that has "As long as this creature is linked, it cannot be affected by other cards\' abilities except for the linked creature. This creature cannot be damaged. When the linked creature leaves the battlefield, sacrifice this creature."\n             If a spell or ability would destroy or exile Reimu, if Reimu is linked, sacrifice the linked orb and negate that spell or ability.\n(0): The linked orb cannot be intercepted until end of turn. Reimu cannot attack and use this ability within the same turn.',
},{
    name: 'Reisen',
    image: 'http://i.imgur.com/Ir2sO0c.jpg',
    type: 'Creature',
    cost: 5,
    attack: 12,
    defense: 27,
    text: 'Creatures your opponents control attack each turn if able.\n            Whenever a creature your opponent controls attacks, it deals 5 damage to itself.',
},{
    name: 'Remilia',
    image: 'http://i.imgur.com/0HxCSOw.jpg',
    type: 'Creature',
    cost: 7,
    attack: 24,
    defense: 35,
    text: 'After combat, Remilia heals health equal to a quarter of the damage she dealt, rounded up.',
},{
    name: 'Rika',
    image: 'http://i.imgur.com/hyCkqxF.png',
    type: 'Creature',
    cost: 2,
    attack: 3,
    defense: 22,
    text: '(1): Draw two cards.  Your opponent creates a 10/20 monster token.  You lose 5 life. You may only use this ability once each turn.\n            ',
},{
    name: 'Rin',
    image: 'http://i.imgur.com/oXO2f48.jpg',
    type: 'Creature',
    cost: 6,
    attack: 18,
    defense: 28,
    text: 'Whenever a non-token card enters your graveyard from anywhere or Rin kills a creature, create a 0/5 Zombie Fairy token that cannot intercept.\nSacrifice X Zombie Fairy tokens: Return a creature that costs X from your graveyard to play. If it would leave the battlefield, exile it instead.\n            ',
},{
    name: 'Rumia',
    image: 'http://i.imgur.com/SuEi1xu.jpg',
    type: 'Creature',
    cost: 2,
    attack: 8,
    defense: 25,
    text: 'Whenever a non-token creature dies, Rumia gets +2/+5.',
},{
    name: 'Sakuya',
    image: 'http://i.imgur.com/RvBj2Cy.jpg',
    type: 'Creature',
    cost: 6,
    attack: 15,
    defense: 27,
    text: 'Whenever a creature you control attacks, you may have Sakuya deal 5 damage to target creature or player. You cannot target the same target twice with this ability in the same turn.',
},{
    name: 'Sanae',
    image: 'http://i.imgur.com/0fnyyae.jpg',
    type: 'Creature',
    cost: 4,
    attack: 5,
    defense: 30,
    text: 'At the beginning of your turn, gain life equal to the number of essences you control.\n(0): Turn target non-token creature you control into an essence of your choice.',
    special: {
        "upkeep": function(){this.controller.gainLife(this.controller.pointEssences.length + this.controller.powerEssences.length);}
    }
},{
    name: 'Shiki',
    image: 'http://i.imgur.com/krNdfLg.jpg',
    type: 'Creature',
    cost: 13,
    attack: 25,
    defense: 45,
    text: 'Whenever another creature dies, choose one - Exile target card from a graveyard and Shiki gets +2/+2; or put target card in a graveyard on the bottom of your deck.\n(2), sacrifice another non-token creature: Return target creature card from your graveyard to your hand.',
},{
    name: 'Shizuha',
    image: 'http://i.imgur.com/WkeWks3.jpg',
    type: 'Creature',
    cost: 3,
    attack: 5,
    defense: 20,
    text: 'When Shizuha dies, put her back into play as an essence.\n            When you play a essence, if you have already played at least 1 essence this turn, gain 1 resource of your choice.\n',
    special: {
        "die": function(){
            GAME.promptChoice("Turn Shizuha into what type of land?", {
                "Point": function() {this.controller.addPointToBoard(this);},
                "Power": function() {this.controller.addPowerToBoard(this);}
            }, this);
            return true;
        }
    },
},{
    name: 'Shou',
    image: 'http://i.imgur.com/m1bXprH.jpg',
    type: 'Creature',
    cost: 7,
    attack: 10,
    defense: 45,
    text: '(2): Shou deals 5 damage to target creature.  If this kills the creature, you gain 2 power.\n            ',
},{
    name: 'Snow',
    image: 'http://i.imgur.com/kdrCarG.jpg',
    type: 'Field',
    cost: 2,
    text: 'Whenever a creature is dealt damage, its controller puts the top card of his or her deck into his or her graveyard.\nWhenever a player is dealt damage, that player puts the top 2 cards of his or her deck into his or her graveyard.\nWhen 7 or more cards are put from a player\'s deck into their graveyard in one turn, sacrifice Snow.\n            ',
},{
    name: 'Straw Doll',
    image: 'http://i.imgur.com/k9T6z4R.jpg',
    type: 'Creature',
    cost: 2,
    attack: 7,
    defense: 15,
    text: 'When Straw Doll enters your graveyard from anywhere, exile it. Create a curse equip that has "Equipped creature cannot intercept and has Poison 1." and equip it to target creature.',
},{
    name: 'Suika',
    image: 'http://i.imgur.com/f5Rpji4.jpg',
    type: 'Creature',
    cost: 8,
    attack: 20,
    defense: 35,
    text: 'Discard a creature card: Suika deals damage to target creature equal to the discarded card\'s attack. Use this ability only once each turn.\nDiscard a non-creature card: Suika heals X life and gets +(X+15)/+0 until end of turn, where X is the cost of the discarded card. Use this ability only once each turn.',
},{
    name: 'Sunshower',
    image: 'http://i.imgur.com/BKT9tG7.jpg',
    type: 'Field',
    cost: 3,
    text: 'Creatures deal no damage when intercepting.\nWhen a creature intercepts, if there was already an intercept this turn, sacrifice Sunshower after combat.\n            ',
},{
    name: 'Suwako',
    image: 'http://i.imgur.com/LFgNBUO.jpg',
    type: 'Creature',
    cost: 10,
    attack: 20,
    defense: 50,
    text: 'At the end of your turn, if Suwako did not attack this turn, she heals 10 health.\n(1), put a card from your hand down as an essence: Return target essence you control to your hand.\n',
    special: {
        "end": function() {
            var DAMAGE_HEALED = 10;
            
            if (this.attackCount == 0) this.heal(DAMAGE_HEALED);
            events.trigger("creatureHeal", this, DAMAGE_HEALED);
        }
    },
},{
    name: 'Sweet Poison',
    image: 'http://i.imgur.com/pVSrqL9.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Target creature gets +7/+0 and Poison 5 (Poisoned creatures lose health equal to their amount of poison at the end of each turn).\n            ',
},{
    name: 'Sword of Scarlet Perception',
    image: 'http://i.imgur.com/RpBZK1o.jpg',
    type: 'Spell',
    cost: 3,
    text: 'Search your deck for a field card and put it into your hand.',
},{
    name: 'Terrible Souvenir',
    image: 'http://i.imgur.com/L8uCD6r.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Select a spellcard from your graveyard and put it into your hand.',
},{
    name: 'Terrifying Hypnotism',
    image: 'http://i.imgur.com/Prj0rQv.jpg',
    type: 'Spell',
    cost: 3,
    text: 'You may pay an additional 9 power when you cast this spell.\n            Select a creature from your graveyard and put it into your hand.  If you paid the additional cost, put it onto the battlefield instead.',
},{
    name: 'Total Purification',
    image: 'http://i.imgur.com/X6932IL.jpg',
    type: 'Spell',
    cost: 2,
    text: 'Discard your hand. At the end of your turn, draw X cards, where X is the number of cards discarded this way.',
},{
    name: 'Ultimate Color "Mad Colorful Dance"',
    image: 'http://i.imgur.com/1mblWkp.jpg',
    type: 'Spell',
    cost: 0,
    text: 'Until your next turn, damage dealt during an interception by target creature is equal to its attack.  That creature can intercept an additional time.\nThat creature gets +0/+10.\n',
},{
    name: 'Unzan',
    image: 'http://i.imgur.com/nk4oRi6.jpg',
    type: 'Creature',
    cost: 8,
    attack: 30,
    defense: 45,
    text: 'Unzan cannot attack the turn he enters the battlefield.\n            After combat, Unzan cannot attack or intercept until the end of the next turn.',
},{
    name: 'Utsuho',
    image: 'http://i.imgur.com/nmjKIpr.jpg',
    type: 'Creature',
    cost: 5,
    attack: 15,
    defense: 30,
    text: 'Sacrifice 2 essences: Utsuho gets +20/+0 and "If Utsuho is intercepted, overkill damage is dealt to the original target.  Cannot be intercepted by bomb." until end of turn. Use this ability only once each turn.',
},{
    name: 'Vertigo',
    image: 'http://i.imgur.com/CxcI4vJ.jpg',
    type: 'Spell',
    cost: 0,
    text: 'Target creature cannot intercept this turn.  ',
    effect: function() {
                GAME.chooseTarget(function(target) {
                                    target.intercepts = target.maxIntercepts;
                                  },
                                  GAME.findCreature(), this);
            },
},{
    name: 'War Sign "Little Legion"',
    image: 'http://i.imgur.com/isucNAx.jpg',
    type: 'Spell',
    cost: 3,
    text: 'War Sign "Little Legion" deals X damage to target creature, where X is the number of creatures you control multiplied by 7.',
    effect: function() {
                var DAMAGE_PER_CREATURE = 7;
                
                GAME.chooseTarget(function(target) {
                                    var damage = GAME.damageFromSpell(DAMAGE_PER_CREATURE * this.controller.creatures.length);
                                    this.dealDamage(target, damage);
                                    events.trigger("creatureDamage", target, damage);
                                  },
                                  GAME.findCreature(), this);
            },
},{
    name: 'Wind Sign "Tengu Newspaper Deadline Day"',
    image: 'http://i.imgur.com/EWbQwYo.jpg',
    type: 'Spell',
    cost: 3,
    text: 'You may play an additional essence this turn.\nDraw a card.',
    effect: function() {
                this.controller.extraPlayableEssences++;
                this.controller.draw(1);
    },
},{
    name: 'Wood Fairy',
    image: 'http://i.imgur.com/683GODc.jpg',
    type: 'Creature',
    cost: 1,
    attack: 8,
    defense: 20,
    text: '',
},{
    name: 'Wriggle',
    image: 'http://i.imgur.com/pkeKaCf.jpg',
    type: 'Creature',
    cost: 2,
    attack: 5,
    defense: 15,
    text: 'When Wriggle enters the battlefield, you may pay up to 3 additional resources. If you do, create that many 5/5 bug tokens.',
},{
    name: 'Yamame',
    image: 'http://i.imgur.com/Jq0Iu8c.jpg',
    type: 'Creature',
    cost: 5,
    attack: 5,
    defense: 30,
    text: 'Whenever a poisoned creature your opponent controls dies, you may have target creature gain Poison 5 (Poisoned creatures lose health equal to their amount of poison at the end of each turn).\n(3): Target creature gains Poison 4.',
},{
    name: 'Youkai Mountain',
    image: 'http://i.imgur.com/Cppzjz5.jpg',
    type: 'Field',
    cost: 4,
    text: 'At the end of your turn, put the top card of your deck into play as an essence. Afterwards, if 2 or fewer essences have entered the battlefield under your control this turn, sacrifice Youkai Mountain.',
	special: {
		"end": function(){
			GAME.promptChoice("Turn the top card of your deck into an essence:", {
				"Point": function() {this.controller.addPointToBoard(this.controller.deck.shift());},
				"Power": function() {this.controller.addPowerToBoard(this.controller.deck.shift());}
			}, this);
			return true;
		}
	}
},{
    name: 'Youmu',
    image: 'http://i.imgur.com/xbV86bp.jpg',
    type: 'Creature',
    cost: 4,
    attack: 15,
    defense: 20,
    text: 'Youmu cannot be intercepted by creatures with 20 or less attack.',
},{
    name: 'Yukari',
    image: 'http://i.imgur.com/DK81laK.jpg',
    type: 'Creature',
    cost: 14,
    attack: 18,
    defense: 55,
    text: 'Whenever you cast a card, you may pay (2).  If you do, search your deck for any card, put it into your hand, and then shuffle your deck.',
},{
    name: 'Yuugi',
    image: 'http://i.imgur.com/NRNAHT4.jpg',
    type: 'Creature',
    cost: 6,
    attack: 5,
    defense: 40,
    text: 'Whenever Yuugi would be dealt damage, prevent 5 of that damage.\n            Whenever Yuugi is dealt (more than 0) damage, she gets +5/+0.',
    takeDamage: function (source, amount) {
        var ATTACK_TO_INCREASE = 5;
        
        var oldHP = this.HP;
        var damage = Math.floor(GAME.modifyDamage(source, this, amount));
        
        this.HP -= damage;
        if (this.HP <= 0)
            this.die();
        else if (this.HP < oldHP) {
            this.atk += ATTACK_TO_INCREASE;
        }
        //events.trigger("creatureDamage", [this, damage]);
        
        return damage;
    },
},{
    name: 'Yuuka',
    image: 'http://i.imgur.com/G3tsKAG.jpg',
    type: 'Creature',
    cost: 7,
    attack: 18,
    defense: 40,
    text: 'Whenever Yuuka kills a creature, put that creature into play under your control as an essence.',
},{
    name: 'Yuyuko',
    image: 'http://i.imgur.com/g8dQmOj.jpg',
    type: 'Creature',
    cost: 9,
    attack: 13,
    defense: 50,
    text: 'At the beginning of each turn or whenever a non-token creature dies, create a 0/1 Ghost token that cannot intercept and has "Sacrifice 7 ghosts: Create a Saigyou Ayakashi token".\nSacrifice a Ghost token: Yuyuko heals 8 health.',
    special: {
        "upkeep": function() {this.controller.addToCreatures(CardUtils.createCard("Ghost"));},
        "oppupkeep":  function() {this.controller.addToCreatures(CardUtils.createCard("Ghost"));}    
    }
}];



allTokens = [{
    name: 'Bug',
    image: 'http://i.imgur.com/rM50VTW.png',
    type: 'Token',
    attack: 5,
    defense: 1,
    text: '',
},{
    name: 'EX-Keine',
    image: 'http://i.imgur.com/LoMoaxx.jpg',
    type: 'Token',
    attack: 15,
    defense: 40,
    text: 'You may cast cards removed by Keine as if they were in your hand.  If this token leaves play, it turns back into Keine (for being returned to hand/deck)',
},{
    name: 'Flan',
    image: 'http://i.imgur.com/NPR3voI.jpg',
    type: 'Token',
    attack: 10,
    defense: 5,
    text: 'Sacrifice this at the end of your turn',
},{
    name: 'Ghost',
    image: 'http://i.imgur.com/jU38yzW.jpg',
    type: 'Token',
    attack: 0,
    defense: 1,
    text: 'Ghost cannot intercept.\n			Sacrifice 7 Ghosts: Create a 0/80 Saigyou Ayakashi token that cannot be targeted by spells or abilities, cannot be destroyed outside of combat, cannot be protected by intercepts and has "When this creature enters the battlefield, return all creatures in your graveyard to play. If a non-token creature you control would die, exile it instead. Return it to its owner\'s hand at the end of the turn."',
},{
    name: 'Master Spark',
    image: 'http://i.imgur.com/sbZc4Np.jpg',
    type: 'Token-Spell',
    cost: 5,
    text: ' Deal 35 damage to target creature.',
},{
    name: 'Monster',
    image: 'http://i.imgur.com/8GCvJOU.jpg',
    type: 'Token',
    attack: 10,
    defense: 20,
    text: '',
},{
    name: 'Orb',
    image: 'http://i.imgur.com/eLBhnF2.jpg',
    type: 'Token',
    attack: 20,
    defense: 20,
    text: 'Paired to a Reimu.  If the Reimu leaves play, sacrifice the orb.  Cannot be damaged, targetted, or effected in any ways by spells or abilities except those of the paired reimu.',
},{
    name: 'Saigyou Ayakashi',
    image: 'http://i.imgur.com/nJLKVOs.jpg',
    type: 'Token',
    attack: 0,
    defense: 80,
    text: 'Saigyou Ayakashi cannot be targeted by spells or abilities, cannot intercept, cannot be destroyed outside of combat and cannot be protected by intercepts.\nWhen Saigyou Ayakashi enters the battlefield, return all creatures in your graveyard to play.\nIf a non-token creature you control would die, exile it instead. Return it to its owner\'s hand at the end of the turn.',
},{
    name: 'Shield Doll',
    image: 'http://i.imgur.com/32sBu26.jpg',
    type: 'Token',
    attack: 0,
    defense: 15,
    text: '',
},{
    name: 'Sword Doll',
    image: 'http://i.imgur.com/h2awqTD.jpg',
    type: 'Token',
    attack: 10,
    defense: 5,
    text: 'Cannot intercept',
},{
    name: 'Zombie Fairy',
    image: 'http://i.imgur.com/ocV53If.jpg',
    type: 'Token',
    attack: 0,
    defense: 5,
    text: 'Zombie Fairy cannot intercept.',
},];
