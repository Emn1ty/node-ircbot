// rpg-dice rolling plugin
var config = require('../config');
var trigger = config.trigger + 'roll';

var len = trigger.length + 1;

module.exports = function (irc) {
    'use strict';
    irc.on('message', function (from, to, message) {
        var rollResult = {
            rolls: [],
            sum: 0,
            modifiers: []
        };

        if (message.indexOf(trigger) === 0) {
            if (message.length > len) {
                var dice = message.replace('!roll','');
                dice = dice.replace(/- */,'+ -');
                dice = dice.replace(/D/,'d');
                var re = / *\+ */;
                var items = dice.split(re);

                for(var roll in items) {
                    if (items[roll].indexOf('d') == -1) {
                        rollResult.modifiers.push(parseInt(items[roll]));
                        rollResult.sum += parseInt(items[roll]);
                    } else {
                        rollResult.rolls.push(rollDice(items[roll].split('d')));
                    }
                }
                irc.say(to, from + ': ' + formatRoll(rollResult));
            } else {
                irc.say(to, from + ': ' + 'Roll a dice e.g. \'' + trigger + ' 1d6+2\'');
            }
        }
    });

    function formatRoll(results) {
        var verbose = '';
        var sum = results.sum;

        for (var i = 0; i < results.rolls.length; i++) {
            if (results.rolls[i].mod === '-') {
                sum -= results.rolls[i].sum;
            } else {
                sum += results.rolls[i].sum;
            }
            if (i === 0) {
                verbose += results.rolls[i].originalDice;
                verbose += '[' + results.rolls[i].verbose + ']';
            } else {
                verbose += results.rolls[i].mod;
                verbose += results.rolls[i].originalDice;
                verbose += '[' + results.rolls[i].verbose + ']';
            }
        }
        for (var mod in results.modifiers) {
            if (results.modifiers[mod] >= 0) { verbose += '+'; }
            verbose += results.modifiers[mod];
        }
        return verbose + ' = ' + sum;
    }
    function rollDice(arr, irc, to) {
        var result = {
            mod: '+', 
            verbose: [], 
            sum: 0 
        };

        if (arr[0][0] == '-') {
            result.mod = '-';
            arr[0] = arr[0].replace('-','');
        }

        result.originalDice = arr[0] + 'd' + arr[1];
        var number = parseInt(arr[0]);
        result.sides = parseInt(arr[1]);
        
        for (var i = 0; i < number; i++) {
            var rollResult = Math.floor(Math.random()*result.sides)+1;
            result.verbose.push(rollResult);
            result.sum += rollResult;
        }
        result.verbose.sort().reverse();
        return result;
    }
};
