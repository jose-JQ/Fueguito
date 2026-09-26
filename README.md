# Fueguito

Un regalito para Carito: una llamita con sombrero de paja que sigue el cursor y dice una frase distinta según el momento.

Solo hay HTML, CSS y JavaScript. No hace falta instalar nada ni compilar.

## Abrirlo en tu computadora

Doble clic en `index.html`.

O, desde esta carpeta:

```bash
python3 -m http.server 8080
```

Entra a [http://localhost:8080](http://localhost:8080).

## Publicarlo en GitHub Pages

1. En el repositorio, abre **Settings → Pages**.
2. En **Build and deployment**, elige **Deploy from a branch**.
3. Branch: **`main`** cuando el cambio ya esté fusionado. Para previsualizar antes, elige esta rama.
4. Carpeta: **`/` (root)**.
5. Guarda. En unos minutos queda publicado en `https://jose-jq.github.io/Fueguito/`.

El archivo `.nojekyll` hace que Pages sirva la carpeta tal cual, sin pasarla por Jekyll.

## Qué puede hacer Carito

- Mover el cursor: los ojitos la siguen y, de vez en cuando, cambia la frase.
- Tocar el fueguito.
- Quedarse quieta un ratito.
- Sacar el cursor de la ventana y volver.

Las frases están en `js/fueguito.js`.

Fredoka y Nunito viven en `fonts/` bajo la licencia OFL (ver `fonts/OFL-Fredoka.txt` y `fonts/OFL-Nunito.txt`). El sombrero, el mar y la llama están dibujados en este repo, sin imágenes oficiales.
