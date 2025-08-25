// Definição do objeto App para encapsular todas as funcionalidades
const App = {
    SELECTORS: {
        // Selectors para modais de notificação
        notificationModal: '#notificationModal',
        notificationMessage: '#notificationMessage',
        notificationIcon: '#notificationIcon',

        // Sidebar e elementos relacionados
        sidebar: '.sidebar',
        sidebarToggler: '.sidebar-toggler',
        menuToggler: '.menu-toggler',
        main: '.main',

        // dark mode
        darkToggleBtn: '#darkModeToggle'
    },

    // Constantes de estilo do sidebar
    CONSTANTS: {
        collapsedSidebarHeight: '56px',
        fullSidebarHeight: 'calc(100vh)',
        desktopBreakpoint: 1024,
        sidebarWidth: 270,
        collapsedWidth: 85
    },

    // Estado inicial dos elementos
    elements: {
        sidebar: null,
        sidebarToggler: null,
        menuToggler: null,
        main: null
    },

    // Inicialização da aplicação
    init: function () {
        // Armazena referências aos elementos
        this.elements.sidebar = document.querySelector(this.SELECTORS.sidebar);
        this.elements.sidebarToggler = document.querySelector(this.SELECTORS.sidebarToggler);
        this.elements.menuToggler = document.querySelector(this.SELECTORS.menuToggler);
        this.elements.main = document.querySelector(this.SELECTORS.main);

        // Verifica se os elementos existem antes de adicionar eventos
        if (this.elements.sidebar && this.elements.sidebarToggler && this.elements.main) {
            this.setupEventListeners();
            this.updateSidebarState();
        }
        console.log("App initialized.");
    },

    // Configura os event listeners
    setupEventListeners: function () {
        // Toggle do sidebar no desktop
        this.elements.sidebarToggler.addEventListener('click', () => {
            this.elements.sidebar.classList.toggle('collapsed');
            this.updateSidebarState();
            console.log("estou colapsando")
        });

        // Toggle do menu no mobile
        if (this.elements.menuToggler) {
            this.elements.menuToggler.addEventListener('click', () => {
                const isMenuActive = this.elements.sidebar.classList.toggle('menu-active');
                this.elements.sidebar.style.height = isMenuActive ? `${this.elements.sidebar.scrollHeight}px` : this.CONSTANTS.collapsedSidebarHeight;
                this.elements.menuToggler.querySelector('i').classList.toggle('bi-list', !isMenuActive);
                this.elements.menuToggler.querySelector('i').classList.toggle('bi-x', isMenuActive);
                this.updateSidebarState();
            });
        }

        // Ajuste ao redimensionar a janela
        window.addEventListener('resize', () => this.updateSidebarState());

        // Listener para modais (se necessário, pode ser expandido)
        document.addEventListener('click', (e) => this.handleModalClickOutside(e));
    },

    // Atualiza o estado do sidebar e padding do main
    updateSidebarState: function () {
        const isCollapsed = this.elements.sidebar.classList.contains('collapsed');
        const isMenuActive = this.elements.sidebar.classList.contains('menu-active');
        const isDesktop = window.innerWidth >= this.CONSTANTS.desktopBreakpoint;

        if (isDesktop) {
            this.elements.sidebar.style.height = this.CONSTANTS.fullSidebarHeight;
            this.elements.sidebar.classList.remove('menu-active');
            this.elements.main.style.paddingLeft = isCollapsed ? `${this.CONSTANTS.collapsedWidth}px` : `${this.CONSTANTS.sidebarWidth}px`;
        } else {
            this.elements.sidebar.style.height = isMenuActive ? `${this.elements.sidebar.scrollHeight}px` : this.CONSTANTS.collapsedSidebarHeight;
            this.elements.main.style.paddingLeft = '0';
        }
    },

    // Abre um modal e adiciona listener para fechar ao clicar fora
    openModal: function (modalId) {
        console.log('Abrindo modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex'; // Garante que o modal seja visível

            // Adiciona listener para fechar ao clicar fora
            const handleClickOutside = (event) => {
                if (event.target === modal) {
                    this.closeModal(modalId);
                    window.removeEventListener('click', handleClickOutside);
                }
            };
            window.addEventListener('click', handleClickOutside);
        }
    },
    setupSubmenuToggle: function () {
        const submenuParents = document.querySelectorAll('.has-submenu');

        submenuParents.forEach(item => {
            const link = item.querySelector('.nav-link');
            const submenu = item.querySelector('.submenu-flyout');

            if (!link || !submenu) return;

            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Fecha outros submenus
                document.querySelectorAll('.submenu-flyout').forEach(el => {
                    if (el !== submenu) el.classList.remove('open');
                });

                // Alterna visibilidade do submenu clicado
                submenu.classList.toggle('open');
            });

            // Fecha se clicar fora
            document.addEventListener('click', (e) => {
                if (!item.contains(e.target)) {
                    submenu.classList.remove('open');
                }
            });
        });
    },


    // Fecha um modal
    closeModal: function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none'; // Garante que o modal seja oculto
        }
    },

    // Exibe uma notificação temporária com mensagem e ícone
    showNotification: function (message, type = 'success') {
        const modal = document.querySelector(this.SELECTORS.notificationModal);
        const msgEl = document.querySelector(this.SELECTORS.notificationMessage);
        const iconEl = document.querySelector(this.SELECTORS.notificationIcon);

        if (modal && msgEl && iconEl) {
            modal.classList.remove('success', 'error');
            modal.classList.add(type);

            if (Array.isArray(message)) {
                msgEl.innerHTML = '<ul>' + message.map(m => `<li style="list-style-type: none;">${m}</li>`).join('') + '</ul>';
            } else {
                msgEl.textContent = message;
            }

            iconEl.src = type === 'success'
                ? '/static/assets/image/success_icon.png'
                : '/static/assets/image/sign_error_icon.png';

            modal.style.display = 'flex';
            setTimeout(() => { modal.style.display = 'none'; }, 1000);
        }
    },

    // Exibe um modal de confirmação com ação de callback
    showConfirmationModal: function (message, onConfirm) {
        const modal = document.getElementById('notificationModalConfirm');
        const messageEl = document.getElementById('notificationMessageConfirm');
        const icon = document.getElementById('notificationIconConfirm');
        const buttons = document.getElementById('notificationButtons');

        if (modal && messageEl && icon && buttons) {
            messageEl.textContent = message;
            icon.src = '/static/assets/image/success_icon.png';
            icon.style.display = 'block';
            buttons.style.display = 'flex';
            modal.style.display = 'flex';

            const yesBtn = document.getElementById('confirmYes');
            const noBtn = document.getElementById('confirmNo');

            yesBtn.onclick = () => {
                modal.style.display = 'none';
                buttons.style.display = 'none';
                if (onConfirm) onConfirm();
            };

            noBtn.onclick = () => {
                modal.style.display = 'none';
                buttons.style.display = 'none';
            };
        }
    },

    // Exibe um modal com inputs dinâmicos e retorna valores via Promise
    exibirModalInputs: function ({ mensagem, campos }) {
        return new Promise((resolve, reject) => {
            const modal = document.getElementById('modalInputCustom');
            const spanMsg = document.getElementById('modalInputMessage');
            const fieldsContainer = document.getElementById('modalInputFields');
            const btnConfirm = document.getElementById('btnModalInputConfirm');
            const btnCancel = document.getElementById('btnModalInputCancel');

            if (modal && spanMsg && fieldsContainer && btnConfirm && btnCancel) {
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

                function closeModal() {
                    modal.style.display = 'none';
                    btnConfirm.removeEventListener('click', confirm);
                    btnCancel.removeEventListener('click', cancel);
                }

                function confirm() {
                    const valores = {};
                    const inputs = fieldsContainer.querySelectorAll('input');
                    inputs.forEach(input => {
                        valores[input.name] = input.value.trim();
                    });
                    closeModal();
                    resolve(valores);
                }

                function cancel() {
                    closeModal();
                    reject('cancelado');
                }

                btnConfirm.addEventListener('click', confirm);
                btnCancel.addEventListener('click', cancel);
            }
        });
    },

    // Trata cliques fora do modal
    handleModalClickOutside: function (event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal && modal.style.display === 'flex') {
                this.closeModal(modal.id);
            }
        });
    },


    // Alterna o tema dark e salva no localStorage
    toggleDarkMode: function () {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        this.updateDarkModeIcon(isDark);
    },

    // Atualiza o ícone do botão de toggle
    updateDarkModeIcon: function (isDark) {
        const btn = document.querySelector(this.SELECTORS.darkToggleBtn);
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
            }
        }
    },

    // Aplica tema salvo no carregamento
    applySavedDarkMode: function () {
        const savedMode = localStorage.getItem('darkMode');
        const isDark = savedMode === 'enabled';
        if (isDark) document.body.classList.add('dark-mode');
        this.updateDarkModeIcon(isDark);
    }



};

// Inicializa a aplicação quando o DOM estiver carregado

document.addEventListener('DOMContentLoaded', () => {
    App.init();
    App.setupSubmenuToggle();
    App.applySavedDarkMode();

    const darkBtn = document.querySelector(App.SELECTORS.darkToggleBtn); // <--- aqui
    if (darkBtn) {
        darkBtn.addEventListener('click', () => App.toggleDarkMode()); // <--- e aqui
    }
});


// Expõe App globalmente
window.App = App;
