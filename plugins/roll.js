// rpg-dice rolling plugin
var config = require('../config');
var trigger = config.trigger + 'roll';

var len = trigger.length + 1;

module.exports = function (irc) {
    'use strict';
    irc.on('message', function (from, to, message) {
        // create new roll result object
        // rolls -> array of dice objects
        // sum -> total of rolls + modifiers
        // modifiers -> array of integer values
        var rollResult = {
            rolls: [],
            sum: 0,
            modifiers: []
        };

        if (message.indexOf(trigger) === 0) {
            if (message.length > len) {
                // clean command string
                var dice = message.replace('!roll','');
                dice = dice.replace(/- */,'+ -');
                dice = dice.replace(/D/,'d');

                // split on + or - characters, but preserve - with dice
                var re = / *\+ */;
                var items = dice.split(re);

                // loop through the dice
                for(var roll in items) {
                    // check if dice or modifier
                    if (items[roll].indexOf('d') == -1) {
                        // modifiers are parsed, then appended to the modifiers list
                        // and += to the sum in the rollResult object
                        rollResult.modifiers.push(parseInt(items[roll]));
                        rollResult.sum += parseInt(items[roll]);
                    } else {
                        // rolls are split on the 'd' and passed to the roll function
                        rollResult.rolls.push(rollDice(items[roll].split('d')));
                    }
                }
                // return complete dice string
                irc.say(to, from + ': ' + formatRoll(rollResult));
            } else {
                // return example string if no roll is given
                irc.say(to, from + ': ' + 'Roll a dice e.g. \'' + trigger + ' 1d6+2\'');
            }
        }
    });


    /*--------------------------------------
    formatRoll accepts the rollResult object
    and then formats a string to return
    to the channel. Currently it is set up
    for a string like:
    > Input - !roll 1d6+5+2d6
    > Output - 1d6[4]+2d6[2,6]+5 = 17
    ---------------------------------------*/
    function formatRoll(results) {
        var verbose = '';
        var sum = results.sum;

        for (var i = 0; i < results.rolls.length; i++) {
            // checks for negative dice roll or mod
            // then adds or subtracts values
            if (results.rolls[i].mod === '-') {
                sum -= results.rolls[i].sum;
            } else {
                sum += results.rolls[i].sum;
            }
            // checks if this is the start of the return string,
            // if so it does not print the modifier
            if (i === 0) {
                verbose += results.rolls[i].originalDice; // original dice string, ie. "3d6"
                verbose += '[' + results.rolls[i].verbose + ']'; // verbose roll string, ie. "[2,3,5]"
            } else {
                verbose += results.rolls[i].mod; // modifier, "+" or "-"
                verbose += results.rolls[i].originalDice;
                verbose += '[' + results.rolls[i].verbose + ']';
            }
        }
        // loops through modifiers string and appends them to
        // the return string, if they are non-negative numbers,
        // it adds a '+'.
        for (var mod in results.modifiers) {
            if (results.modifiers[mod] >= 0) { verbose += '+'; }
            verbose += results.modifiers[mod];
        }

        return verbose + ' = ' + sum; // returns completed string.
    }

    /*-----------------------------------------------------
    accepts the split array of a single roll, ie "1d6" is
    split to ['1','6'], then rolls a number of times equal
    to the first number a random integer between 1 and the
    second number. This then returns a dice object.
    -----------------------------------------------------*/
    function rollDice(arr) {
        // dice object
        // mod -> positive or negative value
        // verbose -> array of individual roll results
        // sum -> total of roll results
        // sides -> dice sides
        var result = {
            mod: '+',
            verbose: [],
            sum: 0
        };

        // checks for negative value, assings mod and removes
        // the '-' from the string
        if (arr[0][0] == '-') {
            result.mod = '-';
            arr[0] = arr[0].replace('-','');
        }

        // creates original dice string
        result.originalDice = arr[0] + 'd' + arr[1];

        // assings the number and the sides to the
        // dice object as well as gets integer for
        // number of dice to roll
        var number = parseInt(arr[0]);
        result.sides = parseInt(arr[1]);

        // rolls for each number of dice according to it's sides.
        // +1 addition is to offset from 0
        for (var i = 0; i < number; i++) {
            var rollResult = Math.floor(Math.random()*result.sides)+1;
            result.verbose.push(rollResult);
            result.sum += rollResult;
        }
        // sorts verbose to descending order
        result.verbose.sort().reverse();
        // return result object
        return result;
    }
};
