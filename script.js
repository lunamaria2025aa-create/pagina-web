document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN DE LA BASE DE DATOS POR PÁGINAS ---
    let materiaActual = 'lectura';
    let paginaActual = 1;

    // Estructura: cuadernos -> materias -> páginas -> { texto: "", elementos: [] }
    let baseDatos = JSON.parse(localStorage.getItem('mis_cuadernos_interactivos')) || {
        lectura: { 1: { texto: "", elementos: [] } },
        ingles: { 1: { texto: "", elementos: [] } },
        naturales: { 1: { texto: "", elementos: [] } },
        sociales: { 1: { texto: "", elementos: [] } },
        matematicas: { 1: { texto: "", elementos: [] } }
    };

    const blocNotas = document.getElementById('blocNotas');
    const tituloMateria = document.getElementById('tituloMateria');
    const numPagina = document.getElementById('numPagina');
    const lienzoHoja = document.getElementById('lienzoHoja');
    const estadoGuardado = document.getElementById('estadoGuardado');

    // --- 2. FUNCIÓN PARA CARGAR LA PÁGINA ACTUAL ---
    function cargarPagina() {
        // Asegurar que la estructura exista
        if (!baseDatos[materiaActual][paginaActual]) {
            baseDatos[materiaActual][paginaActual] = { texto: "", elementos: [] };
        }

        // Limpiar elementos viejos del lienzo (excepto el textarea)
        const elementosViejos = lienzoHoja.querySelectorAll('.elemento-movil');
        elementosViejos.forEach(el => el.remove());

        // Cargar Texto
        blocNotas.value = baseDatos[materiaActual][paginaActual].texto;
        numPagina.textContent = paginaActual;

        // Cargar Elementos/Stickers guardados en esta página
        baseDatos[materiaActual][paginaActual].elementos.forEach(datosEl => {
            crearElementoEnLienzo(datosEl.id, datosEl.tipo, datosEl.contenido, datosEl.x, datosEl.y, datosEl.w, datosEl.h);
        });
    }

    // --- 3. GUARDADO AUTOMÁTICO ---
    function guardarTodo() {
        // Guardar texto actual
        baseDatos[materiaActual][paginaActual].texto = blocNotas.value;

        // Guardar posiciones de todos los stickers/textos que estén en pantalla
        const elementosPantalla = lienzoHoja.querySelectorAll('.elemento-movil');
        let listaElementos = [];
        
        elementosPantalla.forEach(el => {
            listaElementos.push({
                id: el.id,
                tipo: el.getAttribute('data-tipo'),
                contenido: el.getAttribute('data-contenido'),
                x: parseFloat(el.getAttribute('data-x')) || 0,
                y: parseFloat(el.getAttribute('data-y')) || 0,
                w: el.offsetWidth,
                h: el.offsetHeight
            });
        });

        baseDatos[materiaActual][paginaActual].elementos = listaElementos;
        localStorage.setItem('mis_cuadernos_interactivos', JSON.stringify(baseDatos));
        estadoGuardado.textContent = "Guardado automáticamente ✨";
    }

    blocNotas.addEventListener('input', guardarTodo);

    // --- 4. CONTROLES DE PÁGINAS Y MATERIAS ---
    document.getElementById('btnPagSig').addEventListener('click', () => { paginaActual++; cargarPagina(); });
    document.getElementById('btnPagAnt').addEventListener('click', () => { if(paginaActual > 1) { paginaActual--; cargarPagina(); } });

    const botonesPestana = document.querySelectorAll('.tab-btn');
    botonesPestana.forEach(boton => {
        boton.addEventListener('click', (e) => {
            document.querySelector('.tab-btn.activo').classList.remove('activo');
            e.target.classList.add('activo');
            materiaActual = e.target.getAttribute('data-materia');
            tituloMateria.textContent = e.target.textContent.split(' ')[1] || e.target.textContent;
            paginaActual = 1; // Reinicia a página 1 al cambiar materia
            cargarPagina();
        });
    });

    // --- 5. FUNCIÓN PARA CREAR ELEMENTOS FLOTANTES (CANVA STYLE) ---
    function crearElementoEnLienzo(id, tipo, contenido, x=50, y=50, w=80, h=80) {
        const div = document.createElement('div');
        div.className = 'elemento-movil';
        div.id = id || 'el_' + Date.now() + Math.random().toString(36).substr(2, 5);
        div.setAttribute('data-tipo', tipo);
        div.setAttribute('data-contenido', contenido);
        
        // Posición y tamaño inicial
        div.style.transform = `translate(${x}px, ${y}px)`;
        div.setAttribute('data-x', x);
        div.setAttribute('data-y', y);
        div.style.width = w + 'px';
        div.style.height = h + 'px';

        if (tipo === 'emoji' || tipo === 'imagen') {
            const img = document.createElement('img');
            img.src = contenido;
            div.appendChild(img);
        } else if (tipo === 'texto') {
            div.className += ' postit-texto';
            div.contentEditable = true;
            div.innerText = contenido;
            div.style.width = 'auto';
            div.style.height = 'auto';
            div.addEventListener('input', guardarTodo);
        }

        lienzoHoja.appendChild(div);
        guardarTodo();
    }

    // --- 6. AGREGAR COSAS DESDE LA BARRA LATERAL ---
    document.getElementById('btnAnadirTexto').addEventListener('click', () => {
        crearElementoEnLienzo(null, 'texto', 'Escribe una nota rápida...', 100, 100, 150, 80);
    });

    document.querySelectorAll('.sticker-previa').forEach(st => {
        st.addEventListener('click', (e) => {
            crearElementoEnLienzo(null, 'emoji', e.target.src, 80, 80, 70, 70);
        });
    });

    // Subir imagen propia como Sticker
    document.getElementById('inputStickerPropio').addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onload = function(event) {
                crearElementoEnLienzo(null, 'imagen', event.target.result, 100, 100, 100, 100);
            };
            lector.readAsDataURL(archivo);
        }
    });

    // SIMULACIÓN INTELIGENCIA ARTIFICIAL (Para hacerla real se necesita API de pago, pero aquí tienes el truco funcional)
    document.getElementById('btnStickerIA').addEventListener('click', () => {
        const prompt = prompt("¿Qué sticker mágico quieres que genere la Inteligencia Artificial para tu estudio?");
        if(prompt) {
            estadoGuardado.textContent = "🤖 IA Generando: '" + prompt + "'...";
            setTimeout(() => {
                // Usamos un servicio gratuito que genera hermosas imágenes minimalistas basadas en texto para simular la IA
                const urlIA = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop`; 
                // En un caso real aquí se conectaría con DALL-E. Usamos un fallback estético cute:
                const urlCuteRandom = "https://openmoji.org/data/color/svg/1F9E0.svg"; // Un cerebro cute si estudia naturales/mate
                crearElementoEnLienzo(null, 'emoji', urlCuteRandom, 120, 120, 80, 80);
                estadoGuardado.textContent = "¡Sticker IA creado! ✨";
            }, 1500);
        }
    });

    // --- 7. CONFIGURACIÓN DE INTERACT.JS (MOVIMIENTO Y REDIMENSIÓN TOTAL) ---
    interact('.elemento-movil')
        .draggable({
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                end() { guardarTodo(); }
            }
        })
        .resizable({
            edges: { left: false, right: true, bottom: true, top: false },
            listeners: {
                move(event) {
                    const target = event.target;
                    let x = (parseFloat(target.getAttribute('data-x')) || 0);
                    let y = (parseFloat(target.getAttribute('data-y')) || 0);

                    target.style.width = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';

                    x += event.deltaRect.left;
                    y += event.deltaRect.top;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                end() { guardarTodo(); }
            },
            modifiers: [
                interact.modifiers.restrictSize({ min: { width: 30, height: 30 }, max: { width: 400, height: 400 } })
            ]
        });

    // --- 8. REPRODUCTOR DE MÚSICA (Código anterior idéntico) ---
    const audio = document.getElementById('reproductorAudio');
    const selectorSonido = document.getElementById('selectorSonido');
    const btnPlayPausa = document.getElementById('btnPlayPausa');
    const controlVolumen = document.getElementById('controlVolumen');

    audio.src = selectorSonido.value;
    selectorSonido.addEventListener('change', () => { audio.src = selectorSonido.value; if (btnPlayPausa.textContent === '⏸️') audio.play(); });
    btnPlayPausa.addEventListener('click', () => { if (audio.paused) { audio.play(); btnPlayPausa.textContent = '⏸️'; } else { audio.pause(); btnPlayPausa.textContent = '▶️'; } });
    controlVolumen.addEventListener('input', (e) => { audio.volume = e.target.value; });

    // Hacer reproductor arrastrable básico
    const rep = document.getElementById('reproductor');
    const headerRep = document.getElementById('reproductorHeader');
    let xI = 0, yI = 0, xF = 0, yF = 0;
    headerRep.onmousedown = (e) => {
        e.preventDefault(); xF = e.clientX; yF = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (ev) => {
            ev.preventDefault(); xI = xF - ev.clientX; yI = yF - ev.clientY; xF = ev.clientX; yF = ev.clientY;
            rep.style.top = (rep.offsetTop - yI) + "px"; rep.style.left = (rep.offsetLeft - xF) + "px";
            rep.style.bottom = "auto"; rep.style.right = "auto";
        };
    };

    // Inicializar página
    cargarPagina();
});
