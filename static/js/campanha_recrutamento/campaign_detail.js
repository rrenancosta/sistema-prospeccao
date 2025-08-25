// Campaign Detail JavaScript
let editModalStep = 1;
let editCampaignSpeeches = [];
let editingCampaignUrl = null;
let currentCampaign = null;
let currentCampaignId = null;
let leads = [];
let filteredLeads = [];
let sortState = { column: null, direction: 'asc' };

// Initialize campaign detail page
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    setupEventListeners();
    loadCampaignDetail();
});

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
 * Setup event listeners
 */
function setupEventListeners() {
    // Lead search input
    const leadSearchInput = document.getElementById('candidateSearchInput');
    if (leadSearchInput) {
        leadSearchInput.addEventListener('input', applyLeadFilters);
    }
    
    // Filter selects
    const leadStatusFilter = document.getElementById('candidateStatusFilter');
    if (leadStatusFilter) {
        leadStatusFilter.addEventListener('change', applyLeadFilters);
    }
    
    // Score filter
    const scoreFilter = document.getElementById('scoreFilter');
    if (scoreFilter) {
        scoreFilter.addEventListener('input', function() {
            document.getElementById('scoreValue').textContent = this.value;
            applyLeadFilters();
        });
    }
    
    // Clear filters button
    const clearLeadFilters = document.getElementById('clearCandidateFilters');
    if (clearLeadFilters) {
        clearLeadFilters.addEventListener('click', clearAllLeadFilters);
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
    
    // Mass message modal event
    const massMessageModal = document.getElementById('massMessageModal');
    if (massMessageModal) {
        massMessageModal.addEventListener('show.bs.modal', renderMassMessageModal);
    }

    // Setup file upload previews
    setupBulkUploadPreview();
}

/**
 * Load campaign detail from URL
 */
function loadCampaignDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('id');
    
    if (campaignId) {
        currentCampaignId = parseInt(campaignId, 10);
        fetchCampaignDetail(currentCampaignId);
    } else {
        showToast('ID da campanha não encontrado na URL.', 'danger');
        document.body.innerHTML = `<div class="alert alert-danger m-5">ID da campanha inválido. Volte para o <a href="dashboard.html">dashboard</a>.</div>`;
    }
}

/**
 * Fetch campaign and leads from mock data
 */
async function fetchCampaignDetail(campaignId) {
    try {
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate delay

        const campaign = getCampaignById(campaignId);

        if (campaign) {
            currentCampaign = campaign;
            leads = getLeadsByCampaign(campaignId);
            filteredLeads = [...leads];

            document.getElementById('campaignTitle').textContent = campaign.name;
            document.getElementById('campaignSubtitle').textContent = campaign.position;
            document.getElementById('campaignStatus').textContent = campaign.status;
            document.getElementById('campaignStatus').className = `status-badge status-${campaign.status.replace(' ', '-')}`;
            document.getElementById('campaignCreated').textContent = formatDate(campaign.created);
            document.getElementById('campaignBreadcrumb').textContent = campaign.name;
            document.getElementById('campaignCandidateCount').textContent = leads.length;

            renderLeadsTable();
            updateCampaignStats();
        } else {
            showToast(`Campanha com ID ${campaignId} não encontrada.`, 'danger');
            document.body.innerHTML = `<div class="alert alert-danger m-5">Campanha não encontrada. Volte para o <a href="dashboard.html">dashboard</a>.</div>`;
        }
    } catch (err) {
        showToast('Erro ao carregar dados da campanha (mock).', 'danger');
    }
}

/**
 * Update campaign statistics
 */
function updateCampaignStats() {
    const totalCount = leads.length;
    const processingCount = leads.filter(c => c.status === 'em processamento').length;
    const qualifiedCount = leads.filter(c => c.status === 'fit 5' || c.status === 'fit 10').length;
    const averageScore = leads.length > 0 ?
        (leads.reduce((sum, c) => sum + (c.score || 0), 0) / leads.length).toFixed(1) : 0;
    
    document.getElementById('totalCandidatesCount').textContent = totalCount;
    document.getElementById('processingCount').textContent = processingCount;
    document.getElementById('qualifiedCount').textContent = qualifiedCount;
    document.getElementById('averageScore').textContent = averageScore;
}

/**
 * Render leads table
 */
function renderLeadsTable() {
    const tbody = document.getElementById('candidatesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (filteredLeads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-search mb-2 d-block text-muted"></i>
                    <p class="text-muted mb-0">Nenhum lead encontrado</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredLeads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="form-check-input lead-checkbox" value="${lead.id}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-user text-primary me-2"></i>
                    <div>
                        <div class="fw-bold">${lead.name}</div>
                        <small class="text-muted">${lead.birthDate ? 'Nascido em ' + formatDate(lead.birthDate) : 'Data não informada'}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-phone text-success me-1"></i>
                    <span>${lead.phone}</span>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-envelope text-info me-1"></i>
                    <span>${lead.email}</span>
                </div>
            </td>
            <td>
                <span class="status-badge status-${lead.status.replace(' ', '-')}">${lead.status}</span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="fw-bold text-primary">${lead.score || 0}</span>
                    <small class="text-muted ms-1">/10</small>
                </div>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-success" onclick="openChatHistory(${lead.id})" title="Histórico de conversa">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn btn-outline-secondary" onclick="editLead(${lead.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteLead(${lead.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateSelectionControls();
}

/**
 * Apply lead filters
 */
function applyLeadFilters() {
    const searchTerm = document.getElementById('candidateSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('candidateStatusFilter').value;
    const minScore = parseFloat(document.getElementById('scoreFilter').value);
    
    filteredLeads = leads.filter(lead => {
        const matchesSearch = searchTerm === '' || 
            lead.name.toLowerCase().includes(searchTerm) ||
            lead.phone.includes(searchTerm) ||
            lead.email.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === '' || lead.status === statusFilter;
        
        const matchesScore = (lead.score || 0) >= minScore;
        
        return matchesSearch && matchesStatus && matchesScore;
    });
    
    renderLeadsTable();
}

/**
 * Clear all lead filters
 */
function clearAllLeadFilters() {
    document.getElementById('candidateSearchInput').value = '';
    document.getElementById('candidateStatusFilter').value = '';
    document.getElementById('scoreFilter').value = '0';
    document.getElementById('scoreValue').textContent = '0';
    
    filteredLeads = [...leads];
    renderLeadsTable();
}

/**
 * Sort leads table
 */
function sortLeadsTable(column) {
    if (sortState.column === column) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.column = column;
        sortState.direction = 'asc';
    }
    
    filteredLeads.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        if (column === 'score') {
            aValue = aValue || 0;
            bValue = bValue || 0;
        }
        
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (sortState.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    renderLeadsTable();
}

/**
 * Selection controls
 */
function toggleSelectAllLeads() {
    const selectAll = document.getElementById('selectAllCandidates');
    const checkboxes = document.querySelectorAll('.lead-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateSelectionControls();
}

function updateSelectionControls() {
    const checkboxes = document.querySelectorAll('.lead-checkbox');
    const checkedBoxes = document.querySelectorAll('.lead-checkbox:checked');
    const selectAll = document.getElementById('selectAllCandidates');
    const massActionBtn = document.getElementById('massActionBtn');
    
    // Update select all checkbox
    if (selectAll) {
        selectAll.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
        selectAll.checked = checkedBoxes.length === checkboxes.length && checkboxes.length > 0;
    }
    
    // Update mass action button
    if (massActionBtn) {
        massActionBtn.disabled = checkedBoxes.length === 0;
    }
}

/**
 * Mass message functions
 */
function showMassMessageModal() {
    const modal = new bootstrap.Modal(document.getElementById('massMessageModal'));
    modal.show();
}

function renderMassMessageModal() {
    const selectedCheckboxes = document.querySelectorAll('.lead-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
    const selectedLeads = leads.filter(c => selectedIds.includes(c.id));
    
    // Update count
    document.getElementById('selectedCandidatesCount').textContent = selectedLeads.length;
    
    // Render selected leads list
    const listDiv = document.getElementById('selectedCandidatesList');
    listDiv.innerHTML = '';
    
    selectedLeads.forEach(lead => {
        const leadHtml = `
            <div class="selected-lead-item">
                <div class="lead-info">
                    <div class="lead-name">${lead.name}</div>
                    <div class="lead-contact">${lead.phone} • ${lead.email}</div>
                </div>
            </div>
        `;
        listDiv.insertAdjacentHTML('beforeend', leadHtml);
    });
}

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
 * Individual lead functions
 */
async function addIndividualLead() {
    const name = document.getElementById('candidateName').value.trim();
    const phone = document.getElementById('candidatePhone').value.trim();
    if (!name || !phone) return showToast('Nome e telefone são obrigatórios.', 'warning');

    const newLead = {
        id: Date.now(),
        name,
        phone,
        email: document.getElementById('candidateEmail').value.trim(),
        birthDate: document.getElementById('candidateBirthDate').value,
        status: 'em processamento',
        score: Math.floor(Math.random() * 5),
        campaignId: currentCampaignId
    };

    leads.unshift(newLead);
    filteredLeads = [...leads];
    renderLeadsTable();
    updateCampaignStats();

    showToast(`Lead "${name}" adicionado com sucesso! (Simulado)`, 'success');
    bootstrap.Modal.getInstance(document.getElementById('addCandidateModal')).hide();
    document.getElementById('addCandidateForm').reset();
}

/**
 * Bulk upload functions
 */
function setupBulkUploadPreview() {
    const fileInput = document.getElementById('bulkUploadFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            showToast(`Arquivo "${file.name}" carregado. (Simulado)`, 'info');
            const dummyLeads = [
                { name: 'Lead de Arquivo 1', phone: '(21) 55555-1111', email: 'arquivo1@email.com', birthDate: '1990-01-01' },
                { name: 'Lead de Arquivo 2', phone: '(21) 55555-2222', email: 'arquivo2@email.com', birthDate: '1992-02-02' },
            ];
            renderBulkUploadPreview(dummyLeads);
        });
    }
}

function renderBulkUploadPreview(leadsList) {
    const previewDiv = document.getElementById('bulkUploadPreview');
    const previewList = document.getElementById('bulkUploadPreviewList');
    const countSpan = document.getElementById('bulkPreviewCount');
    const uploadBtn = document.getElementById('bulkUploadBtn');
    
    if (previewDiv && previewList && countSpan && uploadBtn) {
        previewDiv.classList.remove('d-none');
        countSpan.textContent = leadsList.length;
        uploadBtn.disabled = false;
        
        previewList.innerHTML = '';
        
        leadsList.forEach(lead => {
            const leadHtml = `
                <div class="candidate-preview-card border rounded p-2 mb-2" data-birthdate="${lead.birthDate || ''}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="fw-bold text-primary">${lead.name}</div>
                        </div>
                        <div>
                            <div class="fw-bold text-primary">${lead.phone}</div>
                            <small class="text-muted">${lead.email}</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-success">Novo</span>
                        </div>
                    </div>
                </div>
            `;
            previewList.insertAdjacentHTML('beforeend', leadHtml);
        });
    }
}

async function processBulkUpload() {
    showToast('Upload em massa simulado com sucesso!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('bulkUploadModal')).hide();
}

/**
 * Chat history functions
 */
// function openChatHistory(candidateId) {
//     const candidate = candidates.find(c => c.id === candidateId);
//     if (!candidate) return;
    
//     // Populate candidate info
//     document.getElementById('chatCandidateName').textContent = candidate.name;
//     document.getElementById('chatCandidatePhone').textContent = candidate.phone;
//     document.getElementById('chatCandidateEmail').textContent = candidate.email;
//     document.getElementById('chatCandidateScore').textContent = candidate.score || 0;
//     document.getElementById('chatCandidateStatus').textContent = candidate.status;
//     document.getElementById('chatCandidateStatus').className = `status-badge status-${candidate.status.replace(' ', '-')}`;
    
//     // Generate mock chat history
//     const mockMessages = generateMockChatHistory(candidate);
//     renderChatHistory(mockMessages);
    
//     // Set last conversation date
//     document.getElementById('chatLastDate').textContent = 'Hoje, 14:30';
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('chatHistoryModal'));
//     modal.show();
// }

// function generateMockChatHistory(candidate) {
//     return [
//         {
//             type: 'agent',
//             message: `Olá ${candidate.name.split(' ')[0]}! Tudo bem? Sou da equipe de recrutamento e gostaria de conversar sobre uma oportunidade.`,
//             time: '14:10'
//         },
//         {
//             type: 'user',
//             message: 'Oi! Tudo bem sim. Pode falar sobre a vaga!',
//             time: '14:12'
//         },
//         {
//             type: 'agent',
//             message: 'Ótimo! Temos uma vaga de desenvolvedor que combina muito com seu perfil. Você tem experiência com React?',
//             time: '14:13'
//         },
//         {
//             type: 'user',
//             message: 'Sim, trabalho com React há mais de 3 anos. Que tipo de projeto seria?',
//             time: '14:15'
//         },
//         {
//             type: 'agent',
//             message: 'É para uma startup em crescimento, projeto muito interessante na área de fintech. Podemos agendar uma conversa mais detalhada?',
//             time: '14:16'
//         },
//         {
//             type: 'user',
//             message: 'Perfeito! Estou disponível amanhã à tarde.',
//             time: '14:18'
//         },
//         {
//             type: 'agent',
//             message: 'Excelente! Vou te enviar o link da reunião por email. Até amanhã!',
//             time: '14:20'
//         }
//     ];
// }

// function renderChatHistory(messages) {
//     const container = document.getElementById('chatHistoryContainer');
//     container.innerHTML = '';
    
//     messages.forEach(msg => {
//         const messageDiv = document.createElement('div');
//         messageDiv.className = `chat-message ${msg.type}`;
//         messageDiv.innerHTML = `
//             <div class="chat-bubble">
//                 ${msg.message}
//             </div>
//             <div class="chat-time">${msg.time}</div>
//         `;
//         container.appendChild(messageDiv);
//     });
    
//     container.scrollTop = container.scrollHeight;
// }

async function openChatHistory(leadId) {
    const lead = leads.find(c => c.id === leadId);
    if (!lead) return;

    document.getElementById('chatCandidateName').textContent = lead.name;
    document.getElementById('chatCandidatePhone').textContent = lead.phone;
    document.getElementById('chatCandidateEmail').textContent = lead.email;
    document.getElementById('chatCandidateScore').textContent = lead.score || 0;
    document.getElementById('chatCandidateStatus').textContent = lead.status;
    document.getElementById('chatCandidateStatus').className = `status-badge status-${lead.status.replace(' ', '-')}`;

    // Use mock chat data
    const chatHistory = getWhatsAppChat(leadId);
    renderChatHistory(chatHistory);
    document.getElementById('chatLastDate').textContent = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].time : 'Sem mensagens';

    const modal = new bootstrap.Modal(document.getElementById('chatHistoryModal'));
    modal.show();
}

function renderChatHistory(messages) {
    const container = document.getElementById('chatHistoryContainer');
    container.innerHTML = '';

    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${msg.direction}`;
        messageDiv.innerHTML = `
            <div class="chat-bubble">
                ${msg.message}
            </div>
            <div class="chat-time">${msg.created_at}</div>
        `;
        container.appendChild(messageDiv);
    });

    container.scrollTop = container.scrollHeight;
}

function openWhatsAppChat() {
    const leadName = document.getElementById('chatCandidateName').textContent;
    const leadPhone = document.getElementById('chatCandidatePhone').textContent;
    
    // Remove formatting from phone number for WhatsApp link
    const phoneNumber = leadPhone.replace(/\D/g, '');
    const message = `Olá ${leadName}! Como está?`;
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    showToast('Abrindo WhatsApp...', 'success');
}

/**
 * Campaign actions
 */

function openEditCampaignModal() {
    if (!currentCampaign) {
        showToast('Dados da campanha não carregados.', 'danger');
        return;
    }
    editingCampaignUrl = window.location.pathname.split('/').pop();

    // Pre-fill fields
    document.getElementById('editCampaignNameInput').value = currentCampaign.name || '';
    document.getElementById('editPositionNameInput').value = currentCampaign.position || '';
    document.getElementById('editCampaignDescriptionInput').value = currentCampaign.description || '';
    document.getElementById('editCampaignSpeechInput').value = currentCampaign.speech || '';
    document.getElementById('editCampaignStatusSelect').value = currentCampaign.status || '';

    // Speeches
    editCampaignSpeeches = (currentCampaign.speeches || []).map((s, i) => ({
        id: Date.now() + i,
        stage: s.stage,
        content: s.content
    }));
    renderEditSpeechList();

    // Reset steps
    editModalStep = 1;
    updateEditModalStep();
    updateEditModalButtons();

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editCampaignModal'));
    modal.show();
}

function editNextStep() {
    if (editModalStep < 3) {
        if (validateEditCurrentStep()) {
            editModalStep++;
            updateEditModalStep();
            updateEditModalButtons();
        }
    } else {
        updateCampaign();
    }
}

function editPreviousStep() {
    if (editModalStep > 1) {
        editModalStep--;
        updateEditModalStep();
        updateEditModalButtons();
    }
}

function updateEditModalStep() {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`editModalStep${i}`).classList.toggle('d-none', i !== editModalStep);
        document.getElementById(`editStep${i}`).classList.toggle('active-step', i === editModalStep);
        document.querySelectorAll('.step-label')[i-1].classList.toggle('active-step', i === editModalStep);
    }
    if (editModalStep === 3) renderEditCampaignReview();
}

function updateEditModalButtons() {
    document.getElementById('editPrevBtn').style.display = editModalStep > 1 ? 'inline-block' : 'none';
    const nextBtn = document.getElementById('editNextBtn');
    if (editModalStep === 3) {
        nextBtn.innerHTML = '<i class="fas fa-save me-1"></i> Salvar Alterações';
    } else {
        nextBtn.innerHTML = 'Próximo <i class="fas fa-arrow-right ms-1"></i>';
    }
}

function validateEditCurrentStep() {
    if (editModalStep === 1) {
        if (!document.getElementById('editCampaignNameInput').value.trim() ||
            !document.getElementById('editPositionNameInput').value.trim() ||
            !document.getElementById('editCampaignSpeechInput').value.trim()) {
            showToast('Por favor, preencha os campos obrigatórios.', 'warning');
            return false;
        }
    }
    return true;
}

function renderEditSpeechList() {
    const speechesList = document.getElementById('editSpeechesList');
    if (!speechesList) return;
    speechesList.innerHTML = '';
    editCampaignSpeeches.forEach((speech, idx) => {
        const speechHtml = `
            <div class="speech-item border rounded p-3 mb-3" data-speech-id="${speech.id}">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label">Estágio do Speech</label>
                        <input type="text" class="form-control speech-stage" value="${speech.stage || ''}" placeholder="Ex: Primeiro Contato, Follow-up" data-speech-id="${speech.id}">
                    </div>
                    <div class="col-12">
                        <label class="form-label">Conteúdo do Speech</label>
                        <textarea class="form-control speech-content" rows="4" placeholder="Digite o conteúdo do speech..." data-speech-id="${speech.id}">${speech.content || ''}</textarea>
                    </div>
                    <div class="col-12 d-flex justify-content-end">
                        <button type="button" class="btn btn-outline-secondary btn-sm me-1" onclick="moveEditSpeechUp(${idx})" ${idx === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button type="button" class="btn btn-outline-secondary btn-sm me-1" onclick="moveEditSpeechDown(${idx})" ${idx === editCampaignSpeeches.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeEditSpeech(${speech.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        speechesList.insertAdjacentHTML('beforeend', speechHtml);
    });

    // Add event listeners
    editCampaignSpeeches.forEach(speech => {
        const stageInput = document.querySelector(`.speech-stage[data-speech-id="${speech.id}"]`);
        const contentInput = document.querySelector(`.speech-content[data-speech-id="${speech.id}"]`);
        if (stageInput) {
            stageInput.addEventListener('input', (e) => {
                speech.stage = e.target.value;
            });
        }
        if (contentInput) {
            contentInput.addEventListener('input', (e) => {
                speech.content = e.target.value;
            });
        }
    });
}

function addEditSpeech() {
    const speechId = Date.now() + Math.random();
    editCampaignSpeeches.push({ id: speechId, stage: '', content: '' });
    renderEditSpeechList();
}

function removeEditSpeech(speechId) {
    editCampaignSpeeches = editCampaignSpeeches.filter(s => s.id !== speechId);
    renderEditSpeechList();
}

function moveEditSpeechUp(index) {
    if (index > 0) {
        [editCampaignSpeeches[index - 1], editCampaignSpeeches[index]] = [editCampaignSpeeches[index], editCampaignSpeeches[index - 1]];
        renderEditSpeechList();
    }
}

function moveEditSpeechDown(index) {
    if (index < editCampaignSpeeches.length - 1) {
        [editCampaignSpeeches[index], editCampaignSpeeches[index + 1]] = [editCampaignSpeeches[index + 1], editCampaignSpeeches[index]];
        renderEditSpeechList();
    }
}

function renderEditCampaignReview() {
    const reviewDiv = document.getElementById('editCampaignReview');
    if (!reviewDiv) return;
    const name = document.getElementById('editCampaignNameInput').value;
    const position = document.getElementById('editPositionNameInput').value;
    const description = document.getElementById('editCampaignDescriptionInput').value;
    const speech = document.getElementById('editCampaignSpeechInput').value;
    const status = document.getElementById('editCampaignStatusSelect').value;
    reviewDiv.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6"><strong>Nome da Campanha:</strong><br><span class="text-muted">${name}</span></div>
            <div class="col-md-6"><strong>Público-alvo:</strong><br><span class="text-muted">${position}</span></div>
            <div class="col-12"><strong>Descrição:</strong><br><span class="text-muted">${description || 'Nenhuma descrição fornecida'}</span></div>
            <div class="col-12"><strong>Speech Principal:</strong><br><span class="text-muted">${speech}</span></div>
            <div class="col-md-6"><strong>Status:</strong><br><span class="text-muted">${status}</span></div>
            <div class="col-md-6"><strong>Speeches Adicionais:</strong><br><span class="text-muted">${editCampaignSpeeches.length} speeches adicionados</span></div>
        </div>
    `;
}

async function updateCampaign() {
    showToast('Campanha atualizada com sucesso! (Simulado)', 'success');
    bootstrap.Modal.getInstance(document.getElementById('editCampaignModal')).hide();
    // In a real app, you would update the local data and re-render
}

async function deleteCampaign() {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) return;
    showToast('Campanha excluída com sucesso! Redirecionando... (Simulado)', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
}

function exportCandidates() {
    showToast('Exportação simulada! O download começaria agora.', 'success');
}

function editLead(id) {
    showToast(`Edição do lead ${id} não implementada no protótipo.`, 'info');
}

async function deleteLead(id) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    leads = leads.filter(c => c.id !== id);
    filteredLeads = filteredLeads.filter(c => c.id !== id);
    renderLeadsTable();
    updateCampaignStats();

    showToast(`Lead ${id} excluído com sucesso! (Simulado)`, 'success');
}