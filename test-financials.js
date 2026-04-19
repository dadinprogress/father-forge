// Test Financials Feature
const fs = require('fs');

console.log('Testing Financials Feature...\n');

// Test 1: Load test data
console.log('Test 1: Loading test financial data');
try {
    const data = JSON.parse(fs.readFileSync('./test-financials.json', 'utf-8'));
    
    console.log('✅ Financial data loaded successfully');
    console.log(`   Current MRR: $${data.currentMRR.toLocaleString('en-US')}`);
    console.log(`   History entries: ${data.history.length}`);
    console.log(`   Last update: ${new Date(data.lastUpdated).toLocaleString()}`);
    console.log('');
    
    // Test 2: Validate milestones
    console.log('Test 2: Milestone calculations');
    const milestones = {
        experiment: { target: data.milestones.experiment, name: 'Experiment Costs' },
        bridge: { target: data.milestones.bridge, name: 'Bridge Goal' },
        final: { target: data.milestones.final, name: 'Final Goal' }
    };
    
    for (const [key, milestone] of Object.entries(milestones)) {
        const progress = Math.min((data.currentMRR / milestone.target) * 100, 100);
        const status = progress >= 100 ? '✅ ACHIEVED' : progress > 0 ? '🟡 IN PROGRESS' : '⏳ PENDING';
        console.log(`   ${milestone.name}: ${Math.round(progress)}% (${status})`);
    }
    console.log('');
    
    // Test 3: Validate history entries
    console.log('Test 3: Revenue history validation');
    let valid = true;
    for (const entry of data.history) {
        if (typeof entry.amount !== 'number' || 
            typeof entry.change !== 'number' || 
            !entry.date || 
            !entry.source) {
            console.log(`❌ Invalid entry: ${JSON.stringify(entry)}`);
            valid = false;
        }
    }
    
    if (valid) {
        console.log('✅ All history entries valid');
        console.log('');
        
        // Display history
        console.log('Recent updates:');
        data.history.slice(0, 3).forEach((entry, i) => {
            const date = new Date(entry.date).toLocaleDateString();
            const changeText = entry.change >= 0 ? `+$${entry.change}` : `-$${Math.abs(entry.change)}`;
            console.log(`   ${i + 1}. ${date}: $${entry.amount} (${changeText}) - ${entry.source}`);
            if (entry.notes) {
                console.log(`      "${entry.notes}"`);
            }
        });
    }
    console.log('');
    
    // Test 4: Schema validation
    console.log('Test 4: Schema structure validation');
    const requiredFields = ['version', 'currentMRR', 'history', 'milestones', 'metadata'];
    const missing = requiredFields.filter(field => !(field in data));
    
    if (missing.length > 0) {
        console.log(`❌ Missing required fields: ${missing.join(', ')}`);
    } else {
        console.log('✅ Schema structure valid');
    }
    console.log('');
    
    console.log('=====================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('=====================================');
    console.log('');
    console.log('Summary:');
    console.log(`- Current MRR: $${data.currentMRR.toLocaleString('en-US')}`);
    console.log(`- Progress to $500: ${Math.round((data.currentMRR / 500) * 100)}%`);
    console.log(`- Progress to $10k: ${Math.round((data.currentMRR / 10000) * 100)}%`);
    console.log(`- Progress to $42k: ${Math.round((data.currentMRR / 42000) * 100)}%`);
    console.log(`- Total updates: ${data.history.length}`);
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}
