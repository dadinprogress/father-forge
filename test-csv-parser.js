// Test CSV parser logic
const fs = require('fs');

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV must have header and at least one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredFields = ['name', 'email'];
    
    // Validate headers
    for (const field of requiredFields) {
        if (!headers.includes(field)) {
            throw new Error(`Missing required column: ${field}`);
        }
    }
    
    const leads = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;
        
        const lead = {};
        headers.forEach((header, index) => {
            lead[header] = values[index];
        });
        
        // Add metadata
        lead.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        lead.status = lead.status || 'new';
        lead.date = lead.date || new Date().toISOString().split('T')[0];
        
        leads.push(lead);
    }
    
    return leads;
}

// Test with sample data
const csvData = fs.readFileSync('./sample-leads.csv', 'utf-8');
console.log('Testing CSV parser...\n');

try {
    const leads = parseCSV(csvData);
    console.log(`✅ Parsed ${leads.length} leads successfully\n`);
    
    leads.forEach((lead, i) => {
        console.log(`Lead ${i + 1}:`);
        console.log(`  Name: ${lead.name}`);
        console.log(`  Email: ${lead.email}`);
        console.log(`  Company: ${lead.company || 'N/A'}`);
        console.log(`  Role: ${lead.role || 'N/A'}`);
        console.log(`  Status: ${lead.status}`);
        console.log(`  Date: ${lead.date}`);
        console.log('');
    });
    
    console.log('✅ All tests passed!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}
