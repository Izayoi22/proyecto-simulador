let previousStatus = {}; // Objeto para almacenar el estado anterior de cada dispositivo
let dispositivos = []; // Almacenará los dispositivos obtenidos del servidor

// Función para crear un gráfico para un dispositivo
async function crearGraficoDispositivo(dispositivo, color) {
  const chartContainer = document.getElementById('chart-container');
  chartContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar un nuevo gráfico

  // Crear el canvas para el gráfico
  const canvas = document.createElement('canvas');
  chartContainer.appendChild(canvas);

  // Crear el gráfico usando Chart.js
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dispositivo.historial.map(entry => entry.tiempo),
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

// Función para actualizar el estado de los dispositivos y llenar el selector de IPs
async function actualizarEstadoDispositivos() {
  try {
    const response = await fetch('/api/connection-status'); // Obtener datos del servidor
    dispositivos = await response.json(); // Guardar la respuesta en la variable dispositivos

    // Limpiar el contenedor de estado de dispositivos
    const deviceStatusContainer = document.getElementById('device-status-container');
    deviceStatusContainer.innerHTML = '';

    // Limpiar el selector de IPs
    const ipSelector = document.getElementById('ip-selector');
    ipSelector.innerHTML = '<option value="">Seleccionar IP</option>'; // Resetear el selector

    dispositivos.forEach(dispositivo => {
      // Agregar cada dispositivo al selector de IPs
      const option = document.createElement('option');
      option.value = dispositivo.ip;
      option.textContent = `${dispositivo.nombre} - ${dispositivo.ip}`;
      ipSelector.appendChild(option);

      const card = document.createElement('div');
      card.classList.add('device-card');

      const estadoActual = dispositivo.historial[dispositivo.historial.length - 1].status;

      // Cambiar el color de la tarjeta según el estado
      if (estadoActual === 'Conexión') {
        card.classList.add('connected');
      } else {
        card.classList.add('disconnected');
      }

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

// Función para manejar la selección de IP y mostrar el gráfico del dispositivo seleccionado
function manejarSeleccionDeIP() {
  const selectedIp = document.getElementById('ip-selector').value;

  // Si no se ha seleccionado ninguna IP, limpiar el gráfico
  if (!selectedIp) {
    document.getElementById('chart-container').innerHTML = '';
    return;
  }

  // Filtrar el dispositivo por IP seleccionada
  const dispositivoSeleccionado = dispositivos.find(dispositivo => dispositivo.ip === selectedIp);

  if (dispositivoSeleccionado) {
    const color = 'blue'; // Puedes asignar diferentes colores si lo deseas
    crearGraficoDispositivo(dispositivoSeleccionado, color);
  }
}

// Función para obtener datos del servidor y actualizar los gráficos
async function actualizarGrafico() {
  try {
    const response = await fetch('/api/connection-status');
    dispositivos = await response.json(); // Almacenar dispositivos globalmente

    // Llenar el selector de IPs con los dispositivos
    const ipSelector = document.getElementById('ip-selector');
    dispositivos.forEach(dispositivo => {
      const option = document.createElement('option');
      option.value = dispositivo.ip;
      option.textContent = `${dispositivo.nombre} - ${dispositivo.ip}`;
      ipSelector.appendChild(option);
    });

    // Agregar un event listener para manejar la selección de IP
    ipSelector.addEventListener('change', manejarSeleccionDeIP);
  } catch (error) {
    console.error("Error al obtener datos del servidor:", error);
  }
}
setInterval(() => {
  actualizarGrafico();
  actualizarEstadoDispositivos();
  registrarAlerta();
  

}, 5000);
// Llamar a las funciones al cargar la página
actualizarEstadoDispositivos();
actualizarGrafico();

