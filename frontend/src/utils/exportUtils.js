import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToPDF = (data, reportType, dateRange) => {
  try {
    const doc = new jsPDF();
    const title = `${reportType} Report`;
    const subtitle = `Date Range: ${dateRange.startDate} to ${dateRange.endDate}`;
    
    // Add title and subtitle
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 25);

    // Add tables based on report type
    let yPos = 35;
    
    switch (reportType) {
      case 'Vehicle':
        if (data.vehicleTypes) {
          autoTable(doc, {
            startY: yPos,
            head: [['Vehicle Type', 'Count']],
            body: data.vehicleTypes.map(item => [item.type, item.count]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }
        if (data.maintenanceSchedule) {
          autoTable(doc, {
            startY: yPos,
            head: [['Vehicle ID', 'Type', 'Date', 'Status']],
            body: data.maintenanceSchedule.map(item => [
              item.vehicleId,
              item.type,
              item.date,
              item.status
            ]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
        }
        break;
        
      case 'Driver':
        if (data.driverStatus) {
          autoTable(doc, {
            startY: yPos,
            head: [['Status', 'Count']],
            body: data.driverStatus.map(item => [item.status, item.count]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }
        if (data.driverDetails) {
          autoTable(doc, {
            startY: yPos,
            head: [['Driver ID', 'Name', 'Status', 'Performance']],
            body: data.driverDetails.map(item => [
              item.id,
              item.name,
              item.status,
              item.performance
            ]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
        }
        break;
        
      case 'Request':
        if (data.requestTypes) {
          autoTable(doc, {
            startY: yPos,
            head: [['Request Type', 'Count']],
            body: data.requestTypes.map(item => [item.type, item.count]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }
        if (data.requestDetails) {
          autoTable(doc, {
            startY: yPos,
            head: [['Request ID', 'Type', 'Status', 'Date']],
            body: data.requestDetails.map(item => [
              item.id,
              item.type,
              item.status,
              item.date
            ]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
        }
        break;
        
      case 'Financial':
        if (data.revenueBreakdown) {
          autoTable(doc, {
            startY: yPos,
            head: [['Category', 'Amount']],
            body: data.revenueBreakdown.map(item => [item.category, item.amount]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }
        if (data.expenseBreakdown) {
          autoTable(doc, {
            startY: yPos,
            head: [['Category', 'Amount']],
            body: data.expenseBreakdown.map(item => [item.category, item.amount]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }
        if (data.outstandingPayments) {
          autoTable(doc, {
            startY: yPos,
            head: [['ID', 'Amount', 'Due Date', 'Status']],
            body: data.outstandingPayments.map(item => [
              item.id,
              item.amount,
              item.dueDate,
              item.status
            ]),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }
          });
        }
        break;
        
      default:
        doc.text('No data available for export', 14, yPos);
    }

    // Return the PDF data instead of saving it
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to generate PDF report');
  }
};

export const exportToExcel = (data, reportType, dateRange) => {
  const workbook = XLSX.utils.book_new();
  
  // Add metadata
  workbook.Props = {
    Title: `${reportType} Report`,
    Subject: `Date Range: ${dateRange.startDate} to ${dateRange.endDate}`,
    Author: 'Fleet Management System',
    CreatedDate: new Date()
  };

  // Add worksheets based on report type
  switch (reportType) {
    case 'Vehicle':
      if (data.vehicleTypes) {
        const ws1 = XLSX.utils.json_to_sheet(data.vehicleTypes);
        XLSX.utils.book_append_sheet(workbook, ws1, 'Vehicle Types');
      }
      if (data.maintenanceSchedule) {
        const ws2 = XLSX.utils.json_to_sheet(data.maintenanceSchedule);
        XLSX.utils.book_append_sheet(workbook, ws2, 'Maintenance Schedule');
      }
      break;
      
    case 'Driver':
      if (data.driverStatus) {
        const ws1 = XLSX.utils.json_to_sheet(data.driverStatus);
        XLSX.utils.book_append_sheet(workbook, ws1, 'Driver Status');
      }
      if (data.driverDetails) {
        const ws2 = XLSX.utils.json_to_sheet(data.driverDetails);
        XLSX.utils.book_append_sheet(workbook, ws2, 'Driver Details');
      }
      break;
      
    case 'Request':
      if (data.requestTypes) {
        const ws1 = XLSX.utils.json_to_sheet(data.requestTypes);
        XLSX.utils.book_append_sheet(workbook, ws1, 'Request Types');
      }
      if (data.requestDetails) {
        const ws2 = XLSX.utils.json_to_sheet(data.requestDetails);
        XLSX.utils.book_append_sheet(workbook, ws2, 'Request Details');
      }
      break;
      
    case 'Financial':
      if (data.revenueBreakdown) {
        const ws1 = XLSX.utils.json_to_sheet(data.revenueBreakdown);
        XLSX.utils.book_append_sheet(workbook, ws1, 'Revenue Breakdown');
      }
      if (data.expenseBreakdown) {
        const ws2 = XLSX.utils.json_to_sheet(data.expenseBreakdown);
        XLSX.utils.book_append_sheet(workbook, ws2, 'Expense Breakdown');
      }
      if (data.outstandingPayments) {
        const ws3 = XLSX.utils.json_to_sheet(data.outstandingPayments);
        XLSX.utils.book_append_sheet(workbook, ws3, 'Outstanding Payments');
      }
      break;
      
    default:
      const ws = XLSX.utils.aoa_to_sheet([['No data available for export']]);
      XLSX.utils.book_append_sheet(workbook, ws, 'No Data');
  }

  // Return the Excel buffer instead of saving directly
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};

export const exportToCSV = (data, reportType, dateRange) => {
  let csvContent = '';
  
  // Add metadata as comments
  csvContent += `# ${reportType} Report\n`;
  csvContent += `# Date Range: ${dateRange.startDate} to ${dateRange.endDate}\n\n`;

  // Add data based on report type
  switch (reportType) {
    case 'Vehicle':
      if (data.vehicleTypes) {
        csvContent += 'Vehicle Types\n';
        csvContent += 'Type,Count\n';
        data.vehicleTypes.forEach(item => {
          csvContent += `${item.type},${item.count}\n`;
        });
        csvContent += '\n';
      }
      if (data.maintenanceSchedule) {
        csvContent += 'Maintenance Schedule\n';
        csvContent += 'Vehicle ID,Type,Date,Status\n';
        data.maintenanceSchedule.forEach(item => {
          csvContent += `${item.vehicleId},${item.type},${item.date},${item.status}\n`;
        });
      }
      break;
      
    case 'Driver':
      if (data.driverStatus) {
        csvContent += 'Driver Status\n';
        csvContent += 'Status,Count\n';
        data.driverStatus.forEach(item => {
          csvContent += `${item.status},${item.count}\n`;
        });
        csvContent += '\n';
      }
      if (data.driverDetails) {
        csvContent += 'Driver Details\n';
        csvContent += 'ID,Name,Status,Performance\n';
        data.driverDetails.forEach(item => {
          csvContent += `${item.id},${item.name},${item.status},${item.performance}\n`;
        });
      }
      break;
      
    case 'Request':
      if (data.requestTypes) {
        csvContent += 'Request Types\n';
        csvContent += 'Type,Count\n';
        data.requestTypes.forEach(item => {
          csvContent += `${item.type},${item.count}\n`;
        });
        csvContent += '\n';
      }
      if (data.requestDetails) {
        csvContent += 'Request Details\n';
        csvContent += 'ID,Type,Status,Date\n';
        data.requestDetails.forEach(item => {
          csvContent += `${item.id},${item.type},${item.status},${item.date}\n`;
        });
      }
      break;
      
    case 'Financial':
      if (data.revenueBreakdown) {
        csvContent += 'Revenue Breakdown\n';
        csvContent += 'Category,Amount\n';
        data.revenueBreakdown.forEach(item => {
          csvContent += `${item.category},${item.amount}\n`;
        });
        csvContent += '\n';
      }
      if (data.expenseBreakdown) {
        csvContent += 'Expense Breakdown\n';
        csvContent += 'Category,Amount\n';
        data.expenseBreakdown.forEach(item => {
          csvContent += `${item.category},${item.amount}\n`;
        });
        csvContent += '\n';
      }
      if (data.outstandingPayments) {
        csvContent += 'Outstanding Payments\n';
        csvContent += 'ID,Amount,Due Date,Status\n';
        data.outstandingPayments.forEach(item => {
          csvContent += `${item.id},${item.amount},${item.dueDate},${item.status}\n`;
        });
      }
      break;
      
    default:
      csvContent += 'No data available for export\n';
  }

  // Return the CSV content instead of saving directly
  return csvContent;
}; 