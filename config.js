// Configuration for real-time job scraping
const CONFIG = {
    // API Keys - Users need to add their own keys
    TWITTER: {
        BEARER_TOKEN: 'YOUR_TWITTER_BEARER_TOKEN_HERE',
        API_KEY: 'YOUR_TWITTER_API_KEY_HERE',
        API_SECRET: 'YOUR_TWITTER_API_SECRET_HERE'
    },
    
    LINKEDIN: {
        CLIENT_ID: 'YOUR_LINKEDIN_CLIENT_ID_HERE',
        CLIENT_SECRET: 'YOUR_LINKEDIN_CLIENT_SECRET_HERE',
        ACCESS_TOKEN: 'YOUR_LINKEDIN_ACCESS_TOKEN_HERE'
    },

    // Job search keywords for each role
    JOB_KEYWORDS: {
        'marketing-analyst': ['marketing analyst', 'digital marketing analyst', 'marketing data analyst'],
        'seo': ['seo specialist', 'seo analyst', 'search engine optimization'],
        'devops': ['devops engineer', 'site reliability engineer', 'infrastructure engineer'],
        'ml-engineer': ['machine learning engineer', 'ml engineer', 'ai engineer'],
        'tableau-developer': ['tableau developer', 'tableau analyst', 'data visualization'],
        'data-analyst': ['data analyst', 'business intelligence analyst'],
        'business-analyst': ['business analyst', 'systems analyst'],
        'sde': ['software engineer', 'software developer', 'full stack developer']
    },

    // Note: Real newspaper sources are now loaded from county-newspapers.js
    // This ensures we scrape actual local newspapers across all 3,144+ US counties

    // Rate limiting settings
    RATE_LIMITS: {
        TWITTER_REQUESTS_PER_HOUR: 100,
        LINKEDIN_REQUESTS_PER_HOUR: 50,
        NEWSPAPER_DELAY_MS: 2000, // 2 seconds between requests
    },

    // Search settings
    SEARCH_SETTINGS: {
        MAX_RESULTS_PER_SOURCE: 50,
        MAX_RESULTS_TOTAL: 1000,
        CACHE_DURATION_MINUTES: 15,
        AUTO_REFRESH_INTERVAL_MINUTES: 5
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 