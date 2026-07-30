// Configuración de Supabase
const SUPABASE_URL = 'https://gkunigyqgetqvjsovzjy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdW5pZ3lxZ2V0cXZqc292emp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjc1MzEsImV4cCI6MjEwMDk0MzUzMX0.Co8JkEWVJGlexJGG5WJbnLPb63pYvdX-y5HfYTd6fsg';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let listaVocabulario = [];
let indiceActual = 0;

// Esperar a que cargue la página para asignar los eventos a los botones
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();

    document.getElementById('btn-signup').addEventListener('click', handleSignup);
    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('btn-audio').addEventListener('click', reproducirAudioActual);
    document.getElementById('btn-siguiente').addEventListener('click', cargarSiguienteVocabulario);
    document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
});

// Registro de usuarios
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

// Iniciar sesión
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

// Verificar estado de la sesión
async function verificarSesion() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        document.getElementById('user-info').innerText = session.user.email;
        cargarVocabularioDesdeBaseDeDatos();
    }
}

// Cerrar sesión
async function cerrarSesion() {
    await _supabase.auth.signOut();
    location.reload();
}

// Cargar datos de la tabla creada en Supabase
async function cargarVocabularioDesdeBaseDeDatos() {
    const { data, error } = await _supabase.from('vocabulario').select('*');
    if (error) {
        console.error('Error cargando vocabulario:', error);
    } else if (data && data.length > 0) {
        listaVocabulario = data;
        mostrarVocabularioActual();
    }
}

// Mostrar tarjeta actual en pantalla
function mostrarVocabularioActual() {
    if (listaVocabulario.length === 0) return;
    const item = listaVocabulario[indiceActual];
    document.getElementById('palabra-coreano').innerText = item.coreano;
    document.getElementById('palabra-espanol').innerText = item.espanol;
}

// Rotar a la siguiente palabra
function cargarSiguienteVocabulario() {
    if (listaVocabulario.length === 0) return;
    indiceActual = (indiceActual + 1) % listaVocabulario.length;
    mostrarVocabularioActual();
}

// Reproductor de audio con archivo MP3 real (100% compatible con iPhone)
function reproducirAudioActual() {
    if (listaVocabulario.length === 0) return;
    const item = listaVocabulario[indiceActual];

    // Si guardaste una URL de audio en Supabase, la usa; si no, usa un enlace de respaldo gratuito de prueba
    const audioUrl = item.audio_url || 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg'; // (Aquí pondremos el enlace de tu mp3)
    
    const reproductor = document.getElementById('audio-reproductor');
    reproductor.src = audioUrl;
    reproductor.play().catch(error => {
        console.log("Error al reproducir audio:", error);
        alert('Toca la pantalla una vez más para habilitar el audio en el celular.');
    });
}