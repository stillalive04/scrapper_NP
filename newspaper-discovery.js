const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// US Counties data - all 3,144+ counties
const US_COUNTIES = [
    // This would contain all 3,144+ US counties
    // For now, let's start with major ones and build a discovery system
    
    // COMPLETE STATE COVERAGE
    // Alabama - 67 counties
    { county: "Autauga County", state: "Alabama", population: 58805 },
    { county: "Baldwin County", state: "Alabama", population: 231767 },
    { county: "Barbour County", state: "Alabama", population: 24686 },
    { county: "Bibb County", state: "Alabama", population: 22293 },
    { county: "Blount County", state: "Alabama", population: 59134 },
    { county: "Bullock County", state: "Alabama", population: 10101 },
    { county: "Butler County", state: "Alabama", population: 19051 },
    { county: "Calhoun County", state: "Alabama", population: 113605 },
    { county: "Chambers County", state: "Alabama", population: 33254 },
    { county: "Cherokee County", state: "Alabama", population: 24971 },
    { county: "Chilton County", state: "Alabama", population: 45014 },
    { county: "Choctaw County", state: "Alabama", population: 12665 },
    { county: "Clarke County", state: "Alabama", population: 23087 },
    { county: "Clay County", state: "Alabama", population: 13805 },
    { county: "Cleburne County", state: "Alabama", population: 14973 },
    { county: "Coffee County", state: "Alabama", population: 57826 },
    { county: "Colbert County", state: "Alabama", population: 57227 },
    { county: "Conecuh County", state: "Alabama", population: 11597 },
    { county: "Coosa County", state: "Alabama", population: 10387 },
    { county: "Covington County", state: "Alabama", population: 37570 },
    { county: "Crenshaw County", state: "Alabama", population: 14170 },
    { county: "Cullman County", state: "Alabama", population: 87866 },
    { county: "Dale County", state: "Alabama", population: 49326 },
    { county: "Dallas County", state: "Alabama", population: 38462 },
    { county: "DeKalb County", state: "Alabama", population: 72876 },
    { county: "Elmore County", state: "Alabama", population: 87977 },
    { county: "Escambia County", state: "Alabama", population: 36757 },
    { county: "Etowah County", state: "Alabama", population: 102721 },
    { county: "Fayette County", state: "Alabama", population: 16472 },
    { county: "Franklin County", state: "Alabama", population: 32113 },
    { county: "Geneva County", state: "Alabama", population: 25899 },
    { county: "Greene County", state: "Alabama", population: 8111 },
    { county: "Hale County", state: "Alabama", population: 14785 },
    { county: "Henry County", state: "Alabama", population: 17146 },
    { county: "Houston County", state: "Alabama", population: 107202 },
    { county: "Jackson County", state: "Alabama", population: 52579 },
    { county: "Jefferson County", state: "Alabama", population: 674721 },
    { county: "Lamar County", state: "Alabama", population: 13972 },
    { county: "Lauderdale County", state: "Alabama", population: 93564 },
    { county: "Lawrence County", state: "Alabama", population: 32924 },
    { county: "Lee County", state: "Alabama", population: 174241 },
    { county: "Limestone County", state: "Alabama", population: 103570 },
    { county: "Lowndes County", state: "Alabama", population: 10311 },
    { county: "Macon County", state: "Alabama", population: 18714 },
    { county: "Madison County", state: "Alabama", population: 395867 },
    { county: "Marengo County", state: "Alabama", population: 18863 },
    { county: "Marion County", state: "Alabama", population: 29341 },
    { county: "Marshall County", state: "Alabama", population: 96774 },
    { county: "Mobile County", state: "Alabama", population: 414809 },
    { county: "Monroe County", state: "Alabama", population: 21027 },
    { county: "Montgomery County", state: "Alabama", population: 228954 },
    { county: "Morgan County", state: "Alabama", population: 123421 },
    { county: "Perry County", state: "Alabama", population: 8511 },
    { county: "Pickens County", state: "Alabama", population: 19123 },
    { county: "Pike County", state: "Alabama", population: 33009 },
    { county: "Randolph County", state: "Alabama", population: 22913 },
    { county: "Russell County", state: "Alabama", population: 59183 },
    { county: "Shelby County", state: "Alabama", population: 223024 },
    { county: "St. Clair County", state: "Alabama", population: 91103 },
    { county: "Sumter County", state: "Alabama", population: 12427 },
    { county: "Talladega County", state: "Alabama", population: 82149 },
    { county: "Tallapoosa County", state: "Alabama", population: 41311 },
    { county: "Tuscaloosa County", state: "Alabama", population: 227036 },
    { county: "Walker County", state: "Alabama", population: 63521 },
    { county: "Washington County", state: "Alabama", population: 15388 },
    { county: "Wilcox County", state: "Alabama", population: 10600 },
    { county: "Winston County", state: "Alabama", population: 23540 },
    
    // Alaska - 29 boroughs/census areas (equivalent to counties)
    { county: "Anchorage Municipality", state: "Alaska", population: 291247 },
    { county: "Fairbanks North Star Borough", state: "Alaska", population: 95655 },
    { county: "Matanuska-Susitna Borough", state: "Alaska", population: 107081 },
    { county: "Kenai Peninsula Borough", state: "Alaska", population: 58799 },
    { county: "Juneau City and Borough", state: "Alaska", population: 32255 },
    { county: "Bethel Census Area", state: "Alaska", population: 18666 },
    { county: "Northwest Arctic Borough", state: "Alaska", population: 7793 },
    
    // This continues for all 50 states...
    // In production, this would contain all 3,144+ counties
];

// Newspaper discovery patterns
const NEWSPAPER_PATTERNS = [
    // Common newspaper website patterns
    '{city}herald.com',
    '{city}news.com', 
    '{city}times.com',
    '{city}post.com',
    '{city}gazette.com',
    '{city}tribune.com',
    '{city}daily.com',
    '{city}chronicle.com',
    '{city}journal.com',
    '{city}observer.com',
    '{city}sentinel.com',
    '{city}dispatch.com',
    '{city}record.com',
    '{city}advertiser.com',
    '{city}register.com',
    'the{city}news.com',
    '{city}independent.com',
    '{city}examiner.com',
    '{city}banner.com',
    '{city}courier.com',
    
    // County-specific patterns
    '{county}news.com',
    '{county}herald.com',
    '{county}times.com',
    '{county}gazette.com',
    
    // State/regional patterns
    '{state}local.com',
    '{region}news.com'
];

// Job section URL patterns
const JOB_URL_PATTERNS = [
    '/jobs',
    '/classifieds/jobs',
    '/employment',
    '/careers',
    '/help-wanted',
    '/job-listings',
    '/classified/employment',
    '/marketplace/jobs'
];

// Function to discover newspapers for a county
async function discoverCountyNewspapers(county, state) {
    const newspapers = [];
    const cityName = county.replace(' County', '').replace(' Parish', '').replace(' Borough', '');
    const stateName = state;
    
    console.log(`🔍 Discovering newspapers for ${county}, ${state}...`);
    
    // Generate potential newspaper URLs
    const potentialUrls = [];
    
    for (const pattern of NEWSPAPER_PATTERNS) {
        const url = pattern
            .replace('{city}', cityName.toLowerCase().replace(/\s+/g, ''))
            .replace('{county}', county.toLowerCase().replace(/\s+/g, ''))
            .replace('{state}', stateName.toLowerCase().replace(/\s+/g, ''))
            .replace('{region}', `${cityName}${stateName}`.toLowerCase().replace(/\s+/g, ''));
        
        potentialUrls.push(`https://${url}`);
        potentialUrls.push(`https://www.${url}`);
    }
    
    // Test each potential URL
    for (const baseUrl of potentialUrls) {
        try {
            const isValid = await testNewspaperUrl(baseUrl);
            if (isValid) {
                const jobUrls = await findJobSection(baseUrl);
                
                newspapers.push({
                    county: county,
                    state: state,
                    newspaper: await extractNewspaperName(baseUrl) || `${cityName} News`,
                    url: baseUrl,
                    jobsUrl: jobUrls[0] || `${baseUrl}/jobs`,
                    selectors: await detectJobSelectors(jobUrls[0] || `${baseUrl}/jobs`),
                    discoveredAt: new Date().toISOString()
                });
                
                console.log(`✅ Found: ${baseUrl}`);
                break; // Found one, move to next county
            }
        } catch (error) {
            // Continue to next URL
        }
    }
    
    // Search using search engines as fallback
    if (newspapers.length === 0) {
        const searchResults = await searchForCountyNewspapers(county, state);
        newspapers.push(...searchResults);
    }
    
    return newspapers;
}

// Test if a URL is a valid newspaper
async function testNewspaperUrl(url) {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const title = $('title').text().toLowerCase();
        const content = response.data.toLowerCase();
        
        // Check for newspaper indicators
        const newspaperIndicators = [
            'news', 'herald', 'times', 'post', 'gazette', 'tribune',
            'daily', 'chronicle', 'journal', 'observer', 'sentinel',
            'dispatch', 'record', 'advertiser', 'register', 'independent',
            'examiner', 'banner', 'courier', 'newspaper'
        ];
        
        const hasNewspaperWords = newspaperIndicators.some(word => 
            title.includes(word) || content.includes(word)
        );
        
        // Check for news-related content
        const hasNewsContent = content.includes('article') || 
                              content.includes('breaking') ||
                              content.includes('local news') ||
                              $('article').length > 0 ||
                              $('.news').length > 0;
        
        return hasNewspaperWords && hasNewsContent;
        
    } catch (error) {
        return false;
    }
}

// Find job section URLs
async function findJobSection(baseUrl) {
    const jobUrls = [];
    
    for (const pattern of JOB_URL_PATTERNS) {
        const jobUrl = `${baseUrl}${pattern}`;
        
        try {
            const response = await axios.head(jobUrl, { timeout: 5000 });
            if (response.status === 200) {
                jobUrls.push(jobUrl);
            }
        } catch (error) {
            // URL doesn't exist, continue
        }
    }
    
    return jobUrls;
}

// Extract newspaper name from website
async function extractNewspaperName(url) {
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        
        // Try to extract name from title, meta tags, or headers
        const title = $('title').text();
        const siteName = $('meta[property="og:site_name"]').attr('content');
        const headerText = $('h1, .site-title, .logo').first().text();
        
        return siteName || headerText || title || null;
    } catch (error) {
        return null;
    }
}

// Detect job listing selectors
async function detectJobSelectors(jobUrl) {
    try {
        const response = await axios.get(jobUrl, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        
        // Common job listing selectors
        const titleSelectors = [
            '.job-title', '.job-listing-title', '.title',
            'h3 a', 'h2 a', '.headline a',
            '[class*="job"] [class*="title"]'
        ];
        
        const companySelectors = [
            '.company', '.employer', '.job-company',
            '[class*="company"]', '[class*="employer"]'
        ];
        
        const locationSelectors = [
            '.location', '.job-location', '.city',
            '[class*="location"]', '[class*="city"]'
        ];
        
        const descriptionSelectors = [
            '.description', '.summary', '.job-description',
            '[class*="description"]', '[class*="summary"]'
        ];
        
        // Find the best working selectors
        const workingSelectors = {
            jobTitle: findBestSelector($, titleSelectors),
            company: findBestSelector($, companySelectors),
            location: findBestSelector($, locationSelectors),
            description: findBestSelector($, descriptionSelectors)
        };
        
        return workingSelectors;
        
    } catch (error) {
        // Return default selectors
        return {
            jobTitle: '.job-title, h3 a',
            company: '.company, .employer',
            location: '.location, .job-location',
            description: '.description, .summary'
        };
    }
}

// Find the best selector that returns the most elements
function findBestSelector($, selectors) {
    let bestSelector = selectors[0];
    let maxElements = 0;
    
    for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > maxElements) {
            maxElements = elements.length;
            bestSelector = selector;
        }
    }
    
    return bestSelector;
}

// Search for newspapers using search engines
async function searchForCountyNewspapers(county, state) {
    // This would use search APIs to find local newspapers
    // For now, return empty array - this would be implemented with
    // Google Custom Search API, Bing Search API, etc.
    return [];
}

// Main function to discover all newspapers
async function discoverAllNewspapers() {
    console.log('🚀 Starting newspaper discovery for all US counties...');
    
    const allNewspapers = [];
    const batchSize = 10;
    
    for (let i = 0; i < US_COUNTIES.length; i += batchSize) {
        const batch = US_COUNTIES.slice(i, i + batchSize);
        
        const batchPromises = batch.map(countyData => 
            discoverCountyNewspapers(countyData.county, countyData.state)
        );
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(newspapers => allNewspapers.push(...newspapers));
        
        console.log(`📊 Progress: ${i + batch.length}/${US_COUNTIES.length} counties processed`);
        console.log(`📰 Found ${allNewspapers.length} newspapers so far`);
        
        // Save progress periodically
        if ((i + batchSize) % 100 === 0) {
            await saveNewspapers(allNewspapers);
        }
        
        // Delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`🎉 Discovery complete! Found ${allNewspapers.length} newspapers across ${US_COUNTIES.length} counties`);
    await saveNewspapers(allNewspapers);
    
    return allNewspapers;
}

// Save discovered newspapers to file
async function saveNewspapers(newspapers) {
    const content = `// Auto-generated newspaper database
// Discovered: ${new Date().toISOString()}
// Total newspapers: ${newspapers.length}

const DISCOVERED_NEWSPAPERS = ${JSON.stringify(newspapers, null, 2)};

module.exports = {
    DISCOVERED_NEWSPAPERS,
    getNewspapersByState: (state) => DISCOVERED_NEWSPAPERS.filter(n => n.state === state),
    getNewspapersByCounty: (county, state) => DISCOVERED_NEWSPAPERS.filter(n => n.county === county && n.state === state),
    getAllNewspapers: () => DISCOVERED_NEWSPAPERS
};
`;
    
    fs.writeFileSync('discovered-newspapers.js', content);
    console.log(`💾 Saved ${newspapers.length} newspapers to discovered-newspapers.js`);
}

// Export functions
module.exports = {
    discoverCountyNewspapers,
    discoverAllNewspapers,
    US_COUNTIES
};

// If run directly, start discovery
if (require.main === module) {
    discoverAllNewspapers().catch(console.error);
} 