document.addEventListener("DOMContentLoaded", function () {
    console.log("Main script initialized.");
    initUserMenu();
    initLogout();
    initSettings();
  });
  const SELECTORS = {
    // notifications
    notificationModal: '#notificationModal',
    notificationMessage: '#notificationMessage',
    notificationIcon: '#notificationIcon',
}
  
  // ================================
  // MENU DO USUÁRIO
  // ================================
  
  function initUserMenu() {
    const userPhoto = document.getElementById("userPhotoWrapper");
    const userMenu = document.getElementById("userMenu");
  
    if (!userPhoto || !userMenu) return;
  
    userPhoto.addEventListener("click", (e) => {
      userMenu.classList.toggle("hidden");
      e.stopPropagation();
    });
  
    document.addEventListener("click", () => {
      userMenu.classList.add("hidden");
    });
  
    userMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
  
  // ================================
  // LOGOUT
  // ================================
  
  function initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;
  
    logoutBtn.addEventListener("click", () => {
      // Simulate logout for prototype
      localStorage.removeItem('token');
      showNotification('Logout realizado com sucesso!', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    });
  }
  
  // ================================
  // SETTINGS
  // ================================
  
  function initSettings() {
    const settingsBtn = document.getElementById('openSettingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('A funcionalidade de configurações está desativada no protótipo.');
      });
    }
  }
  
  // Abrir modal
function openModal(modalId) {
  console.log('abrindo modal', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
  
      // Adiciona o listener apenas uma vez
      function handleClickOutside(event) {
        if (event.target === modal) {
          closeModal(modalId);
          window.removeEventListener('click', handleClickOutside);
        }
      }
  
      window.addEventListener('click', handleClickOutside);
    }
  }
  
  // Fechar modal
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }
  
  
  function showNotification(message, type = 'success') {
    const modal = document.querySelector(SELECTORS.notificationModal);
    const msgEl = document.querySelector(SELECTORS.notificationMessage);
    const iconEl = document.querySelector(SELECTORS.notificationIcon);

    modal.classList.remove('success', 'error');
    modal.classList.add(type);

    if (Array.isArray(message)) {
        // monta lista de erros
        msgEl.innerHTML = '<ul >' +
            message.map(m => `<li style="list-style-type: none;">${m}</li>`).join('') +
            '</ul>';
    } else {
        msgEl.textContent = message;
    }

    iconEl.src = type === 'success'
        ? '/static/assets/image/success_icon.png'
        : '/static/assets/image/sign_error_icon.png';

    modal.style.display = 'flex';
    setTimeout(() => { modal.style.display = 'none'; }, 1000);
}

function showConfirmationModal(message, onConfirm) {
  const modal = document.getElementById("notificationModalConfirm");
  const messageEl = document.getElementById("notificationMessageConfirm");
  const icon = document.getElementById("notificationIconConfirm");
  const buttons = document.getElementById("notificationButtons");

  // Define mensagem e ícone
  messageEl.textContent = message;
  icon.src = "/static/assets/image/success_icon.png"; // ou ícone padrão seu
  icon.style.display = "block";

  // Mostra botões
  buttons.style.display = "flex";
  modal.style.display = "flex"; // ou o que você usa para mostrar o modal

  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  // Remove listeners antigos
  yesBtn.onclick = noBtn.onclick = null;

  yesBtn.onclick = () => {
    modal.style.display = "none";
    buttons.style.display = "none";
    onConfirm(); // Executa ação confirmada
  };

  noBtn.onclick = () => {
    modal.style.display = "none";
    buttons.style.display = "none";
  };
}
function exibirModalInputs({ mensagem, campos }) {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById('modalInputCustom');
    const spanMsg = document.getElementById('modalInputMessage');
    const fieldsContainer = document.getElementById('modalInputFields');
    const btnConfirm = document.getElementById('btnModalInputConfirm');
    const btnCancel = document.getElementById('btnModalInputCancel');

    // Limpa e configura
    spanMsg.innerHTML = mensagem;
    fieldsContainer.innerHTML = '';

    campos.forEach(campo => {
      const input = document.createElement('input');
      input.type = campo.type || 'text';
      input.name = campo.name;
      input.placeholder = campo.placeholder || '';
      input.required = campo.required || false;
      input.dataset.label = campo.label || campo.name;
      fieldsContainer.appendChild(input);
    });

    modal.style.display = 'flex';
    fieldsContainer.querySelector('input')?.focus();

    function fechar() {
      modal.style.display = 'none';
      btnConfirm.removeEventListener('click', confirmar);
      btnCancel.removeEventListener('click', cancelar);
    }

    function confirmar() {
      const valores = {};
      const inputs = fieldsContainer.querySelectorAll('input');
      inputs.forEach(input => {
        valores[input.name] = input.value.trim();
      });
      fechar();
      resolve(valores);
    }

    function cancelar() {
      fechar();
      reject('cancelado');
    }

    btnConfirm.addEventListener('click', confirmar);
    btnCancel.addEventListener('click', cancelar);
  });
}

  
  // Preencher formulário
  function fillFormData(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;
  
    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data[key];
      }
    });
  
    // Agora tratamos a foto separadamente
    if (data.photo_url) {
      const fotoPreview = document.getElementById('settings-foto-preview');
      if (fotoPreview) {
        if (data.photo_url.startsWith('http')) {
          fotoPreview.src = data.photo_url;
        } else {
          fotoPreview.src = '/' + data.photo_url.replace(/^\/+/, '');
        }
        fotoPreview.style.display = 'block';
  
        // Esconde o placeholder também
        const placeholder = document.getElementById('settings-logo-placeholder');
        if (placeholder) {
          placeholder.style.display = 'none';
        }
      }
    }
  }
  
  

  function previewImagem(event) {
  const file = event.target.files[0];
  const previewSelector = event.target.dataset.preview; // ex: "#foto-preview"
  const preview = document.querySelector(previewSelector);

  if (file && preview) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}
  
  
  
  