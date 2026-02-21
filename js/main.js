// =======================
// VARIABLES GLOBALES
// =======================
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// =======================
// ELEMENTOS DEL DOM
// =======================
const listaProductos = document.getElementById("lista-productos");
const carritoHTML = document.getElementById("carrito");
const totalHTML = document.getElementById("total");
const mensaje = document.getElementById("mensaje");

const btnVaciar = document.getElementById("vaciar");
const btnFinalizar = document.getElementById("finalizar");

const checkoutSection = document.getElementById("checkout");
const formCheckout = document.getElementById("form-checkout");
const inputNombre = document.getElementById("nombre");
const inputEmail = document.getElementById("email");
const inputDireccion = document.getElementById("direccion");

// =======================
// CARGAR PRODUCTOS DESDE JSON
// =======================
async function cargarProductos() {
    try {
        const response = await fetch("./data/productos.json");
        
        if (!response.ok) {
            throw new Error("No se pudo cargar el archivo de productos");
        }

        productos = await response.json();
        mostrarProductos();
    } catch (error) {
        mensaje.textContent = "Ups, hubo un problema al cargar los productos";
        Swal.fire({
            title: "Error",
            text: "No pudimos cargar la lista de productos",
            icon: "error"
        });
    }
}

// =======================
// MOSTRAR LOS PRODUCTOS EN LA PANTALLA
// =======================
function mostrarProductos() {
    listaProductos.innerHTML = "";

    productos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");

        div.innerHTML = `
            <p>${producto.nombre} - $${producto.precio.toLocaleString('es-AR')}</p>
            <button>Agregar</button>
        `;

        div.querySelector("button").addEventListener("click", () => {
            agregarAlCarrito(producto);
        });

        listaProductos.appendChild(div);
    });
}

// =======================
// AGREGAR PRODUCTO AL CARRITO
// =======================
function agregarAlCarrito(producto) {
    const existente = carrito.find(item => item.id === producto.id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarrito();
    mensaje.textContent = `${producto.nombre} agregado al carrito`;
}

// =======================
// SUMAR UNA UNIDAD DESDE EL CARRITO
// =======================
function sumarDelCarrito(id) {
    const producto = carrito.find(item => item.id === id);
    if (producto) {
        producto.cantidad++;
        actualizarCarrito();
    }
}

// =======================
// QUITAR UNA UNIDAD DEL CARRITO
// =======================
function quitarDelCarrito(id) {
    const producto = carrito.find(item => item.id === id);

    if (producto) {
        producto.cantidad--;

        if (producto.cantidad <= 0) {
            carrito = carrito.filter(item => item.id !== id);
        }

        actualizarCarrito();
    }
}

// =======================
// ACTUALIZAR LA VISTA DEL CARRITO
// =======================
function actualizarCarrito() {
    carritoHTML.innerHTML = "";
    let total = 0;

    carrito.forEach(producto => {
        const li = document.createElement("li");
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        li.innerHTML = `
            ${producto.nombre} x${producto.cantidad} - $${subtotal.toLocaleString('es-AR')}
            <div class="acciones">
                <button class="sumar">+</button>
                <button class="quitar">−</button>
            </div>
        `;

        li.querySelector(".sumar").addEventListener("click", () => {
            sumarDelCarrito(producto.id);
        });

        li.querySelector(".quitar").addEventListener("click", () => {
            quitarDelCarrito(producto.id);
        });

        carritoHTML.appendChild(li);
    });

    totalHTML.textContent = `Total: $${total.toLocaleString('es-AR')}`;
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// =======================
// VACIAR TODO EL CARRITO
// =======================
btnVaciar.addEventListener("click", () => {
    if (carrito.length === 0) {
        mensaje.textContent = "El carrito ya está vacío";
        return;
    }

    Swal.fire({
        title: "¿Vaciar carrito?",
        text: "Se van a eliminar todos los productos",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            carrito = [];
            actualizarCarrito();
            checkoutSection.style.display = "none";
            mensaje.textContent = "Carrito vaciado";
        }
    });
});

// =======================
// MOSTRAR EL FORMULARIO DE CHECKOUT
// =======================
btnFinalizar.addEventListener("click", () => {
    if (carrito.length === 0) {
        mensaje.textContent = "No hay nada en el carrito para comprar";
        return;
    }

    checkoutSection.style.display = "block";
    mensaje.textContent = "Completá tus datos para finalizar";
});

// =======================
// FINALIZAR COMPRA Y GUARDAR DATOS
// =======================
formCheckout.addEventListener("submit", (e) => {
    e.preventDefault();

    if (
        inputNombre.value.trim() === "" ||
        inputEmail.value.trim() === "" ||
        inputDireccion.value.trim() === ""
    ) {
        mensaje.textContent = "Completá todos los campos por favor";
        return;
    }

    Swal.fire({
        title: "¡Compra realizada!",
        text: `Gracias por tu compra, ${inputNombre.value.trim()}`,
        icon: "success"
    });

    // Guardamos los datos para precargar la próxima vez
    localStorage.setItem("datosUsuario", JSON.stringify({
        nombre: inputNombre.value.trim(),
        email: inputEmail.value.trim(),
        direccion: inputDireccion.value.trim()
    }));

    carrito = [];
    actualizarCarrito();
    checkoutSection.style.display = "none";
    formCheckout.reset();
});

// =======================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// =======================
cargarProductos();
actualizarCarrito();

// Precargar datos guardados en el formulario (si existen)
const datosGuardados = localStorage.getItem("datosUsuario");
if (datosGuardados) {
    const datos = JSON.parse(datosGuardados);
    inputNombre.value = datos.nombre || "";
    inputEmail.value = datos.email || "";
    inputDireccion.value = datos.direccion || "";
}