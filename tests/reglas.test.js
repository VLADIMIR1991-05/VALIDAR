const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = {
  console,
  TOLERANCIA_MM: 2
};
vm.createContext(context);

["db_codigos.js", "lector_codigos.js", "reglas_validacion.js"].forEach(file => {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInContext(source, context, { filename: file });
});

function validar(pieza, medida1, medida2, modulo) {
  return context.validarMedidasPieza(pieza, medida1, medida2, {
    ancho: 600,
    alto: 760,
    profundidad: 580,
    profundidadTotal: 580,
    grosor: 18,
    grosorRespaldo: 6,
    anchoInterno: 563,
    tieneTpm: false,
    contextoOrejas: {},
    contextoFrenteFalso: {},
    tipo: "B",
    cod: "B60H4P58",
    ...modulo
  });
}

assert.strictEqual(context.obtenerDimensionesCodigo("B60H4P58"), "600X760X580");

let resultado = validar("PT", 757, 597);
assert.strictEqual(resultado.ok, true, "puerta estandar de 600 mm debe descontar 3 mm en alto y ancho");

resultado = validar("PT", 760, 300);
assert.strictEqual(resultado.ok, false, "puerta sin fuga debe fallar");

resultado = validar("ZOC", 126, 600);
assert.strictEqual(resultado.ok, true, "zocalo debe validar altura 126");

resultado = validar("FON-MRV", 512, 474);
assert.strictEqual(resultado.ok, true, "fondo Merivobox debe descontar 88 mm y usar profundidad 474");

resultado = validar("FON-SS", 513, 490);
assert.strictEqual(resultado.ok, true, "fondo Slim debe descontar 87 mm y usar profundidad 490");

resultado = validar("FF", 152, 597);
assert.strictEqual(resultado.ok, true, "frente falso debe medir 152 por ancho menos 3");

resultado = validar("RESP", 574, 734);
assert.strictEqual(resultado.ok, true, "respaldo debe usar descuento de espesores y ranura");

resultado = validar("MALE", 563, 580, { tipo: "CL" });
assert.strictEqual(resultado.ok, true, "maletera de closet debe conservar la profundidad estructural completa");

resultado = validar("MALE", 563, 470, { tipo: "CL" });
assert.strictEqual(resultado.ok, false, "maletera no debe usar el descuento de profundidad de una repisa movil");

assert.strictEqual(context.grosorEstructuraPorDefecto("B"), 18, "modulos bajos usan estructura de 18 mm por defecto");
assert.strictEqual(context.grosorEstructuraPorDefecto("A"), 15, "modulos altos usan estructura de 15 mm por defecto");
assert.strictEqual(context.grosorEstructuraPorDefecto("CL"), 15, "closets usan estructura de 15 mm por defecto");

resultado = validar("PT", 757, 307, { ancho: 620 });
assert.strictEqual(resultado.ok, true, "desde 620 mm la puerta se divide en dos hojas");

resultado = validar("TPM", 563, 0, { profundidad: 40 });
assert.strictEqual(resultado.ok, true, "TPM no debe producir profundidades negativas en modulos poco profundos");

console.log("Pruebas de reglas OK");
