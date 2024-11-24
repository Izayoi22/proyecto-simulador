// script.js

let previousStatus = {}; // Objeto para almacenar el estado anterior de cada dispositivo

// Función para crear una fila en la tabla para cada dispositivo y agregar un gráfico
async function crearGraficoDispositivo(dispositivo, color) {
  const tableBody = document.getElementById('table-body');
  
  // Crear elementos de la fila y columnas
  const row = document.createElement('tr');
  const nameCell = document.createElement('td');
  const chartCell = document.createElement('td');
  const historyCell = document.createElement('td');  // Nueva celda para el historial

  nameCell.textContent = dispositivo.nombre;

  // Crear un contenedor para el gráfico
  const chartContainer = document.createElement('div');
  chartContainer.classList.add('chart-container');

  // Crear el canvas para el gráfico
  const canvas = document.createElement('canvas');
  chartContainer.appendChild(canvas);
  chartCell.appendChild(chartContainer);

  // Crear un elemento de lista para el historial
  const historyList = document.createElement('ul');
  dispositivo.historial.forEach(entry => {
    const historyItem = document.createElement('li');
    historyItem.textContent = `${entry.timestamp}: ${entry.status}`;
    historyList.appendChild(historyItem);
  });
  historyCell.appendChild(historyList);  // Mostrar historial en la celda

  row.appendChild(nameCell);
  row.appendChild(chartCell);
  row.appendChild(historyCell);  // Agregar la columna de historial a la fila
  tableBody.appendChild(row);

  // Crear el gráfico usando Chart.js
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dispositivo.historial.map(entry => entry.timestamp),
      datasets: [{
        label: 'Estado de Conexión',
        data: dispositivo.historial.map(entry => entry.status === 'Conexión' ? 1 : 0),
        borderColor: color,
        fill: false,
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value === 1 ? 'Conexión' : 'Sin conexión';
            }
          },
        },
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10
          }
        }
      }
    }
  });

  return chart;
}

// Función para actualizar el estado de los dispositivos en la parte superior de la página
async function actualizarEstadoDispositivos() {
  try {
    const response = await fetch('/api/connection-status');
    const dispositivos = await response.json();

    // Limpiar el contenedor de estado de dispositivos
    const deviceStatusContainer = document.getElementById('device-status-container');
    deviceStatusContainer.innerHTML = '';

    dispositivos.forEach(dispositivo => {
      const card = document.createElement('div');
      card.classList.add('device-card');

      const estadoActual = dispositivo.historial[dispositivo.historial.length - 1].status;

      // Cambiar el color de la tarjeta según el estado
      if (estadoActual === 'Conexión') {
        card.classList.add('connected');
      } else {
        card.classList.add('disconnected');
      }

      // Verificar si el estado cambió para registrar la alerta
      if (previousStatus[dispositivo.nombre] && previousStatus[dispositivo.nombre] !== estadoActual) {
        registrarAlerta(`${dispositivo.nombre} ha ${estadoActual === 'Conexión' ? 'restaurado' : 'caído'}!`, dispositivo.ip);
      }
      previousStatus[dispositivo.nombre] = estadoActual;

      // Agregar información del dispositivo
      card.innerHTML = `
        <h2>${dispositivo.nombre}</h2>
        <p><strong>IP:</strong> ${dispositivo.ip}</p>
        <p><strong>Estado:</strong> ${estadoActual === 'Conexión' ? 'Conectado' : 'Desconectado'}</p>
      `;

      deviceStatusContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error al obtener el estado de los dispositivos:", error);
  }
}


function registrarAlerta(mensaje, ip) {
  const alertsList = document.getElementById('alerts-list');

  const alertItem = document.createElement('div');
  alertItem.classList.add('alert-item');
  alertItem.innerHTML = `
    <p><strong>${mensaje}</strong></p>
    <p>${new Date().toLocaleString()}</p>
  `;

  alertsList.prepend(alertItem); 
  enviarNotificacionCorreo(mensaje, ip);
}

// Función para obtener datos del servidor y actualizar los gráficos
async function actualizarGrafico() {
  try {
    const response = await fetch('/api/connection-status');
    const dispositivos = await response.json();

    // Limpiar el contenido actual de la tabla
    document.getElementById('table-body').innerHTML = '';

    // Colores para diferenciar cada dispositivo
    const colores = ['blue', 'green', 'red', 'purple', 'orange'];

    // Crear un gráfico para cada dispositivo
    dispositivos.forEach((dispositivo, index) => {
      crearGraficoDispositivo(dispositivo, colores[index % colores.length]);
    });
  } catch (error) {
    console.error("Error al obtener datos del servidor:", error);
  }
} 





// Llamar a ambas funciones cada 5 segundos
setInterval(() => {
  actualizarGrafico();
  actualizarEstadoDispositivos();
  

}, 5000);

// Llamar inmediatamente para obtener datos iniciales
actualizarGrafico();
actualizarEstadoDispositivos();


