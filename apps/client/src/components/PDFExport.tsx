import { useRef } from 'react'
import { FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useStore } from '../stores/useStore'

export function PDFExport() {
  const { currentReport, currentPatient, currentUser } = useStore()
  const linkRef = useRef<HTMLAnchorElement>(null)

  const generatePDF = () => {
    if (!currentReport || !currentPatient) return

    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 50
    let y = margin

    const addText = (text: string, size: number, opts?: { bold?: boolean; color?: string }) => {
      doc.setFontSize(size)
      if (opts?.bold) doc.setFont('helvetica', 'bold')
      else doc.setFont('helvetica', 'normal')
      if (opts?.color) {
        const c = opts.color
        // Simple hex to rgb
        const r = parseInt(c.slice(1, 3), 16)
        const g = parseInt(c.slice(3, 5), 16)
        const b = parseInt(c.slice(5, 7), 16)
        doc.setTextColor(r, g, b)
      } else {
        doc.setTextColor(0, 0, 0)
      }
      const lines = doc.splitTextToSize(text, pageW - margin * 2)
      doc.text(lines, margin, y)
      y += lines.length * size * 1.2 + 4
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
    }

    const addLine = () => {
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageW - margin, y)
      y += 12
    }

    // Header
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageW, 80, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('MediVision Pro', margin, 42)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Radiology Report', margin, 58)
    doc.text('Institution Name Placeholder', pageW - margin, 42, { align: 'right' })
    doc.text(new Date().toLocaleDateString(), pageW - margin, 58, { align: 'right' })

    y = 100

    // Patient Demographics
    addText('Patient Information', 14, { bold: true, color: '#0ea5e9' })
    addLine()
    addText(`Name: ${currentPatient.name}`, 10)
    addText(`MRN: ${currentPatient.mrn}`, 10)
    addText(`DOB: ${currentPatient.dateOfBirth}  |  Age: ${currentPatient.age}  |  Sex: ${currentPatient.sex}`, 10)
    addText(`Accession: ${currentPatient.accessionNumber}`, 10)
    addText(`Referring Physician: ${currentPatient.referringPhysician}`, 10)
    addText(`Priority: ${currentPatient.clinicalPriority.toUpperCase()}`, 10)
    y += 8

    // Report
    addText('Radiology Report', 14, { bold: true, color: '#0ea5e9' })
    addLine()
    addText(`Status: ${currentReport.status.toUpperCase()}`, 10, { bold: true })
    addText(`Report Date: ${new Date(currentReport.updatedAt).toLocaleString()}`, 10)
    addText(`Radiologist: ${currentReport.radiologistName}`, 10)
    y += 4

    if (currentReport.clinicalHistory) {
      addText('Clinical History', 11, { bold: true })
      addText(currentReport.clinicalHistory, 10)
      y += 4
    }
    if (currentReport.clinicalIndication) {
      addText('Clinical Indication', 11, { bold: true })
      addText(currentReport.clinicalIndication, 10)
      y += 4
    }
    if (currentReport.technique) {
      addText('Technique', 11, { bold: true })
      addText(currentReport.technique, 10)
      y += 4
    }
    if (currentReport.findings) {
      addText('Findings', 11, { bold: true })
      addText(currentReport.findings, 10)
      y += 4
    }
    if (currentReport.impression) {
      addText('Impression', 11, { bold: true })
      addText(currentReport.impression, 10)
      y += 4
    }
    if (currentReport.recommendations) {
      addText('Recommendations', 11, { bold: true })
      addText(currentReport.recommendations, 10)
      y += 4
    }

    if (currentReport.criticalFindings) {
      y += 4
      doc.setFillColor(254, 242, 242)
      doc.rect(margin, y - 12, pageW - margin * 2, 40, 'F')
      addText('⚠ CRITICAL FINDINGS', 11, { bold: true, color: '#dc2626' })
      y += 8
    }

    // Signature block
    y = Math.max(y, pageH - 140)
    addLine()
    addText('Electronically Signed By:', 10, { bold: true })
    addText(currentUser?.name || currentReport.radiologistName, 10)
    addText(`Role: ${currentUser?.role || 'Radiologist'}`, 10)
    addText(`Date: ${new Date().toLocaleString()}`, 10)
    if (currentUser?.signature) {
      addText(`Signature ID: ${currentUser.signature}`, 9)
    }

    // Footer / Page number
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${pageCount}  |  Confidential - For Medical Use Only`, margin, pageH - 20)
      doc.text(`MediVision Pro © ${new Date().getFullYear()}`, pageW - margin, pageH - 20, { align: 'right' })
    }

    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    if (linkRef.current) {
      linkRef.current.href = url
      linkRef.current.download = `Report_${currentPatient.mrn}_${new Date().toISOString().split('T')[0]}.pdf`
      linkRef.current.click()
    }
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button
        onClick={generatePDF}
        disabled={!currentReport || !currentPatient}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors disabled:opacity-40"
      >
        <FileDown className="w-3.5 h-3.5" />
        Export PDF
      </button>
      <a ref={linkRef} className="hidden" />
    </>
  )
}
