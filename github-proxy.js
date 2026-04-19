// Father Forge - GitHub Storage Proxy
// Securely handles GitHub API calls for lead persistence

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

class GitHubStorage {
    constructor(config) {
        this.owner = config.owner;
        this.repo = config.repo;
        this.token = config.token || process.env.GITHUB_TOKEN;
        this.baseUrl = 'https://api.github.com';
    }
    
    async getFile(path) {
        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 404) {
            return null; // File doesn't exist yet
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        
        return {
            content: JSON.parse(content),
            sha: data.sha
        };
    }
    
    async saveFile(path, content, sha = null) {
        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
        
        const body = {
            message: `Update ${path} - ${new Date().toISOString()}`,
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
        };
        
        if (sha) {
            body.sha = sha;
        }
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    async getLeads() {
        try {
            const file = await this.getFile('leads.json');
            return file ? file.content : this.getEmptyLeadsStructure();
        } catch (error) {
            console.error('Failed to load leads:', error);
            return this.getEmptyLeadsStructure();
        }
    }
    
    async saveLeads(leadsData) {
        try {
            // Get current file to get SHA
            const current = await this.getFile('leads.json');
            
            // Update metadata
            leadsData.metadata = {
                ...leadsData.metadata,
                lastUpdated: new Date().toISOString(),
                totalLeads: leadsData.leads.length
            };
            
            // Save
            return await this.saveFile('leads.json', leadsData, current?.sha);
        } catch (error) {
            console.error('Failed to save leads:', error);
            throw error;
        }
    }
    
    getEmptyLeadsStructure() {
        return {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            leads: [],
            metadata: {
                totalLeads: 0,
                lastImport: null,
                sources: []
            }
        };
    }
    
    getEmptyFinancialsStructure() {
        return {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            currentMRR: 0,
            history: [],
            milestones: {
                experiment: 500,
                bridge: 10000,
                final: 42000
            },
            metadata: {
                currency: 'USD',
                trackingStarted: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        };
    }
}

function createGitHubProxyServer(config, port = 3002) {
    const app = express();
    const storage = new GitHubStorage(config);
    
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    
    // GET /api/leads - Fetch all leads
    app.get('/api/leads', async (req, res) => {
        try {
            const data = await storage.getLeads();
            res.json({
                success: true,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // POST /api/leads - Save leads
    app.post('/api/leads', async (req, res) => {
        try {
            const leadsData = req.body;
            
            // Validate structure
            if (!leadsData.leads || !Array.isArray(leadsData.leads)) {
                throw new Error('Invalid leads data structure');
            }
            
            await storage.saveLeads(leadsData);
            
            res.json({
                success: true,
                message: 'Leads saved successfully',
                count: leadsData.leads.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // POST /api/leads/import - Import CSV leads
    app.post('/api/leads/import', async (req, res) => {
        try {
            const { leads: newLeads } = req.body;
            
            if (!Array.isArray(newLeads)) {
                throw new Error('Expected array of leads');
            }
            
            // Get existing
            const current = await storage.getLeads();
            
            // Deduplicate by email
            const existingEmails = new Set(current.leads.map(l => l.email.toLowerCase()));
            const uniqueNew = newLeads.filter(l => !existingEmails.has(l.email.toLowerCase()));
            
            // Merge
            current.leads = [...current.leads, ...uniqueNew];
            current.metadata.lastImport = new Date().toISOString();
            
            // Save
            await storage.saveLeads(current);
            
            res.json({
                success: true,
                imported: uniqueNew.length,
                skipped: newLeads.length - uniqueNew.length,
                total: current.leads.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // GET /api/financials - Fetch financial data
    app.get('/api/financials', async (req, res) => {
        try {
            const file = await storage.getFile('financials.json');
            const data = file ? file.content : storage.getEmptyFinancialsStructure();
            res.json({
                success: true,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // POST /api/financials - Save financial data
    app.post('/api/financials', async (req, res) => {
        try {
            const financialData = req.body;
            
            // Validate structure
            if (typeof financialData.currentMRR !== 'number' || !Array.isArray(financialData.history)) {
                throw new Error('Invalid financial data structure');
            }
            
            // Get current file to get SHA
            const current = await storage.getFile('financials.json');
            
            // Update metadata
            financialData.metadata = {
                ...financialData.metadata,
                lastModified: new Date().toISOString()
            };
            
            // Save
            await storage.saveFile('financials.json', financialData, current?.sha);
            
            res.json({
                success: true,
                message: 'Financials saved successfully',
                currentMRR: financialData.currentMRR
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // Health check
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            service: 'father-forge-github-proxy'
        });
    });
    
    app.listen(port, () => {
        console.log(`GitHub Proxy Server running on port ${port}`);
        console.log(`Target: ${config.owner}/${config.repo}`);
    });
    
    return app;
}

module.exports = { GitHubStorage, createGitHubProxyServer };

// Run standalone
if (require.main === module) {
    const config = {
        owner: 'dadinprogress',
        repo: 'father-forge-data',
        token: process.env.GITHUB_TOKEN
    };
    
    if (!config.token) {
        console.error('ERROR: GITHUB_TOKEN environment variable not set');
        process.exit(1);
    }
    
    createGitHubProxyServer(config);
}
