# VALIDAR

Aplicacion web estatica para validar despieces de muebles Madeval desde archivos Excel o CSV.

## Uso

1. Abrir `index.html` o la version publicada en GitHub Pages.
2. Cargar un archivo `.xlsx`, `.xls` o `.csv`.
3. Revisar los muebles agrupados por OP.
4. Usar `Validar estructura` para marcar piezas correctas y piezas con error.
5. Usar `Exportar reporte` para descargar el resultado en CSV.
6. Usar `Comparar archivos` para revisar faltantes, sobrantes y piezas cambiadas entre dos archivos.

## Columnas esperadas

El sistema intenta detectar columnas aunque el encabezado cambie ligeramente:

- `op`
- `Tipo`
- `cod_mueble`
- `jov` o `job`
- `cod_pieza`
- `cant_piezas`
- `medida1`
- `medida2`
- `l1`, `l2`, `c1`, `c2`
- `nomueble`, `ubicacion` o `ubi`
- `material_nombre`

Si faltan columnas requeridas, la app muestra una advertencia y mantiene la tabla visible.

## Mejoras incluidas

- Correccion de caracteres danados en la base de codigos.
- Version visible de reglas.
- Validacion automatica opcional al cargar archivos.
- Exportacion de reporte de validacion a CSV.
- Exportacion de reporte de comparacion a CSV.
- Mensajes de error con medida esperada, encontrada y diferencia minima.
- Vista movil con formato completo y zoom/pan nativo, como al revisar una imagen.
- Ancho de trabajo estable para que las tablas no se desarmen en celular.
- Pruebas automatizadas basicas para reglas criticas.
- Documentacion del formato esperado.
- Separacion operativa clara entre base de codigos, lector, reglas y pantalla.
- Espesores estructurales por defecto segun familia: bajos 18 mm; altos y closets 15 mm.
- Maleteras de closet validadas con profundidad completa, sin confundirlas con repisas moviles.
- Constantes generales de fugas, ranura, puertas, TPM y repisas centralizadas para evitar reglas divergentes.

## Desarrollo

No requiere instalacion para usarse en navegador. Para ejecutar pruebas con Node:

```bash
npm test
```

Las pruebas cargan `db_codigos.js`, `lector_codigos.js` y `reglas_validacion.js` en un entorno aislado.

## Archivos principales

- `index.html`: interfaz y estilos.
- `app.js`: lectura de archivos, filtros, renderizado, comparacion y exportacion.
- `lector_codigos.js`: interpretacion de codigos de muebles.
- `reglas_validacion.js`: reglas dimensionales por pieza.
- `db_codigos.js`: diccionario de nomenclaturas.
- `tests/reglas.test.js`: pruebas basicas de reglas.
