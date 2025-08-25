document.addEventListener('DOMContentLoaded', () => {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fileNameDisplay = document.getElementById('fileName');
    const startFormattingBtn = document.getElementById('startFormattingBtn');

    // Trigger file input click when the "select file" button is clicked
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Also trigger file input when the main upload area is clicked
    fileUploadArea.addEventListener('click', (e) => {
        // Prevent triggering the file input if the button was clicked
        if (e.target !== selectFileBtn) {
            fileInput.click();
        }
    });

    // Handle file selection via file input
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    });

    // Handle drag and drop
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
            // Ensure only allowed file types are processed
            const file = e.dataTransfer.files[0];
            const allowedTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.xls',
                '.xlsx'
            ];
            if (allowedTypes.includes(file.type) || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                fileInput.files = e.dataTransfer.files; // Assign dropped file to input
                handleFile(file);
            } else {
                alert('Por favor, envie um arquivo .xls ou .xlsx');
            }
        }
    });

    function handleFile(file) {
        if (file) {
            fileNameDisplay.textContent = `Arquivo selecionado: ${file.name}`;
            startFormattingBtn.disabled = false;
        } else {
            fileNameDisplay.textContent = '';
            startFormattingBtn.disabled = true;
        }
    }

    // Placeholder for table action buttons
    const historyTableBody = document.getElementById('historyTableBody');
    historyTableBody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const action = target.title;
        const fileName = target.closest('tr').querySelector('td:first-child').textContent;

        if (action === 'Baixar') {
            alert(`Ação de Baixar para o arquivo: ${fileName}`);
        } else if (action === 'Parar Processamento') {
            alert(`Ação de Parar Processamento para o arquivo: ${fileName}`);
        } else if (action === 'Deletar') {
            if (confirm(`Tem certeza que deseja deletar o histórico de: ${fileName}?`)) {
                target.closest('tr').remove();
                alert(`Histórico de ${fileName} deletado.`);
            }
        }
    });
});
