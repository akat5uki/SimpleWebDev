const importObject = {
    imports: { imported_func: (arg) => console.log(arg) },
};

WebAssembly.instantiateStreaming(fetch("http://127.0.0.46:8046/assets/bin/simple3bin.wasm"), importObject).then(
    (obj) => obj.instance.exports.exported_func(),
);

export function hello1(){
    return importObject.imports.imported_func("hello world !!!");
}