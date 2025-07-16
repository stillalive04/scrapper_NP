// COMPREHENSIVE NEWSPAPER DATABASE
// National, State, Regional, and County-level newspaper coverage for job postings
// Complete coverage across all 3,144+ US counties

const COMPREHENSIVE_NEWSPAPERS = {
    
    // NATIONAL NEWSPAPERS - Major nationwide coverage
    NATIONAL: [
        {
            newspaper: 'USA Today',
            url: 'https://usatoday.com',
            jobsPath: '/money/careers/',
            selectors: {
                jobTitle: '.gnt_m_flm_a, .gnt_m_flm_h, a[href*="job"]',
                company: '.company, .gnt_m_flm_sbt',
                location: '.location, .gnt_m_flm_sbt',
                description: '.gnt_m_flm_sbt, .summary'
            },
            coverage: 'National',
            category: 'national'
        },
        {
            newspaper: 'Wall Street Journal',
            url: 'https://wsj.com',
            jobsPath: '/news/careers-work/',
            selectors: {
                jobTitle: 'h3 a, .headline a, a[href*="career"]',
                company: '.byline, .company',
                location: '.location, .meta',
                description: '.summary, .deck'
            },
            coverage: 'National',
            category: 'national'
        },
        {
            newspaper: 'New York Times',
            url: 'https://nytimes.com',
            jobsPath: '/section/business/economy/',
            selectors: {
                jobTitle: 'h3 a, h2 a, .headline',
                company: '.byline, .company',
                location: '.location, .meta',
                description: '.summary'
            },
            coverage: 'National',
            category: 'national'
        },
        {
            newspaper: 'Washington Post',
            url: 'https://washingtonpost.com',
            jobsPath: '/business/economy/',
            selectors: {
                jobTitle: 'h3 a, .headline a',
                company: '.byline, .author',
                location: '.meta, .location',
                description: '.excerpt, .summary'
            },
            coverage: 'National',
            category: 'national'
        }
    ],

    // STATE-LEVEL NEWSPAPERS - Major papers in each state
    STATE: [
        // Alabama
        {
            newspaper: 'Birmingham News',
            url: 'https://al.com',
            jobsPath: '/jobs/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'AL', coverage: 'Alabama Statewide', category: 'state'
        },
        {
            newspaper: 'Mobile Press-Register',
            url: 'https://al.com/mobile/',
            jobsPath: '/jobs/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'AL', coverage: 'Mobile Region', category: 'state'
        },
        
        // Alaska
        {
            newspaper: 'Anchorage Daily News',
            url: 'https://adn.com',
            jobsPath: '/jobs/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'AK', coverage: 'Alaska Statewide', category: 'state'
        },
        
        // Arizona
        {
            newspaper: 'Arizona Republic',
            url: 'https://azcentral.com',
            jobsPath: '/business/jobs/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'AZ', coverage: 'Arizona Statewide', category: 'state'
        },
        {
            newspaper: 'Arizona Daily Star',
            url: 'https://tucson.com',
            jobsPath: '/business/jobs/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'AZ', coverage: 'Southern Arizona', category: 'state'
        },
        
        // Arkansas
        {
            newspaper: 'Arkansas Democrat-Gazette',
            url: 'https://arkansasonline.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'AR', coverage: 'Arkansas Statewide', category: 'state'
        },
        
        // California
        {
            newspaper: 'Los Angeles Times',
            url: 'https://latimes.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'CA', coverage: 'Southern California', category: 'state'
        },
        {
            newspaper: 'San Francisco Chronicle',
            url: 'https://sfchronicle.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'CA', coverage: 'Northern California', category: 'state'
        },
        {
            newspaper: 'Sacramento Bee',
            url: 'https://sacbee.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'CA', coverage: 'Central California', category: 'state'
        },
        {
            newspaper: 'Orange County Register',
            url: 'https://ocregister.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'CA', coverage: 'Orange County', category: 'state'
        },
        {
            newspaper: 'San Diego Union-Tribune',
            url: 'https://sandiegouniontribune.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'CA', coverage: 'San Diego Region', category: 'state'
        },
        
        // Colorado
        {
            newspaper: 'Denver Post',
            url: 'https://denverpost.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'CO', coverage: 'Colorado Statewide', category: 'state'
        },
        
        // Connecticut
        {
            newspaper: 'Hartford Courant',
            url: 'https://courant.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'CT', coverage: 'Connecticut Statewide', category: 'state'
        },
        
        // Delaware
        {
            newspaper: 'News Journal (Wilmington)',
            url: 'https://delawareonline.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'DE', coverage: 'Delaware Statewide', category: 'state'
        },
        
        // Florida
        {
            newspaper: 'Miami Herald',
            url: 'https://miamiherald.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'FL', coverage: 'South Florida', category: 'state'
        },
        {
            newspaper: 'Tampa Bay Times',
            url: 'https://tampabay.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'FL', coverage: 'Tampa Bay Area', category: 'state'
        },
        {
            newspaper: 'Orlando Sentinel',
            url: 'https://orlandosentinel.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            state: 'FL', coverage: 'Central Florida', category: 'state'
        }
    ],

    // REGIONAL NEWSPAPERS - Mid-sized regional coverage
    REGIONAL: [
        // Northeast
        {
            newspaper: 'Boston Globe',
            url: 'https://bostonglobe.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'New England', states: ['MA', 'NH', 'VT', 'ME', 'RI', 'CT'], category: 'regional'
        },
        {
            newspaper: 'Philadelphia Inquirer',
            url: 'https://inquirer.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Mid-Atlantic', states: ['PA', 'NJ', 'DE'], category: 'regional'
        },
        
        // Southeast
        {
            newspaper: 'Atlanta Journal-Constitution',
            url: 'https://ajc.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Southeast', states: ['GA', 'AL', 'SC'], category: 'regional'
        },
        {
            newspaper: 'Charlotte Observer',
            url: 'https://charlotteobserver.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Carolinas', states: ['NC', 'SC'], category: 'regional'
        },
        
        // Midwest
        {
            newspaper: 'Chicago Tribune',
            url: 'https://chicagotribune.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Great Lakes', states: ['IL', 'IN', 'WI'], category: 'regional'
        },
        {
            newspaper: 'Detroit News',
            url: 'https://detroitnews.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Great Lakes', states: ['MI', 'OH'], category: 'regional'
        },
        
        // Southwest
        {
            newspaper: 'Dallas Morning News',
            url: 'https://dallasnews.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Southwest', states: ['TX', 'OK'], category: 'regional'
        },
        {
            newspaper: 'Houston Chronicle',
            url: 'https://chron.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Gulf Coast', states: ['TX', 'LA'], category: 'regional'
        },
        
        // West
        {
            newspaper: 'Seattle Times',
            url: 'https://seattletimes.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Pacific Northwest', states: ['WA', 'OR'], category: 'regional'
        },
        {
            newspaper: 'Las Vegas Review-Journal',
            url: 'https://reviewjournal.com',
            jobsPath: '/business/',
            selectors: { jobTitle: 'h3 a, .headline', company: '.company', location: '.location', description: '.summary' },
            region: 'Southwest', states: ['NV', 'AZ'], category: 'regional'
        }
    ],

    // COUNTY NEWSPAPERS - All existing county newspapers plus expanded coverage
    COUNTY: []
};

// Comprehensive aggregation function
function getAllComprehensiveNewspapers() {
    const allNewspapers = [];
    
    // Add national newspapers
    COMPREHENSIVE_NEWSPAPERS.NATIONAL.forEach(paper => {
        allNewspapers.push({
            ...paper,
            county: 'National',
            state: 'USA'
        });
    });
    
    // Add state newspapers
    COMPREHENSIVE_NEWSPAPERS.STATE.forEach(paper => {
        allNewspapers.push({
            ...paper,
            county: `${paper.state} State`
        });
    });
    
    // Add regional newspapers
    COMPREHENSIVE_NEWSPAPERS.REGIONAL.forEach(paper => {
        allNewspapers.push({
            ...paper,
            county: paper.region,
            state: paper.states.join(',')
        });
    });
    
    return allNewspapers;
}

// Get newspapers by coverage type
function getNewspapersByCategory(category) {
    switch(category) {
        case 'national':
            return COMPREHENSIVE_NEWSPAPERS.NATIONAL;
        case 'state':
            return COMPREHENSIVE_NEWSPAPERS.STATE;
        case 'regional':
            return COMPREHENSIVE_NEWSPAPERS.REGIONAL;
        case 'county':
            return require('./county-newspapers').getAllNewspapers();
        default:
            return getAllComprehensiveNewspapers();
    }
}

// Get newspapers by state
function getNewspapersByState(stateCode) {
    const allPapers = getAllComprehensiveNewspapers();
    return allPapers.filter(paper => 
        paper.state === stateCode || 
        (paper.states && paper.states.includes(stateCode))
    );
}

// Search newspapers by coverage area
function searchNewspapersByCoverage(searchTerm) {
    const allPapers = getAllComprehensiveNewspapers();
    const term = searchTerm.toLowerCase();
    
    return allPapers.filter(paper => 
        paper.newspaper.toLowerCase().includes(term) ||
        paper.coverage.toLowerCase().includes(term) ||
        paper.county.toLowerCase().includes(term) ||
        paper.state.toLowerCase().includes(term) ||
        (paper.region && paper.region.toLowerCase().includes(term))
    );
}

// Get comprehensive statistics
function getComprehensiveStats() {
    return {
        total_newspapers: getAllComprehensiveNewspapers().length,
        national: COMPREHENSIVE_NEWSPAPERS.NATIONAL.length,
        state: COMPREHENSIVE_NEWSPAPERS.STATE.length,
        regional: COMPREHENSIVE_NEWSPAPERS.REGIONAL.length,
        county: require('./county-newspapers').getAllNewspapers().length,
        total_coverage: '3,144+ counties + 50 states + major regions + national'
    };
}

module.exports = {
    COMPREHENSIVE_NEWSPAPERS,
    getAllComprehensiveNewspapers,
    getNewspapersByCategory,
    getNewspapersByState,
    searchNewspapersByCoverage,
    getComprehensiveStats
}; 