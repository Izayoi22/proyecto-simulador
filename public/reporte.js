
async function cargarRegistros() {
  try {
    const response = await fetch('/api/registros');
    const registros = await response.json();
    
    // Selecciona el contenedor de la tabla
    const tabla = document.getElementById('tabla-registros');

    // Itera sobre los registros y agrega las filas a la tabla
    registros.forEach(registro => {
      const fila = document.createElement('tr');
      
      // Crea las celdas para cada columna de la tabla
      const celdaid = document.createElement('td');
      celdaid.textContent = registro.id;
      
      const celdaHora = document.createElement('td');
      celdaHora.textContent = registro.hora;
      
      const celdaIp = document.createElement('td');
      celdaIp.textContent = registro.ip;
      
      const celdaTipo_Caidas = document.createElement('td');
      celdaTipo_Caidas.textContent = registro.tipo_caidas;

      const celdafecha = document.createElement('td');
      celdafecha.textContent = registro.fecha;

      // Agrega las celdas a la fila
      fila.appendChild(celdaid);
      fila.appendChild(celdaHora);
      fila.appendChild(celdaIp);
      fila.appendChild(celdaTipo_Caidas);
      fila.appendChild(celdafecha);


      // Agrega la fila a la tabla
      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error('Error al cargar los registros', error);
  }
}

// Llama a la función para cargar los registros cuando la página cargue
document.addEventListener('DOMContentLoaded', cargarRegistros);