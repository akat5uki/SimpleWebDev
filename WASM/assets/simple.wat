(module
  (func $i (import "imports" "imported_func") (param i32))
  (func (export "exported_func")
    i32.const 49
    call $i))