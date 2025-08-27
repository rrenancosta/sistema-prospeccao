/**
 * Exibe uma notificação toast para feedback ao usuário.
 * Certifique-se de que seu HTML tem os elementos com os IDs 'liveToast' e 'toastMessage'.
 * @param {string} message - Mensagem a ser exibida.
 * @param {'success'|'error'|'info'} [type='info'] - Tipo de mensagem (controla a cor).
 */
function showToast(message, type = 'info') {
    const toastEl = document.getElementById('liveToast');
    const toastMessageEl = document.getElementById('toastMessage');
    if (!toastEl || !toastMessageEl) {
        console.error("Elementos do Toast não encontrados no HTML!");
        alert(message); // Usa um alert como alternativa se o toast não existir
        return;
    }
    toastMessageEl.textContent = message;
    
    // Garante que a instância do Toast do Bootstrap seja criada
    const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl);

    // Remove classes de cor antigas e adiciona a nova
    toastEl.classList.remove('bg-success', 'bg-danger', 'bg-info');
    if (type === 'success') toastEl.classList.add('bg-success');
    else if (type === 'error') toastEl.classList.add('bg-danger');
    else toastEl.classList.add('bg-info');
    
    bsToast.show();
}


document.addEventListener('DOMContentLoaded', () => {
    // Elementos principais
    const uploadArea = document.getElementById('leadsFileUploadArea');
    const selectFileBtn = document.getElementById('leadsSelectFileBtn');
    const fileInput = document.getElementById('leadsFileInput');
    const fileNameEl = document.getElementById('leadsFileName');
    const startFormattingBtn = document.getElementById('leadsStartFormattingBtn');

    if (!uploadArea || !selectFileBtn || !fileInput || !fileNameEl || !startFormattingBtn) {
        console.error("Algum elemento de upload não foi encontrado no HTML.");
        return;
    }

    // Função para validar arquivo
    function validateFile(file) {
        if (!file) return { valid: false, message: 'Nenhum arquivo selecionado.' };
        const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const allowedExts = ['.xls', '.xlsx'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowedExts.includes(ext)) {
            return { valid: false, message: 'Formato inválido. Só aceitamos .xls ou .xlsx.' };
        }
        if (file.size > maxSize) {
            return { valid: false, message: 'Arquivo muito grande. Máximo 5MB.' };
        }
        return { valid: true };
    }

    // Atualiza nome do arquivo e habilita botão
    function updateFileState(file) {
        if (file) {
            fileNameEl.textContent = file.name;
            startFormattingBtn.disabled = false;
        } else {
            fileNameEl.textContent = '';
            startFormattingBtn.disabled = true;
        }
    }

    // Clique no botão para abrir input
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Mudança no input de arquivo
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const validation = validateFile(file);
        if (!validation.valid) {
            showToast(validation.message, 'error');
            fileInput.value = '';
            updateFileState(null);
            return;
        }
        updateFileState(file);
    });

    // Arrastar/soltar na área
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        const validation = validateFile(file);
        if (!validation.valid) {
            showToast(validation.message, 'error');
            fileInput.value = '';
            updateFileState(null);
            return;
        }
        // Atualiza input manualmente para manter consistência
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        updateFileState(file);
    });

    // Lógica de formatação e envio
    startFormattingBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            showToast('Por favor, selecione uma planilha primeiro.', 'error');
            return;
        }
        const validation = validateFile(file);
        if (!validation.valid) {
            showToast(validation.message, 'error');
            return;
        }

        startFormattingBtn.disabled = true;
        startFormattingBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Formatando...';

        const formData = new FormData();
        formData.append('planilha', file);

        fetch('http://127.0.0.1:5001/formatar-leads', {
            method: 'POST',
            body: formData,
        })
        .then(async (response) => {
            if (response.ok) {
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = 'formatado_' + file.name;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch && filenameMatch.length > 1) {
                        filename = filenameMatch[1];
                    }
                }
                const blob = await response.blob();
                return { blob, filename };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Erro desconhecido no servidor.');
            }
        })
        .then(({ blob, filename }) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showToast('Planilha formatada e baixada com sucesso!', 'success');
            // Limpa estado
            fileInput.value = '';
            updateFileState(null);
        })
        .catch((error) => {
            console.error('Erro na formatação:', error);
            showToast(`Falha na formatação: ${error.message}`, 'error');
        })
        .finally(() => {
            startFormattingBtn.disabled = true;
            startFormattingBtn.innerHTML = '<i class="fas fa-rocket me-2"></i>Iniciar Formatação de Leads';
        });
    });
});
