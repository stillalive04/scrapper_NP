// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Cache for job data
let jobCache = new Map();
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// DOM elements
const jobTypeSelect = document.getElementById('jobType');
const sourceSelect = document.getElementById('source');
const locationInput = document.getElementById('location');
const searchBtn = document.getElementById('searchBtn');
const enhancedSearchBtn = document.getElementById('enhancedSearchBtn');
const loadingElement = document.getElementById('loading');
const jobResults = document.getElementById('jobResults');

// Stats elements
const totalJobsElement = document.getElementById('totalJobs');
const newspaperJobsElement = document.getElementById('newspaperJobs');
const twitterJobsElement = document.getElementById('twitterJobs');
const linkedinJobsElement = document.getElementById('linkedinJobs');

// API Functions
async function fetchJobs(jobType = '', source = '', location = '') {
    try {
        const params = new URLSearchParams();
        if (jobType) params.append('jobType', jobType);
        if (source) params.append('source', source);
        if (location) params.append('location', location);
        
        const response = await fetch(`${API_BASE_URL}/jobs/search?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jobs = await response.json();
        return jobs;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        showError('Failed to fetch jobs. Please check if the server is running.');
        return [];
    }
}

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/stats`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { total: 0, newspaper: 0, twitter: 0, linkedin: 0 };
    }
}

async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const health = await response.json();
        
        if (!health.apiStatus.twitter && !health.apiStatus.linkedin) {
            showWarning('API keys not configured. Using limited functionality. Please configure your API keys in config.js');
        }
        
        return health;
    } catch (error) {
        showError('Server is not running. Please start the server with "npm start"');
        return null;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Check server health first
    const health = await checkServerHealth();
    
    if (health) {
        await displayInitialJobs();
        await updateStatsFromAPI();
    }
    
    // Add event listeners
    searchBtn.addEventListener('click', performSearch);
    enhancedSearchBtn.addEventListener('click', performEnhancedSearch);
    
    // Allow Enter key to trigger search
    [jobTypeSelect, sourceSelect, locationInput].forEach(element => {
        element.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    });
    
    // Auto-refresh every 5 minutes
    setInterval(async () => {
        console.log('Auto-refreshing job data...');
        await updateStatsFromAPI();
        
        // If no search filters are active, refresh the job list
        if (!jobTypeSelect.value && !sourceSelect.value && !locationInput.value) {
            await displayInitialJobs();
        }
    }, 5 * 60 * 1000);
});

async function displayInitialJobs() {
    showLoading();
    try {
        const jobs = await fetchJobs();
        displayJobs(jobs); // Show ALL jobs, not just first 20
    } catch (error) {
        console.error('Error displaying initial jobs:', error);
    } finally {
        hideLoading();
    }
}

async function performSearch() {
    showLoading();
    
    try {
        const jobType = jobTypeSelect.value;
        const source = sourceSelect.value;
        const location = locationInput.value;
        
        const jobs = await fetchJobs(jobType, source, location);
        displayJobs(jobs);
        updateStats(jobs);
    } catch (error) {
        console.error('Error performing search:', error);
    } finally {
        hideLoading();
    }
}

async function updateStatsFromAPI() {
    try {
        const stats = await fetchStats();
        
        animateCounter(totalJobsElement, stats.total);
        animateCounter(newspaperJobsElement, stats.newspaper);
        animateCounter(twitterJobsElement, stats.twitter);
        animateCounter(linkedinJobsElement, stats.linkedin);
        
        // Update last update time if available
        if (stats.lastUpdate) {
            const lastUpdateElement = document.getElementById('lastUpdate');
            if (lastUpdateElement) {
                lastUpdateElement.textContent = `Last updated: ${new Date(stats.lastUpdate).toLocaleTimeString()}`;
            }
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

async function performEnhancedSearch() {
    showLoading();
    enhancedSearchBtn.disabled = true;
    enhancedSearchBtn.textContent = '🔄 Searching ALL newspapers...';
    
    try {
        const jobType = jobTypeSelect.value || 'data-analyst';
        const location = locationInput.value;
        
        // Extract state if provided
        const stateMatch = location.match(/\b([A-Z]{2})\b/i);
        const state = stateMatch ? stateMatch[1].toUpperCase() : null;
        
        const params = new URLSearchParams();
        params.append('jobType', jobType);
        params.append('category', 'all'); // Search ALL categories (national, state, regional, county)
        if (state) params.append('state', state);
        params.append('limit', '30'); // Limit newspapers for faster response
        
        const response = await fetch(`${API_BASE_URL}/jobs/comprehensive-search?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayJobs(result.jobs);
            updateStats(result.jobs);
            
            // Show enhanced search results info
            const resultInfo = document.createElement('div');
            resultInfo.className = 'enhanced-results-info';
            resultInfo.innerHTML = `
                <div class="enhanced-info">
                    <h3>🚀 COMPREHENSIVE ALL-MEDIA SEARCH RESULTS</h3>
                    <p>✅ Searched ${result.total_newspapers_searched} newspapers</p>
                    <p>📰 Category: ${result.category_searched.toUpperCase()} (National + State + Regional + County)</p>
                    <p>🗺️ Coverage: ${result.state_searched || 'ALL STATES'}</p>
                    <p>💼 Found ${result.jobs_found} job postings</p>
                    <p class="coverage-note">
                        ${result.coverage_stats.total_coverage} - 
                        ${result.coverage_stats.national} national, 
                        ${result.coverage_stats.state} state, 
                        ${result.coverage_stats.regional} regional, 
                        ${result.coverage_stats.county} county newspapers
                    </p>
                </div>
            `;
            
            jobResults.insertBefore(resultInfo, jobResults.firstChild);
        } else {
            showError('Enhanced search failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Error performing enhanced search:', error);
        showError('Enhanced search failed. Please check if the server is running.');
    } finally {
        hideLoading();
        enhancedSearchBtn.disabled = false;
        enhancedSearchBtn.textContent = '🚀 COMPREHENSIVE All-Media Search';
    }
}

function displayJobs(jobs) {
    if (jobs.length === 0) {
        jobResults.innerHTML = `
            <div class="empty-state">
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or browse all available positions.</p>
            </div>
        `;
        return;
    }
    
    // Add job counter header
    const jobCounterHTML = `
        <div class="job-counter">
            <h3>📋 Displaying ${jobs.length} Job${jobs.length === 1 ? '' : 's'}</h3>
        </div>
    `;
    
    const jobsHTML = jobs.map(job => createJobCard(job)).join('');
    jobResults.innerHTML = jobCounterHTML + jobsHTML;
}

function createJobCard(job) {
    const sourceClass = `source-${job.source}`;
    const sourceIcon = getSourceIcon(job.source);
    
    return `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <div class="job-title">${job.title}</div>
                    <div class="job-company">${job.company}</div>
                </div>
                <div class="job-source">
                    <span class="source-badge ${sourceClass}">
                        ${sourceIcon} ${job.sourceDetail}
                    </span>
                </div>
            </div>
            <div class="job-details">
                <div class="job-location">
                    <strong>Location:</strong> ${job.location}<br>
                    <small>${job.county}</small>
                </div>
                <div class="job-posted">
                    <strong>Posted:</strong> ${job.posted}
                </div>
            </div>
            <div class="job-description">
                ${job.description}
            </div>
            <a href="${job.link}" class="job-link">View Full Posting →</a>
        </div>
    `;
}

function getSourceIcon(source) {
    switch(source) {
        case 'newspaper': return '📰';
        case 'twitter': return '🐦';
        case 'linkedin': return '💼';
        default: return '📄';
    }
}

function updateStats(jobs) {
    const newspaperCount = jobs.filter(job => job.source === 'newspaper').length;
    const twitterCount = jobs.filter(job => job.source === 'twitter').length;
    const linkedinCount = jobs.filter(job => job.source === 'linkedin').length;
    
    animateCounter(totalJobsElement, jobs.length);
    animateCounter(newspaperJobsElement, newspaperCount);
    animateCounter(twitterJobsElement, twitterCount);
    animateCounter(linkedinJobsElement, linkedinCount);
}

function animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 300;
    const steps = Math.abs(targetValue - currentValue);
    const stepDuration = steps > 0 ? duration / steps : 0;
    
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === targetValue) {
            clearInterval(timer);
        }
    }, stepDuration);
}

function showLoading() {
    loadingElement.style.display = 'flex';
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
}

function hideLoading() {
    loadingElement.style.display = 'none';
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search Jobs';
}

// Error handling functions
function showError(message) {
    const errorDiv = createNotification(message, 'error');
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 10000);
}

function showWarning(message) {
    const warningDiv = createNotification(message, 'warning');
    document.body.appendChild(warningDiv);
    setTimeout(() => warningDiv.remove(), 8000);
}

function showSuccess(message) {
    const successDiv = createNotification(message, 'success');
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add CSS styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                animation: slideInRight 0.3s ease-out;
            }
            
            .notification-error {
                background: #fee2e2;
                border-left: 4px solid #dc2626;
                color: #991b1b;
            }
            
            .notification-warning {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                color: #92400e;
            }
            
            .notification-success {
                background: #dcfce7;
                border-left: 4px solid #16a34a;
                color: #166534;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                gap: 8px;
            }
            
            .notification-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .notification-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
                flex-shrink: 0;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    return notification;
}

function getNotificationIcon(type) {
    switch (type) {
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'success': return '✅';
        default: return 'ℹ️';
    }
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to results when search is performed
    searchBtn.addEventListener('click', function() {
        setTimeout(() => {
            document.querySelector('.results-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }, 1600);
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            locationInput.focus();
        }
    });
});

// Real-time job monitoring
function startRealTimeMonitoring() {
    console.log('🔄 Real-time job monitoring started');
    showSuccess('Real-time job monitoring is active. Jobs will update automatically every 5 minutes.');
}

// Start monitoring when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startRealTimeMonitoring, 2000);
}); 