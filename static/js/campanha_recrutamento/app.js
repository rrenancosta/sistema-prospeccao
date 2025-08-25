// Main application logic

let currentView = 'dashboard';
let currentCampaignId = null;
let currentModalStep = 1;
let filteredCampaigns = [];
let filteredLeads = [];
let sortState = { column: null, direction: 'asc' };

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupRouting();
    loadInitialData();
    initializeTheme();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Setup sortable tables
    setupSortableHeaders('campaignsTable', sortCampaigns);
    setupSortableHeaders('candidatesTable', sortLeads);
    
    // Setup file upload preview
    setupFileUploadPreview();
    
    // Show initial view based on hash
    const hash = window.location.hash;
    if (hash.startsWith('#campaign-detail/')) {
        const campaignId = hash.split('/')[1];
        navigateTo('campaign-detail', parseInt(campaignId));
    } else {
        navigateTo('dashboard');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Campaign filters
    const campaignNameFilter = document.getElementById('campaignNameFilter');
    const campaignStatusFilter = document.getElementById('campaignStatusFilter');
    
    if (campaignNameFilter) {
        campaignNameFilter.addEventListener('input', debounce(applyCampaignFilters, 300));
    }
    if (campaignStatusFilter) {
        campaignStatusFilter.addEventListener('change', applyCampaignFilters);
    }
    
    // Lead filters
    const leadSearchFilter = document.getElementById('candidateSearchFilter');
    const leadScoreFilter = document.getElementById('candidateScoreFilter');
    const leadStatusFilter = document.getElementById('candidateStatusFilter');
    
    if (leadSearchFilter) {
        leadSearchFilter.addEventListener('input', debounce(applyLeadFilters, 300));
    }
    if (leadScoreFilter) {
        leadScoreFilter.addEventListener('change', applyLeadFilters);
    }
    if (leadStatusFilter) {
        leadStatusFilter.addEventListener('change', applyLeadFilters);
    }
    
    // Select all leads checkbox
    const selectAllLeads = document.getElementById('selectAllCandidates');
    if (selectAllLeads) {
        selectAllLeads.addEventListener('change', toggleSelectAllLeads);
    }
    
    // Lead checkboxes (delegated event)
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('lead-checkbox')) {
            updateSelectionControls();
        }
    });
    
    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Modal events
    const addCampaignModal = document.getElementById('addCampaignModal');
    if (addCampaignModal) {
        addCampaignModal.addEventListener('hidden.bs.modal', resetModal);
    }

    // Mass message modal event
    const massMessageModal = document.getElementById('massMessageModal');
    if (massMessageModal) {
        massMessageModal.addEventListener('show.bs.modal', renderMassMessageModal);
    }

    // Setup file upload previews
    setupFileUploadPreview();
    setupBulkUploadPreview();
    setupCandidateFilePreview();
}

/**
 * Setup client-side routing
 */
function setupRouting() {
    window.addEventListener('hashchange', handleRouteChange);
}

/**
 * Handle route changes
 */
function handleRouteChange() {
    const hash = window.location.hash;
    
    if (hash === '#dashboard' || hash === '') {
        navigateTo('dashboard');
    } else if (hash.startsWith('#campaign-detail/')) {
        const campaignId = hash.split('/')[1];
        navigateTo('campaign-detail', parseInt(campaignId));
    }
}

/**
 * Navigate to different views
 */
function navigateTo(view, campaignId = null) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.add('d-none'));
    
    currentView = view;
    currentCampaignId = campaignId;
    
    if (view === 'dashboard') {
        document.getElementById('dashboard-view').classList.remove('d-none');
        window.location.hash = 'dashboard';
        loadCampaigns();
    } else if (view === 'campaign-detail') {
        document.getElementById('campaign-detail-view').classList.remove('d-none');
        window.location.hash = `campaign-detail/${campaignId}`;
        loadCampaignDetail(campaignId);
    }
}

/**
 * Load initial data
 */
function loadInitialData() {
    if (currentView === 'dashboard') {
        loadCampaigns();
    }
}

/**
 * Load and display campaigns
 */
function loadCampaigns() {
    const campaigns = getCampaigns();
    filteredCampaigns = [...campaigns];
    applyCampaignFilters();
}

/**
 * Load and display campaign detail
 */
function loadCampaignDetail(campaignId) {
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
        showToast('Campanha não encontrada', 'error');
        navigateTo('dashboard');
        return;
    }
    
    // Update campaign details
    document.getElementById('campaignDetailTitle').textContent = campaign.name;
    document.getElementById('campaignDetailDescription').textContent = campaign.description;
    
    // Load leads
    const leads = getLeadsByCampaign(campaignId);
    filteredLeads = [...leads];
    applyLeadFilters();
}

/**
 * Apply campaign filters
 */
function applyCampaignFilters() {
    const nameFilter = document.getElementById('campaignNameFilter')?.value || '';
    const statusFilter = document.getElementById('campaignStatusFilter')?.value || '';
    
    filteredCampaigns = filterCampaigns(getCampaigns(), nameFilter, statusFilter);
    
    // Apply current sort if any
    if (sortState.column) {
        filteredCampaigns = sortArray(filteredCampaigns, sortState.column, sortState.direction);
    }
    
    renderCampaignsTable(filteredCampaigns);
}

/**
 * Apply lead filters
 */
function applyLeadFilters() {
    const searchFilter = document.getElementById('candidateSearchFilter')?.value || '';
    const scoreFilter = document.getElementById('candidateScoreFilter')?.value || '';
    const statusFilter = document.getElementById('candidateStatusFilter')?.value || '';
    
    const allLeads = getLeadsByCampaign(currentCampaignId);
    filteredLeads = filterCandidates(allLeads, searchFilter, scoreFilter, statusFilter);
    
    // Apply current sort if any
    if (sortState.column) {
        filteredLeads = sortArray(filteredLeads, sortState.column, sortState.direction);
    }
    
    renderLeadsTable(filteredLeads);
}

/**
 * Sort campaigns
 */
function sortCampaigns(column, direction) {
    sortState = { column, direction };
    filteredCampaigns = sortArray(filteredCampaigns, column, direction);
    renderCampaignsTable(filteredCampaigns);
}

/**
 * Sort leads
 */
function sortLeads(column, direction) {
    sortState = { column, direction };
    filteredLeads = sortArray(filteredLeads, column, direction);
    renderLeadsTable(filteredLeads);
}

/**
 * Toggle campaign status (pause/continue)
 */
function toggleCampaignStatus(campaignId, newStatus) {
    const campaign = updateCampaignStatus(campaignId, newStatus);
    if (campaign) {
        const statusText = newStatus === 'ativa' ? 'ativada' : 'pausada';
        showToast(`Campanha "${campaign.name}" foi ${statusText} com sucesso!`, 'success');
        applyCampaignFilters(); // Refresh the table
    } else {
        showToast('Erro ao atualizar status da campanha', 'danger');
    }
}

/**
 * Toggle select all leads
 */
function toggleSelectAllLeads() {
    const selectAll = document.getElementById('selectAllCandidates');
    const checkboxes = document.querySelectorAll('.lead-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateSelectionControls();
}

/**
 * Open WhatsApp chat modal
 */
function openWhatsAppChat(leadId, leadName) {
    renderWhatsAppChat(leadId, leadName);
    const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
    modal.show();
}

/**
 * Send message in chat
 */
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatContainer = document.getElementById('chatContainer');
    const messageHtml = `
        <div class="chat-message user">
            <div class="chat-bubble">
                ${escapeHtml(message)}
            </div>
            <div class="chat-time">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
    
    chatContainer.insertAdjacentHTML('beforeend', messageHtml);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    input.value = '';
    
    // Simulate agent response after 2 seconds
    setTimeout(() => {
        const agentResponse = `
            <div class="chat-message agent">
                <div class="chat-bubble">
                    Obrigado pela mensagem! Vou analisar e retorno em breve.
                </div>
                <div class="chat-time">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', agentResponse);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 2000);
}

/**
 * Modal navigation functions
 */
function nextStep() {
    if (!validateFormStep(currentModalStep)) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
        return;
    }
    
    if (currentModalStep < 4) {
        // Hide current step
        document.getElementById(`modal-step-${currentModalStep}`).classList.add('d-none');
        
        // Show next step
        currentModalStep++;
        document.getElementById(`modal-step-${currentModalStep}`).classList.remove('d-none');
        
        // Update progress and buttons
        updateModalProgress(currentModalStep, 4);
        updateModalButtons();
        
        // If it's the review step, update the review
        if (currentModalStep === 4) {
            updateReviewStep();
        }
    }
}

function previousStep() {
    if (currentModalStep > 1) {
        // Hide current step
        document.getElementById(`modal-step-${currentModalStep}`).classList.add('d-none');
        
        // Show previous step
        currentModalStep--;
        document.getElementById(`modal-step-${currentModalStep}`).classList.remove('d-none');
        
        // Update progress and buttons
        updateModalProgress(currentModalStep, 4);
        updateModalButtons();
    }
}

/**
 * Update modal buttons based on current step
 */
function updateModalButtons() {
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');
    const finishBtn = document.getElementById('modalFinishBtn');
    
    prevBtn.disabled = currentModalStep === 1;
    
    if (currentModalStep === 4) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';
    }
}

/**
 * Finish campaign creation
 */
function finishCampaign() {
    const name = document.getElementById('campaignName').value;
    const description = document.getElementById('campaignDescription').value;
    
    if (!name || !description) {
        showToast('Nome e descrição são obrigatórios', 'warning');
        return;
    }
    
    // Create new campaign
    const newCampaign = addCampaign({ name, description });
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCampaignModal'));
    modal.hide();
    
    // Show success message
    showToast(`Campanha "${newCampaign.name}" criada com sucesso!`, 'success');
    
    // Refresh campaigns list
    if (currentView === 'dashboard') {
        loadCampaigns();
    }
}

/**
 * Reset modal to initial state
 */
function resetModal() {
    currentModalStep = 1;
    
    // Hide all steps except first
    document.querySelectorAll('.modal-step').forEach((step, index) => {
        if (index === 0) {
            step.classList.remove('d-none');
        } else {
            step.classList.add('d-none');
        }
    });
    
    // Reset form
    document.getElementById('campaignName').value = '';
    document.getElementById('campaignDescription').value = '';
    document.getElementById('candidatesFile').value = '';
    
    // Reset questions
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = `
        <div class="question-item mb-3">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Digite a pergunta">
                <button class="btn btn-outline-danger" type="button" onclick="removeQuestion(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // Reset progress and buttons
    updateModalProgress(1, 4);
    updateModalButtons();
}

/**
 * Initialize and toggle theme
 */
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

/**
 * Setup lead file preview in campaign modal
 */
function setupLeadFilePreview() {
    const fileInput = document.getElementById('candidatesFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Simulate processing Excel file and show preview
                const mockLeads = [
                    { name: 'João Silva Santos', phone: '(11) 99999-1234', email: 'joao.silva@email.com', score: 8.5 },
                    { name: 'Maria Oliveira Costa', phone: '(11) 98888-5678', email: 'maria.oliveira@email.com', score: 9.2 },
                    { name: 'Pedro Almeida Rocha', phone: '(11) 97777-9012', email: 'pedro.almeida@email.com', score: 7.8 }
                ];
                renderLeadPreview(mockLeads);
                showToast(`Arquivo "${file.name}" processado com sucesso! ${mockLeads.length} leads encontrados.`, 'success');
            }
        });
    }
}

/**
 * Setup bulk upload preview in campaign detail
 */
function setupBulkUploadPreview() {
    const fileInput = document.getElementById('bulkUploadFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Simulate processing Excel file
                const mockLeads = [
                    { name: 'Ana Carolina Silva', phone: '(11) 96666-1111', email: 'ana.silva@email.com' },
                    { name: 'Carlos Eduardo Santos', phone: '(11) 95555-2222', email: 'carlos.santos@email.com' },
                    { name: 'Beatriz Costa Lima', phone: '(11) 94444-3333', email: 'beatriz.lima@email.com' },
                    { name: 'Diego Ferreira Rocha', phone: '(11) 93333-4444', email: 'diego.rocha@email.com' }
                ];
                renderBulkUploadPreview(mockLeads);
                showToast(`Arquivo "${file.name}" analisado! ${mockLeads.length} leads encontrados.`, 'success');
            }
        });
    }
}

/**
 * Send mass message to selected leads
 */
function sendMassMessage() {
    const messageText = document.getElementById('massMessageText').value.trim();
    const selectedCount = document.querySelectorAll('.lead-checkbox:checked').length;
    
    if (!messageText) {
        showToast('Por favor, digite uma mensagem.', 'warning');
        return;
    }
    
    if (selectedCount === 0) {
        showToast('Nenhum lead selecionado.', 'warning');
        return;
    }
    
    // Simulate sending messages
    showToast(`Mensagem enviada para ${selectedCount} leads com sucesso!`, 'success');
    
    // Close modal and reset
    const modal = bootstrap.Modal.getInstance(document.getElementById('massMessageModal'));
    modal.hide();
    document.getElementById('massMessageText').value = '';
    
    // Uncheck all leads
    document.querySelectorAll('.lead-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('selectAllCandidates').checked = false;
    updateSelectionControls();
}

/**
 * Add individual lead
 */
function addIndividualLead() {
    const name = document.getElementById('candidateName').value.trim();
    const phone = document.getElementById('candidatePhone').value.trim();
    const email = document.getElementById('candidateEmail').value.trim();
    const birthDate = document.getElementById('candidateBirthDate').value;
    
    if (!name || !phone || !email) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Por favor, digite um email válido.', 'warning');
        return;
    }
    
    // Create new lead
    const newLead = {
        id: Date.now(),
        name: name,
        phone: phone,
        email: email,
        birthDate: birthDate,
        status: 'em processamento',
        score: generateRandomScore(),
        campaignId: currentCampaignId
    };
    
    // Add to mock data
    if (!mockLeads[currentCampaignId]) {
        mockLeads[currentCampaignId] = [];
    }
    mockLeads[currentCampaignId].push(newLead);
    
    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCandidateModal'));
    modal.hide();
    
    showToast(`Lead "${name}" adicionado com sucesso!`, 'success');
    
    // Reset form
    document.getElementById('addCandidateForm').reset();
    
    // Refresh leads table
    applyLeadFilters();
}

/**
 * Process bulk upload
 */
function processBulkUpload() {
    const file = document.getElementById('bulkUploadFile').files[0];
    const previewCount = document.getElementById('bulkPreviewCount').textContent;
    
    if (!file) {
        showToast('Por favor, selecione um arquivo.', 'warning');
        return;
    }
    
    // Simulate processing leads from preview
    const mockNewLeads = Array.from(document.querySelectorAll('#bulkUploadPreviewList .candidate-preview-card')).map((card, index) => {
        const name = card.querySelector('.fw-bold').textContent;
        const contacts = card.querySelector('.text-muted').textContent.split(' • ');
        return {
            id: Date.now() + index,
            name: name,
            phone: contacts[0],
            email: contacts[1],
            status: 'em processamento',
            score: generateRandomScore(),
            campaignId: currentCampaignId
        };
    });
    
    // Add to mock data
    if (!mockLeads[currentCampaignId]) {
        mockLeads[currentCampaignId] = [];
    }
    mockLeads[currentCampaignId].push(...mockNewLeads);
    
    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('bulkUploadModal'));
    modal.hide();
    
    showToast(`${previewCount} leads adicionados com sucesso!`, 'success');
    
    // Reset form
    document.getElementById('bulkUploadFile').value = '';
    document.getElementById('bulkUploadPreview').classList.add('d-none');
    document.getElementById('bulkUploadBtn').disabled = true;
    
    // Refresh leads table
    applyLeadFilters();
}

// CSS for fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);
