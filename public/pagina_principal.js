document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    // Obtener los valores de los campos
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Credenciales correctas
    const usuarioCorrecto = "Admin";
    const contrasenaCorrecta = "Admin123";
  
    // Validación
    if (username === usuarioCorrecto && password === contrasenaCorrecta) {
      // Guardar la sesión en localStorage
      localStorage.setItem('loggedIn', 'true');
  
      // Redirigir a la página principal (Index.html)
      window.location.href = "Index.html";
    } else {
      // Si el login falla, mostrar mensaje de error
      document.getElementById('error-message').textContent = "Usuario o contraseña incorrectos";
    }
  });
