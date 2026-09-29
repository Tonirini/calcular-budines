# GOSPA · Calculadora de batidas

App web estática, pensada para subir a GitHub y desplegar directamente en EasyPanel.

## Qué hace

1. Elegís el sabor.
2. Cargás cantidad de budines, materas, planchas y medias planchas.
3. Podés agregar varios sabores a una misma producción.
4. La app agrupa cada sabor y calcula automáticamente la batida.

### Tamaños

- Budín: 250 g
- Matera: 600 g

### Planchas

La plancha se calcula por unidades de receta, no por peso final:

- Sabor con regla 1.200:
  - 1 plancha = 2.400 g de premezcla
  - 1/2 plancha = 1.200 g de premezcla
- Sabor con regla real 1.000:
  - 1 plancha = 2.000 g de premezcla
  - 1/2 plancha = 1.000 g de premezcla

## Reglas cargadas

### Regla 1.200

- Premezcla: 1.200 g
- Huevo: 175 g
- Agua/líquido: 425 g
- Manteca: 200 g
- Maicena: 3 cucharadas
- Polvo: 3 cucharadas
- Rendimiento usado para budines/materas: 1.998 g

Se usa en naranja, manzana y cereza/coco.

### Premezcla real 1.000

- Premezcla: 1.000 g
- Huevo: 175 g
- Agua/líquido: 425 g
- Manteca: 200 g
- Maicena: 2 cucharadas
- Polvo: 2 cucharadas
- Rendimiento usado para budines/materas: 1.785 g

Se usa en vainilla, chocolate, marmolado, limón y variantes.

### Esencia

1 chorro por kg de premezcla. Chocolate no lleva.

## Naranja

Incluye una opción manual para aplicar el ajuste práctico observado en producción: +17,8% de premezcla en budines/materas. No se aplica automáticamente a planchas.

## Cómo subir a GitHub

Creá un repositorio nuevo y subí todos los archivos de esta carpeta a la raíz del repositorio.

También podés usar Git desde la terminal:

```bash
git init
git add .
git commit -m "Calculadora de batidas GOSPA"
git branch -M main
git remote add origin TU_URL_DE_GITHUB
git push -u origin main
```

## Cómo desplegar en EasyPanel

1. Crear un nuevo servicio desde GitHub.
2. Elegir el repositorio.
3. EasyPanel detectará el `Dockerfile`.
4. Puerto interno: `80`.
5. Asignar el dominio.
6. Deploy.

No necesita base de datos ni variables de entorno.

## Editar recetas

Las recetas están centralizadas al principio de `app.js`:

- `RECIPES`: sabores y reglas.
- `BASE`: cantidades base y rendimientos.

Así podés corregir un rendimiento o agregar un sabor sin tocar toda la app.
