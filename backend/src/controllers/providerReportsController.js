// controllers/providerReportsController.js
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Service from "../models/Service.js";
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { formatTimeTo12Hour } from "../utils/timeFormatter.js";

// ======================================================
// 📌 Obtener reportes con filtros
// ======================================================
export const getProviderReports = async (req, res) => {
  console.log('🔔 Petición GET /provider/reports recibida');
  console.log('📅 Filtros:', req.query);
  console.log('👤 Proveedor ID:', req.user?._id);
  
  try {
    // Verificar que el usuario sea proveedor
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Solo proveedores pueden ver estos reportes"
      });
    }

    // Construir query base
    const query = { providerId: req.user._id };

    // Aplicar filtros de fecha si existen
    if (req.query.startDate) {
      query.date = { $gte: req.query.startDate };
    }
    
    if (req.query.endDate) {
      query.date = query.date || {};
      query.date.$lte = req.query.endDate;
    }

    console.log('🔍 Query final:', JSON.stringify(query));

    // Obtener citas filtradas
    const appointments = await Appointment.find(query)
      .select('_id userId petId serviceId date time status notes serviceName servicePrice serviceDuration businessName businessAddress businessPhone createdAt updatedAt cancelledAt completedAt rescheduledAt')
      .sort({ date: -1, time: -1 })
      .lean();

    console.log(`✅ ${appointments.length} citas encontradas para el reporte`);

    // Obtener IDs únicos para populate
    const userIds = [...new Set(appointments.map(a => a.userId).filter(id => id))];
    const petIds = [...new Set(appointments.map(a => a.petId).filter(id => id))];
    const serviceIds = [...new Set(appointments.map(a => a.serviceId).filter(id => id))];

    // Obtener datos poblados por separado
    const [users, pets, services] = await Promise.all([
      User.find({ _id: { $in: userIds } })
        .select('_id name lastname email phone')
        .lean(),
      Pet.find({ _id: { $in: petIds } })
        .select('_id name type breed age')
        .lean(),
      Service.find({ _id: { $in: serviceIds } })
        .select('_id name description price duration')
        .lean()
    ]);

    // Crear mapas para búsqueda rápida
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    const petMap = pets.reduce((map, pet) => {
      map[pet._id.toString()] = pet;
      return map;
    }, {});

    const serviceMap = services.reduce((map, service) => {
      map[service._id.toString()] = service;
      return map;
    }, {});

    // Procesar citas con datos poblados
    const processedAppointments = appointments.map(appt => {
      const appointment = {
        _id: appt._id,
        userId: userMap[appt.userId?.toString()] || { _id: appt.userId },
        petId: petMap[appt.petId?.toString()] || { _id: appt.petId },
        serviceId: serviceMap[appt.serviceId?.toString()] || { _id: appt.serviceId },
        date: appt.date,
        time: appt.time,
        status: appt.status || 'pendiente',
        notes: appt.notes || '',
        serviceName: appt.serviceName || '',
        servicePrice: appt.servicePrice || 0,
        serviceDuration: appt.serviceDuration || 60,
        businessName: appt.businessName || '',
        businessAddress: appt.businessAddress || '',
        businessPhone: appt.businessPhone || '',
        createdAt: appt.createdAt,
        updatedAt: appt.updatedAt
      };

      // Agregar campos opcionales solo si existen
      if (appt.cancelledAt) appointment.cancelledAt = appt.cancelledAt;
      if (appt.completedAt) appointment.completedAt = appt.completedAt;
      if (appt.rescheduledAt) appointment.rescheduledAt = appt.rescheduledAt;

      return appointment;
    });

    // Calcular estadísticas
    const stats = {
      completed: 0,
      cancelled: 0,
      pending: 0,
      revenue: 0,
      total: processedAppointments.length
    };

    processedAppointments.forEach(appt => {
      if (appt.status === 'completada') {
        stats.completed++;
        stats.revenue += appt.servicePrice || 0;
      } else if (appt.status === 'cancelada') {
        stats.cancelled++;
      } else if (['pendiente', 'confirmada', 'reprogramada'].includes(appt.status)) {
        stats.pending++;
      }
    });

    // Preparar datos para gráfico mensual
    const monthlyData = Array(12).fill(0);
    const cancelledData = Array(12).fill(0);
    const pendingData = Array(12).fill(0);
    
    processedAppointments.forEach(appt => {
      if (appt.date) {
        const date = new Date(appt.date);
        const month = date.getMonth();
        
        if (appt.status === 'completada') {
          monthlyData[month]++;
        } else if (appt.status === 'cancelada') {
          cancelledData[month]++;
        } else if (['pendiente', 'confirmada', 'reprogramada'].includes(appt.status)) {
          pendingData[month]++;
        }
      }
    });

    // Preparar datos para gráfico semanal (últimas 8 semanas)
    const weeklyData = prepareWeeklyData(processedAppointments);

    // Calcular métricas adicionales
    const completionRate = stats.total > 0 ? 
      Math.round((stats.completed / (stats.completed + stats.cancelled)) * 100) || 0 : 0;
    
    // Calcular días en el período
    let daysInPeriod = 30; // Valor por defecto
    if (req.query.startDate && req.query.endDate) {
      const start = new Date(req.query.startDate);
      const end = new Date(req.query.endDate);
      const diffTime = Math.abs(end - start);
      daysInPeriod = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    
    const avgDailyAppointments = daysInPeriod > 0 ? 
      (stats.total / daysInPeriod).toFixed(1) : 0;
    
    const avgRevenuePerAppointment = (stats.completed + stats.cancelled) > 0 ? 
      (stats.revenue / (stats.completed + stats.cancelled)).toFixed(2) : 0;

    res.json({
      success: true,
      stats,
      appointments: processedAppointments,
      chart: {
        monthly: {
          labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
          completed: monthlyData,
          cancelled: cancelledData,
          pending: pendingData
        },
        weekly: weeklyData
      },
      metrics: {
        completionRate,
        avgDailyAppointments,
        avgRevenuePerAppointment,
        daysInPeriod
      },
      filters: {
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo reportes del proveedor:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener reportes",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 Preparar datos semanales para gráfico
// ======================================================
const prepareWeeklyData = (appointments) => {
  const weeklyData = {
    labels: [],
    completed: [],
    cancelled: [],
    pending: []
  };

  // Obtener las últimas 8 semanas
  const today = new Date();
  const weeks = [];
  
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (today.getDay() + (i * 7)) + 1);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekLabel = `Sem ${getWeekNumber(weekStart)}`;
    weeks.push({
      label: weekLabel,
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
      completed: 0,
      cancelled: 0,
      pending: 0
    });
  }

  // Contar citas por semana
  appointments.forEach(appt => {
    if (appt.date) {
      const appointmentDate = new Date(appt.date);
      
      for (const week of weeks) {
        const weekStart = new Date(week.start);
        const weekEnd = new Date(week.end);
        
        if (appointmentDate >= weekStart && appointmentDate <= weekEnd) {
          if (appt.status === 'completada') {
            week.completed++;
          } else if (appt.status === 'cancelada') {
            week.cancelled++;
          } else if (['pendiente', 'confirmada', 'reprogramada'].includes(appt.status)) {
            week.pending++;
          }
          break;
        }
      }
    }
  });

  // Preparar arrays para el gráfico
  weeklyData.labels = weeks.map(w => w.label);
  weeklyData.completed = weeks.map(w => w.completed);
  weeklyData.cancelled = weeks.map(w => w.cancelled);
  weeklyData.pending = weeks.map(w => w.pending);

  return weeklyData;
};

// ======================================================
// 📌 Obtener número de semana
// ======================================================
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// ======================================================
// 📌 Exportar reporte en PDF
// ======================================================
// ======================================================
// 📌 Exportar reporte en PDF
// ======================================================
export const exportReportPDF = async (req, res) => {
  console.log('🔔 Petición GET /provider/reports/export/pdf recibida');
  
  try {
    // Verificar que el usuario sea proveedor
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    // Construir query con filtros
    const query = { providerId: req.user._id };

    if (req.query.startDate) {
      query.date = { $gte: req.query.startDate };
    }
    
    if (req.query.endDate) {
      query.date = query.date || {};
      query.date.$lte = req.query.endDate;
    }

    console.log('📋 Query para exportación:', JSON.stringify(query));

    // Obtener citas con datos poblados
    const appointments = await Appointment.find(query)
      .select('_id userId petId serviceId date time status notes serviceName servicePrice serviceDuration businessName businessAddress businessPhone createdAt')
      .sort({ date: 1, time: 1 })
      .lean();

    // Obtener datos relacionados
    const userIds = [...new Set(appointments.map(a => a.userId).filter(id => id))];
    const petIds = [...new Set(appointments.map(a => a.petId).filter(id => id))];

    const [users, pets] = await Promise.all([
      User.find({ _id: { $in: userIds } })
        .select('_id name lastname phone')
        .lean(),
      Pet.find({ _id: { $in: petIds } })
        .select('_id name type breed')
        .lean()
    ]);

    // Crear mapas
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    const petMap = pets.reduce((map, pet) => {
      map[pet._id.toString()] = pet;
      return map;
    }, {});

    // Procesar citas
    const processedAppointments = appointments.map(appt => ({
      ...appt,
      user: userMap[appt.userId?.toString()] || { name: 'N/A', lastname: '', phone: '' },
      pet: petMap[appt.petId?.toString()] || { name: 'N/A', type: 'N/A', breed: 'N/A' }
    }));

    // Calcular estadísticas
    const stats = {
      total: processedAppointments.length,
      completed: 0,
      cancelled: 0,
      pending: 0,
      revenue: 0
    };

    processedAppointments.forEach(appt => {
      if (appt.status === 'completada') {
        stats.completed++;
        stats.revenue += appt.servicePrice || 0;
      } else if (appt.status === 'cancelada') {
        stats.cancelled++;
      } else if (['pendiente', 'confirmada', 'reprogramada'].includes(appt.status)) {
        stats.pending++;
      }
    });

    // Crear documento PDF
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `Reporte de Citas - ${req.user.name}`,
        Author: 'PetCare Pro',
        Subject: 'Reporte de citas del proveedor'
      }
    });
    
    // Configurar headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-citas-${req.query.startDate || 'inicio'}-al-${req.query.endDate || 'fin'}.pdf`);
    
    doc.pipe(res);

    // Logo o encabezado
    doc.fontSize(20).fillColor('#0d9488').text('PetCare Pro', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor('#000000').text('Reporte de Citas', { align: 'center' });
    doc.moveDown();
    
    // Información del proveedor y período
    doc.fontSize(10).fillColor('#666666').text('Información del Reporte', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).fillColor('#000000')
      .text(`Proveedor: ${req.user.name} ${req.user.lastname}`, { indent: 20 })
      .text(`Email: ${req.user.email}`, { indent: 20 })
      .text(`Período: ${req.query.startDate || 'Inicio'} al ${req.query.endDate || 'Fin'}`, { indent: 20 })
      .text(`Fecha de generación: ${new Date().toLocaleDateString('es-VE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, { indent: 20 });
    
    doc.moveDown();

    // Estadísticas resumidas
    doc.fontSize(12).fillColor('#000000').text('Resumen Estadístico', { underline: true });
    doc.moveDown(0.5);
    
    // Tabla de estadísticas
    const statsTableTop = doc.y;
    const col1 = 50;
    const col2 = 250;
    const col3 = 400;
    
    // Encabezado de tabla
    doc.fontSize(10).fillColor('#FFFFFF');
    doc.rect(col1, statsTableTop, col2 - col1, 20).fillAndStroke('#0d9488', '#0d9488');
    doc.text('Métrica', col1 + 10, statsTableTop + 5);
    
    doc.rect(col2, statsTableTop, col3 - col2, 20).fillAndStroke('#0d9488', '#0d9488');
    doc.text('Valor', col2 + 10, statsTableTop + 5);
    
    // Filas de estadísticas
    const statsRows = [
      ['Total de Citas', stats.total.toString()],
      ['Citas Completadas', stats.completed.toString()],
      ['Citas Canceladas', stats.cancelled.toString()],
      ['Citas Pendientes', stats.pending.toString()],
      ['Ingresos Totales', `$${stats.revenue.toFixed(2)}`],
      ['Tasa de Finalización', `${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%`],
      ['Ingreso Promedio', `$${(stats.completed > 0 ? (stats.revenue / stats.completed).toFixed(2) : 0)}`]
    ];
    
    let currentY = statsTableTop + 20;
    statsRows.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      
      doc.rect(col1, currentY, col2 - col1, 20).fillAndStroke(bgColor, '#e2e8f0');
      doc.rect(col2, currentY, col3 - col2, 20).fillAndStroke(bgColor, '#e2e8f0');
      
      doc.fontSize(9).fillColor('#000000');
      doc.text(row[0], col1 + 10, currentY + 5);
      doc.text(row[1], col2 + 10, currentY + 5);
      
      currentY += 20;
    });
    
    doc.y = currentY + 10;

    // Lista detallada de citas (si hay)
    if (processedAppointments.length > 0) {
      // Nueva página si es necesario
      if (doc.y > 650) {
        doc.addPage();
      }
      
      doc.fontSize(12).fillColor('#000000').text('Detalle de Citas', { underline: true });
      doc.moveDown(0.5);
      
      processedAppointments.forEach((appt, index) => {
        // Nueva página cada 10 citas
        if (index > 0 && index % 10 === 0) {
          doc.addPage();
        }
        
        // Ajustar alineación a la izquierda (sin sangría)
        const leftMargin = 50;
        
        doc.fontSize(9).fillColor('#000000')
          .text(`Cita #${index + 1}`, leftMargin, doc.y, { bold: true, continued: false });
        doc.moveDown(0.3);
        
        doc.text(`• Fecha y Hora: ${appt.date} ${formatTimeTo12Hour(appt.time)}`, leftMargin, doc.y);
        doc.moveDown(0.3);
        
        doc.text(`• Cliente: ${appt.user.name} ${appt.user.lastname}${appt.user.phone ? ` | Tel: ${appt.user.phone}` : ''}`, leftMargin, doc.y);
        doc.moveDown(0.3);
        
        doc.text(`• Mascota: ${appt.pet.name} (${appt.pet.type}${appt.pet.breed ? ` - ${appt.pet.breed}` : ''})`, leftMargin, doc.y);
        doc.moveDown(0.3);
        
        doc.text(`• Servicio: ${appt.serviceName || 'N/A'}`, leftMargin, doc.y);
        doc.moveDown(0.3);
        
        doc.text(`• Estado: ${getStatusText(appt.status)}`, leftMargin, doc.y);
        doc.moveDown(0.3);
        
        doc.text(`• Precio: $${(appt.servicePrice || 0).toFixed(2)}`, leftMargin, doc.y);
        doc.moveDown(0.3);
        
        if (appt.notes) {
          doc.text(`• Notas: ${appt.notes}`, leftMargin, doc.y);
          doc.moveDown(0.3);
        }
        
        doc.moveDown(0.5);
        doc.strokeColor('#e2e8f0').lineWidth(0.5)
          .moveTo(leftMargin, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(11).fillColor('#666666').text('No hay citas en el período seleccionado.', { align: 'center' });
    }

    // Pie de página
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 50;
    
    doc.fontSize(8).fillColor('#666666')
      .text('Reporte generado automáticamente por PetCare Pro', 50, footerY, { align: 'center' })
      .text(`Página ${doc.bufferedPageRange().count}`, 50, footerY + 15, { align: 'center' });

    doc.end();

  } catch (err) {
    console.error("❌ Error generando PDF:", err);
    res.status(500).json({
      success: false,
      message: "Error generando reporte PDF",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 Exportar reporte en Excel
// ======================================================
export const exportReportExcel = async (req, res) => {
  console.log('🔔 Petición GET /provider/reports/export/excel recibida');
  
  try {
    // Verificar que el usuario sea proveedor
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    // Construir query con filtros
    const query = { providerId: req.user._id };

    if (req.query.startDate) {
      query.date = { $gte: req.query.startDate };
    }
    
    if (req.query.endDate) {
      query.date = query.date || {};
      query.date.$lte = req.query.endDate;
    }

    // Obtener citas con datos poblados
    const appointments = await Appointment.find(query)
      .select('_id userId petId serviceId date time status notes serviceName servicePrice serviceDuration businessName businessAddress businessPhone createdAt')
      .sort({ date: 1, time: 1 })
      .lean();

    // Obtener datos relacionados
    const userIds = [...new Set(appointments.map(a => a.userId).filter(id => id))];
    const petIds = [...new Set(appointments.map(a => a.petId).filter(id => id))];

    const [users, pets] = await Promise.all([
      User.find({ _id: { $in: userIds } })
        .select('_id name lastname phone')
        .lean(),
      Pet.find({ _id: { $in: petIds } })
        .select('_id name type breed')
        .lean()
    ]);

    // Crear mapas
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    const petMap = pets.reduce((map, pet) => {
      map[pet._id.toString()] = pet;
      return map;
    }, {});

    // Procesar citas
    const processedAppointments = appointments.map(appt => ({
      ...appt,
      user: userMap[appt.userId?.toString()] || { name: 'N/A', lastname: '', phone: '' },
      pet: petMap[appt.petId?.toString()] || { name: 'N/A', type: 'N/A', breed: 'N/A' }
    }));

    // Calcular estadísticas
    const stats = {
      total: processedAppointments.length,
      completed: 0,
      cancelled: 0,
      pending: 0,
      revenue: 0
    };

    processedAppointments.forEach(appt => {
      if (appt.status === 'completada') {
        stats.completed++;
        stats.revenue += appt.servicePrice || 0;
      } else if (appt.status === 'cancelada') {
        stats.cancelled++;
      } else if (['pendiente', 'confirmada', 'reprogramada'].includes(appt.status)) {
        stats.pending++;
      }
    });

    // Crear workbook de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PetCare Pro';
    workbook.created = new Date();
    workbook.modified = new Date();

    // ==================== HOJA 1: RESUMEN ====================
    const summarySheet = workbook.addWorksheet('Resumen');
    
    // Título
    summarySheet.mergeCells('A1:G1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'REPORTE DE CITAS - PETCARE PRO';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF0d9488' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 30;

    // Información del reporte
    summarySheet.mergeCells('A2:G2');
    summarySheet.getCell('A2').value = `Proveedor: ${req.user.name} ${req.user.lastname}`;
    summarySheet.getCell('A2').font = { bold: true };
    summarySheet.getRow(2).height = 20;

    summarySheet.mergeCells('A3:G3');
    summarySheet.getCell('A3').value = `Período: ${req.query.startDate || 'Inicio'} al ${req.query.endDate || 'Fin'}`;

    summarySheet.mergeCells('A4:G4');
    summarySheet.getCell('A4').value = `Fecha de generación: ${new Date().toLocaleDateString('es-VE')}`;
    summarySheet.getRow(4).height = 20;

    // Espacio
    summarySheet.getRow(5).height = 15;

    // Encabezado de estadísticas
    summarySheet.mergeCells('A6:G6');
    const statsHeader = summarySheet.getCell('A6');
    statsHeader.value = 'ESTADÍSTICAS DEL PERÍODO';
    statsHeader.font = { size: 14, bold: true };
    statsHeader.alignment = { horizontal: 'center' };
    statsHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFf0f9ff' }
    };
    summarySheet.getRow(6).height = 25;

    // Datos de estadísticas
    const statsData = [
      ['Métrica', 'Valor'],
      ['Total de Citas', stats.total],
      ['Citas Completadas', stats.completed],
      ['Citas Canceladas', stats.cancelled],
      ['Citas Pendientes', stats.pending],
      ['Ingresos Totales', `$${stats.revenue.toFixed(2)}`],
      ['Tasa de Finalización', `${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%`],
      ['Ingreso Promedio por Cita', `$${(stats.completed > 0 ? (stats.revenue / stats.completed).toFixed(2) : 0)}`]
    ];

    statsData.forEach((row, index) => {
      const rowNum = 7 + index;
      summarySheet.getCell(`A${rowNum}`).value = row[0];
      summarySheet.getCell(`B${rowNum}`).value = row[1];
      
      if (index === 0) {
        // Encabezado de tabla
        summarySheet.getRow(rowNum).font = { bold: true };
        summarySheet.getRow(rowNum).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFe0f2fe' }
        };
      } else if (index % 2 === 0) {
        // Filas pares
        summarySheet.getRow(rowNum).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFf8fafc' }
        };
      }
      
      summarySheet.getRow(rowNum).height = 22;
    });

    // Ajustar anchos de columna
    summarySheet.getColumn('A').width = 30;
    summarySheet.getColumn('B').width = 20;

    // ==================== HOJA 2: DETALLE DE CITAS ====================
    if (processedAppointments.length > 0) {
      const detailSheet = workbook.addWorksheet('Detalle de Citas');
      
      // Título
      detailSheet.mergeCells('A1:J1');
      detailSheet.getCell('A1').value = 'DETALLE DE CITAS';
      detailSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FF0d9488' } };
      detailSheet.getCell('A1').alignment = { horizontal: 'center' };
      detailSheet.getRow(1).height = 25;

      // Encabezados
      const headers = [
        'ID', 'Fecha', 'Hora', 'Cliente', 'Teléfono', 'Mascota', 
        'Tipo', 'Servicio', 'Estado', 'Precio ($)', 'Notas'
      ];

      const headerRow = detailSheet.getRow(3);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0d9488' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      headerRow.height = 25;

      // Datos de citas
      processedAppointments.forEach((appt, index) => {
        const row = detailSheet.getRow(4 + index);
        
        const statusText = getStatusText(appt.status);
        const statusColor = getStatusColor(appt.status);
        
        row.getCell(1).value = index + 1;
        row.getCell(2).value = appt.date;
        row.getCell(3).value = formatTimeTo12Hour(appt.time);
        row.getCell(4).value = `${appt.user.name} ${appt.user.lastname}`;
        row.getCell(5).value = appt.user.phone || 'N/A';
        row.getCell(6).value = appt.pet.name;
        row.getCell(7).value = appt.pet.type;
        row.getCell(8).value = appt.serviceName || 'N/A';
        row.getCell(9).value = statusText;
        row.getCell(10).value = appt.servicePrice || 0;
        row.getCell(11).value = appt.notes || '';
        
        // Formato de celda de estado
        const statusCell = row.getCell(9);
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusColor }
        };
        
        // Formato de moneda para precio
        row.getCell(10).numFmt = '$#,##0.00';
        
        // Alternar colores de fila
        if (index % 2 === 0) {
          for (let i = 1; i <= 11; i++) {
            row.getCell(i).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFf8fafc' }
            };
          }
        }
        
        // Bordes
        for (let i = 1; i <= 11; i++) {
          row.getCell(i).border = {
            top: { style: 'thin', color: { argb: 'FFe2e8f0' } },
            left: { style: 'thin', color: { argb: 'FFe2e8f0' } },
            bottom: { style: 'thin', color: { argb: 'FFe2e8f0' } },
            right: { style: 'thin', color: { argb: 'FFe2e8f0' } }
          };
        }
        
        row.height = 20;
      });

      // Ajustar anchos de columna automáticamente
      detailSheet.columns.forEach((column, index) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 30);
      });
    }

    // ==================== HOJA 3: ANÁLISIS MENSUAL ====================
    const analysisSheet = workbook.addWorksheet('Análisis Mensual');
    
    // Título
    analysisSheet.mergeCells('A1:E1');
    analysisSheet.getCell('A1').value = 'ANÁLISIS MENSUAL';
    analysisSheet.getCell('A1').font = { size: 14, bold: true };
    analysisSheet.getCell('A1').alignment = { horizontal: 'center' };
    analysisSheet.getRow(1).height = 25;

    // Preparar datos mensuales
    const monthlyAnalysis = Array(12).fill().map((_, index) => ({
      month: new Date(2024, index, 1).toLocaleDateString('es-VE', { month: 'short' }),
      completed: 0,
      cancelled: 0,
      revenue: 0
    }));

    processedAppointments.forEach(appt => {
      if (appt.date) {
        const date = new Date(appt.date);
        const month = date.getMonth();
        
        if (appt.status === 'completada') {
          monthlyAnalysis[month].completed++;
          monthlyAnalysis[month].revenue += appt.servicePrice || 0;
        } else if (appt.status === 'cancelada') {
          monthlyAnalysis[month].cancelled++;
        }
      }
    });

    // Encabezados
    const analysisHeaders = ['Mes', 'Citas Completadas', 'Citas Canceladas', 'Ingresos ($)', 'Tasa Éxito'];
    const analysisHeaderRow = analysisSheet.getRow(3);
    
    analysisHeaders.forEach((header, index) => {
      const cell = analysisHeaderRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFe0f2fe' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    analysisHeaderRow.height = 25;

    // Datos mensuales
    monthlyAnalysis.forEach((data, index) => {
      const row = analysisSheet.getRow(4 + index);
      const successRate = (data.completed + data.cancelled) > 0 ? 
        (data.completed / (data.completed + data.cancelled) * 100).toFixed(1) : 0;
      
      row.getCell(1).value = data.month;
      row.getCell(2).value = data.completed;
      row.getCell(3).value = data.cancelled;
      row.getCell(4).value = data.revenue;
      row.getCell(5).value = `${successRate}%`;
      
      // Formato de moneda
      row.getCell(4).numFmt = '$#,##0.00';
      
      // Color para tasa de éxito
      const rateCell = row.getCell(5);
      const rate = parseFloat(successRate);
      if (rate >= 80) {
        rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFd1fae5' } };
      } else if (rate >= 60) {
        rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFfef3c7' } };
      } else {
        rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFfee2e2' } };
      }
      
      row.height = 20;
    });

    // Configurar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-citas-${req.query.startDate || 'inicio'}-al-${req.query.endDate || 'fin'}.xlsx`);

    // Escribir a response
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("❌ Error generando Excel:", err);
    res.status(500).json({
      success: false,
      message: "Error generando reporte Excel",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 Endpoint unificado para exportación
// ======================================================
export const exportReport = async (req, res) => {
  console.log('🔔 Petición GET /provider/reports/export recibida');
  console.log('📋 Formato solicitado:', req.query.format);
  
  try {
    const format = req.query.format?.toLowerCase();
    
    if (format === 'pdf') {
      return await exportReportPDF(req, res);
    } else if (format === 'excel') {
      return await exportReportExcel(req, res);
    } else {
      return res.status(400).json({
        success: false,
        message: "Formato no válido. Use 'pdf' o 'excel'"
      });
    }
  } catch (err) {
    console.error("❌ Error en exportación:", err);
    res.status(500).json({
      success: false,
      message: "Error en la exportación",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ======================================================
// 📌 Funciones auxiliares
// ======================================================

const getStatusText = (status) => {
  const statusMap = {
    'pendiente': 'Pendiente',
    'confirmada': 'Confirmada',
    'cancelada': 'Cancelada',
    'completada': 'Completada',
    'reprogramada': 'Reprogramada'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    'pendiente': 'FFFEF3C7',
    'confirmada': 'FFDBEAFE',
    'cancelada': 'FFFEE2E2',
    'completada': 'FFD1FAE5',
    'reprogramada': 'FFF3E8FF'
  };
  return colorMap[status] || 'FFFFFFFF';
};

// ======================================================
// 📌 Obtener estadísticas rápidas (para dashboard)
// ======================================================
export const getQuickStats = async (req, res) => {
  console.log('🔔 Petición GET /provider/reports/quick-stats recibida');
  
  try {
    // Verificar que el usuario sea proveedor
    if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado"
      });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
    
    const query = { providerId: req.user._id };

    // Obtener estadísticas para hoy
    const todayQuery = { ...query, date: todayStr };
    const todayAppointments = await Appointment.find(todayQuery).lean();
    
    // Obtener estadísticas para este mes
    const monthQuery = { 
      ...query, 
      date: { $gte: startOfMonthStr, $lte: todayStr } 
    };
    const monthAppointments = await Appointment.find(monthQuery).lean();

    // Calcular estadísticas
    const calculateStats = (appointments) => {
      return appointments.reduce((acc, appt) => {
        if (appt.status === 'completada') {
          acc.completed++;
          acc.revenue += appt.servicePrice || 0;
        } else if (appt.status === 'cancelada') {
          acc.cancelled++;
        } else if (['pendiente', 'confirmada', 'reprogramada'].includes(appt.status)) {
          acc.pending++;
        }
        acc.total++;
        return acc;
      }, { total: 0, completed: 0, cancelled: 0, pending: 0, revenue: 0 });
    };

    const todayStats = calculateStats(todayAppointments);
    const monthStats = calculateStats(monthAppointments);

    res.json({
      success: true,
      today: todayStats,
      thisMonth: monthStats,
      summary: {
        today: `Hoy: ${todayStats.completed} completadas, $${todayStats.revenue.toFixed(2)}`,
        thisMonth: `Este mes: ${monthStats.completed} completadas, $${monthStats.revenue.toFixed(2)}`,
        completionRate: monthStats.total > 0 ? 
          ((monthStats.completed / monthStats.total) * 100).toFixed(1) : 0
      }
    });

  } catch (err) {
    console.error("❌ Error obteniendo estadísticas rápidas:", err);
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas rápidas"
    });
  }
};