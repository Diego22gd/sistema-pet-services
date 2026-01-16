// check-models.js
const API_KEY = "AIzaSyCBdJtCWgPlPqh-iInCo4f_k0SK68kHXMc";

async function listAvailableModels() {
  console.log("🔍 Buscando modelos disponibles...");
  
  // Intentar con v1beta primero
  const urls = [
    `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
    `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
  ];
  
  for (const url of urls) {
    console.log(`\n🔗 Probando: ${url.replace(API_KEY, '***')}`);
    
    try {
      const response = await fetch(url);
      console.log(`📡 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ÉXITO! Encontrados ${data.models?.length || 0} modelos:`);
        
        if (data.models) {
          // Filtrar solo modelos de generación
          const generationModels = data.models.filter(model => 
            model.name.includes('generateContent') || 
            model.supportedGenerationMethods?.includes('generateContent')
          );
          
          generationModels.forEach(model => {
            console.log(`\n📋 Modelo: ${model.name}`);
            console.log(`   Descripción: ${model.description || 'Sin descripción'}`);
            console.log(`   Métodos soportados: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
            console.log(`   Versión: ${model.version || 'N/A'}`);
          });
        }
        return;
      } else {
        const error = await response.text();
        console.log(`❌ Error: ${error.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`❌ Excepción: ${error.message}`);
    }
  }
  
  console.log("\n⚠️ No se pudieron listar modelos. Tu API Key puede no tener permisos.");
}

listAvailableModels();