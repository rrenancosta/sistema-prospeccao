document.addEventListener('DOMContentLoaded', () => {

    // --- Dark Mode Theme Functions (copiados de dashboard.js) ---
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }

    function updateThemeIcon(theme) {
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    initializeTheme();

    // --- State for the RD Station dual upload ---
    const rdUploadState = {
        agence: false,
        outra: false,
    };

    // --- Reusable Uploader Initialization Function ---
    // Corrigindo os IDs para RD Station
    const initializeUploader = (type, onFileSelectedCallback) => {
        // IDs para RD Station
        let fileUploadAreaId = `${type}FileUploadArea`;
        if (type === 'rdAgence') fileUploadAreaId = 'rdAgenceUploadArea';
        if (type === 'rdOutra') fileUploadAreaId = 'rdOutraUploadArea';

        const fileUploadArea = document.getElementById(fileUploadAreaId);
        const fileInput = document.getElementById(`${type}FileInput`);
        const selectFileBtn = document.getElementById(`${type}SelectFileBtn`);
        const fileNameDisplay = document.getElementById(`${type}FileName`);
        const startFormattingBtn = document.getElementById(`${type}StartFormattingBtn`);

        if (!fileUploadArea) return;

        const handleFile = (file) => {
            if (file) {
                fileNameDisplay.textContent = `Arquivo: ${file.name}`;
                if (startFormattingBtn) {
                    startFormattingBtn.disabled = false;
                }
                if (onFileSelectedCallback) {
                    onFileSelectedCallback(true);
                }
            } else {
                fileNameDisplay.textContent = '';
                if (startFormattingBtn) {
                    startFormattingBtn.disabled = true;
                }
                if (onFileSelectedCallback) {
                    onFileSelectedCallback(false);
                }
            }
        };

        selectFileBtn.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('click', (e) => {
            if (e.target !== selectFileBtn && !selectFileBtn.contains(e.target)) {
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFile(fileInput.files[0]);
            } else {
                handleFile(null);
            }
        });

        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
                const isExcelFile = allowedTypes.includes(file.type) || file.name.endsWith('.xls') || file.name.endsWith('.xlsx');

                if (isExcelFile) {
                    fileInput.files = e.dataTransfer.files;
                    handleFile(file);
                } else {
                    alert('Por favor, envie um arquivo .xls ou .xlsx');
                }
            }
        });
    };

    // --- Function to check and set the comparison button state ---
    const checkComparisonButtonState = () => {
        const comparisonBtn = document.getElementById('rdStartComparisonBtn');
        if (rdUploadState.agence && rdUploadState.outra) {
            comparisonBtn.disabled = false;
        } else {
            comparisonBtn.disabled = true;
        }
    };

    // --- Initialize all four uploaders ---
    initializeUploader('leads');
    initializeUploader('prospects');
    initializeUploader('rdAgence', (isFileSelected) => {
        rdUploadState.agence = isFileSelected;
        checkComparisonButtonState();
    });
    initializeUploader('rdOutra', (isFileSelected) => {
        rdUploadState.outra = isFileSelected;
        checkComparisonButtonState();
    });

    // --- Event Delegation for Table Actions ---
    const tabContent = document.getElementById('formattingTypeTabContent');
    tabContent.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton || !targetButton.closest('tbody')) {
            return;
        }

        const action = targetButton.title;
        const fileName = targetButton.closest('tr').querySelector('td:first-child').textContent;

        if (action === 'Baixar') {
            alert(`Ação de Baixar para o arquivo: ${fileName}`);
        } else if (action === 'Parar Processamento') {
            alert(`Ação de Parar Processamento para o arquivo: ${fileName}`);
        } else if (action === 'Deletar') {
            if (confirm(`Tem certeza que deseja deletar o histórico de: ${fileName}?`)) {
                targetButton.closest('tr').remove();
                alert(`Histórico de ${fileName} deletado.`);
            }
        }
    });
});
