// jshint esversion: 6
// jshint globalstrict: true
// jshint devel: true
// jshint browser: true
/* globals $, Instruction, Cpu */
'use strict';


let cpu = new Cpu();

cpu.dataMem = [111, 222, 333, 444];

cpu.instructionMem = [ ];


let svg;
let total_dur = 3;
let divisions = 12;

let isPlaying = false;
let doingOneStep = false;


function activateAnimations() {
    if(doingOneStep) {
        return;
    }

    doingOneStep = true;

    setTimeout(function() {
        doingOneStep = false;

        if(isPlaying) {
            activateAnimations();
        }
    }, 500 + 1000 * total_dur);

    setTimeout(function() {
        cpu.update();
        updateUi(cpu);
    }, 1000 * total_dur);

    for(let i = 0; i <= divisions; i++) {
        setAnimTimeout(i);
    }

}


function setAnimTimeout(wait) {
    return setTimeout(function() {
        $('.anim' + wait).each(function(i, elem) {
            elem.beginElement();
        });
    }, 1000 * total_dur * wait / divisions);
}


$(document).ready(onReady);

function onReady() {
    svg = $('svg');
    updateUi(cpu);


    let defaultProgram = [
        'LW $R0 4',
        'LW $R1 12',
        'NOP',
        'NOP',
        'ADD $R2 $R0 $R1',
        'NOOP',
        'NOOP',
        'SW $R2 0'
    ].join('\n');

    $('#codeBox').html(defaultProgram);

    $('#startSimBtn').click(function() {
        let instructions = $('#codeBox')
            .html()
            .split('\n')
            .map((str) => str.trim())
            .filter((str) => str !== '');

        cpu.instructionMem = instructions;

        $('.first-screen').css('display', 'none');
        $('.second-screen').css('display', 'inline-block');
    });


    $('#stepBtn').click(function() {
        activateAnimations();
    });

    $('#playBtn').click(function() {
        isPlaying = true;
        activateAnimations();
    });

    $('#stopBtn').click(function() {
        isPlaying = false;
    });



    $('path').each(function(idx, elem) {
        elem = $(elem);
        let classes = elem.attr('class');

        if(classes === undefined) {
            return;
        }

        classes = classes
             .split(' ')
             .filter((str) => str !== '');


        let wait = 0;
        let weight = divisions;
        let ignore = true;

        classes.forEach(function(theClass) {
            let re = /([a-z]+)(\d+)/g;

            let matches = re.exec(theClass);
            if(matches === null) {
                return;
            }

            let name = matches[1];
            let value = +matches[2];

            if(name == 'espera') {
                ignore = false;
                wait = value;
            } else if(name === 'peso') {
                ignore = false;
                weight = value;
            }
        });

        let dur = total_dur * weight / divisions;

        if(!ignore) {
            makeAnimatedCircle(elem.attr('id'), wait, dur);
        }
    });
}


function makeAnimatedCircle(pathId, wait, dur) {
    let circle = makeSvg('circle', {});

    let animMotion = makeSvg('animateMotion', {
        'class': 'anim' + wait,
        begin: 'indefinite',
        dur: dur + 's',
    });

    let mpath = makeSvg('mpath', {});

    mpath.setAttributeNS("http://www.w3.org/1999/xlink", "href", '#' + pathId);

    animMotion.appendChild(mpath);
    circle.appendChild(animMotion);
    svg.append(circle);
}


function makeSvg(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for(var k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}


function updateUi(cpu) {
    let stages = {
        'if_id': ['ir', 'newPc'],
        'id_ex': ['ir', 'newPc', 'a', 'b'],
        'ex_mem': ['ir', 'aluOutput', 'b', 'zero', 'branchAddress'],
        'mem_wb': ['ir', 'aluOutput', 'lmd'],
    };

    $.each(stages, function(stage, fields) {
        fields.forEach(function(field) {
            let elem = $('#' + stage + '-' + field);
            let value = cpu[stage][field];
            elem.text(value);
        });
    });
}

