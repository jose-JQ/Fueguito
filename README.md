# Fueguito

Un regalito para Carito: una llamita que sigue el cursor con la mirada y dice una frase distinta según el momento.

## Cómo abrirlo

Es un sitio estático. Doble clic en `index.html`, o desde la carpeta del proyecto:

```bash
python3 -m http.server 8080
```

Entra a [http://localhost:8080](http://localhost:8080).

La canción y el recuerdito viven en internet, así que hace falta conexión para oírlos y verlos. Si el navegador bloquea el audio al abrir el archivo directo, usa el servidor de arriba y el botón **poner canción**.

## Qué puede hacer Carito

- Mover el cursor: los ojitos la siguen y, de vez en cuando, cambia la frase.
- Tocar el fueguito.
- Quedarse quieta un ratito.
- Sacar el cursor de la ventana y volver.
- Poner la canción o ver el recuerdito.

Las frases están en `js/fueguito.js`, por si quieres sumar alguna más.
