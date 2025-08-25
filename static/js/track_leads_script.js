// Global variables
let allLeads = [];
let filteredLeads = [];
let consultants = [];
let queues = [];
let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortDirection = 'asc';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const consultantFilter = document.getElementById('consultantFilter');
const queueFilter = document.getElementById('queueFilter');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const leadsTableBody = document.getElementById('leadsTableBody');
const loadingSpinner = document.getElementById('loadingSpinner');
const modal = document.getElementById('leadModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBody = document.getElementById('modalBody');
const paginationInfo = document.getElementById('paginationInfo');
const pageNumbers = document.getElementById('pageNumbers');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageSizeSelect = document.getElementById('pageSizeSelect');
const btnRemoverLead = document.getElementById('btn-remover-lead');
const dropdown = document.getElementById("exportDropdown");
// Dark Mode Elements (added for this task)
const darkModeToggle = document.getElementById('darkModeToggle');

const body = document.body;

// Dark Mode Elements (added for this task)
// ... (darkModeToggle and body are already here)

// Date Filter Elements
// const startDateFilter = document.getElementById('startDateFilter'); // Old, to be removed by Litepicker
// const endDateFilter = document.getElementById('endDateFilter');   // Old, to be removed by Litepicker
const dateRangeFilter = document.getElementById('dateRangeFilter'); // New for Litepicker


// Global Variables for Litepicker selected dates
let selectedStartDate = null;
let selectedEndDate = null;

// Utility functions
function showLoading() {
    loadingSpinner.classList.add('show');
}

function hideLoading() {
    loadingSpinner.classList.remove('show');
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    // This existing function is for display, keep it as is.
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function calculateAttendanceTime(createdAt, clickedAt) {
    if (!clickedAt) return null;

    const diffMs = new Date(clickedAt).getTime() - new Date(createdAt).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    } else {
        return `${minutes}min`;
    }
}

function getLeadWithConsultant(lead) {
    // verifica se o lead.consultant existe no array consultants
    const consultantName = consultants.find(name => name === lead.consultant);

    return {
        ...lead,
        consultant: lead.consultant || '-', // mantém lead.consultant se não achar no array
        attendanceTime: calculateAttendanceTime(lead.createdAt, lead.firstClick)
    };
}

// Mock Data for Prototype
const mockLeadsData = [
    { id: 1, name: 'Empresa Alpha', email: 'contato@alpha.com', company: 'Alpha Inc.', queue: 'Vendas', consultant: 'Ana', links: [{ ShortLinkNovo: 'sh1', isAttended: true, attendanceTime: '15min', createdAt: '2024-01-01T10:00:00Z', countClick: 1, clickedAt: '2024-01-01T10:15:00Z', originalLink: '#' }], createdAt: '2024-01-01T10:00:00Z' },
    { id: 2, name: 'Empresa Beta', email: 'contato@beta.com', company: 'Beta Solutions', queue: 'Suporte', consultant: 'Bruno', links: [{ ShortLinkNovo: 'sh2', isAttended: false, attendanceTime: null, createdAt: '2024-01-02T11:00:00Z', countClick: 0, clickedAt: null, originalLink: '#' }], createdAt: '2024-01-02T11:00:00Z' },
    { id: 3, name: 'Empresa Gamma', email: 'contato@gamma.com', company: 'Gamma Tech', queue: 'Vendas', consultant: 'Ana', links: [{ ShortLinkNovo: 'sh3', isAttended: true, attendanceTime: '30min', createdAt: '2024-01-03T12:00:00Z', countClick: 2, clickedAt: '2024-01-03T12:30:00Z', originalLink: '#' }], createdAt: '2024-01-03T12:00:00Z' },
];
const mockConsultants = ['Ana', 'Bruno', 'Carlos'];
const mockQueues = ['Vendas', 'Suporte', 'Marketing'];

async function loadInitialData(startDate = null, endDate = null) {
    showLoading();
    try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

        allLeads = mockLeadsData;
        consultants = mockConsultants;
        queues = mockQueues;

        updateFilters();
        filterAndDisplayLeads();
        updateStats();
    } catch (error) {
        console.error('Error loading mock data:', error);
    } finally {
        hideLoading();
    }
}


// Filter functions
function updateFilters() {
    // Update consultant filter
    consultantFilter.innerHTML = '<option value="">Todos os Consultores</option>';
    consultants.forEach(name => {
        const option = document.createElement('option');
        option.value = name;    // valor igual ao nome do consultor
        option.textContent = name; // texto exibido igual ao nome
        consultantFilter.appendChild(option);
    });

    // Update queue filter
    queueFilter.innerHTML = '<option value="">Todas as Filas</option>';
    queues.forEach(queue => {
        const option = document.createElement('option');
        option.value = queue;
        option.textContent = queue;
        queueFilter.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const consultantValue = consultantFilter.value;
    const queueValue = queueFilter.value;

    let filterStartDate = null;
    if (selectedStartDate) {
        filterStartDate = new Date(selectedStartDate);
        filterStartDate.setHours(0, 0, 0, 0);
    }

    let filterEndDate = null;
    if (selectedEndDate) {
        filterEndDate = new Date(selectedEndDate);
        filterEndDate.setHours(23, 59, 59, 999);
    }

    filteredLeads = allLeads.filter(lead => {
       
        const name = (lead.name || '').toLowerCase();
        const company = (lead.company || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const consultant = (lead.consultant || '').toLowerCase();
        const queue = (lead.queue || '').toLowerCase();

        const searchTermLower = searchTerm.toLowerCase();
        const statusValLower = statusValue ? statusValue.toLowerCase() : '';
        const consultantFilterLower = consultantValue ? consultantValue.toLowerCase() : '';
        const queueFilterLower = queueValue ? queueValue.toLowerCase() : '';

        // Busca no nome, empresa e email
        const matchesSearch = !searchTerm ||
            name.includes(searchTermLower) ||
            company.includes(searchTermLower) ||
            email.includes(searchTermLower);

        // Novo status baseado nos links
        const isAttended = lead.links.some(link => link.isAttended === true);

        const matchesStatus = !statusValue ||
            (statusValLower === 'atendido' && isAttended) ||
            (statusValLower === 'nao-atendido' && !isAttended);

        // Consultant - filtro exato ignorando case
        const matchesConsultant = !consultantValue || consultant === consultantFilterLower;

        // Queue - filtro exato ignorando case
        const matchesQueue = !queueValue || queue === queueFilterLower;

        // Datas
        const createdAtDate = new Date(lead.createdAt);

        const matchesStartDate = !filterStartDate || lead.links.some(link => {
            const linkDate = new Date(link.createdAt);
            return linkDate >= filterStartDate;
        });

        const matchesEndDate = !filterEndDate || lead.links.some(link => {
            const linkDate = new Date(link.createdAt);
            return linkDate <= filterEndDate;
        });

        return matchesSearch && matchesStatus && matchesConsultant && matchesQueue && matchesStartDate && matchesEndDate;
    });


    // Ordenação permanece igual
    if (sortField) {
        filteredLeads.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            // No caso de consultant, já é string, então só normalize para minusculo pra ordenar
            if (sortField === 'consultant') {
                aValue = (aValue || '').toLowerCase();
                bValue = (bValue || '').toLowerCase();
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    currentPage = 1;

}


function filterAndDisplayLeads() {
    applyFilters();
    displayLeads();
    updatePagination();
}


// Display functions
function displayLeads() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
    
    if (paginatedLeads.length === 0) {
        leadsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state"> 
                    <div class="empty-state-icon">🔍</div>
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente ajustar os filtros ou realizar uma nova busca.</p>
                </td>
            </tr>
        `;
        return;
    }

    leadsTableBody.innerHTML = paginatedLeads.map(lead => {

        
        // Verifica se algum dos links foi atendido
        const isAttended = lead.links.some(link => link.isAttended);

        // Pega o primeiro tempo de atendimento não nulo, se existir
        const attendanceTime = lead.links.find(link => link.attendanceTime && link.attendanceTime !== 'N/A')?.attendanceTime || '-';

        const statusClass = isAttended ? 'status-attended' : 'status-pending';
        const statusText = isAttended ? '✓ Atendido' : '⏰ Não Atendido';

        // Link principal usado para visualizar detalhes (pode ser o primeiro)
        const mainShortLink = lead.links[0]?.ShortLinkNovo  || '#';

        return `
            <tr class="clickable-row" onclick="viewLeadDetails('${mainShortLink}')">
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="lead-info">
                        <div class="lead-name">${lead.name || '-'}</div>
                        <div class="lead-email">${lead.email || '-'}</div>
                    </div>
                </td>
                <td>${lead.company || '-'}</td>
                <td>
                    <span class="queue-badge">${lead.queue || '-'}</span>
                </td>
                <td>
                    <div class="consultant-info">
                        <span class="consultant-name">${lead.consultant}</span>
                    </div>
                </td>
                <td>${attendanceTime}</td>
            </tr>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    adjustBadgeWidths();
}

function updateStats() {
    const total = allLeads.length;

    // Conta quantos leads têm pelo menos um link com isAttended === true
    const attended = allLeads.filter(lead => lead.links && lead.links.some(link => link.isAttended === true)).length;

    const pending = total - attended;
    const conversionRate = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;

    document.getElementById('totalLeads').textContent = total;
    document.getElementById('attendedLeads').textContent = attended;
    document.getElementById('pendingLeads').textContent = pending;
    document.getElementById('conversionRate').textContent = `${conversionRate}%`;
}


// Pagination functions
function updatePagination() {
    const totalPages = Math.ceil(filteredLeads.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(startIndex + pageSize - 1, filteredLeads.length);

    // Update pagination info
    paginationInfo.textContent = `Mostrando ${filteredLeads.length === 0 ? 0 : startIndex} - ${endIndex} de ${filteredLeads.length} leads`;

    // Update page controls
    prevPageBtn.disabled = currentPage === 1 || totalPages === 0;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Update page numbers
    renderPageNumbers(totalPages);
}

function renderPageNumbers(totalPages) {
    pageNumbers.innerHTML = '';

    if (totalPages <= 1) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageBtn);
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredLeads.length / pageSize);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayLeads();
        updatePagination();
    }
}

function changePageSize() {
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    displayLeads();
    updatePagination();
}

function shortenLink(url, maxLength = 30) {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + '...';
}

function viewLeadDetails(shortLink) {
    const lead = allLeads.find(l => 
    l.ShortLinkNovo === shortLink || l.links.some(link => link.ShortLinkNovo === shortLink)
);

    if (!lead) return;

    // Verifica se algum link foi atendido
    const isAttended = lead.links.some(link => link.isAttended);
    const statusClass = isAttended ? 'status-attended' : 'status-pending';
    const statusText = isAttended ? '✓ Atendido' : '⏰ Não Atendido';

    const linksHtml = lead.links.map((link, index) => {
        const isNotLast = index < lead.links.length - 1;

        return `
        <div class="modal-subsection">
            <div class="modal-field" style="padding-bottom: 20px;">
                <p class="modal-value">
                    <a href="${link.ShortLinkNovo}" style="color: #00A4BD;" target="_blank" rel="noopener noreferrer">
    Link Encurtado
</a>

                </p>
            </div>

            <div class="modal-field">
                <p class="modal-link" title="${link.originalLink}">
                    <a href="${link.originalLink}" style="color: #00A4BD;" target="_blank" rel="noopener noreferrer">
                        Link Original
                    </a>
                </p>
            </div>
        </div>
        <div class="modal-field">
            <label class="modal-label">Data de Criação do Link</label>
            <p class="modal-value">${formatDate(link.createdAt)}</p>
        </div>
        <div class="modal-field">
            <label class="modal-label">Total de acessos</label>
            <p class="modal-value">${link.countClick ?? 0}</p>
        </div>
        ${link.clickedAt ? `
            <div class="modal-field">
                <label class="modal-label">Data do Clique</label>
                <p class="modal-value">${formatDate(link.clickedAt)}</p>
            </div>
        ` : ''}
        ${link.attendanceTime ? `
            <div class="modal-field">
                <label class="modal-label">Tempo de Atendimento</label>
                <p class="modal-value">${link.attendanceTime}</p>
            </div>
        ` : ''}
        ${isNotLast ? `
            <div class="modal-field-full-width">
                <hr class="hr-full" />
            </div>
        ` : ''}
    `;
    }).join('');


    modalBody.innerHTML = `
        <div class="modal-field">
            <label class="modal-label">Status</label>
            <div><span class="status-badge ${statusClass}">${statusText}</span></div>
        </div>
        <div class="modal-field">
            <label class="modal-label">Nome</label>
            <p class="modal-value">${lead.name}</p>
        </div>
        <div class="modal-field">
            <label class="modal-label">Email</label>
            <p class="modal-value">${lead.email}</p>
        </div>
        <div class="modal-field">
            <label class="modal-label">Empresa</label>
            <p class="modal-value">${lead.company}</p>
        </div>
        <div class="modal-field">
            <label class="modal-label">Fila de Atendimento</label>
            <div><span class="queue-badge">${lead.queue}</span></div>
        </div>
        <div class="modal-field">
            <label class="modal-label">Consultor</label>
            <div class="consultant-info">
                <span class="consultant-name">${lead.consultant}</span>
            </div>
        </div>
        <div class="modal-field-full-width">
            <hr class="hr-full" />
            <h4 style="text-align: center; margin-bottom:20px;">Links Associados</h4>
        </div>
        
        ${linksHtml}

        <div class="modal-field-full-width" style="margin-top: 2rem; text-align: right;">
            <button id="btn-remover-lead" class="status-pending" style=" border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;">
            Remover Lead
        </button>
        </div>
        
        
    `;

    modal.classList.add('show');
    adicionarFuncionalidadeRemoverLead(lead, closeModal)
}

function adicionarFuncionalidadeRemoverLead(lead, closeModalCallback) {
    const btn = document.getElementById('btn-remover-lead');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (confirm("Deseja realmente remover este lead?")) {
            allLeads = allLeads.filter(l => l.id !== lead.id);
            alert('Lead removido com sucesso! (Simulado)');
            closeModalCallback();
            filterAndDisplayLeads();
            updateStats();
        }
    });
}



function closeModal() {
    modal.classList.remove('show');
}

// Sorting functions
function handleSort(field) {
    if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortField = field;
        sortDirection = 'asc';
    }
    // Update sort icons
    document.querySelectorAll('th[data-sort]').forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if (icon) { // Check if icon element exists
            if (th.getAttribute('data-sort') === sortField) {
                icon.setAttribute('data-lucide', sortDirection === 'asc' ? 'arrow-up' : 'arrow-down');
            } else {
                icon.setAttribute('data-lucide', 'arrow-up-down');
            }
        }
    });
    lucide.createIcons(); // Refresh icons
    filterAndDisplayLeads();
}

// Function to adjust badge widths for consistency
function adjustBadgeWidths() {
    if (!leadsTableBody) return; // Ensure table body exists

    // Adjust status badges
    const statusBadges = leadsTableBody.querySelectorAll('.status-badge');
    if (statusBadges.length > 0) {
        let maxStatusWidth = 0;
        // First, reset minWidth for all badges to allow natural width calculation
        statusBadges.forEach(badge => {
            badge.style.minWidth = '';
        });

        // Use requestAnimationFrame to ensure styles are applied and reflow happens
        requestAnimationFrame(() => {
            // Measure all badges after reset
            statusBadges.forEach(badge => {
                // Ensure badge is visible before measuring, otherwise offsetWidth can be 0
                // This check might be overly cautious if badges are always visible when this runs
                if (badge.offsetParent !== null) {
                    maxStatusWidth = Math.max(maxStatusWidth, badge.offsetWidth);
                }
            });

            // Apply the calculated max width to all badges
            // Only apply if a valid max width was found (greater than 0)
            if (maxStatusWidth > 0) {
                statusBadges.forEach(badge => {
                    badge.style.minWidth = maxStatusWidth + 'px';
                });
            }
        });
    }

    // Adjust queue badges
    const queueBadges = leadsTableBody.querySelectorAll('.queue-badge');
    if (queueBadges.length > 0) {
        let maxQueueWidth = 0;
        // First, reset minWidth for all badges
        queueBadges.forEach(badge => {
            badge.style.minWidth = '';
        });

        requestAnimationFrame(() => {
            // Measure all badges after reset
            queueBadges.forEach(badge => {
                if (badge.offsetParent !== null) {
                    maxQueueWidth = Math.max(maxQueueWidth, badge.offsetWidth);
                }
            });

            // Apply the calculated max width
            if (maxQueueWidth > 0) {
                queueBadges.forEach(badge => {
                    badge.style.minWidth = maxQueueWidth + 'px';
                });
            }
        });
    }
}

function setupExportDropdown() {
    if (!exportBtn || !dropdown) return;
    exportBtn.addEventListener("click", () => dropdown.classList.toggle("hidden"));
    document.addEventListener("click", (event) => {
        if (!exportBtn.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.add("hidden");
        }
    });
    dropdown.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
            alert("Funcionalidade de exportação desativada no protótipo.");
            dropdown.classList.add("hidden");
        });
    });
}


// Event listeners
document.addEventListener('DOMContentLoaded', function () {

    // End Dark Mode Logic

    // Initialize Lucide icons (this will also render the initial dark mode toggle icon)
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Initialize Litepicker
    if (dateRangeFilter) { // Check if the element exists
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        selectedStartDate = thirtyDaysAgo;
        selectedEndDate = today;

        new Litepicker({
            element: dateRangeFilter,
            singleMode: false,
            autoApply: true,
            format: 'DD/MM/YYYY',
            separator: ' - ',
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            setup: (picker) => {
                picker.on('selected', (date1, date2) => {
                    // These are Litepicker date objects, get JS Date instances
                    selectedStartDate = date1 ? date1.dateInstance : null;
                    selectedEndDate = date2 ? date2.dateInstance : null;
                    loadInitialData(selectedStartDate, selectedEndDate);
                });
            }
        });
    }

    // Load initial data
    loadInitialData();
    setupExportDropdown();

    // Filter event listeners
    if (searchInput) searchInput.addEventListener('input', filterAndDisplayLeads);
    if (statusFilter) statusFilter.addEventListener('change', filterAndDisplayLeads);
    if (consultantFilter) consultantFilter.addEventListener('change', filterAndDisplayLeads);
    if (queueFilter) queueFilter.addEventListener('change', filterAndDisplayLeads);
    // Old date filter listeners are no longer needed as Litepicker handles it.

    // Button event listeners
    if (refreshBtn) refreshBtn.addEventListener('click', loadInitialData);


    // Modal event listeners
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Pagination event listeners
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    if (pageSizeSelect) pageSizeSelect.addEventListener('change', changePageSize);

    // Sort event listeners
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', function () {
            const field = this.getAttribute('data-sort');
            handleSort(field);
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModal();
        }
    });


});