// Test từng route riêng lẻ
console.log('Testing individual routes...');

const routes = [
  { name: 'auth', path: './routes/auth' },
  { name: 'certificates', path: './routes/certificates' },
  { name: 'admin', path: './routes/admin' },
  { name: 'comments', path: './routes/comments' },
  { name: 'ai-ocr', path: './routes/ai-ocr' },
  { name: 'templates', path: './routes/templates' },
  { name: 'reports', path: './routes/reports' }
];

routes.forEach(route => {
  try {
    const routeModule = require(route.path);
    console.log(`✅ ${route.name}: ${typeof routeModule} - ${routeModule.constructor.name}`);
    
    // Kiểm tra xem có phải là router không
    if (typeof routeModule === 'function' && routeModule.name === 'router') {
      console.log(`   📍 ${route.name} is a valid Express router`);
    } else if (typeof routeModule === 'object' && routeModule.constructor.name === 'Function') {
      console.log(`   📍 ${route.name} is a router function`);
    } else {
      console.log(`   ⚠️ ${route.name} might not be a valid router`);
    }
  } catch (error) {
    console.error(`❌ ${route.name}: ${error.message}`);
  }
});