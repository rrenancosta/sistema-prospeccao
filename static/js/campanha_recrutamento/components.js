// Component functions for rendering UI elements

/**
 * Render campaigns table
 */
function renderCampaignsTable(campaigns) {
    const tbody = document.getElementById('campaignsTableBody');
    
    if (campaigns.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Nenhuma campanha encontrada</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = campaigns.map(campaign => `
        <tr onclick="navigateTo('campaign-detail', ${campaign.id})" style="cursor: pointer;">
            <td>
                <strong>${escapeHtml(campaign.name)}</strong>
            </td>
            <td>
                <span class="badge bg-primary">${formatNumber(campaign.candidates)}</span>
            </td>
            <td>
                ${getProgressBar(campaign.progress)}
            </td>
            <td>
                <small class="text-muted">${escapeHtml(campaign.description.substring(0, 50))}...</small>
            </td>
            <td>
                ${getStatusBadge(campaign.status)}
            </td>
            <td onclick="event.stopPropagation();">
                ${getCampaignActionButton(campaign)}
            </td>
        </tr>
    `).join('');
}

/**
 * Render leads table
 */
function renderLeadsTable(leads) {
    const tbody = document.getElementById('candidatesTableBody');
    
    if (leads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Nenhum lead encontrado</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = leads.map(lead => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input lead-checkbox" value="${lead.id}" data-name="${escapeHtml(lead.name)}" data-phone="${escapeHtml(lead.phone)}">
            </td>
            <td>
                <strong>${escapeHtml(lead.name)}</strong>
            </td>
            <td>${escapeHtml(lead.phone)}</td>
            <td>${escapeHtml(lead.email)}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="score-badge bg-primary text-white rounded-pill px-2 py-1 me-2" style="font-size: 0.75rem; font-weight: 600;">
                        ${lead.score}
                    </div>
                </div>
            </td>
            <td>${getStatusBadge(lead.status)}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="openWhatsAppChat(${lead.id}, '${escapeHtml(lead.name)}')">
                    <i class="fab fa-whatsapp"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Update selection controls
    updateSelectionControls();
}

/**
 * Render WhatsApp chat
 */
function renderWhatsAppChat(leadId, leadName) {
    const chat = getWhatsAppChat(leadId);
    const chatContainer = document.getElementById('chatContainer');
    
    // Update modal title
    document.querySelector('#whatsappModal .modal-title').innerHTML = `
        <i class="fab fa-whatsapp me-2"></i>Conversa com ${escapeHtml(leadName)}
    `;
    
    // Render messages
    chatContainer.innerHTML = chat.map(message => `
        <div class="chat-message ${message.sender}">
            <div class="chat-bubble">
                ${escapeHtml(message.message)}
            </div>
            <div class="chat-time">${message.time}</div>
        </div>
    `).join('');
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Render modal steps progress
 */
function updateModalProgress(currentStep, totalSteps) {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('modalProgress').style.width = `${progress}%`;
    
    // Update step indicators
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        if (stepElement) {
            if (i === currentStep) {
                stepElement.classList.add('active-step');
            } else {
                stepElement.classList.remove('active-step');
            }
        }
    }
}

/**
 * Add question input to modal
 */
function addQuestion() {
    const container = document.getElementById('questionsContainer');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item mb-3';
    questionDiv.innerHTML = `
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Digite a pergunta">
            <button class="btn btn-outline-danger" type="button" onclick="removeQuestion(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(questionDiv);
    animateElement(questionDiv, 'fadeIn');
}

/**
 * Remove question input from modal
 */
function removeQuestion(button) {
    const questionItem = button.closest('.question-item');
    questionItem.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        questionItem.remove();
    }, 300);
}

/**
 * Update review step in modal
 */
function updateReviewStep() {
    const name = document.getElementById('campaignName').value;
    const description = document.getElementById('campaignDescription').value;
    const file = document.getElementById('candidatesFile').files[0];
    const questions = Array.from(document.querySelectorAll('#questionsContainer input'))
        .map(input => input.value)
        .filter(value => value.trim() !== '');
    
    // Count candidates from preview if available
    const previewCount = document.getElementById('previewCount')?.textContent || '0';
    
    document.getElementById('reviewName').textContent = name || 'Não informado';
    document.getElementById('reviewDescription').textContent = description || 'Não informado';
    document.getElementById('reviewCandidates').textContent = `${previewCount} leads`;
    document.getElementById('reviewFile').textContent = file ? file.name : 'Nenhum arquivo selecionado';
    document.getElementById('reviewQuestions').innerHTML = questions.length > 0 
        ? questions.map(q => `<li>${escapeHtml(q)}</li>`).join('')
        : 'Nenhuma pergunta adicionada';
}

/**
 * Render lead preview in modal
 */
function renderLeadPreview(leads) {
    const previewContainer = document.getElementById('candidatePreview');
    const previewList = document.getElementById('candidatePreviewList');
    const previewCount = document.getElementById('previewCount');
    
    if (!leads || leads.length === 0) {
        previewContainer.classList.add('d-none');
        return;
    }
    
    previewCount.textContent = leads.length;
    previewList.innerHTML = leads.map(lead => `
        <div class="candidate-preview-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">${escapeHtml(lead.name)}</div>
                    <small class="text-muted">${escapeHtml(lead.phone)} • ${escapeHtml(lead.email)}</small>
                </div>
                <div class="text-end">
                    <small class="text-muted">Score: ${lead.score || generateRandomScore()}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    previewContainer.classList.remove('d-none');
}

/**
 * Render mass message modal
 */
function renderMassMessageModal() {
    const checkboxes = document.querySelectorAll('.lead-checkbox:checked');
    const selectedLeads = Array.from(checkboxes).map(checkbox => ({
        id: checkbox.value,
        name: checkbox.dataset.name,
        phone: checkbox.dataset.phone
    }));
    
    document.getElementById('massMessageCount').textContent = selectedLeads.length;
    
    const selectedList = document.getElementById('selectedCandidatesList');
    selectedList.innerHTML = selectedLeads.map(lead => `
        <div class="selected-lead-item">
            <div class="lead-info">
                <div class="lead-name">${escapeHtml(lead.name)}</div>
                <div class="lead-contact">${escapeHtml(lead.phone)}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Render bulk upload preview
 */
function renderBulkUploadPreview(leads) {
    const previewContainer = document.getElementById('bulkUploadPreview');
    const previewList = document.getElementById('bulkUploadPreviewList');
    const previewCount = document.getElementById('bulkPreviewCount');
    const uploadBtn = document.getElementById('bulkUploadBtn');
    
    if (!leads || leads.length === 0) {
        previewContainer.classList.add('d-none');
        uploadBtn.disabled = true;
        return;
    }
    
    previewCount.textContent = leads.length;
    previewList.innerHTML = leads.map((lead, index) => `
        <div class="candidate-preview-card">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">${escapeHtml(lead.name)}</div>
                    <small class="text-muted">${escapeHtml(lead.phone)} • ${escapeHtml(lead.email)}</small>
                </div>
                <div class="text-end">
                    <small class="text-muted">Linha ${index + 2}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    previewContainer.classList.remove('d-none');
    uploadBtn.disabled = false;
}

/**
 * Update selection controls for leads
 */
function updateSelectionControls() {
    const checkboxes = document.querySelectorAll('.lead-checkbox');
    const selectAll = document.getElementById('selectAllLeads');
    const massActionBtn = document.getElementById('massActionBtn');
    const selectedCount = document.getElementById('selectedCount');
    
    const checkedBoxes = document.querySelectorAll('.lead-checkbox:checked');
    const allChecked = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
    const someChecked = checkedBoxes.length > 0;
    
    // Update select all checkbox
    if (selectAll) {
        selectAll.checked = allChecked;
        selectAll.indeterminate = someChecked && !allChecked;
    }
    
    // Update mass action button
    if (massActionBtn) {
        massActionBtn.disabled = !someChecked;
    }
    
    // Update selected count
    if (selectedCount) {
        selectedCount.textContent = `${checkedBoxes.length} selecionados`;
    }
}

/**
 * Create sortable table headers
 */
function setupSortableHeaders(tableId, sortCallback) {
    const table = document.getElementById(tableId);
    const headers = table.querySelectorAll('th.sortable');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            const currentSort = header.classList.contains('sort-asc') ? 'asc' : 
                              header.classList.contains('sort-desc') ? 'desc' : null;
            
            // Remove sort classes from all headers
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            
            // Add appropriate sort class
            let newSort = 'asc';
            if (currentSort === 'asc') {
                newSort = 'desc';
                header.classList.add('sort-desc');
            } else {
                header.classList.add('sort-asc');
            }
            
            // Call sort callback
            sortCallback(column, newSort);
        });
    });
}

/**
 * Show loading spinner in element
 */
function showLoadingSpinner(element, text = 'Carregando...') {
    element.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2 text-muted">${text}</p>
        </div>
    `;
}

/**
 * Create empty state message
 */
function createEmptyState(icon, message) {
    return `
        <div class="text-center py-5">
            <i class="fas ${icon} fa-3x text-muted mb-3"></i>
            <p class="text-muted">${message}</p>
        </div>
    `;
}

/**
 * Setup file upload preview
 */
function setupFileUploadPreview() {
    const fileInput = document.getElementById('leadsFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                showToast(`Arquivo "${file.name}" selecionado com sucesso!`, 'success');
            }
        });
    }
}

/**
 * Validate form step
 */
function validateFormStep(stepNumber) {
    switch (stepNumber) {
        case 1:
            const name = document.getElementById('campaignName').value.trim();
            const description = document.getElementById('campaignDescription').value.trim();
            return name && description;
        case 2:
            // File upload is optional
            return true;
        case 3:
            // Questions are optional
            return true;
        case 4:
            return true;
        default:
            return false;
    }
}
