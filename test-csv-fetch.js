// Test CSV fetching from Google Sheets
const CSV_URL = 'https://docs.google.com/spreadsheets/d/1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec/export?format=csv&gid=0';

async function testCSVFetch() {
    try {
        console.log('🧪 Testing CSV fetch from Google Sheets...');
        console.log('📊 URL:', CSV_URL);
        
        const response = await fetch(CSV_URL);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('📄 CSV Content:');
        console.log(csvText);
        
        const rows = csvText.split('\n').filter(row => row.trim());
        console.log(`📊 Found ${rows.length} rows`);
        
        if (rows.length > 0) {
            console.log('📋 Headers:', rows[0]);
            if (rows.length > 1) {
                console.log('📋 Sample data:', rows[1]);
            }
        }
        
        return csvText;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
}

// Test profile lookup
async function testProfileLookup(profileId) {
    try {
        const csvText = await testCSVFetch();
        if (!csvText) return;
        
        console.log(`\n🔍 Looking for profile: ${profileId}`);
        
        const rows = csvText.split('\n').filter(row => row.trim());
        const headers = parseCSVRow(rows[0]);
        
        for (let i = 1; i < rows.length; i++) {
            const data = parseCSVRow(rows[i]);
            if (data[0] && data[0].toString().trim() === profileId.toString().trim()) {
                console.log('✅ Profile found!');
                console.log('📋 Profile data:');
                headers.forEach((header, index) => {
                    console.log(`  ${header}: ${data[index] || ''}`);
                });
                return true;
            }
        }
        
        console.log('❌ Profile not found');
        return false;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Run tests
console.log('🚀 Starting GitHub Integration Tests');
testCSVFetch().then(() => {
    testProfileLookup('profile_1753659290537_8ewsw4s6l');
});
