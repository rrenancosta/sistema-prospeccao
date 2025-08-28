document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:5001';

    // --- API Abstraction ---
    const api = {
        getHistorico: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/historico`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Falha ao carregar histórico:', error);
                // You might want to show a notification to the user here
                return []; // Return empty array on failure
            }
        },
        deleteJob: async (jobId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/historico/${jobId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Falha ao deletar job ${jobId}:`, error);
                throw error; // Re-throw to be caught by the caller
            }
        },
        formatarLeads: async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${API_BASE_URL}/formatar-leads`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Handle file download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // Extract filename from Content-Disposition header or use a default
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = 'formatted_leads.xlsx';
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch.length > 1) {
                        filename = filenameMatch[1];
                    }
                }
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                return { success: true };
            } catch (error) {
                console.error('Falha ao formatar leads:', error);
                throw error;
            }
        }
    };

    // --- UI Rendering ---
    const ui = {
        renderHistorico: (jobs) => {
            const tableBody = document.getElementById('leadsHistoryTableBody');
            if (!tableBody) return;
            tableBody.innerHTML = ''; // Clear existing rows

            if (jobs.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum histórico encontrado.</td></tr>';
                return;
            }

            jobs.forEach(job => {
                const row = document.createElement('tr');
                const statusBadge = ui.getStatusBadge(job.status);
                const actions = ui.getActions(job);

                row.innerHTML = `
                    <td class="align-middle">${job.filename}</td>
                    <td class="align-middle">${new Date(job.upload_date).toLocaleString('pt-BR')}</td>
                    <td class="align-middle">${statusBadge}</td>
                    <td class="align-middle">
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar" role="progressbar" style="width: 100%; background-color: var(--success-color);" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                        </div>
                    </td>
                    <td class="text-end">${actions}</td>
                `;
                row.dataset.jobId = job.id;
                tableBody.appendChild(row);
            });
        },
        getStatusBadge: (status) => {
            // This can be expanded with more statuses
            switch (status) {
                case 'Concluído':
                    return `<span class="badge status-finalizada">Concluído</span>`;
                default:
                    return `<span class="badge bg-secondary">${status}</span>`;
            }
        },
        getActions: (job) => {
            const downloadButton = `<a href="${API_BASE_URL}/download/${job.id}" class="btn btn-sm btn-outline-primary me-1" title="Baixar"><i class="fas fa-download"></i></a>`;
            const deleteButton = `<button class="btn btn-sm btn-outline-danger" title="Deletar" data-action="delete" data-job-id="${job.id}"><i class="fas fa-trash"></i></button>`;
            return `${downloadButton}${deleteButton}`;
        },
        showNotification: (message, isSuccess = true) => {
            // Placeholder for a more robust notification system
            alert(message);
        }
    };

    // --- Main Application Logic ---
    const carregarHistorico = async () => {
        const jobs = await api.getHistorico();
        ui.renderHistorico(jobs);
    };

    // --- Event Listeners Setup ---
    const setupLeadsUploader = () => {
        const fileInput = document.getElementById('leadsFileInput');
        const startBtn = document.getElementById('leadsStartFormattingBtn');

        if (startBtn) {
            startBtn.addEventListener('click', async () => {
                if (fileInput.files.length === 0) {
                    ui.showNotification('Por favor, selecione um arquivo primeiro.', false);
                    return;
                }
                const file = fileInput.files[0];
                startBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';

                try {
                    await api.formatarLeads(file);
                    ui.showNotification('Arquivo formatado e download iniciado com sucesso!');
                    await carregarHistorico(); // Refresh the history
                } catch (error) {
                    ui.showNotification('Ocorreu um erro ao formatar o arquivo.', false);
                } finally {
                    startBtn.disabled = false;
                    startBtn.innerHTML = '<i class="fas fa-rocket me-2"></i> Iniciar Formatação de Leads';
                     // Reset file input and related UI
                    const fileNameDisplay = document.getElementById('leadsFileName');
                    fileInput.value = '';
                    fileNameDisplay.textContent = '';
                    startBtn.disabled = true;
                }
            });
        }
    };

    const initializeUploader = (type) => {
        const fileUploadArea = document.getElementById(`${type}FileUploadArea`);
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
            } else {
                fileNameDisplay.textContent = '';
                if (startFormattingBtn) {
                    startFormattingBtn.disabled = true;
                }
            }
        };

        selectFileBtn.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('click', (e) => {
            if (e.target !== selectFileBtn && !selectFileBtn.contains(e.target)) {
                fileInput.click();
            }
        });
        fileInput.addEventListener('change', () => handleFile(fileInput.files.length > 0 ? fileInput.files[0] : null));
        fileUploadArea.addEventListener('dragover', (e) => { e.preventDefault(); fileUploadArea.classList.add('dragover'); });
        fileUploadArea.addEventListener('dragleave', () => fileUploadArea.classList.remove('dragover'));
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                const isExcelFile = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');
                if (isExcelFile) {
                    fileInput.files = e.dataTransfer.files;
                    handleFile(file);
                } else {
                    alert('Por favor, envie um arquivo .xls ou .xlsx');
                }
            }
        });
    };

    // Initialize standard uploaders
    initializeUploader('leads');
    initializeUploader('prospects');
    initializeUploader('rdAgence');
    initializeUploader('rdOutra');

    // Setup specific logic for the Leads uploader button
    setupLeadsUploader();

    // Setup table actions
    const leadsTableBody = document.getElementById('leadsHistoryTableBody');
    if (leadsTableBody) {
        leadsTableBody.addEventListener('click', async (e) => {
            const targetButton = e.target.closest('button');
            if (!targetButton) return;

            const action = targetButton.dataset.action;
            const jobId = targetButton.dataset.jobId;

            if (action === 'delete') {
                if (confirm('Tem certeza que deseja deletar este item do histórico?')) {
                    try {
                        await api.deleteJob(jobId);
                        ui.showNotification('Item deletado com sucesso.');
                        // Find and remove the row from the UI
                        const rowToRemove = targetButton.closest('tr');
                        if (rowToRemove) {
                            rowToRemove.remove();
                        }
                    } catch (error) {
                        ui.showNotification('Falha ao deletar o item.', false);
                    }
                }
            }
        });
    }

    // Initial load of history
    carregarHistorico();
});
