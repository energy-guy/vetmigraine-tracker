import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MigraineEntry } from '../types';

export const generateVAPdf = (entries: MigraineEntry[]) => {
  const doc = new jsPDF();
  
  // Sort entries by date descending
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Header
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Migraine Log for VA Disability Claim', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // slate-500
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Total Recorded Episodes: ${entries.length}`, 14, 36);
  
  const prostratingCount = entries.filter(e => e.prostrating).length;
  doc.text(`Total Prostrating Episodes: ${prostratingCount}`, 14, 42);

  // Table Data Preparation
  const tableData = sortedEntries.map(entry => {
    const dateObj = new Date(entry.date);
    const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return [
      formattedDate,
      `${entry.durationHours} hrs`,
      entry.severity.toString(),
      entry.prostrating ? 'YES' : 'No',
      entry.symptoms.join(', ') || 'None noted',
      entry.medication || 'None',
      entry.notes || ''
    ];
  });

  // Generate Table
  autoTable(doc, {
    startY: 50,
    head: [['Date & Time', 'Duration', 'Severity (1-10)', 'Prostrating*', 'Symptoms', 'Medication', 'Notes']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [30, 58, 138], // blue-900 (professional, veteran-appropriate)
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Date
      1: { cellWidth: 20 }, // Duration
      2: { cellWidth: 20, halign: 'center' }, // Severity
      3: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }, // Prostrating
      4: { cellWidth: 40 }, // Symptoms
      5: { cellWidth: 25 }, // Medication
      6: { cellWidth: 'auto' } // Notes
    },
    didParseCell: function(data) {
      // Highlight prostrating 'YES' cells
      if (data.section === 'body' && data.column.index === 3 && data.cell.raw === 'YES') {
        data.cell.styles.textColor = [220, 38, 38]; // red-600 for emphasis
      }
    }
  });

  // Footer / Definitions
  const finalY = (doc as any).lastAutoTable.finalY || 50;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('* Prostrating: VA defines this as attacks that are so severe they require the veteran to stop all activity and seek a dark, quiet room to rest.', 14, finalY + 10, { maxWidth: 180 });

  // Save
  doc.save('VA_Migraine_Log.pdf');
};
