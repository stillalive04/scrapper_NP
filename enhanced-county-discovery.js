// Enhanced County Discovery System for All 3,144+ US Counties
// Real-time newspaper discovery across the entire United States

const axios = require('axios');
const cheerio = require('cheerio');

// Complete US County Data - efficiently structured
const US_STATES_COUNTIES = {
    'AL': { name: 'Alabama', counties: 67 },
    'AK': { name: 'Alaska', counties: 29 },
    'AZ': { name: 'Arizona', counties: 15 },
    'AR': { name: 'Arkansas', counties: 75 },
    'CA': { name: 'California', counties: 58 },
    'CO': { name: 'Colorado', counties: 64 },
    'CT': { name: 'Connecticut', counties: 8 },
    'DE': { name: 'Delaware', counties: 3 },
    'FL': { name: 'Florida', counties: 67 },
    'GA': { name: 'Georgia', counties: 159 },
    'HI': { name: 'Hawaii', counties: 5 },
    'ID': { name: 'Idaho', counties: 44 },
    'IL': { name: 'Illinois', counties: 102 },
    'IN': { name: 'Indiana', counties: 92 },
    'IA': { name: 'Iowa', counties: 99 },
    'KS': { name: 'Kansas', counties: 105 },
    'KY': { name: 'Kentucky', counties: 120 },
    'LA': { name: 'Louisiana', counties: 64 },
    'ME': { name: 'Maine', counties: 16 },
    'MD': { name: 'Maryland', counties: 24 },
    'MA': { name: 'Massachusetts', counties: 14 },
    'MI': { name: 'Michigan', counties: 83 },
    'MN': { name: 'Minnesota', counties: 87 },
    'MS': { name: 'Mississippi', counties: 82 },
    'MO': { name: 'Missouri', counties: 115 },
    'MT': { name: 'Montana', counties: 56 },
    'NE': { name: 'Nebraska', counties: 93 },
    'NV': { name: 'Nevada', counties: 17 },
    'NH': { name: 'New Hampshire', counties: 10 },
    'NJ': { name: 'New Jersey', counties: 21 },
    'NM': { name: 'New Mexico', counties: 33 },
    'NY': { name: 'New York', counties: 62 },
    'NC': { name: 'North Carolina', counties: 100 },
    'ND': { name: 'North Dakota', counties: 53 },
    'OH': { name: 'Ohio', counties: 88 },
    'OK': { name: 'Oklahoma', counties: 77 },
    'OR': { name: 'Oregon', counties: 36 },
    'PA': { name: 'Pennsylvania', counties: 67 },
    'RI': { name: 'Rhode Island', counties: 5 },
    'SC': { name: 'South Carolina', counties: 46 },
    'SD': { name: 'South Dakota', counties: 66 },
    'TN': { name: 'Tennessee', counties: 95 },
    'TX': { name: 'Texas', counties: 254 },
    'UT': { name: 'Utah', counties: 29 },
    'VT': { name: 'Vermont', counties: 14 },
    'VA': { name: 'Virginia', counties: 95 },
    'WA': { name: 'Washington', counties: 39 },
    'WV': { name: 'West Virginia', counties: 55 },
    'WI': { name: 'Wisconsin', counties: 72 },
    'WY': { name: 'Wyoming', counties: 23 },
    'DC': { name: 'District of Columbia', counties: 1 }
};

// Comprehensive newspaper URL patterns for maximum coverage
const ENHANCED_URL_PATTERNS = [
    // Primary patterns
    '{city}news', '{city}herald', '{city}times', '{city}record', 
    '{city}press', '{city}gazette', '{city}journal', '{city}tribune',
    '{city}observer', '{city}democrat', '{city}republican', '{city}courier',
    '{city}examiner', '{city}bulletin', '{city}sentinel', '{city}dispatch',
    '{city}chronicle', '{city}beacon', '{city}standard', '{city}advocate',
    '{city}register', '{city}leader', '{city}enterprise', '{city}star',
    '{city}mirror', '{city}post', '{city}daily', '{city}weekly',
    
    // With "the" prefix
    'the{city}news', 'the{city}herald', 'the{city}times', 'the{city}record',
    
    // Modern patterns
    '{city}today', '{city}now', '{city}online', '{city}report',
    '{city}review', '{city}voice', '{city}sun', '{city}globe',
    '{city}independent', '{city}messenger', '{city}argus',
    
    // County-based patterns
    '{county}news', '{county}herald', '{county}times', '{county}record',
    '{county}press', '{county}gazette', '{county}journal',
    
    // Hyphenated city names
    '{city}-news', '{city}-herald', '{city}-times', '{city}-record',
    
    // Local variations
    '{city}local', '{city}community', '{city}citizen', '{city}resident',
    '{state}{city}', '{city}{state}', 'my{city}', '{city}area'
];

// Domain extensions to try
const DOMAIN_EXTENSIONS = ['.com', '.net', '.org', '.us', '.news'];

// Major county seats and cities for each state (sample data for key counties)
const MAJOR_COUNTIES_BY_STATE = {
    'AL': [
        { name: 'Jefferson County', city: 'Birmingham', population: 658000 },
        { name: 'Mobile County', city: 'Mobile', population: 414000 },
        { name: 'Madison County', city: 'Huntsville', population: 388000 },
        { name: 'Montgomery County', city: 'Montgomery', population: 229000 },
        { name: 'Tuscaloosa County', city: 'Tuscaloosa', population: 227000 }
    ],
    'AK': [
        { name: 'Anchorage Municipality', city: 'Anchorage', population: 291000 },
        { name: 'Fairbanks North Star Borough', city: 'Fairbanks', population: 95000 },
        { name: 'Matanuska-Susitna Borough', city: 'Palmer', population: 107000 },
        { name: 'Kenai Peninsula Borough', city: 'Soldotna', population: 58000 },
        { name: 'Juneau City and Borough', city: 'Juneau', population: 32000 }
    ],
    'AZ': [
        { name: 'Maricopa County', city: 'Phoenix', population: 4700000 },
        { name: 'Pima County', city: 'Tucson', population: 1040000 },
        { name: 'Pinal County', city: 'Florence', population: 425000 },
        { name: 'Yavapai County', city: 'Prescott', population: 236000 },
        { name: 'Mohave County', city: 'Kingman', population: 213000 }
    ],
    'AR': [
        { name: 'Pulaski County', city: 'Little Rock', population: 393000 },
        { name: 'Washington County', city: 'Fayetteville', population: 245000 },
        { name: 'Benton County', city: 'Bentonville', population: 284000 },
        { name: 'Sebastian County', city: 'Fort Smith', population: 127000 },
        { name: 'Craighead County', city: 'Jonesboro', population: 111000 }
    ],
    'CA': [
        { name: 'Los Angeles County', city: 'Los Angeles', population: 10000000 },
        { name: 'San Diego County', city: 'San Diego', population: 3300000 },
        { name: 'Orange County', city: 'Santa Ana', population: 3200000 },
        { name: 'Riverside County', city: 'Riverside', population: 2400000 },
        { name: 'San Bernardino County', city: 'San Bernardino', population: 2180000 },
        { name: 'Santa Clara County', city: 'San Jose', population: 1930000 },
        { name: 'Alameda County', city: 'Oakland', population: 1680000 },
        { name: 'Sacramento County', city: 'Sacramento', population: 1550000 },
        { name: 'Contra Costa County', city: 'Martinez', population: 1150000 },
        { name: 'Fresno County', city: 'Fresno', population: 1000000 }
    ]
    // This would continue for all states...
};

// Function to generate newspaper URLs for any city/county
function generateNewspaperURLs(cityName, countyName, stateName, stateCode) {
    const urls = [];
    const city = cityName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
    const county = countyName.toLowerCase().replace(/\s+county/i, '').replace(/\s+/g, '').replace(/[^a-z]/g, '');
    const state = stateCode.toLowerCase();
    
    // Generate URLs from patterns
    for (const pattern of ENHANCED_URL_PATTERNS) {
        for (const extension of DOMAIN_EXTENSIONS) {
            let url = pattern.replace('{city}', city)
                            .replace('{county}', county)
                            .replace('{state}', state);
            
            urls.push(`https://${url}${extension}`);
            urls.push(`https://www.${url}${extension}`);
        }
    }
    
    return [...new Set(urls)]; // Remove duplicates
}

// Function to test if a newspaper URL is active and has job content
async function testNewspaperURL(url, timeout = 5000) {
    try {
        const response = await axios.get(url, {
            timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        if (response.status === 200 && response.data) {
            const $ = cheerio.load(response.data);
            
            // Check if it's a newspaper/news site
            const title = $('title').text().toLowerCase();
            const content = $.text().toLowerCase();
            
            const newsKeywords = ['news', 'newspaper', 'herald', 'times', 'gazette', 'journal', 'tribune', 'press', 'observer'];
            const hasNewsKeywords = newsKeywords.some(keyword => 
                title.includes(keyword) || content.includes(keyword)
            );
            
            // Look for job-related content
            const jobKeywords = ['jobs', 'employment', 'careers', 'classifieds', 'hiring'];
            const hasJobContent = jobKeywords.some(keyword => 
                title.includes(keyword) || content.includes(keyword)
            );
            
            // Look for common job section selectors
            const jobSelectors = [
                'a[href*="job"]', 'a[href*="career"]', 'a[href*="employment"]',
                'a[href*="classified"]', '.job', '.career', '.employment',
                '[href*="jobs"]', '[href*="careers"]'
            ];
            
            const hasJobLinks = jobSelectors.some(selector => $(selector).length > 0);
            
            if (hasNewsKeywords && (hasJobContent || hasJobLinks)) {
                return {
                    url,
                    active: true,
                    hasJobSection: hasJobContent || hasJobLinks,
                    title: $('title').text().trim(),
                    score: (hasJobContent ? 2 : 0) + (hasJobLinks ? 1 : 0) + (hasNewsKeywords ? 1 : 0)
                };
            }
        }
        
        return { url, active: false };
    } catch (error) {
        return { url, active: false, error: error.message };
    }
}

// Function to discover newspapers for a specific county
async function discoverCountyNewspapers(countyName, cityName, stateCode, batchSize = 10) {
    console.log(`🔍 Discovering newspapers for ${countyName}, ${cityName}, ${stateCode}...`);
    
    const urls = generateNewspaperURLs(cityName, countyName, US_STATES_COUNTIES[stateCode]?.name || '', stateCode);
    const workingNewspapers = [];
    
    // Test URLs in batches to avoid overwhelming servers
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const results = await Promise.allSettled(
            batch.map(url => testNewspaperURL(url))
        );
        
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.active) {
                workingNewspapers.push(result.value);
            }
        }
        
        // Small delay between batches
        if (i + batchSize < urls.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Sort by score (best newspapers first)
    workingNewspapers.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    console.log(`✅ Found ${workingNewspapers.length} working newspapers for ${countyName}`);
    return workingNewspapers;
}

// Function to discover newspapers for all counties in a state
async function discoverStateNewspapers(stateCode, maxCounties = null) {
    console.log(`🗺️ Discovering newspapers for all counties in ${stateCode}...`);
    
    const counties = MAJOR_COUNTIES_BY_STATE[stateCode] || [];
    const stateNewspapers = [];
    
    const countiestoProcess = maxCounties ? counties.slice(0, maxCounties) : counties;
    
    for (const county of countiestoProcess) {
        try {
            const newspapers = await discoverCountyNewspapers(county.name, county.city, stateCode, 5);
            if (newspapers.length > 0) {
                stateNewspapers.push({
                    county: county.name,
                    city: county.city,
                    state: stateCode,
                    population: county.population,
                    newspapers
                });
            }
            
            // Rate limiting between counties
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`Error discovering newspapers for ${county.name}:`, error.message);
        }
    }
    
    return stateNewspapers;
}

// Function to discover newspapers across all US counties (massive operation)
async function discoverAllUSNewspapers(statesLimit = null, countiesPerState = 5) {
    console.log(`🇺🇸 Starting comprehensive newspaper discovery across all US counties...`);
    
    const allNewspapers = [];
    const statesToProcess = statesLimit ? 
        Object.keys(US_STATES_COUNTIES).slice(0, statesLimit) : 
        Object.keys(US_STATES_COUNTIES);
    
    for (const stateCode of statesToProcess) {
        console.log(`\n📍 Processing ${US_STATES_COUNTIES[stateCode].name} (${stateCode})...`);
        
        try {
            const stateNewspapers = await discoverStateNewspapers(stateCode, countiesPerState);
            allNewspapers.push(...stateNewspapers);
            
            console.log(`✅ ${US_STATES_COUNTIES[stateCode].name}: Found newspapers in ${stateNewspapers.length} counties`);
            
            // Rate limiting between states
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error(`Error processing state ${stateCode}:`, error.message);
        }
    }
    
    console.log(`\n🎉 Discovery complete! Found newspapers in ${allNewspapers.length} counties across ${statesToProcess.length} states`);
    return allNewspapers;
}

// Function to get total US county count
function getTotalUSCounties() {
    return Object.values(US_STATES_COUNTIES).reduce((total, state) => total + state.counties, 0);
}

// Function to expand county database with discovered newspapers
function createExpandedCountyDatabase(discoveredNewspapers) {
    const database = {};
    
    for (const entry of discoveredNewspapers) {
        if (!database[entry.state]) {
            database[entry.state] = {};
        }
        
        database[entry.state][entry.county] = {
            city: entry.city,
            population: entry.population,
            newspapers: entry.newspapers.map(np => ({
                name: np.title,
                url: np.url,
                hasJobSection: np.hasJobSection,
                score: np.score
            }))
        };
    }
    
    return database;
}

module.exports = {
    US_STATES_COUNTIES,
    ENHANCED_URL_PATTERNS,
    MAJOR_COUNTIES_BY_STATE,
    generateNewspaperURLs,
    testNewspaperURL,
    discoverCountyNewspapers,
    discoverStateNewspapers,
    discoverAllUSNewspapers,
    getTotalUSCounties,
    createExpandedCountyDatabase
}; 