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

resultado = validar("FON-SS", 544, 490);
assert.strictEqual(resultado.ok, true, "fondo Slim debe descontar 56 mm y usar profundidad 490");

resultado = validar("FF", 152, 597);
assert.strictEqual(resultado.ok, true, "frente falso debe medir 152 por ancho menos 3");

resultado = validar("RESP", 574, 734);
assert.strictEqual(resultado.ok, true, "respaldo debe usar descuento de espesores y ranura");

resultado = validar("MALE", 563, 470, { tipo: "CL" });
assert.strictEqual(resultado.ok, true, "maletera de closet debe usar la profundidad de repisa de closet");

resultado = validar("MALE", 563, 580, { tipo: "CL" });
assert.strictEqual(resultado.ok, false, "maletera no debe conservar la profundidad completa del casco");

assert.strictEqual(context.grosorEstructuraPorDefecto("B"), 18, "modulos bajos usan estructura de 18 mm por defecto");
assert.strictEqual(context.grosorEstructuraPorDefecto("A"), 15, "modulos altos usan estructura de 15 mm por defecto");
assert.strictEqual(context.grosorEstructuraPorDefecto("CL"), 15, "closets usan estructura de 15 mm por defecto");

resultado = validar("PT", 757, 307, { ancho: 620 });
assert.strictEqual(resultado.ok, true, "desde 620 mm la puerta se divide en dos hojas");

resultado = validar("TPM", 563, 0, { profundidad: 40 });
assert.strictEqual(resultado.ok, true, "TPM no debe producir profundidades negativas en modulos poco profundos");

assert.strictEqual(context.obtenerDimensionesCodigo("FRENTE+HERRAJE-A94H29P6AB-SIM-ON"), "940X290X600", "FRENTE/HERRAJE no debe confundirse con altura HE");
assert.strictEqual(context.obtenerDimensionesCodigo("FXTR74.5H242-CALADO"), "2420X745", "forramiento FXTR debe conservar alto y ancho");
assert.strictEqual(context.obtenerDimensionesCodigo("TPL190P7"), "1900X700", "tapa losa debe interpretar P7 como 700 mm totales");

resultado = validar("ESP1FXTR-CALADO", 2420, 745, { ancho: 0, alto: 2420, profundidad: 745, profundidadTotal: 745, tipo: "FXTR" });
assert.strictEqual(resultado.ok, true, "forramiento especial debe conservar dimensiones sin descuentos");

resultado = validar("ESP2POS-SM", 232, 71, { ancho: 300, alto: 380, tipo: "SOLO-GAV-INT-PEQ-MBS" });
assert.strictEqual(resultado.ok, true, "posterior Metabox debe usar ancho menos 68 y alto constante 71");

resultado = validar("ESP2FON-SM", 232, 483, { ancho: 300, alto: 380, tipo: "SOLO-GAV-INT-PEQ-MBS" });
assert.strictEqual(resultado.ok, true, "fondo Metabox debe usar ancho menos 68 y fondo constante 483");

resultado = validar("FVHZ-I-S", 722, 610, { ancho: 610, alto: 760, tipo: "FB", cod: "FB61HZ-I-S" });
assert.strictEqual(resultado.ok, true, "frente visto Henzo debe descontar 35 y fuga 3 solo al alto");

resultado = validar("LAT-HZ", 760, 150, { ancho: 610, alto: 760, profundidad: 610, profundidadTotal: 610, tipo: "FB", cod: "FB61HZ-I-S" });
assert.strictEqual(resultado.ok, true, "lateral de forro bajo debe usar profundidad 150");

resultado = validar("BAS", 573, 60, { ancho: 610, anchoInterno: 573, alto: 760, profundidad: 610, tipo: "FB", cod: "FB61HZ-I-S" });
assert.strictEqual(resultado.ok, true, "base de forro bajo debe validar ancho interno por 60");

resultado = validar("ESP1TEC=TECHO", 613, 554, { ancho: 650, anchoInterno: 613, alto: 760, profundidad: 580, grosor: 18, grosorRespaldo: 6, cod: "B65P6MH-G1MRV-ON-HZ-S-B" });
assert.strictEqual(resultado.ok, true, "techo especial Merivobox debe usar profundidad 554");

resultado = validar("ESP1FON-MRV=FONDO", 562, 474, { ancho: 650 });
assert.strictEqual(resultado.ok, true, "pieza especial fondo Merivobox debe conservar su regla");

resultado = validar("ESP1POS-MRV=POSTERIOR", 562, 184, { ancho: 650 });
assert.strictEqual(resultado.ok, true, "pieza especial posterior Merivobox debe conservar su regla");

resultado = validar("ESP2PT-ABX", 287, 937, { ancho: 940, alto: 290, tipo: "FRENTE-HERRAJE-A", cod: "FRENTE+HERRAJE-A94H29P6AB-SIM-ON" });
assert.strictEqual(resultado.ok, true, "puerta abatible especial debe descontar fuga 3");

resultado = validar("TPL", 1900, 700, { ancho: 1900, alto: 0, profundidad: 680, profundidadTotal: 700, tipo: "TPL", cod: "TPL190P7" });
assert.strictEqual(resultado.ok, true, "tapa losa debe conservar profundidad total 700");

resultado = validar("ESP1PT", 397, 567, { ancho: 800, alto: 760, cod: "B80P4-G1-2P-MRV" });
assert.strictEqual(resultado.ok, true, "G1-2P-MRV debe reservar H1 para gaveta y dividir dos puertas en el alto restante");

resultado = validar("ESP1FON-MRV", 712, 324, { ancho: 800, profundidad: 420, profundidadTotal: 440, cod: "B80P4-G1-2P-MRV" });
assert.strictEqual(resultado.ok, true, "fondo Merivobox P4 debe usar profundidad constante 324");

resultado = validar("ESP1FON-MRV", 712, 474, { ancho: 800, profundidad: 420, profundidadTotal: 440, cod: "B80P4-G1-2P-MRV" });
assert.strictEqual(resultado.ok, false, "fondo Merivobox P4 no debe aceptar la constante profunda 474");

resultado = validar("ESP1FRE", 452, 647, { ancho: 650, alto: 760, cod: "B65P6MH-G1MRV-ON-HZ-S-B" });
assert.strictEqual(resultado.ok, true, "frente microondas debe completar el alto con gaveta, fugas y Henzo");

resultado = validar("ESP1FC", 267, 647, { ancho: 650, alto: 760, cod: "B65P6MH-G1MRV-ON-HZ-S-B" });
assert.strictEqual(resultado.ok, true, "frente de gaveta microondas Henzo debe validar 267 por ancho menos 3");

assert.ok(context.obtenerNombre("B65P6MH-G1MRV-ON-HZ-S-B").includes("GAVETA SIN BOX SIDE"), "S-B debe interpretarse como Gaveta sin Box Side");

resultado = validar("FON-SS", 244, 490, { ancho: 300, cod: "B30COG2IN-SLIM-T-HZ" });
assert.strictEqual(resultado.ok, true, "fondo de condimentero Slim debe descontar 56 y usar profundidad 490");

resultado = validar("POS-SS", 223, 63, { ancho: 300, cod: "B30COG2IN-SLIM-T-HZ" });
assert.strictEqual(resultado.ok, true, "posterior bajo de condimentero Slim debe validar 223 por 63");

resultado = validar("POS-SS", 223, 300, { ancho: 300, cod: "B30COG2IN-SLIM-T-HZ" });
assert.strictEqual(resultado.ok, true, "posterior alto de condimentero Slim debe validar 223 por 300");

resultado = validar("FRI-SS", 260, 110, { ancho: 300, cod: "B30COG2IN-SLIM-T-HZ" });
assert.strictEqual(resultado.ok, true, "frente interno de condimentero Slim debe validar ancho menos 40 por 110");

resultado = validar("FON-SS", 213, 490, { ancho: 300, cod: "B30COG2IN-SLIM-T-HZ" });
assert.strictEqual(resultado.ok, false, "Slim no debe volver al descuento antiguo de 87 mm");

resultado = validar("FON-SS", 544, 490, { ancho: 600, cod: "B60G3IN-SLIM-HZ" });
assert.strictEqual(resultado.ok, true, "fondo Slim general debe validar ancho menos 56 por 490");

resultado = validar("POS-SS", 523, 63, { ancho: 600, cod: "B60G3IN-SLIM-HZ" });
assert.strictEqual(resultado.ok, true, "posterior de gaveta interna Slim debe usar alto 63");

resultado = validar("POS-SS", 523, 199, { ancho: 600, cod: "B60G3IN-SLIM-HZ" });
assert.strictEqual(resultado.ok, true, "posterior de gaveta normal Slim debe usar alto 199");

resultado = validar("FRI-SS", 560, 110, { ancho: 600, cod: "B60G3IN-SLIM-HZ" });
assert.strictEqual(resultado.ok, true, "frente interno Slim debe validar ancho menos 40 por 110");

assert.strictEqual(context.obtenerDimensionesCodigo("BSX95H223-BF"), "950X2230X75", "BSX sin P debe usar profundidad predeterminada 75");
assert.strictEqual(context.obtenerDimensionesCodigo("BSX95H223P4-BF"), "950X2230X420", "BSX con P debe respetar la profundidad explicita");
assert.ok(context.obtenerNombre("BSX95H223-BF").includes("Bastidor Suspendido Auxiliar"), "BSX debe mostrar su nomenclatura completa");

resultado = validar("MALE", 509, 470, { ancho: 540, anchoInterno: 509, alto: 2120, profundidad: 580, tipo: "CL", cod: "CL54IC1" });
assert.strictEqual(resultado.ok, true, "maletera CL54 debe validar 509 por 470");

resultado = validar("ZAPAP", 508, 320, { ancho: 540, anchoInterno: 509, alto: 2120, profundidad: 580, tipo: "CL", cod: "CL54IC1" });
assert.strictEqual(resultado.ok, true, "zapatera debe usar ancho interno menos 1 y profundidad fija 320");

resultado = validar("LATR", 1350, 340, { ancho: 1350, alto: 0, profundidad: 340, profundidadTotal: 340, tipo: "LATR-H", cod: "LATR-H135" });
assert.strictEqual(resultado.ok, true, "LATR-H debe conservar altura del codigo por profundidad fija 340");

resultado = validar("LBE3", 878, 940, { ancho: 940, alto: 760, profundidad: 0, tipo: "LB", cod: "LB94E3-NIV" });
assert.strictEqual(resultado.ok, true, "lateral bajo LB debe validar altura fija 878 por ancho del codigo");

resultado = validar("FON-SS", 244, 490, { ancho: 300, alto: 570, profundidad: 530, tipo: "MBS", cod: "MBS30H3G2IN-SLIM-HZ" });
assert.strictEqual(resultado.ok, true, "fondo Slim MBS30 debe validar 244 por profundidad constante 490");

resultado = validar("POS-SS", 223, 63, { ancho: 300, alto: 570, profundidad: 530, tipo: "MBS", cod: "MBS30H3G2IN-SLIM-HZ" });
assert.strictEqual(resultado.ok, true, "posterior interno Slim MBS30 debe validar 223 por altura constante 63");

resultado = validar("POS-SS", 223, 199, { ancho: 300, alto: 570, profundidad: 530, tipo: "MBS", cod: "MBS30H3G2IN-SLIM-HZ" });
assert.strictEqual(resultado.ok, true, "posterior normal Slim MBS30 debe validar 223 por altura constante 199");

resultado = validar("FRI-SS", 260, 110, { ancho: 300, alto: 570, profundidad: 530, tipo: "MBS", cod: "MBS30H3G2IN-SLIM-HZ" });
assert.strictEqual(resultado.ok, true, "frente interno Slim MBS30 debe validar 260 por altura constante 110");

console.log("Pruebas de reglas OK");
