document.addEventListener('DOMContentLoaded', () => {
    // --- Reusable Uploader Initialization Function ---
    const initializeUploader = (type) => {
        const fileUploadArea = document.getElementById(`${type}FileUploadArea`);
        const fileInput = document.getElementById(`${type}FileInput`);
        const selectFileBtn = document.getElementById(`${type}SelectFileBtn`);
        const fileNameDisplay = document.getElementById(`${type}FileName`);
        const startFormattingBtn = document.getElementById(`${type}StartFormattingBtn`);

        if (!fileUploadArea) {
            // If the elements for this type don't exist, do nothing.
            return;
        }

        const handleFile = (file) => {
            if (file) {
                fileNameDisplay.textContent = `Arquivo selecionado: ${file.name}`;
                startFormattingBtn.disabled = false;
            } else {
                fileNameDisplay.textContent = '';
                startFormattingBtn.disabled = true;
            }
        };

        // Event listener for the "select file" button
        selectFileBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Event listener for the main upload area
        fileUploadArea.addEventListener('click', (e) => {
            if (e.target !== selectFileBtn && !selectFileBtn.contains(e.target)) {
                fileInput.click();
            }
        });

        // Handle file selection via the hidden file input
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFile(fileInput.files[0]);
            }
        });

        // --- Drag and Drop Event Handlers ---
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
                const allowedTypes = [
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ];
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

    // --- Initialize both uploaders ---
    initializeUploader('leads');
    initializeUploader('prospects');

    // --- Event Delegation for Table Actions ---
    const tabContent = document.getElementById('formattingTypeTabContent');
    tabContent.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton || !targetButton.closest('tbody')) {
            // Exit if the click was not on a button inside a table body
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
