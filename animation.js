// jshint esversion: 6
// jshint globalstrict: true
// jshint devel: true
// jshint browser: true
/* globals $ */
'use strict';

let svg = $('svg');

function makeSvg(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for(var k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}


function makeCircle(pathId, classes) {
    classes = classes || "";
    classes = "anim " + classes;

    let circle = makeSvg('circle', {'class': classes,});
    let animMotion = makeSvg('animateMotion', {});
    let mpath = makeSvg('mpath', {});

    mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", pathId);

    animMotion.appendChild(mpath);
    circle.appendChild(animMotion);
    svg.append(circle);

    return circle;
}


function Path(id) {
    return {id: id};
}


$(document).ready(function () {
    var paths = [
        Path('#MEMINST_IFID'),
        Path('#PC_MEMINST'),
        Path('#PC_ADDPC'),
        Path('#INC_4'),
        Path('#ADDPC_IDIF'),
        Path('#ADDPC_MUX'),
        Path('#MUX_PC'),
        Path('#IFID_IDEX'),
        Path('#IFID_OUT'),
        Path('#IFID_OUT_REGa'),
        Path('#IFID_OUT_REGb'),
        Path('#REGSa_IDEX'),
        Path('#REGSb_IDEX'),
        Path('#IFID_OUT_SIGEXT'),
        Path('#SIGEXT_IDEX'),
        Path('#IFID_OUT_RT'),
        Path('#IFID_OUT_RD'),
        Path('#IDEX_EXMEM'),
        Path('#IDEX_ADD'),
        Path('#IDEX_SHIFT'),
        Path('#SHIFT_ADD'),
        Path('#ADD_EXMEM'),
        Path('#IDEX_ULA'),
        Path('#IDEX_MUX'),
        Path('#MUX_ULA'),
        Path('#IDEX_MUX2'),
        Path('#IDEX_MUXRT'),
        Path('#IDEX_MUXRD'),
        Path('#MUX_EXMEM'),
        Path('#ULA_EXMEM'),
        Path('#MUX_EXMEM'),
        Path('#EXMEM_DMEMa'),
        Path('#EXMEM_MEMWBa'),
        Path('#EXMEM_DMEMb'),
        Path('#DMEM_MEMWB'),
        Path('#EXMEN_MUX'),
        Path('#MEMWB_MUXa'),
        Path('#MEMWB_MUXb'),
        Path('#MUX_REGS'),
        Path('#MEMWB_REGS'),
    ];


    paths.forEach(function(path) {
        makeCircle(path.id);
    });


    $('.anim animateMotion').attr({
        begin: 'o1.begin',
        dur: '2s',
        fill: 'freeze',
        //repeatCount: 'indefinite'
    });
});



/*
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
}*/
