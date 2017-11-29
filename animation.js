// jshint esversion: 6
// jshint globalstrict: true
// jshint devel: true
// jshint browser: true
/* globals $ */
'use strict';


var animRed = $('#animRed');
var animBlue = $('#animBlue');

var circleRed = $('#circleRed');
var circleBlue = $('#circleBlue');


$(document).ready(function() {
    circleRed.css('visibility', 'hidden');
    circleBlue.css('visibility', 'hidden');

    $('#animateBtn').click(function() {
        console.log('Botao apertado');
        triggerRed();
    });

    $('#advanceBtn').click(advanceIndex);
});


// Avança a selecao verde uma linha na lista de instrucoes
let sel_index = 0;
function advanceIndex() {
    let line_count = $('.text-box tspan').length;
    let sel = $('.text-box .selection');

    sel_index = (sel_index + 1) % line_count;
    sel.attr('y', (sel_index * 1.2).toFixed(2) + 'em');
}


function triggerRed() {
    animRed[0].beginElement();
    circleRed.css('visibility', 'visible');
    console.log('Vermelho saiu!');

    var time_ms = cssTimeToMs(animRed.attr('dur'));

    setTimeout(function() {
        // circleRed.css('visibility', 'hidden');
        console.log('Vermelho chegou!');
        triggerBlue();
    }, time_ms);
}


function triggerBlue() {
    animBlue[0].beginElement();
    circleBlue.css('visibility', 'visible');
    console.log('Azul saiu!');

    var time_ms = cssTimeToMs(animBlue.attr('dur'));

    setTimeout(function() {
        // circleBlue.css('visibility', 'hidden');
        console.log('Azul chegou!');
        advanceIndex();
    }, time_ms);
}


function cssTimeToMs(time_string) {
    // https://stackoverflow.com/questions/30439694
    var num = parseFloat(time_string, 10),
        unit = time_string.match(/m?s/),
        milliseconds;

    if (unit) {
        unit = unit[0];
    }

    switch (unit) {
        case "s": // seconds
            milliseconds = num * 1000;
            break;
        case "ms": // milliseconds
            milliseconds = num;
            break;
        default:
            milliseconds = 0;
            break;
    }

    return milliseconds;
}
