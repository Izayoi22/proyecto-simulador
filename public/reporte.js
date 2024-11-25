let dispositivos = []; // Almacenar los dispositivos obtenidos del servidor

// Función para obtener los datos de desconexión de un dispositivo específico
async function obtenerDatosCaidas(ip) {
  try {
    const response = await fetch(`/api/connection-status/${ip}`);  // Corregí el endpoint
    const data = await response.json();
    return data;  // Suponemos que los datos devueltos contienen el historial de caídas
  } catch (error) {
    console.error("Error al obtener los datos de caídas:", error);
    return [];
  }
}

// Función para generar el gráfico de pastel
function generarGraficoPastel(datos) {
  const ctx = document.createElement('canvas');
  document.getElementById('pie-chart-container').innerHTML = '';  // Limpiar el contenedor
  document.getElementById('pie-chart-container').appendChild(ctx);

  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Conectado', 'Desconectado'],
      datasets: [{
        label: 'Estado de Conexión',
        data: [datos.conectado, datos.desconectado],
        backgroundColor: ['#36a2eb', '#ff6384'],  // Colores de las secciones
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              return `${value} horas`;
            }
          }
        }
      }
    }
  });
}

// Función para procesar los datos de desconexión y contar las caídas
function procesarDatosDeCaidas(datos) {
  let caidasPorDia = 0;
  let caidasPorMes = 0;
  let tiempoDesconectado = 0;
  let estaConectado = true; // Asumimos que al principio está conectado

  // Filtrar los datos para contar desconexiones
  const now = new Date();
  const fechaDia = now.getDate();
  const fechaMes = now.getMonth();

  datos.forEach(caida => {
    const caidaFecha = new Date(caida.timestamp);
    const caidaDia = caidaFecha.getDate();
    const caidaMes = caidaFecha.getMonth();

    if (caida.estado === 'Desconectado') {
      tiempoDesconectado += caida.duracion;  // Asumimos que 'duracion' está en horas

      // Contar desconexiones por día
      if (caidaDia === fechaDia) {
        caidasPorDia++;
      }

      // Contar desconexiones por mes
      if (caidaMes === fechaMes) {
        caidasPorMes++;
      }

      estaConectado = false; // Si hay desconexión, el estado cambia a desconectado
    }
  });

  // Si hubo desconexiones, se considera desconectado
  return {
    conectado: estaConectado ? 1 : 0,  // Si nunca hubo desconexiones, el dispositivo sigue conectado
    desconectado: tiempoDesconectado // El tiempo desconectado se cuenta siempre
  };
}

// Función para manejar el evento del botón
async function manejarGenerarGrafico() {
  const ip = document.getElementById('ip-selector').value;

  if (!ip) {
    alert("Por favor, selecciona una IP");
    return;
  }

  const datosCaidas = await obtenerDatosCaidas(ip);
  const datosProcesados = procesarDatosDeCaidas(datosCaidas);
  generarGraficoPastel(datosProcesados);
}

// Función para llenar el selector de IPs
async function llenarSelectorIPs() {
  try {
    const response = await fetch('/api/connection-status');  // Este endpoint debe devolver las IPs de los dispositivos
    const dispositivos = await response.json();

    const ipSelector = document.getElementById('ip-selector');
    dispositivos.forEach(dispositivo => {
      const option = document.createElement('option');
      option.value = dispositivo.ip;
      option.textContent = `${dispositivo.nombre} - ${dispositivo.ip}`;
      ipSelector.appendChild(option);
    });
  } catch (error) {
    console.error("Error al obtener las IPs de los dispositivos:", error);
  }
}

// Evento del botón para generar el gráfico
document.getElementById('generate-pie-chart-btn').addEventListener('click', manejarGenerarGrafico);

// Llamar a la función para llenar el selector de IPs al cargar la página
llenarSelectorIPs();
