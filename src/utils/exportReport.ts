import jsPDF from 'jspdf';
import { AnalysisResult, Metrics } from '../types';

export const exportReportToPDF = async (
  result: AnalysisResult,
  metrics: Metrics,
  screenshot: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.text('UXMind AI Report', margin, cursorY);
  cursorY += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, cursorY);
  cursorY += 15;

  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Executive Summary', margin, cursorY);
  cursorY += 8;

  doc.setFontSize(12);
  doc.text(`UI Type: ${result.uiType}`, margin, cursorY);
  cursorY += 6;
  doc.text(`Overall UX Score: ${result.uxScore}%`, margin, cursorY);
  cursorY += 6;
  doc.text(`AI Confidence: ${metrics.confidence.toFixed(1)}%`, margin, cursorY);
  cursorY += 15;

  // Detailed Metrics
  doc.setFontSize(16);
  doc.text('2. Detailed Metrics', margin, cursorY);
  cursorY += 8;

  const metricsData = [
    ['Accessibility', `${result.metrics.accessibility}%`],
    ['Mobile Readiness', `${result.metrics.mobile}%`],
    ['Visual Hierarchy', `${result.metrics.hierarchy}%`],
    ['Design Consistency', `${result.metrics.consistency}%`],
  ];

  doc.setFontSize(11);
  metricsData.forEach(([label, value]) => {
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, cursorY);
    doc.setTextColor(0, 0, 0);
    doc.text(value, margin + 50, cursorY);
    cursorY += 6;
  });
  cursorY += 10;

  // Screenshot Section
  doc.setFontSize(16);
  doc.text('3. UI Screenshot', margin, cursorY);
  cursorY += 8;

  try {
    // Add image to PDF
    const img = new Image();
    img.src = screenshot;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const imgWidth = contentWidth;
    const imgHeight = (img.height * imgWidth) / img.width;
    
    // Check if image fits on page, if not, scale it down
    const maxImgHeight = 150;
    let finalImgHeight = imgHeight;
    let finalImgWidth = imgWidth;
    
    if (imgHeight > maxImgHeight) {
      finalImgHeight = maxImgHeight;
      finalImgWidth = (img.width * finalImgHeight) / img.height;
    }

    doc.addImage(screenshot, 'PNG', margin, cursorY, finalImgWidth, finalImgHeight);
    cursorY += finalImgHeight + 15;
  } catch (e) {
    doc.text('[Screenshot could not be loaded]', margin, cursorY);
    cursorY += 10;
  }

  // Issues Section
  if (cursorY > 250) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFontSize(16);
  doc.text('4. Issues Found', margin, cursorY);
  cursorY += 10;

  result.issues.forEach((issue, index) => {
    if (cursorY > 270) {
      doc.addPage();
      cursorY = 20;
    }
    doc.setFontSize(12);
    doc.setTextColor(issue.severity === 'High' ? 220 : 0, 0, 0);
    doc.text(`${index + 1}. [${issue.severity}] ${issue.title}`, margin, cursorY);
    cursorY += 6;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const splitDesc = doc.splitTextToSize(issue.description, contentWidth);
    doc.text(splitDesc, margin, cursorY);
    cursorY += (splitDesc.length * 5) + 5;
  });

  // Recommendations Section
  if (cursorY > 250) {
    doc.addPage();
    cursorY = 20;
  }

  cursorY += 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('5. AI Recommendations', margin, cursorY);
  cursorY += 10;

  result.improvements.forEach((improvement, index) => {
    if (cursorY > 270) {
      doc.addPage();
      cursorY = 20;
    }
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const splitImp = doc.splitTextToSize(`• ${improvement}`, contentWidth);
    doc.text(splitImp, margin, cursorY);
    cursorY += (splitImp.length * 5) + 3;
  });

  // Save the PDF
  doc.save(`UXMind-Report-${new Date().getTime()}.pdf`);
};
