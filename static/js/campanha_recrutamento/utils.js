// Utility functions for the application

/**
 * Format numbers with thousands separator
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format phone number for display
 */
function formatPhone(phone) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusClass = `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
    return `<span class="status-badge ${statusClass}">${status}</span>`;
}

/**
 * Get progress bar HTML
 */
function getProgressBar(progress) {
    let colorClass = 'bg-danger';
    if (progress >= 70) colorClass = 'bg-success';
    else if (progress >= 40) colorClass = 'bg-warning';
    
    return `
        <div class="progress progress-sm">
            <div class="progress-bar ${colorClass}" style="width: ${progress}%"></div>
        </div>
        <small class="text-muted">${progress}%</small>
    `;
}

/**
 * Get action button HTML for campaigns
 */
function getCampaignActionButton(campaign) {
    if (campaign.status === 'ativa') {
        return `<button class="btn btn-sm btn-warning" onclick="toggleCampaignStatus(${campaign.id}, 'pausada')">
                    <i class="fas fa-pause"></i> Pausar
                </button>`;
    } else if (campaign.status === 'pausada') {
        return `<button class="btn btn-sm btn-success" onclick="toggleCampaignStatus(${campaign.id}, 'ativa')">
                    <i class="fas fa-play"></i> Continuar
                </button>`;
    } else {
        return `<span class="text-muted">Finalizada</span>`;
    }
}

/**
 * Debounce function for search inputs
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sort array by column
 */
function sortArray(array, column, direction = 'asc') {
    return array.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        // Handle different data types
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });
}

/**
 * Filter campaigns based on search criteria
 */
function filterCampaigns(campaigns, nameFilter, statusFilter) {
    return campaigns.filter(campaign => {
        const nameMatch = !nameFilter || campaign.name.toLowerCase().includes(nameFilter.toLowerCase());
        const statusMatch = !statusFilter || campaign.status === statusFilter;
        return nameMatch && statusMatch;
    });
}

/**
 * Filter candidates based on search criteria
 */
function filterCandidates(candidates, searchFilter, scoreFilter, statusFilter) {
    return candidates.filter(candidate => {
        // Search filter (name or phone)
        const searchMatch = !searchFilter || 
            candidate.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            candidate.phone.includes(searchFilter);
        
        // Score filter
        let scoreMatch = true;
        if (scoreFilter === '0-5') {
            scoreMatch = candidate.score >= 0 && candidate.score <= 5;
        } else if (scoreFilter === '5-10') {
            scoreMatch = candidate.score > 5 && candidate.score <= 10;
        }
        
        // Status filter
        const statusMatch = !statusFilter || candidate.status === statusFilter;
        
        return searchMatch && scoreMatch && statusMatch;
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format (Brazilian)
 */
function isValidPhone(phone) {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Generate random score for new candidates
 */
function generateRandomScore() {
    return Math.round((Math.random() * 10) * 10) / 10;
}

/**
 * Get score-based status
 */
function getScoreBasedStatus(score) {
    if (score >= 9) return 'fit 10';
    if (score >= 7) return 'fit 5';
    if (score >= 5) return 'em processamento';
    if (score >= 3) return 'aguardando';
    return 'sem interesse';
}

/**
 * Animate element
 */
function animateElement(element, animationClass, duration = 1000) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration);
}

/**
 * Handle loading state
 */
function setLoadingState(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format time for display
 */
function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}
