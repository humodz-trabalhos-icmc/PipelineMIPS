// jshint esversion: 6
// jshint globalstrict: true
// jshint devel: true
// jshint browser: true
/* globals Instruction, clear */
'use strict';

class Cpu {
    constructor(that) {
        if(that === undefined) {
            // Create new Cpu object
            this.programCounter = 0;
            this.registers = {};
            this.instructionMem = [];
            this.dataMem = [];

            let numRegisters = 4;
            this.registers.$0 = 0;
            for(let i = 0; i < numRegisters; i++) {
                this.registers['$R' + i] = 0;
            }

            let nop = new Instruction('NOP');

            this.if_id = {ir: nop, newPc: 0,};
            this.id_ex = {ir: nop, newPc: 0, a: 0, b: 0};
            this.ex_mem = {ir: nop, aluOutput: 0, b: 0, zero: 0, branchAddress: 0,};
            this.mem_wb = {ir: nop, aluOutput: 0, lmd: 0,};
        } else {
            // Copy attributes from @that
            this.programCounter = that.programCounter;

            let arrays = ['instructionMem', 'dataMem'];
            let objects = ['registers', 'if_id', 'id_ex', 'ex_mem', 'mem_wb'];

            arrays.forEach((attr) => {
                this[attr] = that[attr].slice();
            });

            objects.forEach((attr) => {
                this[attr] = Object.assign({}, that[attr]);
            });
        }
    }

    setNextInstruction(instruction) {
        let pc = this.if_id.programCounter;
        this.instructionMem[pc + 1] = instruction;
    }

    getRegister(reg) {
        let value = +this.registers[reg] || 0;
        console.log('Reading register', reg, '=', value);
        return value;
    }

    setRegister(reg, value) {
        console.log('Setting register', reg, 'to', value);
        if(reg !== '$0') {
            this.registers[reg] = +value;
        }
    }

    getInstruction(address) {
        address = convertAddress(address);
        let inst = this.instructionMem[address] || 'NOOP';
        console.log('Fetching instruction:', inst);
        return new Instruction(inst);
    }

    getMemoryPosition(address) {
        address = convertAddress(address);
        let value = +this.dataMem[address] || 0;
        console.log('Reading memory at', address, '=', value);
        return value;
    }

    setMemoryPosition(address, value) {
        console.log('Setting memory position', address, 'to', value);
        address = convertAddress(address);
        this.dataMem[address] = +value;
    }

    update() {
        let next = this.nextState();
        Object.assign(this, next);
        return this;
    }

    nextState() {
        let prev = this;
        let next = new Cpu(this);

        // WB happens first to update registers
        banner('WB');
        next.updateWb(prev);

        banner('IF');
        next.updateIf(prev);
        banner('ID');
        next.updateId(prev);
        banner('EX');
        next.updateEx(prev);
        banner('MEM');
        next.updateMem(prev);

        return next;
    }

    updateIf(prev) {
        this.if_id.ir = prev.getInstruction(prev.programCounter);
        console.log(this.if_id.ir.asText);

        let newPc;
        if(prev.ex_mem.zero && prev.ex_mem.ir.category === 'branch') {
            console.log('Taking branch');
            newPc = prev.ex_mem.branchAddress;
        } else {
            newPc = prev.programCounter + 4;
        }

        this.programCounter = newPc;
        this.if_id.newPc = newPc;

        console.log(this.if_id);
        return this;
    }

    updateId(prev) {
        console.log(prev.if_id.ir.asText);
        this.id_ex.ir = prev.if_id.ir;
        this.id_ex.newPc = prev.if_id.newPc;

        let ir = prev.if_id.ir;
        // This part reads from this instead of prev to deal with structural hazards
        this.id_ex.a = this.getRegister(ir.rs);
        this.id_ex.b = this.getRegister(ir.rt);
        this.id_ex.imm = ir.imm;

        console.log(this.id_ex);
        return this;
    }

    updateEx(prev) {
        console.log(prev.id_ex.ir.asText);
        this.ex_mem.ir = prev.id_ex.ir;
        this.ex_mem.branchAddress = 0;

        let category = prev.id_ex.ir.category;

        if(category === 'alu') {
            console.log('alu');
            this.updateExAlu(prev);
        } else if(category === 'loadStore') {
            console.log('loadStore');
            this.updateExLoadStore(prev);
        } else if(category === 'branch') {
            console.log('branch');
            this.updateExBranch(prev);
        } else {
            console.log('Unrecognized op: ', prev.id_ex.ir);
        }
        this.ex_mem.zero = Number(this.ex_mem.aluOutput === 0);

        console.log(this.ex_mem);
        return this;
    }

    updateExAlu(prev) {
        let a = prev.id_ex.a;
        let b;
        if(prev.id_ex.ir.format === 'i') {
            b = prev.id_ex.imm;
        } else {
            b = prev.id_ex.b;
        }

        this.ex_mem.aluOutput = prev.id_ex.ir.aluFunction(a, b);
        return this;
    }

    updateExLoadStore(prev) {
        this.ex_mem.aluOutput = prev.id_ex.a + prev.id_ex.imm;

        this.ex_mem.b = prev.id_ex.b;
        return this;
    }

    updateExBranch(prev) {
        let a = prev.id_ex.a;
        let b = prev.id_ex.b;

        this.ex_mem.aluOutput = prev.id_ex.ir.aluFunction(a, b);

        this.ex_mem.branchAddress = prev.id_ex.newPc + (prev.id_ex.imm << 2);

        return this;
    }

    updateMem(prev) {
        console.log(prev.ex_mem.ir.asText);
        this.mem_wb.ir = prev.ex_mem.ir;
        let category = prev.ex_mem.ir.category;

        this.mem_wb.aluOutput = prev.ex_mem.aluOutput;
        this.mem_wb.lmd = prev.getMemoryPosition(prev.ex_mem.aluOutput);

        if(category === 'alu') {
            console.log('alu');
            // Update aluOutput
        } else if(category === 'loadStore') {
            console.log('loadStore');

            let op = prev.ex_mem.ir.op;
            if(op === 'LW') {
                // Update LMD
            } else if(op === 'SW') {
                this.setMemoryPosition(prev.ex_mem.aluOutput, prev.ex_mem.b);
            } else {
                console.log('Unexpected instruction:', prev.ex_mem.ir);
            }
        } else if(category === 'branch') {
            // Do nothing
            console.log('branch');
        } else {
            console.log('Unexpected instruction:', prev.mem_wb.ir);
        }

        console.log(this.mem_wb);
        return this;
    }

    updateWb(prev) {
        console.log(prev.mem_wb.ir.asText);
        let category = prev.mem_wb.ir.category;

        if(category === 'alu') {
            console.log('alu');
            this.updateWbAlu(prev);
        } else if(category === 'loadStore') {
            console.log('loadStore');
            this.updateWbLoadStore(prev);
        } else if(category === 'branch') {
            // Do nothing
            console.log('branch');
        } else {
            console.log('Unexpected instruction:', prev.mem_wb.ir);
        }

        return this;
    }

    updateWbAlu(prev) {
        let format = prev.mem_wb.ir.format;
        let targetReg;

        if(format === 'r') {
            targetReg = prev.mem_wb.ir.rd;
        } else if(format === 'i') {
            targetReg = prev.mem_wb.ir.rt;
        } else {
            console.log('Unexpected instruction:', prev.ex_mem.ir);
        }

        this.setRegister(targetReg, prev.mem_wb.aluOutput);
        return this;
    }

    updateWbLoadStore(prev) {
        if(prev.mem_wb.ir.op === 'LW') {
            this.setRegister(prev.mem_wb.ir.rt, prev.mem_wb.lmd);
        }
        return this;
    }
}


function banner(text) {
    let bars = Array(10).join('=');
    console.log(bars, text, bars);
}


// Divide by 4 and convert to integer
function convertAddress(address) {
    return Math.floor((+address / 4) | 0);
}
