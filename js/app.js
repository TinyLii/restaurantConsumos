//Variables
let cliente = {
    mesa: "",
    hora: "",
    pedido: []
};

const categorias = {
    1: "Comida",
    2: "Bebida",
    3: "Postre"
}

const btnGuardarCliente = document.querySelector("#guardar-cliente");

//Event listeners
btnGuardarCliente.addEventListener("click", guardarCliente)

//Funciones
function guardarCliente(){
    const mesa = document.querySelector("#mesa").value;
    const hora = document.querySelector("#hora").value;
    const camposVacios = [mesa,hora].some(campo => campo === "");

    if(camposVacios){
        const existeAlerta = document.querySelector(".invalid-feedback");

        if(!existeAlerta){
            const alerta = document.createElement("div");
            alerta.classList.add("invalid-feedback","d-block","text-center");
            alerta.textContent = "Todos los campos son obligatorios";
            document.querySelector(".modal-body form").appendChild(alerta)

            setTimeout(()=>{
                alerta.remove()
            },2000)
        }
        return
    }

    cliente = {...cliente, mesa, hora}

    const modalFormulario = document.querySelector("#formulario");
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario)
    modalBootstrap.hide();
    

    mostrarSecciones();

    obtenerPlatillos();
}

function mostrarSecciones(){
    const seccioneOcultas = document.querySelectorAll(".d-none");
    seccioneOcultas.forEach(seccion => seccion.classList.remove("d-none"))
}

function obtenerPlatillos(){
    const url = "http://localhost:4000/platillos";

    fetch(url)
        .then( respuesta => respuesta.json())
        .then( resultado => mostrarPlatillos(resultado))
        .catch(error => console.log(error))
}

function mostrarPlatillos(platillos){
    const contenido = document.querySelector("#platillos .contenido");

    platillos.forEach( platillo =>{
        const row = document.createElement("div");
        row.classList.add("row");
        
        const nombre = document.createElement("div");
        nombre.classList.add("col-md-4","py-3","border-top");
        nombre.textContent = platillo.nombre;

        const precio = document.createElement("div");
        precio.classList.add("col-md-3","fw-bold");
        precio.textContent = `$${platillo.precio}`

        const categoria = document.createElement("div");
        categoria.classList.add("col-md-3");
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement("input");
        inputCantidad.type = "number";
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add("form-control");
        inputCantidad.onchange = function(){
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo,cantidad})
        }

        
        const agregar = document.createElement("div");
        agregar.classList.add("col-md-2");
        agregar.appendChild(inputCantidad)


        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);
        contenido.appendChild(row)

    })
}

function agregarPlatillo(producto){
    let { pedido } = cliente;
    if(producto.cantidad > 0){
        if(pedido.some( articulo=> articulo.id === producto.id )){
            const pedidoActualizado = pedido.map( articulo => {
                if(articulo.id === producto.id){
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            })
            cliente.pedido = [...pedidoActualizado]
        }else{
            cliente.pedido = [...pedido, producto]

        }
    }else{
        const resultado = pedido.filter( articulo => articulo.id !== producto.id )
        cliente.pedido = [...resultado]
    }

    limpiarHTML();

    if(cliente.pedido.length){
        actualizarResumen()
    }else{
        mensajePedidoVacio()
    }

    
}

function actualizarResumen(){
    const contenido = document.querySelector("#resumen .contenido");
    const resumen = document.createElement("div");
    resumen.classList.add("col-md-6","card","py-3","px-3","shadow");

    const mesa = document.createElement("p");
    mesa.textContent = "Mesa ";
    mesa.classList.add("fw-bold");

    const mesaSpan = document.createElement("span");
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add("fw-normal");

    const hora = document.createElement("p");
    hora.textContent = "Hora ";
    hora.classList.add("fw-bold");

    const horaSpan = document.createElement("span");
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add("fw-normal");

    const heading = document.createElement("h3");
    heading.textContent = "Platillos consumidos";
    heading.classList.add("my-4","text-center")

    const grupo = document.createElement("ul");
    grupo.classList.add("list-group");

    const { pedido } = cliente;
    pedido.forEach( articulo =>{
        const { nombre, cantidad, precio, id } = articulo;
        const lista = document.createElement("li");
        lista.classList.add("list-group-item");
        
        const nombreEl = document.createElement("h4");
        nombreEl.classList.add("my-4");
        nombreEl.textContent = nombre;

        const cantidadEl = document.createElement("p");
        cantidadEl.classList.add("fw-bold");
        cantidadEl.textContent = "Cantidad: ";
        const cantidadValor = document.createElement("span");
        cantidadValor.classList.add("fw-normal");
        cantidadValor.textContent = cantidad;
        cantidadEl.appendChild(cantidadValor);

        const precioEl = document.createElement("p");
        precioEl.classList.add("fw-bold");
        precioEl.textContent = "Precio: ";
        const precioValor = document.createElement("span");
        precioValor.classList.add("fw-normal");
        precioValor.textContent = `$${precio}`;
        precioEl.appendChild(precioValor);

        const subtotalEl = document.createElement("p");
        subtotalEl.classList.add("fw-bold");
        subtotalEl.textContent = "Subtotal: ";
        const subtotalValor = document.createElement("span");
        subtotalValor.classList.add("fw-normal");
        subtotalValor.textContent = calcularSubtotal(precio,cantidad);
        subtotalEl.appendChild(subtotalValor);

        const btnEliminar = document.createElement("button");
        btnEliminar.classList.add("btn","btn-danger");
        btnEliminar.textContent = "Eliminar del pedido"
        btnEliminar.onclick = function(){
            eliminarProducto(id)
        }


        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);
        grupo.appendChild(lista)
    })

    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);
    contenido.appendChild(resumen)

    
    formularioPropinas()
}

function limpiarHTML(){
    const contenido = document.querySelector("#resumen .contenido");

    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild)
    }
}

function calcularSubtotal(precio,cantidad){
    return `$${precio * cantidad}`
}

function eliminarProducto(id){
    const { pedido } = cliente;
    const resultado = pedido.filter( articulo => articulo.id !== id );
    cliente.pedido = [...resultado];
    
    limpiarHTML()
    if(cliente.pedido.length){
        actualizarResumen()
    }else{
        mensajePedidoVacio()
    }

    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio(){
    const contenido = document.querySelector("#resumen .contenido");
    const texto = document.createElement("p");

    texto.classList.add("text-center");
    texto.textContent = "Añade los elementos del pedido";
    
    contenido.appendChild(texto)
}

function formularioPropinas(){
    const contenido = document.querySelector("#resumen .contenido");
    const formulario = document.createElement("div");
    formulario.classList.add("col-md-6","formulario");

    const divFormulario = document.createElement("div");
    divFormulario.classList.add("card","py-3","px-3","shadow")

    const heading = document.createElement("h3");
    heading.textContent = "Propina";
    heading.classList.add("my-4","text-center");

    const radio10 = document.createElement("input");
    radio10.type = "radio";
    radio10.name = "propina";
    radio10.value = "10";
    radio10.classList.add("form-check-input");
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement("label");
    radio10Label.textContent = "10%"
    radio10Label.classList.add("form-check-label")

    const radio10Div = document.createElement("div");
    radio10Div.classList.add("form-check");

    const radio25 = document.createElement("input");
    radio25.type = "radio";
    radio25.name = "propina";
    radio25.value = "25";
    radio25.classList.add("form-check-input");
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement("label");
    radio25Label.textContent = "25%"
    radio25Label.classList.add("form-check-label")

    const radio25Div = document.createElement("div");
    radio25Div.classList.add("form-check");

    const radio50 = document.createElement("input");
    radio50.type = "radio";
    radio50.name = "propina";
    radio50.value = "50";
    radio50.classList.add("form-check-input");
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement("label");
    radio50Label.textContent = "50%"
    radio50Label.classList.add("form-check-label")

    const radio50Div = document.createElement("div");
    radio50Div.classList.add("form-check");

    radio10Div.appendChild(radio10)
    radio10Div.appendChild(radio10Label)
    radio25Div.appendChild(radio25)
    radio25Div.appendChild(radio25Label)
    radio50Div.appendChild(radio50)
    radio50Div.appendChild(radio50Label)
    formulario.appendChild(divFormulario);
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);
    contenido.appendChild(formulario)
}

function calcularPropina(){
    const { pedido } = cliente;
    let subtotal = 0;

    pedido.forEach( articulo =>{
        subtotal += articulo.cantidad * articulo.precio
    })
    
    const propinaSeleccionada = document.querySelector("[name='propina']:checked").value;

    const propina = ((subtotal * parseInt(propinaSeleccionada)) / 100);
    
    const total = subtotal + propina;

    mostrarTotalHTML(subtotal,total,propina)
}

function mostrarTotalHTML(subtotal,total,propina){
    const divTotales = document.createElement("div");
    divTotales.classList.add("total-pagar");

    const subtotalP = document.createElement("p");
    subtotalP.textContent = "Subtotal: "
    subtotalP.classList.add("fs-4","fw-bold","mt-2");
    const subtotalSpan = document.createElement("span");
    subtotalSpan.classList.add("fw-normal");
    subtotalSpan.textContent = `$${subtotal}`;
    
    const propinaP = document.createElement("p");
    propinaP.textContent = "Propina: "
    propinaP.classList.add("fs-4","fw-bold","mt-2");
    const propinaSpan = document.createElement("span");
    propinaSpan.classList.add("fw-normal");
    propinaSpan.textContent = `$${propina}`;

    const totalP = document.createElement("p");
    totalP.textContent = "Total: "
    totalP.classList.add("fs-4","fw-bold","mt-2");
    const totalSpan = document.createElement("span");
    totalSpan.classList.add("fw-normal");
    totalSpan.textContent = `$${total}`;

    const totalPagarDiv = document.querySelector(".total-pagar");
    if(totalPagarDiv){
        totalPagarDiv.remove()
    }

    subtotalP.appendChild(subtotalSpan);
    propinaP.appendChild(propinaSpan);
    totalP.appendChild(totalSpan);
    
    divTotales.appendChild(subtotalP)
    divTotales.appendChild(propinaP)
    divTotales.appendChild(totalP)
    const formulario = document.querySelector(".formulario > div");
    formulario.appendChild(divTotales)
}