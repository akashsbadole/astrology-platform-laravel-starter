const fs = require('fs');
const c = fs.readFileSync('src/app/notifications/index.tsx', 'utf8');
console.log('size:', c.length, 'lines:', c.split('\n').length);
console.log('has styles:', c.includes('StyleSheet.create'));
console.log('has empty:', c.includes('ListEmptyComponent'));
console.log('first line:', c.split('\n')[0]);
console.log('last line:', c.split('\n').pop());
