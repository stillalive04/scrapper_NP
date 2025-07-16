const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const CONFIG = require('./config.js');
const { getAllNewspapers, getNewspapersByState, getNewspapersByCounty } = require('./county-newspapers.js');
const enhancedDiscovery = require('./enhanced-county-discovery.js');
const comprehensiveNews = require('./comprehensive-newspapers.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize cache (15 minutes TTL)
const cache = new NodeCache({ stdTTL: CONFIG.SEARCH_SETTINGS.CACHE_DURATION_MINUTES * 60 });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Job data storage (in-memory for real-time updates)
let allJobs = [];
let lastUpdate = null;

// Helper function to delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Twitter API integration - Real tweets only
async function searchTwitterJobs(jobType, location) {
    if (!CONFIG.TWITTER.BEARER_TOKEN || CONFIG.TWITTER.BEARER_TOKEN === 'YOUR_TWITTER_BEARER_TOKEN_HERE') {
        console.log('⚠️ Twitter API not configured - skipping Twitter jobs');
        return [];
    }

    try {
        const keywords = CONFIG.JOB_KEYWORDS[jobType] || [jobType];
        const query = keywords.map(keyword => `"${keyword}" (hiring OR job OR jobs OR career)`).join(' OR ');
        
        const searchQuery = location ? `${query} ${location}` : query;
        
        const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
            headers: {
                'Authorization': `Bearer ${CONFIG.TWITTER.BEARER_TOKEN}`
            },
            params: {
                query: searchQuery,
                max_results: 50,
                'tweet.fields': 'created_at,author_id,public_metrics',
                'user.fields': 'name,username',
                'expansions': 'author_id'
            }
        });

        const tweets = response.data.data || [];
        const users = response.data.includes?.users || [];
        
        return tweets.map(tweet => {
            const author = users.find(user => user.id === tweet.author_id);
            return {
                id: `twitter-${tweet.id}`,
                title: extractJobTitle(tweet.text),
                company: author ? `@${author.username}` : 'Unknown',
                location: extractLocation(tweet.text) || location || 'Remote/Various',
                county: 'Various Counties',
                source: 'twitter',
                sourceDetail: 'Twitter Jobs',
                type: jobType,
                description: tweet.text,
                posted: formatTimeAgo(tweet.created_at),
                link: `https://twitter.com/${author?.username}/status/${tweet.id}`,
                metrics: tweet.public_metrics
            };
        });
    } catch (error) {
        console.error('Twitter API error:', error.response?.data || error.message);
        return [];
    }
}

// LinkedIn API integration (Note: LinkedIn has strict API access)
async function searchLinkedInJobs(jobType, location) {
    // LinkedIn's API is very restrictive and requires partnership approval for job searches
    // Only attempt if proper API keys are configured
    
    if (CONFIG.LINKEDIN.ACCESS_TOKEN === 'YOUR_LINKEDIN_ACCESS_TOKEN_HERE') {
        console.log('⚠️ LinkedIn API not configured - skipping LinkedIn jobs');
        return [];
    }
    
    try {
        // Using a job search API as alternative (requires proper API key setup)
        const keywords = CONFIG.JOB_KEYWORDS[jobType] || [jobType];
        const searchTerm = keywords[0];
        
        // Only proceed if we have valid configuration
        if (!searchTerm) {
            return [];
        }
        
        // Example using a hypothetical job search API
        const response = await axios.get('https://linkedin-jobs-search.p.rapidapi.com/search', {
            headers: {
                'X-RapidAPI-Key': CONFIG.LINKEDIN.ACCESS_TOKEN,
                'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
            },
            params: {
                keywords: searchTerm,
                location: location || 'United States',
                dateSincePosted: 'week'
            },
            timeout: 10000
        });

        if (!response.data || !response.data.jobs) {
            return [];
        }

        return response.data.jobs.map((job, index) => ({
            id: `linkedin-${Date.now()}-${index}`,
            title: job.title || 'Job Title Not Available',
            company: job.company || 'Company Not Listed',
            location: job.location || 'Location Not Specified',
            county: extractCounty(job.location || ''),
            source: 'linkedin',
            sourceDetail: 'LinkedIn Jobs',
            type: jobType,
            description: job.description || 'Job description not available',
            posted: job.postedDate || 'Recently',
            link: job.jobUrl || '#'
        }));
    } catch (error) {
        console.error('LinkedIn API error:', error.message);
        console.log('⚠️ LinkedIn API unavailable, skipping LinkedIn jobs');
        return [];
    }
}

// COMPREHENSIVE newspaper scraping across ALL national, state, regional, and county newspapers
async function scrapeNewspaperJobs(jobType, location) {
    const jobs = [];
    const newspapers = comprehensiveNews.getAllComprehensiveNewspapers();
    
    console.log(`🗞️ COMPREHENSIVE SCRAPING: ${newspapers.length} newspapers (national, state, regional, county) for ${jobType || 'all'} jobs...`);
    
    // Filter newspapers by location if specified
    let filteredNewspapers = newspapers;
    if (location) {
        const locationLower = location.toLowerCase();
        filteredNewspapers = newspapers.filter(paper => 
            paper.county.toLowerCase().includes(locationLower) ||
            paper.state.toLowerCase().includes(locationLower) ||
            paper.newspaper.toLowerCase().includes(locationLower)
        );
    }
    
    // Limit concurrent requests to avoid overwhelming servers
    const batchSize = 5;
    for (let i = 0; i < filteredNewspapers.length; i += batchSize) {
        const batch = filteredNewspapers.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (newspaper) => {
            try {
                return await scrapeIndividualNewspaper(newspaper, jobType, location);
            } catch (error) {
                console.error(`❌ Error scraping ${newspaper.newspaper}:`, error.message);
                return [];
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(paperJobs => jobs.push(...paperJobs));
        
        // Delay between batches to be respectful
        await delay(CONFIG.RATE_LIMITS.NEWSPAPER_DELAY_MS);
    }
    
    console.log(`📊 Found ${jobs.length} real jobs from ${filteredNewspapers.length} newspapers`);
    return jobs;
}

// Scrape individual newspaper
async function scrapeIndividualNewspaper(newspaper, jobType, location) {
    const jobs = [];
    const keywords = CONFIG.JOB_KEYWORDS[jobType] || [jobType || 'job'];
    
    try {
        console.log(`📰 Scraping ${newspaper.newspaper} (${newspaper.county}, ${newspaper.state})...`);
        
        // Try job board specific URL patterns
        const urlsToTry = [
            `${newspaper.url}${newspaper.jobsPath}`,
            newspaper.url,
            `${newspaper.url}/search`,
            `${newspaper.url}/browse-jobs`
        ].filter(url => url && !url.endsWith('undefined'));
        
        let response = null;
        let workingUrl = null;
        
        for (const url of urlsToTry) {
            try {
                response = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    },
                    timeout: 15000,
                    maxRedirects: 5
                });
                workingUrl = url;
                break;
            } catch (urlError) {
                // Try next URL
                continue;
            }
        }
        
        if (!response) {
            console.log(`⚠️ No working URL found for ${newspaper.newspaper}`);
            return jobs;
        }
        
        const $ = cheerio.load(response.data);
        
        // Job board specific selectors optimized for Idaho Statesman and Chicago Tribune
        const selectorSets = [
            newspaper.selectors,
            {
                jobTitle: '.job-title, .job-link, .listing-title, h2 a, h3 a, h4 a, a[href*="/job"], [data-job-title]',
                company: '.company, .employer, .company-name, .listing-company, [data-company]',
                location: '.location, .job-location, .listing-location, [data-location]',
                description: '.description, .summary, .job-description, .listing-description, [data-description]'
            },
            {
                jobTitle: 'article a, .result a, .search-result a, .job-result a',
                company: '.company-info, .employer-info, .org-name',
                location: '.location-info, .geo, .address',
                description: '.job-summary, .excerpt, .snippet'
            }
        ];
        
        let foundJobs = false;
        
        for (const selectors of selectorSets) {
            const jobElements = $(selectors.jobTitle);
            
            if (jobElements.length > 0) {
                foundJobs = true;
                console.log(`✅ Found ${jobElements.length} job listings on ${newspaper.newspaper}`);
                
                jobElements.each((i, element) => {
                    if (i >= CONFIG.SEARCH_SETTINGS.MAX_RESULTS_PER_SOURCE) return false;
                    
                    const $element = $(element);
                    const title = $element.text().trim();
                    
                    if (!title || title.length < 3) return;
                    
                    // Only skip extremely generic navigation titles
                    const skipPatterns = [
                        /^(jobs?|post (a )?job|find a job|job alerts?|view all jobs|search jobs)$/i,
                        /^(home|about|contact|login|register|sign up|sign in)$/i
                    ];
                    if (skipPatterns.some(pattern => pattern.test(title.toLowerCase()))) return;
                    
                    // Look for company in parent elements
                    const $parent = $element.closest('div, article, section, li');
                    const company = $parent.find(selectors.company).first().text().trim() || 
                                  $element.closest('tr').find(selectors.company).text().trim() ||
                                  'Company not specified';
                    
                    const jobLocation = $parent.find(selectors.location).first().text().trim() || 
                                      $element.closest('tr').find(selectors.location).text().trim() ||
                                      `${newspaper.county}, ${newspaper.state}`;
                    
                    const description = $parent.find(selectors.description).first().text().trim() || 
                                      $element.closest('tr').find(selectors.description).text().trim() ||
                                      'Job description not available';
                    
                    // Resolve link and ensure it points to a job ad (not news)
                    const rawLink = $element.attr('href') || workingUrl;
                    const fullJobLink = rawLink.startsWith('http') ? rawLink : `${new URL(workingUrl).origin}${rawLink}`;

                    // More permissive link filtering - only skip obvious news
                    const linkIsNews = /\/news\/|\/article\/|\/story\/|\/opinion\/|\/editorial\//.test(fullJobLink);
                    if (linkIsNews) return;

                    // Accept most job-related links (removed strict requirement)

                    // Check if job is relevant to search criteria
                    if (isRelevantJob(title, keywords)) {
                        jobs.push({
                            id: `newspaper-${newspaper.newspaper.replace(/\s+/g, '-')}-${Date.now()}-${i}`,
                            title: title,
                            company: company,
                            location: jobLocation,
                            county: newspaper.county,
                            state: newspaper.state,
                            source: 'newspaper',
                            sourceDetail: newspaper.newspaper,
                            type: jobType || 'general',
                            description: description.length > 300 ? description.substring(0, 300) + '...' : description,
                            posted: 'Recently posted',
                            link: fullJobLink,
                            scrapedAt: new Date().toISOString()
                        });
                    }
                });
                
                break; // Found jobs with this selector set, no need to try others
            }
        }
        
        if (!foundJobs) {
            console.log(`ℹ️ No job listings found on ${newspaper.newspaper} with current selectors`);
        }
        
    } catch (error) {
        console.error(`❌ Failed to scrape ${newspaper.newspaper}:`, error.message);
    }
    
    return jobs;
}

// Helper functions
function extractJobTitle(text) {
    const patterns = [
        /hiring\s+(.+?)(?:\s+at|\s+@|\s+#|$)/i,
        /(.+?)\s+position/i,
        /looking for\s+(.+?)(?:\s+at|\s+@|\s+#|$)/i,
        /(.+?)\s+job/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1].trim();
    }
    
    return text.split(' ').slice(0, 4).join(' ') + '...';
}

function extractLocation(text) {
    const locationPattern = /(?:in|at|@)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2})/;
    const match = text.match(locationPattern);
    return match ? match[1] : null;
}

function extractCounty(location) {
    // Simple county extraction - in production, use a proper geo-coding service
    const countyMap = {
        'San Francisco': 'San Francisco County',
        'Los Angeles': 'Los Angeles County',
        'New York': 'New York County',
        'Chicago': 'Cook County',
        'Austin': 'Travis County',
        'Boston': 'Suffolk County',
        'Seattle': 'King County',
        'Denver': 'Denver County',
        'Atlanta': 'Fulton County',
        'Miami': 'Miami-Dade County'
    };
    
    for (const [city, county] of Object.entries(countyMap)) {
        if (location.includes(city)) return county;
    }
    
    return 'Various Counties';
}

function isRelevantJob(title, keywords) {
    // Very permissive filtering - only reject obvious non-jobs
    const text = title.toLowerCase();
    
    // Only skip these extremely generic navigation titles
    const skipPatterns = [
        /^(jobs?|post (a )?job|find a job|job alerts?|view all jobs|manage existing job alerts|job search|search jobs)$/i,
        /^(home|about|contact|login|register|sign up|sign in)$/i,
        /^(privacy|terms|help|faq|support)$/i
    ];
    
    // If it matches skip patterns, reject it
    if (skipPatterns.some(pattern => pattern.test(text))) {
        return false;
    }
    
    // Accept everything else as potential job postings
    return true;
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
}



// API Routes
app.get('/api/jobs/search', async (req, res) => {
    try {
        const { jobType, source, location } = req.query;
        const cacheKey = `jobs-${jobType || 'all'}-${source || 'all'}-${location || 'all'}`;
        
        // Check cache first
        const cachedResults = cache.get(cacheKey);
        if (cachedResults) {
            return res.json(cachedResults);
        }
        
        let jobs = [];
        
        // Fetch from all sources or specific source
        if (!source || source === 'twitter') {
            const twitterJobs = await searchTwitterJobs(jobType, location);
            jobs = jobs.concat(twitterJobs);
        }
        
        if (!source || source === 'linkedin') {
            const linkedinJobs = await searchLinkedInJobs(jobType, location);
            jobs = jobs.concat(linkedinJobs);
        }
        
        if (!source || source === 'newspaper') {
            const newspaperJobs = await scrapeNewspaperJobs(jobType, location);
            jobs = jobs.concat(newspaperJobs);
        }
        
        // Filter by location if specified
        if (location) {
            jobs = jobs.filter(job => 
                job.location.toLowerCase().includes(location.toLowerCase()) ||
                job.county.toLowerCase().includes(location.toLowerCase())
            );
        }
        
        // Sort by most recent
        jobs.sort((a, b) => {
            const timeA = parseTimeAgo(a.posted);
            const timeB = parseTimeAgo(b.posted);
            return timeA - timeB;
        });
        
        // Always update allJobs with fresh data for immediate display
        if (jobs.length > 0) {
            // Remove duplicates and add new jobs
            const existingIds = new Set(allJobs.map(job => job.id));
            const newJobs = jobs.filter(job => !existingIds.has(job.id));
            allJobs = [...allJobs, ...newJobs].slice(-CONFIG.SEARCH_SETTINGS.MAX_RESULTS_TOTAL);
            lastUpdate = new Date().toISOString();
            
            console.log(`✅ Added ${newJobs.length} new jobs to database (total: ${allJobs.length})`);
        }
        
        // Cache results
        cache.set(cacheKey, jobs);
        
        console.log(`📤 Returning ${jobs.length} jobs to frontend`);
        res.json(jobs);
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

app.get('/api/jobs/stats', (req, res) => {
    const stats = {
        total: allJobs.length,
        newspaper: allJobs.filter(job => job.source === 'newspaper').length,
        twitter: allJobs.filter(job => job.source === 'twitter').length,
        linkedin: allJobs.filter(job => job.source === 'linkedin').length,
        lastUpdate: lastUpdate
    };
    
    res.json(stats);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        apiStatus: {
            twitter: CONFIG.TWITTER.BEARER_TOKEN !== 'YOUR_TWITTER_BEARER_TOKEN_HERE',
            linkedin: CONFIG.LINKEDIN.ACCESS_TOKEN !== 'YOUR_LINKEDIN_ACCESS_TOKEN_HERE'
        }
    });
});

// Comprehensive newspaper search endpoint - uses ALL newspapers (national, state, regional, county)
app.get('/api/jobs/comprehensive-search', async (req, res) => {
    try {
        const { jobType = 'data-analyst', category = 'all', state, limit = 50 } = req.query;
        
        console.log(`🚀 COMPREHENSIVE SEARCH: ${jobType} jobs, category: ${category}, state: ${state || 'ALL'}`);
        
        let newspapers;
        if (category === 'all') {
            newspapers = comprehensiveNews.getAllComprehensiveNewspapers();
        } else {
            newspapers = comprehensiveNews.getNewspapersByCategory(category);
        }
        
        // Filter by state if specified
        if (state) {
            newspapers = newspapers.filter(paper => 
                paper.state === state.toUpperCase() || 
                (paper.states && paper.states.includes(state.toUpperCase()))
            );
        }
        
        // Limit newspapers for faster response
        newspapers = newspapers.slice(0, parseInt(limit));
        
        console.log(`📰 Searching ${newspapers.length} newspapers across ${category} category`);
        
        const allJobs = [];
        
        // Process newspapers in batches
        const batchSize = 3;
        for (let i = 0; i < newspapers.length; i += batchSize) {
            const batch = newspapers.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async newspaper => {
                try {
                    return await scrapeIndividualNewspaper(newspaper, jobType, state);
                } catch (error) {
                    console.error(`Error scraping ${newspaper.newspaper}:`, error.message);
                    return [];
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach(jobs => allJobs.push(...jobs));
            
            // Rate limiting
            await delay(1000);
        }
        
        console.log(`✅ COMPREHENSIVE SEARCH COMPLETE: Found ${allJobs.length} jobs from ${newspapers.length} newspapers`);
        
        res.json({
            success: true,
            total_newspapers_searched: newspapers.length,
            category_searched: category,
            state_searched: state || 'ALL',
            jobs_found: allJobs.length,
            jobs: allJobs,
            coverage_stats: comprehensiveNews.getComprehensiveStats()
        });
        
    } catch (error) {
        console.error('Comprehensive search error:', error);
        res.status(500).json({ error: 'Failed to perform comprehensive search' });
    }
});

// Enhanced county discovery endpoint
app.get('/api/discover/counties/:state?', async (req, res) => {
    try {
        const { state } = req.params;
        const { limit = 5 } = req.query;
        
        console.log(`🔍 Starting enhanced county discovery for ${state || 'ALL STATES'}...`);
        
        let discoveredNewspapers;
        if (state) {
            // Discover newspapers for specific state
            discoveredNewspapers = await enhancedDiscovery.discoverStateNewspapers(state.toUpperCase(), parseInt(limit));
        } else {
            // Discover newspapers for all states (limited)
            discoveredNewspapers = await enhancedDiscovery.discoverAllUSNewspapers(10, parseInt(limit));
        }
        
        res.json({
            success: true,
            total_counties: enhancedDiscovery.getTotalUSCounties(),
            discovered_newspapers: discoveredNewspapers.length,
            newspapers: discoveredNewspapers
        });
        
    } catch (error) {
        console.error('Enhanced discovery error:', error);
        res.status(500).json({ error: 'Failed to discover newspapers' });
    }
});

// Expanded newspaper scraping with enhanced discovery
app.get('/api/jobs/enhanced-search', async (req, res) => {
    try {
        const { jobType = 'data-analyst', state, counties = 5 } = req.query;
        
        console.log(`🚀 Enhanced job search: ${jobType} in ${state || 'ALL STATES'} (${counties} counties)`);
        
        // Discover newspapers using enhanced system
        let discoveredNewspapers;
        if (state) {
            discoveredNewspapers = await enhancedDiscovery.discoverStateNewspapers(state.toUpperCase(), parseInt(counties));
        } else {
            discoveredNewspapers = await enhancedDiscovery.discoverAllUSNewspapers(5, parseInt(counties));
        }
        
        console.log(`📰 Found newspapers in ${discoveredNewspapers.length} counties`);
        
        // Scrape jobs from discovered newspapers
        const allJobs = [];
        for (const countyData of discoveredNewspapers) {
            for (const newspaper of countyData.newspapers) {
                try {
                    console.log(`📰 Scraping ${newspaper.title || newspaper.name} (${countyData.county})...`);
                    const jobs = await scrapeSpecificNewspaper(newspaper.url, jobType, countyData);
                    allJobs.push(...jobs);
                    
                    // Rate limiting
                    await delay(2000);
                } catch (error) {
                    console.error(`Error scraping ${newspaper.url}:`, error.message);
                }
            }
        }
        
        res.json({
            success: true,
            total_counties_searched: discoveredNewspapers.length,
            total_newspapers_scraped: discoveredNewspapers.reduce((sum, county) => sum + county.newspapers.length, 0),
            jobs_found: allJobs.length,
            jobs: allJobs
        });
        
    } catch (error) {
        console.error('Enhanced search error:', error);
        res.status(500).json({ error: 'Failed to perform enhanced search' });
    }
});

// Function to scrape a specific newspaper for job postings
async function scrapeSpecificNewspaper(url, jobType, countyData) {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const jobs = [];
        const keywords = CONFIG.JOB_KEYWORDS[jobType] || [jobType];
        
        // Multiple selector strategies for job listings
        const jobSelectors = [
            'a[href*="job"]', 'a[href*="career"]', 'a[href*="employment"]', 
            'a[href*="classified"]', '.job-listing', '.career-listing',
            '.classifieds a', '.jobs a', '.employment a',
            '[class*="job"]', '[class*="career"]', '[class*="employment"]'
        ];
        
        for (const selector of jobSelectors) {
            $(selector).each((index, element) => {
                if (jobs.length >= 10) return false; // Limit per newspaper
                
                const $el = $(element);
                const title = $el.text().trim();
                const link = $el.attr('href');
                
                if (!title || title.length < 5) return;
                
                // Check if job matches our keywords
                const titleLower = title.toLowerCase();
                const matchesKeyword = keywords.some(keyword => 
                    titleLower.includes(keyword.toLowerCase().replace('-', ' '))
                );
                
                if (matchesKeyword) {
                    const fullUrl = link && link.startsWith('http') ? link : 
                                   link ? new URL(link, url).toString() : url;
                    
                    jobs.push({
                        id: `enhanced-${Date.now()}-${index}`,
                        title: title,
                        company: 'Company not specified',
                        location: `${countyData.city}, ${countyData.state}`,
                        county: countyData.county,
                        source: 'newspaper',
                        sourceDetail: `Enhanced Discovery - ${countyData.county}`,
                        type: jobType,
                        description: 'Job description available at source link',
                        posted: 'Recently posted',
                        link: fullUrl
                    });
                }
            });
        }
        
        return jobs;
        
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return [];
    }
}

function parseTimeAgo(timeString) {
    const now = Date.now();
    const match = timeString.match(/(\d+)\s+(minute|hour|day)s?\s+ago/);
    if (!match) return now;
    
    const [, number, unit] = match;
    const multiplier = {
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000
    };
    
    return now - (parseInt(number) * multiplier[unit]);
}

// Auto-refresh job data every 5 minutes
setInterval(async () => {
    console.log('Auto-refreshing job data...');
    try {
        const allJobTypes = Object.keys(CONFIG.JOB_KEYWORDS);
        const newJobs = [];
        
        for (const jobType of allJobTypes) {
            try {
                const twitterJobs = await searchTwitterJobs(jobType, '');
                const linkedinJobs = await searchLinkedInJobs(jobType, '');
                const newspaperJobs = await scrapeNewspaperJobs(jobType, '');
                
                newJobs.push(...twitterJobs, ...linkedinJobs, ...newspaperJobs);
                
                // Delay between job type searches
                await delay(1000);
            } catch (error) {
                console.error(`Error fetching jobs for ${jobType}:`, error.message);
            }
        }
        
        allJobs = newJobs;
        lastUpdate = new Date().toISOString();
        console.log(`Updated ${allJobs.length} jobs`);
        
    } catch (error) {
        console.error('Auto-refresh error:', error);
    }
}, CONFIG.SEARCH_SETTINGS.AUTO_REFRESH_INTERVAL_MINUTES * 60 * 1000);

// Initial job loading function
async function loadInitialJobs() {
    console.log('🔄 Loading initial job data...');
    try {
        const allJobTypes = Object.keys(CONFIG.JOB_KEYWORDS);
        const initialJobs = [];
        
        // Load a few job types to get started
        const priorityJobTypes = ['data-analyst', 'marketing-analyst', 'sde'];
        
        for (const jobType of priorityJobTypes) {
            try {
                console.log(`📊 Loading ${jobType} jobs...`);
                const newspaperJobs = await scrapeNewspaperJobs(jobType, '');
                initialJobs.push(...newspaperJobs);
                
                // Small delay between job types
                await delay(2000);
            } catch (error) {
                console.error(`Error loading initial jobs for ${jobType}:`, error.message);
            }
        }
        
        allJobs = initialJobs;
        lastUpdate = new Date().toISOString();
        console.log(`✅ Loaded ${allJobs.length} initial jobs`);
        
    } catch (error) {
        console.error('Error loading initial jobs:', error);
    }
}

app.listen(PORT, async () => {
    console.log(`🚀 Job Scraping Server running on port ${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}`);
    console.log(`🔧 API endpoints:`);
    console.log(`   GET /api/jobs/search?jobType=&source=&location=`);
    console.log(`   GET /api/jobs/stats`);
    console.log(`   GET /api/health`);
    
    // Load initial jobs
    await loadInitialJobs();
}); 