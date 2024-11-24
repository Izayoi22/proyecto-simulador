// Función para ejecutar la consulta SQL desde el frontend
async function ejecutarConsulta() {
  const consulta = document.getElementById('consulta').value; // Obtener el valor de la consulta SQL

  if (!consulta) {
    alert("Por favor, ingresa una consulta SQL.");
    return;
  }

  try {
    const response = await fetch('/ejecutarConsultas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ consulta }) // Enviar la consulta como JSON
    });

    if (!response.ok) {
      throw new Error('Error al ejecutar la consulta');
    }

    const datos = await response.json(); // Recibir los resultados en formato JSON
    mostrarResultados(datos); // Mostrar los resultados en la tabla

  } catch (error) {
    console.error(error);
    alert('Error al ejecutar la consulta: ' + error.message);
  }
}

// Función para mostrar los resultados de la consulta en la tabla
function mostrarResultados(datos) {
  const tbody = document.getElementById('resultados').getElementsByTagName('tbody')[0];
  tbody.innerHTML = ''; // Limpiar la tabla antes de mostrar los nuevos resultados

  if (datos.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 2;
    cell.innerText = 'No se encontraron resultados.';
    return;
  }

  // Asumir que todos los resultados tienen la misma estructura de columnas
  const columnas = Object.keys(datos[0]);
  const headerRow = tbody.insertRow();

  // Crear las cabeceras de la tabla dinámicamente según las columnas
  columnas.forEach(columna => {
    const th = document.createElement('th');
    th.innerText = columna;
    headerRow.appendChild(th);
  });

  // Agregar las filas de los resultados
  datos.forEach(fila => {
    const row = tbody.insertRow();
    columnas.forEach(columna => {
      const cell = row.insertCell();
      cell.innerText = fila[columna];
    });
  });
}
