// jshint esversion: 6
// jshint globalstrict: true
// jshint devel: true
// jshint browser: true
'use strict';


class OpInfo {
    constructor(category, format, aluFunction) {
        this.category = category;
        this.format = format;
        this.aluFunction = aluFunction || noop;
    }
}


function noop(a, b) {
    return 0;
}


var _opcodes = {
    NOOP: new OpInfo('alu', 'r', noop),
    ADD:  new OpInfo('alu', 'r', (a, b) => a + b),
    SUB:  new OpInfo('alu', 'r', (a, b) => a - b),
    AND:  new OpInfo('alu', 'r', (a, b) => a & b),
    OR:   new OpInfo('alu', 'r', (a, b) => a | b),

    ADDI: new OpInfo('alu', 'i', (a, b) => a + b),

    LW: new OpInfo('loadStore', 'i'),
    SW: new OpInfo('loadStore', 'i'),

    // Branch instructions use ALU zero to determine if the
    // branch condition was met.
    BNE: new OpInfo('branch', 'i', (a, b) => Number(a & b)),
};


class Instruction {
    constructor(string) {
        let array = string
            .split(' ')
            .filter((str) => str !== '')
            .map((str) => str.toUpperCase());

        this.asText = string;
        this.op = array[0];

        Object.assign(this, _opcodes[this.op]);

        if(this.format === 'r') {
            if(this.op === 'NOOP') {
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
            Object.assign(this, new Instruction('NOOP'));
        }
    }
}
