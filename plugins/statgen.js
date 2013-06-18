
// Satgen plugin
// TO DO: test locally

var config = require('../config');
var trigger = config.trigger + 'roll';

var len = trigger.length + 1;

module.exports = function (irc) {
    'use strict';
    irc.on('message', function (from, to, message) {

        if (message.indexOf(trigger) === 0) {
            if (message.length > len) {
                // clean command string and split into array
                // statgen[0] is roll type
                // statgen[1] is optional verbose print
                var statgen = message.replace('.'+trigger,'').split(" ");

                // If verbose is set, print out starting text to client.
                if (statgen.length > 1 && statgen[1] == 'verbose') {
                  irc.say(to, 'Sat block for ' + from + ':');
                }


                /*-------------------------------------------------
                Ex - .statgen
                This switch has three roll types, each resulting in
                a block of stats for a character in a d20 RPG:
                - 2d6+6: rolls two six sided dice + 6 (7-18)
                - 3d6: rolls three dice (3-18)
                - 4d6dl: rolls four dice and drops lowest (3-18)

                OPTIONAL: .statgen verbose
                - verbose prints out each roll individually
                -------------------------------------------------*/
                switch (statgen[0]) {

                    case '2d6+6':
                        var slim = [];
                        for (var i = 0; i < 6; i++) {
                          var rolls = [];
                          var score = 6;
                          for (var i = 0; i < 2; i++) {
                            var roll = Math.floor(Math.random()*6))+1;
                            rolls.push(roll);
                            score += roll;
                          }
                          if (statgen.length > 1 && statgen[1] == 'verbose') {
                            irc.say(to, rolls.sort().reverse() + ' + 6 = ' + sum);
                          }
                          slim.push(score);
                        }
                        irc.say(to, from + ': ' + slim.sort().reverse());
                        break;

                    case '3d6':
                        var slim = [];
                        for (var i = 0; i < 6; i++) {
                          var rolls = [];
                          var score = 0;
                          for (var i = 0; i < 3; i++) {
                            var roll = Math.floor(Math.random()*6))+1;
                            rolls.push(roll);
                            score += roll;
                          }
                          if (statgen.length > 1 && statgen[1] == 'verbose') {
                            irc.say(to, rolls.sort().reverse() + ' = ' + sum);
                          }
                          slim.push(score);
                        }
                        irc.say(to, from + ': ' + slim.sort().reverse());
                        break;

                    default '4d6dl':
                        var slim = [];
                        for (var i = 0; i < 6; i++) {
                          var rolls = [];
                          var score = 0;
                          for (var i = 0; i < 4; i++) {
                            var roll = Math.floor(Math.random()*6))+1;
                            rolls.push(roll);
                            score += roll;
                          }

                          rolls = rolls.sort().reverse();
                          dropped = rolls[rolls.length-1];
                          score = score-dropped;
                          rolls.pop();

                          slim.push(score);

                          if (statgen.length > 1 && statgen[1] == 'verbose') {
                            irc.say(to, + rolls + ' drop [' + dropped + '] = ' + score);
                          }
                        }
                        irc.say(to, from + ': ' + slim.sort().reverse());
                        break;
                }

            } else {

            }
        }
    });
};
