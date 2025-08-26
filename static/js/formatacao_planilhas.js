    /**
     * Exibe uma notificação toast para feedback ao usuário
     * @param {string} message - Mensagem a ser exibida
     * @param {'success'|'error'|'info'} [type='info'] - Tipo de mensagem
     */
    function showToast(message, type = 'info') {
        const toast = document.getElementById('liveToast');
        const toastMessage = document.getElementById('toastMessage');
        if (!toast || !toastMessage) return;
        toastMessage.textContent = message;
        toast.className = 'toast show';
        toast.classList.remove('bg-success', 'bg-danger', 'bg-info');
        if (type === 'success') toast.classList.add('bg-success');
        else if (type === 'error') toast.classList.add('bg-danger');
        else toast.classList.add('bg-info');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para botões do modal de campanha
    const addSpeechBtn = document.querySelector('#modalStep2 .btn.btn-outline-primary');
    if (addSpeechBtn) {
        addSpeechBtn.addEventListener('click', addSpeech);
    }

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', previousStep);
    }

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
    }

    const saveStatusBtn = document.querySelector('#editCampaignModal .btn.btn-primary');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', updateCampaignStatus);
    }


    // Dark mode agora é gerenciado globalmente por theme.js

    // --- State for the RD Station dual upload ---
    const rdUploadState = {
        agence: false,
        outra: false,
    };

    /**
     * Inicializa o uploader de arquivos para cada tipo de planilha
     * @param {string} type - Tipo de uploader (leads, prospects, rdAgence, rdOutra)
     * @param {function} [onFileSelectedCallback] - Callback opcional para estado do arquivo
     */
    const MAX_FILE_SIZE_MB = 5;
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

    if (!fileUploadArea || !fileInput || !selectFileBtn || !fileNameDisplay) return;

    /**
     * Atualiza o estado do upload e exibe nome do arquivo
     * @param {File|null} file - Arquivo selecionado ou null
     */
    const handleFile = (file) => {
        if (file) {
            // Validação de tamanho
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                fileNameDisplay.textContent = '';
                if (startFormattingBtn) startFormattingBtn.disabled = true;
                showToast(`Arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB.`, 'error');
                if (onFileSelectedCallback) onFileSelectedCallback(false);
                return;
            }
            fileNameDisplay.textContent = `Arquivo: ${file.name}`;
            if (startFormattingBtn) startFormattingBtn.disabled = false;
            if (onFileSelectedCallback) onFileSelectedCallback(true);
        } else {
            fileNameDisplay.textContent = '';
            if (startFormattingBtn) startFormattingBtn.disabled = true;
            if (onFileSelectedCallback) onFileSelectedCallback(false);
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
                if (fileInput.files[0] && fileInput.files[0].size <= MAX_FILE_SIZE_MB * 1024 * 1024) {
                    showToast('Arquivo selecionado com sucesso!', 'success');
                }
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

                if (!isExcelFile) {
                    showToast('Por favor, envie um arquivo .xls ou .xlsx', 'error');
                    handleFile(null);
                    return;
                }
                if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                    showToast(`Arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB.`, 'error');
                    handleFile(null);
                    return;
                }
                fileInput.files = e.dataTransfer.files;
                handleFile(file);
                showToast('Arquivo enviado com sucesso!', 'success');
            }
        });
    };

    // --- Function to check and set the comparison button state ---
    /**
     * Habilita/desabilita botão de comparação RD Station conforme uploads
     */
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
    /**
     * Delegação de eventos para ações nas tabelas de histórico
     */
    tabContent.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton || !targetButton.closest('tbody')) {
            return;
        }

        const action = targetButton.title;
        const fileName = targetButton.closest('tr').querySelector('td:first-child').textContent;

        if (action === 'Baixar') {
            showToast(`Download iniciado para o arquivo: ${fileName}`, 'info');
        } else if (action === 'Parar Processamento') {
            showToast(`Processamento parado para o arquivo: ${fileName}`, 'info');
        } else if (action === 'Deletar') {
            if (confirm(`Tem certeza que deseja deletar o histórico de: ${fileName}?`)) {
                targetButton.closest('tr').remove();
                showToast(`Histórico de ${fileName} deletado.`, 'success');
            }
        }
    });
});
