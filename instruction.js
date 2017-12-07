// jshint esversion: 6
// jshint globalstrict: true
// jshint devel: true
// jshint browser: true
'use strict';

// Objeto que guarda informações das instruções
// o conteudo dele será copiado para o objeto Instruction
class OpInfo {
    constructor(category, format, aluFunction) {
        this.category = category; // category = alu, loadStore ou branch
        this.format = format; //formato da instrução
        this.aluFunction = aluFunction || noop;
    }
}


function noop(a, b) {
    return 0;
}

// dicionario que guarda informações sobre a instrução
var _opcodes = {
    NOP:  new OpInfo('alu', 'r', noop),
    ADD:  new OpInfo('alu', 'r', (a, b) => a + b),
    SUB:  new OpInfo('alu', 'r', (a, b) => a - b),
    AND:  new OpInfo('alu', 'r', (a, b) => a & b),
    OR:   new OpInfo('alu', 'r', (a, b) => a | b),

    ADDI: new OpInfo('alu', 'i', (a, b) => a + b),

    LW: new OpInfo('loadStore', 'i', (a, b) => a + b),
    SW: new OpInfo('loadStore', 'i', (a, b) => a + b),

    // Branches are taken when alu result is zero
    BEQ: new OpInfo('branch', 'i', (a, b) => Number(a !== b)),
    BNE: new OpInfo('branch', 'i', (a, b) => Number(a === b)),
};

// interpreta uma string com uma instrução ex: add $r0 $r1 $r2
// e armazena as informações necessarias para o processador executar 
class Instruction {
    constructor(string) {
        string = string.toUpperCase();
        let array = string
            .split(' ')
            .filter((str) => str !== '');

        this.asText = string;
        this.op = array[0];

        Object.assign(this, _opcodes[this.op]);

        if(this.format === 'r') {
            if(this.op === 'NOP') {
                this.rd = '$0';
                this.rs = '$0';
                this.rt = '$0';
                this.imm = 0;
                this.offset = 0;
            } else {
                this.rd = array[1];
                this.rs = array[2];
                this.rt = array[3];
                this.imm = 0;
                this.offset = 0;
            }
        } else if(this.format === 'i') {
            if(this.category === 'loadStore') {
                this.rd = '$0';
                this.rs = '$0';
                this.rt = array[1];
                this.imm = +array[2] || 0;
                this.offset = 0;
            } else {
                this.rd = '$0';
                this.rs = array[1];
                this.rt = array[2];
                this.imm = +array[3] || 0;
                this.offset = 0;
            }
        } else if(this.format === 'j') {
            this.rd = '$0';
            this.rs = '$0';
            this.rt = '$0';
            this.imm = 0;
            this.offset = +array[1];
        } else {
            console.log('Unrecognized instruction:', string);
            Object.assign(this, new Instruction('NOP'));
        }
    }

    toString() {
        return this.asText;
    }
}
