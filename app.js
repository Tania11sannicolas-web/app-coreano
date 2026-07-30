// Configuración de Supabase (Tus credenciales se mantienen igual)
const SUPABASE_URL = 'https://gkunigyqgetqvjsovzjy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdW5pZ3lxZ2V0cXZqc292emp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjc1MzEsImV4cCI6MjEwMDk0MzUzMX0.Co8JkEWVJGlexJGG5WJbnLPb63pYvdX-y5HfYTd6fsg';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let listaVocabulario = [];
let indiceActual = 0;

// Paquete de inicio (Se usará si tu base de datos de Supabase está vacía)
const vocabularioPorDefecto = [
    { coreano: "안녕하세요", espanol: "Hola / Buenos días" },
    { coreano: "감사합니다", espanol: "Gracias (formal)" },
    { coreano: "사랑해", espanol: "Te amo" },
    { coreano: "물", espanol: "Agua" },
    { coreano: "친구", espanol: "Amigo/a" },
    { coreano: "학교", espanol: "Escuela" },
    { coreano: "네", espanol: "Sí" },
    { coreano: "아니요", espanol: "No" },
    { coreano: "맛있어요", espanol: "¡Está delicioso!" },
    { coreano: "고양이", espanol: "Gato" }
];

// Esperar a que cargue la página
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();

    document.getElementById('btn-signup').addEventListener('click', handleSignup);
    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('btn-audio').addEventListener('click', reproducirAudioActual);
    document.getElementById('btn-siguiente').addEventListener('click', cargarSiguienteVocabulario);
    document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
});

// Registro e Inicio de sesión (Sin cambios, funcionaba bien)
async function handleSignup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if(!email || !password) {
        alert('Por favor ingresa correo y contraseña.');
        return;
    }

    const { data, error } = await _supabase.auth.signUp({ email, password });
    if (error) {
        alert('Error en registro: ' + error.message);
    } else {
        alert('¡Registro exitoso! Ya puedes ingresar.');
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if(!email || !password) {
        alert('Por favor ingresa correo y contraseña.');
        return;
    }

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert('Error al ingresar: ' + error.message);
    } else {
        verificarSesion();
    }
}

async function verificarSesion() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        
        // Extraemos solo el nombre de usuario antes del @ para que se vea más estético
        const nombreUsuario = session.user.email.split('@')[0];
        document.getElementById('user-info').innerText = `Hola, ${nombreUsuario} ✨`;
        
        cargarVocabularioDesdeBaseDeDatos();
    }
}

async function cerrarSesion() {
    await _supabase.auth.signOut();
    location.reload();
}

// Cargar datos (Con sistema de respaldo para nunca quedarnos sin palabras)
async function cargarVocabularioDesdeBaseDeDatos() {
    const { data, error } = await _supabase.from('vocabulario').select('*');
    
    if (error || !data || data.length === 0) {
        console.log('Usando vocabulario por defecto. Si quieres usar la base de datos, asegúrate de tener datos en la tabla "vocabulario".');
        listaVocabulario = vocabularioPorDefecto;
    } else {
        listaVocabulario = data;
    }
    
    mostrarVocabularioActual();
}

function mostrarVocabularioActual() {
    if (listaVocabulario.length === 0) return;
    const item = listaVocabulario[indiceActual];
    
    // Agregamos una pequeña animación al texto cuando cambia
    const textoCoreano = document.getElementById('palabra-coreano');
    textoCoreano.style.opacity = 0;
    
    setTimeout(() => {
        textoCoreano.innerText = item.coreano;
        document.getElementById('palabra-espanol').innerText = item.espanol;
        textoCoreano.style.opacity = 1;
        textoCoreano.style.transition = "opacity 0.3s ease-in-out";
    }, 150);
}

function cargarSiguienteVocabulario() {
    if (listaVocabulario.length === 0) return;
    indiceActual = (indiceActual + 1) % listaVocabulario.length;
    mostrarVocabularioActual();
}

// NUEVO: Reproductor de audio usando la voz del sistema operativo (Gratis y sin archivos)
function reproducirAudioActual() {
    if (listaVocabulario.length === 0) return;
    
    const item = listaVocabulario[indiceActual];
    
    // Verificamos si el navegador soporta esta tecnología
    if ('speechSynthesis' in window) {
        // Cancelamos cualquier audio anterior que esté sonando
        window.speechSynthesis.cancel();

        const pronunciacion = new SpeechSynthesisUtterance();
        pronunciacion.text = item.coreano;
        pronunciacion.lang = 'ko-KR'; // Código oficial para idioma Coreano de Corea del Sur
        pronunciacion.rate = 0.85; // Velocidad ligeramente reducida para estudiantes (1 es normal)
        
        window.speechSynthesis.speak(pronunciacion);
    } else {
        alert("Lo siento, tu navegador actual no soporta la reproducción de voz. Intenta usar Chrome o Safari.");
    }
}