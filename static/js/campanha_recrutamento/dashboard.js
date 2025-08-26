// Dashboard JavaScript - Campaign Management
let campaigns = [];
let filteredCampaigns = [];
let sortState = { column: null, direction: 'asc' };
let currentModalStep = 1;
let campaignSpeeches = [];
let uploadedLeads = [];
const DEFAULT_SPEECH = "Olá! Entramos em contato para apresentar uma oportunidade que pode ser do seu interesse. Gostaríamos de saber mais sobre você.";
const DEFAULT_QUESTIONS = [
    { id: 1, text: "Esta trabalhando atualmente? " },
    { id: 2, text: "Qual sua disponibilidade para inicio caso aprovado no processo?" },
    { id: 3, text: "Qual foi o motivo do seu desligamento atual? Ou caso não tenha sido desligado, por que deseja sair da empresa atual?" },
    { id: 4, text: "Qual a forma de contratação na empresa atual, ou na última?" },
    { id: 5, text: "Qual sua remuneração na empresa atual? Ou na última?" },
    { id: 6, text: "Onde você mora? Cidade e bairro?" },
    { id: 7, text: "Possui ensino superior completo? E sim, em qual área?" }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadCampaigns();

    // Adiciona listeners para ordenação das colunas da tabela
    document.querySelectorAll('.table-header th').forEach(th => {
        th.addEventListener('click', function() {
            const columnMap = {
                'Nome da Campanha': 'name',
                'Público-alvo': 'position',
                'Status': 'status',
                'Leads': 'candidatesCount',
                'Progresso': 'progress',
                'Criada em': 'created'
            };
            const text = th.textContent.trim().replace(/\s+/g, ' ');
            if (columnMap[text]) {
                sortTable(columnMap[text]);
            }
        });
    });

    // Adiciona listener para botão Adicionar Speech
    const addSpeechBtn = document.querySelector('#modalStep2 .btn.btn-outline-primary');
    if (addSpeechBtn) {
        addSpeechBtn.addEventListener('click', addSpeech);
    }

    // Botão Anterior (modal)
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', previousStep);
    }

    // Botão Próximo (modal)
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
    }

    // Botão Salvar Alterações (modal de status)
    const saveStatusBtn = document.querySelector('#editCampaignModal .btn.btn-primary');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', updateCampaignStatus);
    }
});

// ...existing code...

/**
 * Setup event listeners for dashboard page
 * @returns {void}
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    // Filter selects
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }

    // Clear filters button
    const clearFilters = document.getElementById('clearFilters');
    if (clearFilters) {
        clearFilters.addEventListener('click', clearAllFilters);
    }

    // Modal events
    const addCampaignModal = document.getElementById('addCampaignModal');
    if (addCampaignModal) {
        addCampaignModal.addEventListener('show.bs.modal', resetModal);
    }

    // Setup file upload preview
    setupCandidateFilePreview();
}

/**
 * Load campaigns data from mock data
 */
async function loadCampaigns() {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));

        // Use mock data
        const data = getCampaigns();
        campaigns = data.map(c => ({...c, url: c.id.toString()})); // Add url property for navigation
        filteredCampaigns = [...campaigns];

        renderCampaignsTable();
        updateStats({
            total_campaigns: campaigns.length,
            active_campaigns: campaigns.filter(c => c.status === 'ativa').length,
            total_leads: campaigns.reduce((acc, c) => acc + c.leadCount, 0),
            progress_average: Math.round(campaigns.reduce((acc, c) => acc + c.progress, 0) / campaigns.length) || 0
        });

    } catch (err) {
        showToast('Erro ao carregar campanhas (dados mock).', 'danger');
    }
}

/**
 * Update dashboard stats
 */
function updateStats(stats) {
    if (!stats) return;
    document.getElementById('totalCampaigns').textContent = stats.total_campaigns || 0;
    document.getElementById('activeCampaigns').textContent = stats.active_campaigns || 0;
    document.getElementById('totalCandidates').textContent = formatNumber(stats.total_candidates || 0);
    document.getElementById('conversionRate').textContent = (stats.progress_average || 0) + '%';
}

/**
 * Render campaigns table
 */
function renderCampaignsTable() {
    const tbody = document.getElementById('campaignsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (filteredCampaigns.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-search mb-2 d-block text-muted"></i>
                    <p class="text-muted mb-0">Nenhuma campanha encontrada</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredCampaigns.forEach(campaign => {
        const row = document.createElement('tr');
        // NOTE: The link to campaign detail now uses a URL parameter to pass the campaign ID
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-bullhorn text-primary me-2"></i>
                    <div>
                        <div class="fw-bold">
                            <a href="campaign_detail.html?id=${campaign.id}" class="text-decoration-none text-primary fw-bold">
                                ${campaign.name}
                            </a>
                        </div>
                        <small class="text-muted">${campaign.description || 'Sem descrição'}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="fw-medium">${campaign.position}</span>
            </td>
            <td>
                <span 
                    class="status-badge status-${campaign.status.replace(' ', '-')}"
                    style="cursor:pointer; display: flex; justify-content: center; align-items: center;"
                    title="Editar status"
                    onclick="openEditCampaignModal('${campaign.id}')"
                >
                ${campaign.status}
                </span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-users text-muted me-1"></i>
                    <span class="fw-bold">${campaign.leadCount}</span>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress progress-sm flex-grow-1 me-2">
                        <div class="progress-bar bg-primary" style="width: ${campaign.progress}%"></div>
                    </div>
                    <small class="text-muted">${campaign.progress}%</small>
                </div>
            </td>
            <td>
                <span class="text-muted">${formatDate(campaign.created)}</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-danger" onclick="deleteCampaign('${campaign.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                        Remover
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Apply filters to campaigns
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = searchTerm === '' || 
            campaign.name.toLowerCase().includes(searchTerm) ||
            campaign.position.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === '' || campaign.status === statusFilter;
        
        let matchesDate = true;
        if (dateFilter !== '') {
            const campaignDate = new Date(campaign.created);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    matchesDate = campaignDate.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = campaignDate >= weekAgo;
                    break;
                case 'month':
                    matchesDate = campaignDate.getMonth() === now.getMonth() && 
                                 campaignDate.getFullYear() === now.getFullYear();
                    break;
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    renderCampaignsTable();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';
    
    filteredCampaigns = [...campaigns];
    renderCampaignsTable();
}

/**
 * Sort campaigns table
 */
function sortTable(column) {
    if (sortState.column === column) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.column = column;
        sortState.direction = 'asc';
    }
    
    filteredCampaigns.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        if (column === 'created') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
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
    
    renderCampaignsTable();
}

/**
 * Modal functions
 */
function nextStep() {
    if (currentModalStep < 4) {
        if (validateCurrentStep()) {
            currentModalStep++;
            updateModalStep();
            updateModalButtons();
        }
    } else {
        createCampaign();
    }
}

function previousStep() {
    if (currentModalStep > 1) {
        currentModalStep--;
        updateModalStep();
        updateModalButtons();
    }
}

function updateModalStep() {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`modalStep${i}`);
        const stepNumber = document.getElementById(`step${i}`);
        const stepLabels = document.querySelectorAll('.step-label');
        
        if (step) {
            step.classList.toggle('d-none', i !== currentModalStep);
        }
        
        if (stepNumber) {
            stepNumber.classList.toggle('active-step', i === currentModalStep);
        }
        
        if (stepLabels[i-1]) {
            stepLabels[i-1].classList.toggle('active-step', i === currentModalStep);
        }
    }
    
    // Update progress line
    updateModalProgress(currentModalStep, 4);
    
    // Special handling for step 4 (review)
    if (currentModalStep === 4) {
        renderCampaignReview();
    }
}

function updateModalButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentModalStep > 1 ? 'inline-block' : 'none';
    }
    
    if (nextBtn) {
        if (currentModalStep === 4) {
            nextBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Criar Campanha';
        } else {
            nextBtn.innerHTML = 'Próximo <i class="fas fa-arrow-right ms-1"></i>';
        }
    }
}
function validateCurrentStep() {
    switch (currentModalStep) {
        case 1:
            const name = document.getElementById('campaignName').value.trim();
            const position = document.getElementById('positionName').value.trim();
            const speech = document.getElementById('campaignSpeech').value.trim();

            if (!name || !position || !speech) {
                showToast('Por favor, preencha os campos obrigatórios.', 'warning');
                return false;
            }
            return true;
        case 2:
        case 3:
            return true;
        default:
            return true;
    }
}

function renderCampaignReview() {
    const reviewDiv = document.getElementById('campaignReview');
    if (!reviewDiv) return;
    
    const name = document.getElementById('campaignName').value;
    const position = document.getElementById('positionName').value;
    const description = document.getElementById('campaignDescription').value;
    const speech = document.getElementById('campaignSpeech').value;
   
    
    // Count candidates from preview
    const candidateCount = document.querySelectorAll('#candidatePreviewList .candidate-preview-card').length;
    
    // Filter out empty speeches
    campaignSpeeches = campaignSpeeches.filter(s => s.stage.trim() !== '' || s.content.trim() !== '');

    reviewDiv.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <strong>Nome da Campanha:</strong><br>
                <span class="text-muted">${name}</span>
            </div>
            <div class="col-md-6">
                <strong>Público-alvo:</strong><br>
                <span class="text-muted">${position}</span>
            </div>
            <div class="col-12">
                <strong>Descrição:</strong><br>
                <span class="text-muted">${description || 'Nenhuma descrição fornecida'}</span>
            </div>
            <div class="col-12">
                <strong>Speech Principal:</strong><br>
                <span class="text-muted">${speech}</span>
            </div>
            <div class="col-md-6">
                <strong>Speeches Adicionais:</strong><br>
                <span class="text-muted">${campaignSpeeches.length} speeches adicionados</span>
            </div>
            <div class="col-md-6">
                <strong>Leads:</strong><br>
                <span class="text-muted">${candidateCount} leads carregados</span>
            </div>
        </div>
    `;
}

function renderSpeechList() {
    const speechesList = document.getElementById('speechesList');
    if (!speechesList) return;
    speechesList.innerHTML = ''; // Clear existing speeches
    campaignSpeeches.forEach((speech, idx) => {
        const speechHtml = `
            <div class="speech-item border rounded p-3 mb-3" data-speech-id="${speech.id}">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label">Estágio do Speech</label>
                        <input type="text" class="form-control speech-stage" value="${speech.stage}" placeholder="Ex: Primeiro Contato, Follow-up" data-speech-id="${speech.id}">
                    </div>
                    <div class="col-12">
                        <label class="form-label">Conteúdo do Speech</label>
                        <textarea class="form-control speech-content" rows="4" placeholder="Digite o conteúdo do speech..." data-speech-id="${speech.id}">${speech.content}</textarea>
                    </div>
                    <div class="col-12 d-flex justify-content-end">
                        <button type="button" class="btn btn-outline-secondary btn-sm me-1" onclick="moveSpeechUp(${idx})" ${idx === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button type="button" class="btn btn-outline-secondary btn-sm me-1" onclick="moveSpeechDown(${idx})" ${idx === campaignSpeeches.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeSpeech(${speech.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        speechesList.insertAdjacentHTML('beforeend', speechHtml);
    });

    // Add event listeners to all inputs
    campaignSpeeches.forEach(speech => {
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

function addSpeech() {
    const speechId = Date.now() + Math.random();
    campaignSpeeches.push({ id: speechId, stage: '', content: '' });
    renderSpeechList();
}

function removeSpeech(speechId) {
    campaignSpeeches = campaignSpeeches.filter(s => s.id !== speechId);
    renderSpeechList();
}

function moveSpeechUp(index) {
    if (index > 0) {
        [campaignSpeeches[index - 1], campaignSpeeches[index]] = [campaignSpeeches[index], campaignSpeeches[index - 1]];
        renderSpeechList();
    }
}

function moveSpeechDown(index) {
    if (index < campaignSpeeches.length - 1) {
        [campaignSpeeches[index], campaignSpeeches[index + 1]] = [campaignSpeeches[index + 1], campaignSpeeches[index]];
        renderSpeechList();
    }
}

function setupCandidateFilePreview() {
    const fileInput = document.getElementById('candidatesFile');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            showToast(`Arquivo "${file.name}" carregado. Em um ambiente real, ele seria processado.`, 'info');
            // Simulate previewing a few candidates
            const dummyLeads = [
                { name: 'Lead de Exemplo 1', phone: '(11) 55555-1111', email: 'exemplo1@email.com' },
                { name: 'Lead de Exemplo 2', phone: '(11) 55555-2222', email: 'exemplo2@email.com' },
            ];
            uploadedLeads = dummyLeads;
            renderCandidatePreview(dummyLeads);
        });
    }
}

function renderCandidatePreview(leads) {
    const previewDiv = document.getElementById('candidatePreview');
    const previewList = document.getElementById('candidatePreviewList');
    
    if (previewDiv && previewList) {
        previewDiv.classList.remove('d-none');
        previewList.innerHTML = '';
        
        leads.forEach(lead => {
            const leadHtml = `
                <div class="candidate-preview-card border rounded p-2 mb-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="fw-bold text-primary">${lead.name}</div>
                            
                        </div>
                        <div>
                            <div class="fw-bold text-primary">${lead.phone}</div>
                            <small class="text-muted">${lead.email}</small>
                        </div>
                        
                    </div>
                </div>
            `;
            previewList.insertAdjacentHTML('beforeend', leadHtml);
        });
    }
}

async function createCampaign() {
    campaignSpeeches = campaignSpeeches.filter(s => s.stage.trim() !== '' || s.content.trim() !== '');
    const newCampaign = {
        id: Date.now(), // Unique ID for demo
        name: document.getElementById('campaignName').value,
        position: document.getElementById('positionName').value,
        description: document.getElementById('campaignDescription').value,
        speech: document.getElementById('campaignSpeech').value, // This is the principal speech
        speeches: campaignSpeeches, // These are the additional speeches
        leadCount: uploadedLeads.length,
        progress: 0,
        status: 'ativa',
        created: new Date().toISOString().split('T')[0],
        url: Date.now().toString()
    };

    campaigns.unshift(newCampaign);
    filteredCampaigns = [...campaigns];

    const modal = bootstrap.Modal.getInstance(document.getElementById('addCampaignModal'));
    modal.hide();

    showToast(`Campanha "${newCampaign.name}" criada com sucesso! (Simulado)`, 'success');
    loadCampaigns();
}

function resetModal() {
    currentModalStep = 1;
    
    document.getElementById('campaignName').value = '';
    document.getElementById('positionName').value = '';
    document.getElementById('campaignDescription').value = '';
    document.getElementById('campaignSpeech').value = '';

    campaignSpeeches = [];
    addSpeech(); // Add one default speech field

    document.getElementById('candidatesFile').value = '';
    document.getElementById('candidatePreview').classList.add('d-none');
    
    updateModalStep();
    updateModalButtons();
}

function updateModalProgress(current, total) {
    // Placeholder
}

let currentEditingCampaignId = null;

function openEditCampaignModal(id) {
    const campaign = campaigns.find(c => c.id.toString() === id);
    if (!campaign) return;

    currentEditingCampaignId = id;

    document.getElementById('editCampaignName').textContent = campaign.name;
    document.getElementById('editCampaignDescription').textContent = campaign.description || 'Sem descrição';
    document.getElementById('campaignStatusSelect').value = campaign.status;
    
    const modal = new bootstrap.Modal(document.getElementById('editCampaignModal'));
    modal.show();
}

async function updateCampaignStatus() {
    const newStatus = document.getElementById('campaignStatusSelect').value;

    if (!currentEditingCampaignId) return;

    const campaignIndex = campaigns.findIndex(c => c.id.toString() === currentEditingCampaignId);
    if (campaignIndex !== -1) {
        campaigns[campaignIndex].status = newStatus;
        filteredCampaigns = [...campaigns];
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('editCampaignModal'));
    modal.hide();

    loadCampaigns();
    showToast(`Status da campanha alterado para "${newStatus}" com sucesso! (Simulado)`, 'success');

    currentEditingCampaignId = null;
}

async function deleteCampaign(id) {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) return;

    campaigns = campaigns.filter(c => c.id.toString() !== id);
    filteredCampaigns = campaigns.filter(c => c.id.toString() !== id);

    loadCampaigns();
    showToast('Campanha excluída com sucesso! (Simulado)', 'success');
}
