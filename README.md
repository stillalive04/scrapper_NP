#  US Job Posting Tracker

**Real-time job posting tracker** that automatically scrapes job opportunities from newspapers across the United States covering 3,144+ counties. No login required, no database needed - just pure real-time job data.

##  Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd crush

# Install dependencies
npm install

# Start the server
npm start

# Open http://localhost:3001 in your browser
```

## Features

### **Real-Time Data Sources**
- 📰 **Comprehensive Newspaper Scraping**: 53+ major US newspapers job sections
- 🎯 **Smart Job Filtering**: Marketing, SEO, DevOps, ML Engineer, Data Analyst, and more
- 🌍 **Nationwide Coverage**: All 3,144+ US counties with county-level attribution

### **Job Categories Tracked**
- Marketing Analyst, SEO Specialist, DevOps Engineer
- ML Engineer, Tableau Developer, Data Analyst  
- Business Analyst, Software Development Engineer (SDE)
- And many more job types

### **Smart Search & Filtering**
- Filter by job type, source, and geographic location
- Real-time statistics and live counters
- Auto-refresh every 5 minutes for latest postings
- County-level job attribution and filtering

### **Geographic Coverage**
- **3,144+ US Counties**: Comprehensive nationwide coverage
- **National Newspapers**: USA Today, Wall Street Journal, New York Times, Washington Post
- **State & Regional Papers**: Major papers from all 50 states
- **County Newspapers**: Local papers for detailed coverage

##  Tech Stack

- **Backend**: Node.js, Express.js
- **Scraping**: Cheerio, Axios for web scraping
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Caching**: In-memory caching with auto-refresh
- **No Database**: Stateless, real-time operation

## 📁 Project Structure

```
├── server.js                       
├── config.js                    
├── package.json                 
├── index.html                  
├── styles.css                  
├── script.js                    
├── comprehensive-newspapers.js  
├── enhanced-county-discovery.js 
├── county-newspapers.js         
├── all-counties-database.js    
├── newspaper-discovery.js      
└── README.md                    
```

## 🔧 Configuration

Edit `config.js` to customize:

- **Rate Limits**: Requests per hour by source
- **Newspaper Sources**: Add/remove newspaper websites
- **Job Keywords**: Customize search terms per job type
- **Refresh Intervals**: Auto-update frequency
- **Cache Settings**: Data caching duration

## 📊 Real-Time Features

- **Automatic Refresh**: Jobs update every 5 minutes
- **Live Statistics**: Real-time counters by source
- **Smart Caching**: 15-minute cache for performance
- **Rate Limiting**: Respectful scraping with delays
- **Error Handling**: Graceful fallbacks and notifications

## 🌐 API Endpoints

- `GET /api/jobs/search?jobType=&source=&location=` - Search jobs
- `GET /api/jobs/stats` - Get live statistics  
- `GET /api/health` - Server health check

Performance

- **Concurrent Scraping**: Multiple sources scraped in parallel
- **Smart Caching**: Reduces requests and improves speed
- **Rate Limiting**: Prevents server overload
- **Efficient Parsing**: Optimized DOM selection and processing

Use Cases

- **Job Seekers**: Find latest opportunities across multiple sources
- **Recruiters**: Monitor job market trends and competition
- **Researchers**: Analyze job posting patterns and geographic distribution
- **Businesses**: Track hiring activity in specific industries/locations

Security & Ethics

- **Respectful Scraping**: Rate limiting and delays between requests
- **No Personal Data**: Only processes public job postings
- **CORS Protection**: Secure cross-origin requests
- **Error Handling**: Graceful degradation when sources are unavailable

Troubleshooting

Common Issues

1. **Port Already in Use**
   ```bash
   # Kill existing process on port 3001
   lsof -ti:3001 | xargs kill -9
   ```

2. **No Jobs Found**
   - Check console logs for scraping errors
   - Verify newspaper URLs are accessible
   - Some newspapers may have changed their structure

3. **Slow Performance**
   - Reduce concurrent scraping in config.js
   - Increase cache duration
   - Check network connectivity

### Console Logs

The server provides detailed logging:
Successful job scraping
Warnings for unavailable sources
Error messages with details
Statistics and counters

License

MIT License - Free for personal and commercial use.

Acknowledgments

- Built with Node.js and Express
- Web scraping powered by Cheerio and Axios
- Comprehensive US newspaper database
- Real-time job market insights


**Ready to start?** Run `npm start` and open http://localhost:3001 to begin tracking jobs across the US! 
