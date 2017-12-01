// jshint esversion: 6
// jshint globalstrict: true
// jshint devel: true
// jshint browser: true
/* globals $ */
'use strict';


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
