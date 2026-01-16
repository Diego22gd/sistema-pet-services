// src/routes/chat.js - VERSIÓN CORREGIDA CON MODELO 2.5 FLASH
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Business from "../models/Business.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// ============================================
// 🔧 CONFIGURACIÓN ACTUALIZADA CON MODELO CORRECTO
// ============================================

// 🔐 API KEY - usar gemini-2.5-flash que SÍ está disponible
const GEMINI_API_KEY = "AIzaSyCBdJtCWgPlPqh-iInCo4f_k0SK68kHXMc";
const GEMINI_MODEL = "gemini-2.5-flash"; // ✅ MODELO CORRECTO

console.log("🔧 ======= CONFIGURACIÓN CHAT =======");
console.log("🤖 API Key configurada");
console.log("📝 Modelo:", GEMINI_MODEL, "(modelo disponible)");
console.log("🔑 Key (inicio):", GEMINI_API_KEY.substring(0, 10) + "...");

// URL CORRECTA para gemini-2.5-flash
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

console.log("🔗 URL de API configurada");
console.log("🔧 ==================================\n");

// ============================================
// 🧪 FUNCIÓN DE PRUEBA ACTUALIZADA
// ============================================

async function testGeminiConnection() {
  console.log("🧪 PROBANDO CONEXIÓN CON GEMINI 2.5 FLASH...");
  
  const url = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
  console.log("🔗 URL:", url.replace(GEMINI_API_KEY, '***'));
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Responde solo con la palabra 'CONECTADO'" }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 20,
          topP: 0.9
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("📡 Status:", response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin texto';
      console.log("✅ GEMINI 2.5 FLASH FUNCIONA CORRECTAMENTE!");
      console.log("📝 Respuesta:", reply);
      return { 
        success: true, 
        model: GEMINI_MODEL,
        message: "Conexión exitosa con Gemini 2.5 Flash"
      };
    } else {
      const errorText = await response.text();
      console.error("❌ Error:", errorText.substring(0, 200));
      
      // Si falla 2.5-flash, probar con 2.0-flash como alternativa
      console.log("🔄 Probando con gemini-2.0-flash como alternativa...");
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      try {
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "OK" }] }]
          })
        });
        
        if (fallbackResponse.ok) {
          console.log("✅ gemini-2.0-flash funciona");
          return { 
            success: true, 
            model: "gemini-2.0-flash",
            message: "Usando gemini-2.0-flash como alternativa"
          };
        }
      } catch (fallbackError) {
        console.log("❌ Fallback también falló:", fallbackError.message);
      }
      
      return { 
        success: false, 
        error: `HTTP ${response.status}`,
        details: errorText.substring(0, 200),
        suggestion: "Verifica que el modelo esté disponible en tu región"
      };
    }
  } catch (error) {
    console.log("❌ Excepción:", error.message);
    return { 
      success: false, 
      error: error.message,
      suggestion: "Error de red o timeout"
    };
  }
}

// Ejecutar prueba al iniciar
let connectionTest = null;
(async () => {
  console.log("\n🚀 EJECUTANDO PRUEBA INICIAL...");
  connectionTest = await testGeminiConnection();
  console.log("📊 RESULTADO:", connectionTest.success ? "✅ CONECTADO" : "❌ FALLÓ");
  if (connectionTest.success) {
    console.log("🤖 Modelo activo:", connectionTest.model);
  } else {
    console.log("💡 El chatbot usará respuestas predefinidas.");
  }
})();

// ============================================
// 🚀 FUNCIÓN PRINCIPAL PARA GEMINI 2.5 FLASH
// ============================================

async function callGeminiAPI(prompt, role = "client") {
  console.log(`\n🤖 [${role}] Llamando a Gemini...`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}${prompt.length > 80 ? '...' : ''}`);
  
  // Si la prueba inicial falló, usar fallback
  if (connectionTest && !connectionTest.success) {
    console.log(`   ⚠️ Usando fallback (Gemini no disponible)`);
    return getFallbackResponse("general", role);
  }
  
  // Usar modelo que funcionó en la prueba
  const modelToUse = connectionTest?.model || GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`;
  
  console.log(`   Modelo: ${modelToUse}`);
  
  try {
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`   📡 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ Error ${response.status}:`, errorText.substring(0, 150));
      
      if (response.status === 403) {
        throw new Error("API Key inválida o sin permisos");
      } else if (response.status === 429) {
        throw new Error("Límite de cuota excedido");
      } else if (response.status === 404) {
        throw new Error(`Modelo ${modelToUse} no encontrado`);
      } else {
        throw new Error(`Error HTTP ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const reply = data.candidates[0].content.parts[0].text.trim();
      console.log(`   ✅ Respuesta recibida (${reply.length} caracteres)`);
      return reply;
    } else if (data?.error) {
      console.error("   ❌ Error en respuesta:", data.error);
      throw new Error(data.error.message || "Error de Gemini");
    } else {
      throw new Error("Respuesta vacía de Gemini");
    }
    
  } catch (error) {
    console.error(`   ❌ Error en Gemini:`, error.message);
    
    if (error.name === 'AbortError') {
      return "⏰ **Tiempo de espera agotado.** Por favor, intenta nuevamente.";
    }
    
    if (error.message.includes('API Key') || error.message.includes('403')) {
      return `🔐 **Error de autenticación.** Verifica tu configuración.`;
    }
    
    if (error.message.includes('cuota') || error.message.includes('429')) {
      return `📊 **Límite de uso alcanzado.** Intenta más tarde.`;
    }
    
    return getFallbackResponse("general", role);
  }
}

// ============================================
// 🛡️ RESPUESTAS PREDEFINIDAS (mejoradas)
// ============================================

function getFallbackResponse(intent = "general", role = "client") {
  const responses = {
    client: {
      general: `¡Hola! Soy PetBot, tu asistente de PetServices. 🤖

**Puedo ayudarte con:**
• 🏢 **Comercios** - Buscar veterinarias, peluquerías, guarderías
• 🛎️ **Servicios** - Ver catálogo de servicios disponibles
• 📅 **Citas** - Consultar tus citas agendadas
• 🐾 **Mascotas** - Ver tus mascotas registradas
• 💰 **Precios** - Rangos de precios por servicio
• 🚑 **Emergencias** - Contactos de urgencia

**¿En qué puedo ayudarte hoy?**`,

      list_businesses: `🏢 **Comercios Disponibles**

**Categorías:**
• 🏥 **Veterinarias y clínicas** - Consultas, vacunas, emergencias
• ✂️ **Peluquerías caninas** - Baño, corte, estética profesional
• 🏠 **Guarderías y hoteles** - Cuidado diurno y nocturno
• 🎯 **Entrenadores** - Adiestramiento básico y avanzado
• 🍎 **Tiendas de mascotas** - Alimentos, juguetes, accesorios

**Para buscar comercios:**
1. Ve al menú principal → "Buscar Comercios"
2. Filtra por categoría, ubicación o calificación
3. Revisa perfiles completos con fotos
4. Contacta directamente para más información

**💡 Recomendación:** Filtra por calificación ⭐ 4.0+ para mejores experiencias.`,

      list_services: `🛎️ **Catálogo de Servicios**

**🏥 SERVICIOS VETERINARIOS:**
• **Consulta general** - Examen básico ($20-$60)
• **Vacunación** - Programa completo ($15-$45 por vacuna)
• **Desparasitación** - Interna y externa ($10-$35)
• **Cirugías** - Esterilización, limpieza dental ($100-$800+)
• **Diagnóstico** - Rayos X, análisis de sangre ($40-$150)
• **Hospitalización** - Cuidado 24/7 ($50-$200/día)

**✂️ SERVICIOS DE ESTÉTICA:**
• **Baño básico** - Champú, secado ($15-$40)
• **Corte completo** - Estilizado por raza ($25-$90)
• **Corte de uñas** - Incluye limpieza ($10-$25)
• **Limpieza dental** - Profesional ($25-$60)
• **Corte higiénico** - Zonas específicas ($15-$35)
• **SPA mascota** - Tratamientos especiales ($30-$100)

**🏠 SERVICIOS DE CUIDADO:**
• **Guardería diurna** - Cuidado supervisado ($15-$50/día)
• **Paseos** - Individuales o grupales ($10-$30/paseo)
• **Visitas a domicilio** - Alimentación y compañía ($20-$50/visita)
• **Hospedaje nocturno** - Con vigilancia ($25-$70/noche)
• **Transporte** - Seguro y cómodo ($15-$40/trayecto)

**🎯 SERVICIOS DE ENTRENAMIENTO:**
• **Entrenamiento básico** - Órdenes esenciales ($30-$80/sesión)
• **Corrección conductual** - Problemas específicos ($40-$100/sesión)
• **Socialización** - Interacción con otros perros ($25-$60/sesión)
• **Entrenamiento avanzado** - Agility, obediencia ($50-$120/sesión)

**💡 Nota:** Los precios varían según tamaño de mascota, ubicación y experiencia del proveedor. Contacta directamente para cotizaciones exactas.`,

      get_user_pets: `🐾 **Tus Mascotas Registradas**

Para gestionar tus mascotas:

**📋 PASOS PARA AGREGAR UNA MASCOTA:**
1. Accede a tu perfil → "Mis Mascotas"
2. Haz clic en **"Agregar Mascota"** (botón verde)
3. Completa el formulario:
   - **Nombre:** Nombre de tu mascota
   - **Tipo:** Perro, Gato, Otro
   - **Raza:** (opcional) Especifica la raza
   - **Edad:** En años o meses
   - **Peso:** En kg (importante para dosificaciones)
   - **Sexo:** Macho / Hembra
   - **Esterilizado:** Sí / No
4. **Información médica importante:**
   - Alergias conocidas
   - Medicamentos actuales
   - Condiciones crónicas
   - Historial de vacunas
5. **Sube una foto** para identificación fácil
6. Guarda los cambios

**🔧 FUNCIONALIDADES DISPONIBLES:**
• **Ver historial completo** de servicios por mascota
• **Agregar notas médicas** después de cada visita
• **Recordatorios** de vacunas y desparasitaciones
• **Compartir información** con proveedores de servicios

**⚠️ IMPORTANTE:** Mantén actualizada la información médica. Esto ayuda a los proveedores a ofrecer el mejor cuidado.`,

      book_appointment: `📅 **Cómo Agendar una Cita**

**✅ PASOS PARA AGENDAR:**

1. **🔍 BUSCA COMERCIOS**
   - Ve a "Buscar Comercios" en el menú principal
   - Filtra por servicio, ubicación o calificación
   - Revisa perfiles, servicios y precios

2. **🛎️ SELECCIONA SERVICIO**
   - Elige el servicio que necesitas
   - Revisa disponibilidad del proveedor
   - Verifica requisitos específicos

3. **📅 ELIGE FECHA Y HORA**
   - Selecciona de los horarios disponibles
   - Considera tiempo de traslado
   - Agenda con anticipación (24-48 horas recomendado)

4. **🐾 COMPLETA INFORMACIÓN**
   - Selecciona la mascota para el servicio
   - Proporciona detalles importantes
   - Especifica necesidades especiales

5. **✅ CONFIRMA CITA**
   - Revisa todos los detalles
   - Confirma la reserva
   - Recibirás confirmación por email y en la app

**📋 RECOMENDACIONES:**

• **Anticipación:** Agenda con al menos 24 horas de anticipación
• **Confirmación:** Confirma la cita 2 horas antes
• **Puntualidad:** Llega 10-15 minutos antes
• **Preparación:** Lleva historial médico y documentos
• **Cancelación:** Cancela con 4 horas de anticipación si no puedes asistir

**🔔 RECORDATORIOS:**
Recibirás notificaciones automáticas:
- 24 horas antes de la cita
- 2 horas antes de la cita
- Después del servicio para calificar

**¿Necesitas ayuda para encontrar un proveedor específico?** ¡Estoy aquí para ayudarte!`,

      prices: `💰 **Información de Precios**

Los precios en PetServices varían según múltiples factores:

**📊 FACTORES QUE INFLUYEN EN EL PRECIO:**

1. **🐕 TAMAÑO Y RAZA DE LA MASCOTA:**
   - Razas pequeñas: Generalmente menor costo
   - Razas grandes/medianas: Mayor costo por materiales y tiempo
   - Razas con pelo especial: Requieren cuidado adicional

2. **🏢 TIPO DE SERVICIO/COMERCIO:**
   - Veterinarias: Consultas, procedimientos, emergencias
   - Peluquerías: Baño, corte, tratamientos estéticos
   - Guarderías: Diurnas, nocturnas, con actividades
   - Entrenadores: Básico, avanzado, especializado

3. **📍 UBICACIÓN GEOGRÁFICA:**
   - Zonas urbanas: Precios moderadamente altos
   - Zonas residenciales: Variados
   - Servicio a domicilio: Puede tener costo adicional

4. **👨‍⚕️ EXPERIENCIA DEL PROVEEDOR:**
   - Profesionales certificados: Mayor experiencia, mayor costo
   - Nuevos proveedores: Precios competitivos

5. **⏰ DURACIÓN Y COMPLEJIDAD:**
   - Servicios rápidos: Menor costo
   - Servicios extensos: Mayor inversión de tiempo

**💡 PARA OBTENER PRECIOS EXACTOS:**

1. **Busca comercios** en tu área que ofrezcan el servicio
2. **Revisa sus perfiles** donde muchos muestran precios base
3. **Contacta directamente** para cotización personalizada
4. **Considera paquetes** que ofrecen mejor valor
5. **Pregunta por promociones** para nuevos clientes

**🎯 CONSEJOS PARA AHORRAR:**

• **Paquetes mensuales:** Para servicios recurrentes
• **Horarios no pico:** Pueden ofrecer descuentos
• **Referidos:** Trae nuevos clientes y obtén beneficios
• **Reseñas:** Algunos proveedores ofrecen descuentos por reseñas

**¿Te ayudo a buscar comercios específicos para cotizar?**`,

      emergency: `🚑 **EMERGENCIAS VETERINARIAS - GUÍA RÁPIDA**

**📞 CONTACTOS INMEDIATOS:**

• **Línea PetServices 24/7:** 1-800-PET-HELP (738-4357)
• **Tu veterinario de confianza:** (Guárdalo en favoritos)
• **Hospital veterinario más cercano:** Usa la función de ubicación

**🚨 SÍNTOMAS DE EMERGENCIA - ACUDA INMEDIATAMENTE:**

**🔴 ROJO (URGENCIA INMEDIATA):**
• Dificultad para respirar o ahogo
• Sangrado abundante e incontrolable
• Convulsiones o pérdida de conciencia
• Ingesta de venenos, productos químicos o medicamentos humanos
• Trauma por accidente (atropello, caída desde altura)
• Distensión abdominal repentina con inquietud (posible torsión gástrica)
• Incapacidad para orinar por más de 12 horas
• Parto complicado con más de 2 horas entre cachorros

**🟡 AMARILLO (ATENCIÓN URGENTE - MENOS DE 12 HORAS):**
• Vómito o diarrea persistente (más de 3 episodios en 1 hora)
• Letargo extremo o incapacidad para levantarse
• Dolor evidente (llanto, agresividad al tocar)
• Heridas profundas o mordeduras
• Temperatura superior a 40°C o inferior a 37°C
• Falta de apetito por más de 24 horas
• Cojera severa o incapacidad para apoyar una pata

**🟢 VERDE (CONSULTA PRONTA - 24-48 HORAS):**
• Cambios en hábitos de alimentación o bebida
• Tos o estornudos persistentes
• Cambios en comportamiento
• Problemas menores de piel

**⚡ QUÉ HACER EN EMERGENCIA:**

1. **MANTÉN LA CALMA** - Tu mascota necesita tu serenidad
2. **EVALÚA LA SITUACIÓN** - ¿Respira? ¿Está consciente?
3. **LLAMA INMEDIATAMENTE** - No esperes a ver si mejora
4. **DESCRIBE CON PRECISIÓN**:
   - Síntomas específicos
   - Hora de inicio
   - Posible causa (si la conoces)
   - Medicamentos que toma
5. **SIGUE INSTRUCCIONES** - Los profesionales te guiarán
6. **PREPÁRATE PARA TRASLADO**:
   - Ten lista el transportín
   - Mantas limpias
   - Agua (si puede beber)
7. **LLEGA AL HOSPITAL** con:
   - Historial médico
   - Cartilla de vacunación
   - Medicamentos actuales
   - Muestra de lo que pudo ingerir (si aplica)

**🆘 PRIMEROS AUXILIOS BÁSICOS:**

**Hemorragia:**
- Aplica presión directa con gasa limpia
- NO uses torniquetes a menos que sea sangrado arterial
- Eleva la herida si es posible

**Atragantamiento:**
- Revisa la boca con cuidado
- Intenta extraer el objeto solo si es visible
- NO metas los dedos a ciegas

**Quemaduras:**
- Enfría con agua corriente (NO hielo)
- Cubre con gasa estéril
- NO apliques ungüentos

**⚠️ NO HAGAS ESTO:**
- NO des medicamentos humanos sin consultar
- NO intentes inmovilizar fracturas sin conocimiento
- NO alimentes si hay vómito o sospecha de obstrucción
- NO uses alcohol o peróxido en heridas profundas

**🏥 BOTIQUÍN RECOMENDADO:**
• Gasas estériles y vendas
• Cinta adhesiva médica
• Tijeras de punta roma
• Termómetro digital
• Guantes desechables
• Solución salina estéril
• Antiséptico (clorhexidina)
• Contactos de emergencia escritos

**💙 RECUERDA:** En emergencias, el tiempo es crucial. Mejor consultar de más que de menos.

**¿Necesitas ayuda para encontrar el hospital más cercano?**`
    },

    provider: {
      general: `¡Hola proveedor! 💼 Soy PetBot, tu asistente de gestión.

**TE AYUDO CON:**

**🏢 GESTIÓN DE TU COMERCIO:**
• Perfil completo y atractivo
• Servicios ofrecidos con precios claros
• Horarios de atención y disponibilidad
• Galería de fotos profesional
• Información de contacto actualizada

**📅 ADMINISTRACIÓN DE AGENDA:**
• Citas del día, semana y mes
• Confirmaciones automáticas a clientes
• Recordatorios programados
• Gestión de cancelaciones y reagendos
• Bloqueo de horarios no disponibles

**👥 GESTIÓN DE CLIENTES:**
• Historial completo de cada cliente
• Preferencias y notas importantes
• Comunicación directa y segura
• Seguimiento post-servicio
• Programas de fidelización

**💰 REPORTES FINANCIEROS:**
• Ingresos diarios, semanales, mensuales
• Servicios más populares
• Clientes recurrentes vs. nuevos
• Temporadas altas y bajas
• Proyecciones de crecimiento

**⭐ REPUTACIÓN Y RESEÑAS:**
• Monitoreo de calificaciones
• Respuestas profesionales a reseñas
• Gestión de comentarios negativos
• Promoción de testimonios positivos
• Mejora continua basada en feedback

**🔧 ACCIONES RÁPIDAS DISPONIBLES:**
• Actualizar horarios de atención
• Modificar precios de servicios
• Subir nuevas fotos del establecimiento
• Responder a reseñas de clientes
• Ver estadísticas de tu negocio
• Configurar disponibilidad automática

**📈 RECOMENDACIONES PARA CRECER:**
1. **Fotos de calidad** - Muestran profesionalismo
2. **Respuestas rápidas** - Mejoran la satisfacción
3. **Precios competitivos** - Atraen más clientes
4. **Servicios especializados** - Diferencian tu negocio
5. **Promociones estratégicas** - Fidelizan clientes

**¿Qué área de tu negocio necesitas optimizar hoy?**`
    },

    admin: {
      general: `¡Hola administrador! 👨‍💼 Soy PetBot, asistente administrativo.

**PANEL DE CONTROL COMPLETO:**

**👥 GESTIÓN DE USUARIOS:**
• Clientes registrados y activos
• Proveedores verificados y pendientes
• Estadísticas de crecimiento
• Actividad reciente de usuarios
• Gestión de cuentas problemáticas

**🏢 SUPERVISIÓN DE COMERCIOS:**
• Comercios activos y sus calificaciones
• Solicitudes pendientes de aprobación
• Comercios suspendidos o inactivos
• Verificación de documentación
• Monitoreo de cumplimiento de políticas

**📊 ANALÍTICA DEL SISTEMA:**
• Métricas de uso de la plataforma
• Reportes de transacciones
• Estadísticas de búsquedas populares
• Tendencias de servicios solicitados
• Análisis de satisfacción general

**⚙️ CONFIGURACIÓN DE PLATAFORMA:**
• Ajustes generales del sistema
• Políticas y términos de servicio
• Configuración de notificaciones
• Gestión de categorías de servicios
• Control de comisiones y tarifas

**🛡️ SEGURIDAD Y AUDITORÍA:**
• Logs de actividad del sistema
• Detección de actividades sospechosas
• Backup y recuperación de datos
• Control de accesos y permisos
• Cumplimiento normativo

**📋 ACCIONES PRIORITARIAS:**

1. **✅ Revisar solicitudes pendientes** de nuevos comercios
2. **📊 Monitorear métricas clave** de la plataforma
3. **🛠️ Verificar funcionamiento** de todos los servicios
4. **👁️ Supervisar actividad** inusual o sospechosa
5. **📈 Analizar tendencias** para mejoras futuras

**🔧 ESTADO ACTUAL DEL SISTEMA:**
• Base de datos: 🟢 Conectada
• Servidor API: 🟢 Operativo
• Servicios de pago: 🟢 Funcionando
• Notificaciones: 🟢 Activas
• AI Chatbot: ${connectionTest?.success ? '🟢 Conectado' : '🟡 Respuestas predefinidas'}

**¿Qué módulo necesitas revisar?**`
    }
  };

  const roleResponses = responses[role] || responses.client;
  return roleResponses[intent] || roleResponses.general;
}

// ============================================
// 📊 FUNCIONES CON DATOS REALES
// ============================================

async function generateResponseWithData(intent, user, userMessage = "") {
  const { name, role, _id: userId } = user;
  
  try {
    switch (intent) {
      case "list_businesses":
        const businesses = await Business.find({
          status: "active",
          approved: true,
          isDeleted: { $ne: true }
        })
        .select('name categories description averageServicePrice rating')
        .limit(5)
        .sort({ rating: -1 })
        .lean();

        if (businesses.length === 0) {
          return "Actualmente no hay comercios disponibles. Los proveedores están actualizando sus perfiles.";
        }

        let response = `🏢 **Encontré ${businesses.length} comercios activos:**\n\n`;
        businesses.forEach((business, index) => {
          response += `${index + 1}. **${business.name}**\n`;
          if (business.categories?.length) {
            response += `   📍 ${business.categories.slice(0, 2).join(', ')}\n`;
          }
          if (business.description) {
            response += `   📝 ${business.description.substring(0, 60)}...\n`;
          }
          if (business.averageServicePrice > 0) {
            response += `   💰 Precio promedio: $${business.averageServicePrice.toFixed(2)}\n`;
          }
          if (business.rating > 0) {
            response += `   ⭐ ${business.rating.toFixed(1)}/5.0\n`;
          }
          response += `\n`;
        });
        response += `🔍 **Para buscar más:** Usa los filtros en "Buscar Comercios".`;
        return response;

      case "list_services":
        return getFallbackResponse("list_services", role);

      case "get_user_pets":
        const pets = await Pet.find({ owner: userId })
          .select('name type breed age')
          .limit(5)
          .lean();

        if (pets.length === 0) {
          return getFallbackResponse("get_user_pets", role);
        }

        let petsResponse = `🐾 **Tus ${pets.length} mascotas registradas:**\n\n`;
        pets.forEach((pet, index) => {
          petsResponse += `${index + 1}. **${pet.name}**\n`;
          petsResponse += `   🐕 ${pet.type || 'Mascota'}\n`;
          if (pet.breed) petsResponse += `   🧬 ${pet.breed}\n`;
          if (pet.age) petsResponse += `   📅 ${pet.age}\n`;
          petsResponse += `\n`;
        });
        petsResponse += `🔧 **Acciones disponibles en tu perfil.**`;
        return petsResponse;

      default:
        return getFallbackResponse(intent, role);
    }
  } catch (error) {
    console.error(`❌ Error en generateResponseWithData:`, error.message);
    return getFallbackResponse(intent, role);
  }
}

// ============================================
// 🎯 DETECCIÓN DE INTENCIONES
// ============================================

function detectIntent(text, role = "client") {
  if (!text || typeof text !== 'string') return "fallback";
  
  const lowerText = text.toLowerCase().trim();

  if (/(hola|buenos|buenas|saludos)/i.test(lowerText)) return "greeting";
  if (/(gracias|thank)/i.test(lowerText)) return "thanks";
  if (/(adiós|chao|bye)/i.test(lowerText)) return "goodbye";
  if (/(ayuda|help|soporte)/i.test(lowerText)) return "help";
  if (/(qu[ií]n eres|qu[eé] eres)/i.test(lowerText)) return "about";
  if (/(comercios|negocios|veterinarias|peluquerías|guarderías)/i.test(lowerText)) 
    return "list_businesses";
  if (/(servicios|qu[eé] ofrecen|opciones|cat[aá]logo)/i.test(lowerText)) 
    return "list_services";
  if (/(mis mascotas|mascotas registradas)/i.test(lowerText)) 
    return "get_user_pets";
  if (/(agendar|reservar|solicitar).*(cita|consulta)/i.test(lowerText)) 
    return "book_appointment";
  if (/(precio|costos|cu[aá]nto cuesta|tarifas)/i.test(lowerText)) 
    return "prices";
  if (/(emergencia|urgencia|accidente|enfermo)/i.test(lowerText)) 
    return "emergency";

  return "fallback";
}

// ============================================
// 🚀 ENDPOINT PRINCIPAL
// ============================================

router.post("/", protect, async (req, res) => {
  console.log(`\n💬 ======= NUEVO MENSAJE CHAT =======`);
  
  try {
    const { message } = req.body;
    const { role, name, _id: userId } = req.user;

    if (!message || !message.trim()) {
      return res.json({
        success: false,
        reply: "Por favor, escribe un mensaje.",
        type: "error"
      });
    }

    const text = message.trim();
    const intent = detectIntent(text, role);
    
    console.log(`👤 Usuario: ${name} (${role})`);
    console.log(`💭 Mensaje: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
    console.log(`🎯 Intención: ${intent}`);
    console.log(`🤖 Gemini: ${connectionTest?.success ? '✅ Disponible' : '❌ Solo respuestas predefinidas'}`);

    // Respuestas rápidas
    const quickResponses = {
      greeting: `¡Hola ${name}! 👋 Soy PetBot, tu asistente de PetServices.`,
      thanks: `¡De nada ${name}! 😊 Es un placer ayudarte.`,
      goodbye: `¡Hasta luego ${name}! Que tengas un excelente día. 🐾`,
      help: `¡Claro ${name}! Te ayudo con:\n• Comercios y servicios\n• Citas y mascotas\n• Precios y emergencias\n\n¿Qué necesitas?`,
      about: `🤖 **Soy PetBot**, el asistente virtual de PetServices.\n\n${connectionTest?.success ? 'Actualmente con IA activada.' : 'En modo respuestas predefinidas.'}`
    };

    if (quickResponses[intent]) {
      console.log(`📤 Enviando respuesta rápida`);
      return res.json({
        success: true,
        reply: quickResponses[intent],
        type: "text",
        intent
      });
    }

    // Intents con datos de BD
    const dataIntents = ["list_businesses", "list_services", "get_user_pets"];
    
    if (dataIntents.includes(intent)) {
      try {
        console.log(`📊 Procesando con datos de BD`);
        const reply = await generateResponseWithData(intent, req.user, text);
        
        return res.json({
          success: true,
          reply,
          type: "text",
          intent,
          hasData: true
        });
      } catch (dbError) {
        console.error("❌ Error con datos:", dbError.message);
        return res.json({
          success: true,
          reply: getFallbackResponse(intent, role),
          type: "text",
          intent
        });
      }
    }

    // Intents que pueden usar IA
    const aiIntents = ["book_appointment", "prices", "emergency", "fallback"];
    
    if (aiIntents.includes(intent)) {
      // Si Gemini está disponible, usarlo
      if (connectionTest?.success) {
        try {
          console.log(`🤖 Procesando con IA Gemini 2.5 Flash`);
          
          const systemPrompt = `Eres PetBot, asistente virtual de PetServices (plataforma de servicios para mascotas).
Usuario: ${name} (${role})
Consulta: "${text}"

Contexto: Los usuarios pueden buscar veterinarias, peluquerías, guarderías, entrenadores. Los precios varían. Las citas se agendan online.

Instrucciones:
1. Responde en español, tono amigable pero profesional
2. Sé conciso y útil (1-2 párrafos máximo)
3. Usa emojis relevantes 🐾🏥✂️🏠
4. Si no sabes algo, sugiere alternativas
5. NO inventes información específica sobre precios exactos
6. Enfócate en servicios para mascotas

Respuesta:`;

          const aiReply = await callGeminiAPI(systemPrompt, role);
          
          return res.json({
            success: true,
            reply: aiReply,
            type: "text",
            intent,
            aiGenerated: true,
            model: connectionTest?.model
          });
          
        } catch (aiError) {
          console.error("❌ Error con IA:", aiError.message);
          // Continuar con fallback
        }
      }
      
      // Si no hay IA o falló, usar respuesta predefinida
      console.log(`📝 Usando respuesta predefinida`);
      return res.json({
        success: true,
        reply: getFallbackResponse(intent, role),
        type: "text",
        intent,
        aiGenerated: false
      });
    }

    // Fallback general
    console.log(`🤔 Usando fallback general`);
    const fallbackReply = `🤔 No estoy seguro de entender, ${name}.\n\n**Puedo ayudarte con:**\n• 🔍 Comercios y servicios\n• 📅 Citas y mascotas\n• 💰 Precios\n• 🚑 Emergencias\n\n¿Puedes reformular tu pregunta o elegir una de estas opciones?`;
    
    return res.json({
      success: true,
      reply: fallbackReply,
      type: "text",
      intent: "fallback"
    });

  } catch (error) {
    console.error("❌ Error crítico en chat:", error);
    
    return res.json({
      success: false,
      reply: `😔 **Ocurrió un error.** Por favor, intenta nuevamente.`,
      type: "error"
    });
  } finally {
    console.log(`💬 ======= FIN MENSAJE =======\n`);
  }
});

// ============================================
// 🔍 ENDPOINTS DE DIAGNÓSTICO ACTUALIZADOS
// ============================================

// Health check
router.get("/health", protect, (req, res) => {
  res.json({
    status: "healthy",
    service: "PetBot Chat API",
    gemini: {
      configured: true,
      model: connectionTest?.model || GEMINI_MODEL,
      connection: connectionTest?.success ? "connected" : "disconnected",
      api_version: "v1beta"
    },
    mode: connectionTest?.success ? "ai_enabled" : "fallback_only",
    user: {
      role: req.user.role,
      name: req.user.name
    }
  });
});

// Test de conexión
router.get("/test-connection", async (req, res) => {
  try {
    console.log("\n🧪 SOLICITUD DE TEST MANUAL");
    const result = await testGeminiConnection();
    
    // Actualizar estado global
    connectionTest = result;
    
    res.json({
      success: result.success,
      message: result.success ? "✅ Gemini 2.5 Flash funciona" : "❌ Gemini no disponible",
      result: result,
      recommendation: result.success ? 
        "El chatbot usará IA para respuestas complejas" : 
        "El chatbot usará respuestas predefinidas"
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Status público
router.get("/status", (req, res) => {
  res.json({
    status: "online",
    service: "PetBot Chat",
    ai_available: connectionTest?.success || false,
    model: connectionTest?.model || GEMINI_MODEL,
    mode: connectionTest?.success ? "🤖 AI Gemini 2.5 Flash" : "📝 Respuestas predefinidas",
    uptime: process.uptime()
  });
});

// Test simple
router.post("/test", protect, (req, res) => {
  const { message = "Test" } = req.body;
  
  res.json({
    success: true,
    reply: `✅ **Test exitoso**\n\nMensaje: "${message}"\nUsuario: ${req.user.name}\nRol: ${req.user.role}\nGemini: ${connectionTest?.success ? '✅ ' + connectionTest.model : '❌ No disponible'}`,
    test: true,
    gemini_available: connectionTest?.success,
    model: connectionTest?.model
  });
});

// Endpoint para probar modelo específico
router.post("/test-model", async (req, res) => {
  const { model = "gemini-2.5-flash", prompt = "Hola" } = req.body;
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        model: model,
        works: true,
        reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || 'OK'
      });
    } else {
      const error = await response.text();
      res.json({
        success: false,
        model: model,
        works: false,
        error: error.substring(0, 200)
      });
    }
  } catch (error) {
    res.json({
      success: false,
      model: model,
      works: false,
      error: error.message
    });
  }
});

export default router;