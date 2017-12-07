// jshint esversion: 6
// jshint globalstrict: true
// jshint devel: true
// jshint browser: true
/* globals $, Instruction, Cpu */

/* Hugo Moraes Dzin    - 8532186
 * Luiz Eduardo Dorici - 4165850
 */

'use strict';


let cpu = new Cpu();

cpu.dataMem = [111, 222, 333, 444];

cpu.instructionMem = [ ];


let svg;
let cycleDurationSeconds = 3;  // Duração de um ciclo de clock em segundos
let divisions = 12;  // Divisões de tempo para controlar a lógica da animação

let isPlaying = false;  // True se é para animar indefinidamente
let doingOneStep = false;  // True se está no meio de uma animação de clock


// Executa as animaçoes baseado nas variáveis acima
function activateAnimations() {
    if(doingOneStep) {
        return;
    }

    doingOneStep = true;

    // Callback para quando o clico terminar, com um delay extra de 500ms
    setTimeout(function() {
        doingOneStep = false;

        if(isPlaying) {
            activateAnimations();
        }
    }, 500 + 1000 * cycleDurationSeconds);

    // Callback para atualizar os dados da interface gráfica
    setTimeout(function() {
        cpu.update();
        updateUi(cpu);
    }, 1000 * cycleDurationSeconds);

    for(let i = 0; i <= divisions; i++) {
        setAnimTimeout(i);
    }

}

// Faz as bolinhas animarem no tempo certo
function setAnimTimeout(wait) {
    return setTimeout(function() {
        $('.anim' + wait).each(function(i, elem) {
            elem.beginElement();
        });
    }, 1000 * cycleDurationSeconds * wait / divisions);
}


$(document).ready(onReady);

function onReady() {
    svg = $('svg');
    updateUi(cpu);


    // Código exemplo que aparece por padrão na primeira tela
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
        // Pega o conteudo do codebox, dividindo em linhas e descartando linhas vazias
        let instructions = $('#codeBox')
            .html()
            .split('\n')
            .map((str) => str.trim())
            .filter((str) => str !== '');

        cpu.instructionMem = instructions;

        // Troca o conteudo da página
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



    // Cria as bolinhas vermelhas que fazem a animação em si
    // Enquanto nao estão animando, ficam paradas no canto superior esquerdo
    $('path').each(function(idx, elem) {
        // Lógica da animação:
        // O ciclo é quebrado em 12 divisões
        // Os objetos path devem ter duas classes, esperaX e pesoY (X, Y de 0 a 12)
        // esperaX indica que a bolinha deve esperar X divisões de tempo para começar a animar
        // pesoY indica quantas divisões dura a animação


        elem = $(elem);
        let classes = elem.attr('class');

        if(classes === undefined) {
            return;
        }

        // Quebra por espaços e descarta strings vazias
        classes = classes
             .split(' ')
             .filter((str) => str !== '');


        // Descobre X e Y do "esperaX pesoY" do path atual
        let wait = 0;
        let weight = divisions;
        let ignore = true;  // Se for true, quer dizer que o objeto path nao tem uma classe valida


        classes.forEach(function(theClass) {
            // Expressao regular para ler esperaX e pesoY separando a palavra do número
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

        let dur = cycleDurationSeconds * weight / divisions;

        // Nao coloca bolinha nos paths que nao têm esperaX e/ou pesoY
        if(!ignore) {
            // Cria o elemento svg do circulo, que anda por cima do path
            makeAnimatedCircle(elem.attr('id'), wait, dur);
        }
    });
}


function makeAnimatedCircle(pathId, wait, dur) {
    let circle = makeSvg('circle', {});

    // Exemplo de svg gerado para pathId="MUX_ULA", wait=3, dur=5
    // <circle>
    //   <animateMotion class="anim3" begin="indefinite" dur="5s">
    //     <mpath xlink:href="#MUX_ULA"/>
    //   </animateMotion>
    // </circle>

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

//cria uma tag SVG com os atributos especificados na variavel attrs
function makeSvg(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for(var k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}

//atualiza valores do pipeline na interface grafica
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

	for(let i = 0; i < 4; i++) {
		$("#R"+i).text(cpu.registers['$R'+i]);
	}

	for(let i = 0; i < 4; i++) {
		$("#MEM"+(i*4)).text(cpu.dataMem[i]);
	}

}

