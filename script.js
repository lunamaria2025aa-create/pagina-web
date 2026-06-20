document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. FRASES MOTIVACIONALES ---
    const frases = [
        "¡Vas a romper ese ICFES! Un paso a la vez. ✨",
        "Estudiar hoy es el superpoder de tu futuro. 🧠",
        "Tu esfuerzo de hoy valdrá la pena. ¡Dale con toda! 🚀",
        "¡Respiremos profundo! Eres muy capaz.",
        "Meta de hoy: Aprender algo nuevo. 📚"
    ];
    document.getElementById('textoFrase').textContent = frases[Math.floor(Math.random() * frases.length)];

    // --- 2. BASE DE DATOS DE LOS CUADERNOS ---
    let materiaActual = 'lectura';
    // Intentamos cargar lo que ya esté guardado, si no, creamos cuadernos vacíos
    let cuadernos = JSON.parse(localStorage.getItem('mis_cuadernos_icfes')) || {
        lectura: "", ingles: "", naturales: "", sociales: "", matematicas: ""
    };

    const blocNotas = document.getElementById('blocNotas');
    const tituloMateria = document.getElementById('tituloMateria');
    const estadoGuardado = document.getElementById('estadoGuardado');

    // Cargar texto de la materia por defecto
    blocNotas.value = cuadernos[materiaActual];

    // --- 3. CAMBIAR DE CUADERNO (PESTAÑAS) ---
    const botonesPestana = document.querySelectorAll('.tab-btn');
    botonesPestana.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Quitar clase activo al botón anterior y ponérselo al nuevo
            document.querySelector('.tab-btn.activo').classList.remove('activo');
            e.target.classList.add('activo');

            // Guardar lo de la materia anterior por si acaso
            cuadernos[materiaActual] = blocNotas.value;

            // Cambiar a la nueva materia
            materiaActual = e.target.getAttribute('data-materia');
            tituloMateria.textContent = `Cuaderno de ${e.target.textContent}`;
            blocNotas.value = cuadernos[materiaActual] || "";
        });
    });

    // --- 4. GUARDADO AUTOMÁTICO ---
    blocNotas.addEventListener('input', () => {
        cuadernos[materiaActual] = blocNotas.value;
        localStorage.setItem('mis_cuadernos_icfes', JSON.stringify(cuadernos));
        estadoGuardado.textContent = "Guardando en tiempo real... ✨";
        setTimeout(() => { estadoGuardado.textContent = "Cambios guardados automáticamente ✨"; }, 1000);
    });

    // --- 5. BUSCADOR GLOBAL ---
    const buscador = document.getElementById('buscador');
    buscador.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        if(termino === "") {
            estadoGuardado.textContent = "Cambios guardados automáticamente ✨";
            return;
        }

        let resultados = [];
        for (let materia in cuadernos) {
            if (cuadernos[materia].toLowerCase().includes(termino)) {
                resultados.push(materia.toUpperCase());
            }
        }

        if(resultados.length > 0) {
            estadoGuardado.textContent = `🔍 Encontrado en: ${resultados.join(', ')}`;
        } else {
            estadoGuardado.textContent = "❌ No se encontraron coincidencias.";
        }
    });

    // --- 6. REPRODUCTOR DE MÚSICA ---
    const audio = document.getElementById('reproductorAudio');
    const selectorSonido = document.getElementById('selectorSonido');
    const btnPlayPausa = document.getElementById('btnPlayPausa');
    const controlVolumen = document.getElementById('controlVolumen');

    // Cargar sonido inicial
    audio.src = selectorSonido.value;

    selectorSonido.addEventListener('change', () => {
        audio.src = selectorSonido.value;
        if (btnPlayPausa.textContent === '⏸️') audio.play();
    });

    btnPlayPausa.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            btnPlayPausa.textContent = '⏸️';
        } else {
            audio.pause();
            btnPlayPausa.textContent = '▶️';
        }
    });

    controlVolumen.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    // --- 7. HACER EL REPRODUCTOR ARRASTRABLE (Moverlo por la pantalla) ---
    const rep = document.getElementById('reproductor');
    const header = document.getElementById('reproductorHeader');
    let xInicial = 0, yInicial = 0, xFinal = 0, yFinal = 0;

    header.onmousedown = arrastrarMouseDown;

    function arrastrarMouseDown(e) {
        e.preventDefault();
        xFinal = e.clientX;
        yFinal = e.clientY;
        document.onmouseup = cerrarArrastreElemento;
        document.onmousemove = arrastrarElemento;
    }

    function arrastrarElemento(e) {
        e.preventDefault();
        xInicial = xFinal - e.clientX;
        yInicial = yFinal - e.clientY;
        xFinal = e.clientX;
        yFinal = e.clientY;
        rep.style.top = (rep.offsetTop - yInicial) + "px";
        rep.style.left = (rep.offsetLeft - xFinal) + "px";
        rep.style.bottom = "auto"; // Desactiva el bottom inicial de CSS
        rep.style.right = "auto";  // Desactiva el right inicial de CSS
    }

    function cerrarArrastreElemento() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
});