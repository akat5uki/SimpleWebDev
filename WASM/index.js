import { hello1 } from "./assets/simple.js";

hello1();

const memory = new WebAssembly.Memory({ initial: 10, maximum: 100 });

new Uint32Array(memory.buffer)[0] = 70;

console.log(new Uint32Array(memory.buffer)[0]);