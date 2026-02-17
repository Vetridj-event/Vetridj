import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { Booking, User } from '@/types'

export const generateInvoicePDF = (booking: Booking, user: User) => {
    const doc = new jsPDF()
    const primaryColor: [number, number, number] = [212, 175, 55] // Gold-ish #D4AF37

    // --- Header ---
    doc.setFillColor(31, 41, 55) // Dark Slate
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('VETRI DJ EVENTS', 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Toll Gate, Mani Road, Chengam, Tamil Nadu | +91 6381 544 170', 105, 30, { align: 'center' })

    // --- Invoice Info ---
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 20, 55)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Invoice No: INV-${booking.id.slice(-6).toUpperCase()}`, 20, 62)
    doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 20, 67)
    doc.text(`Status: ${booking.status}`, 20, 72)

    // --- Client & Event Details ---
    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO:', 20, 85)
    doc.setFont('helvetica', 'normal')
    doc.text(booking.customerName, 20, 92)
    doc.text(booking.customerPhone || 'N/A', 20, 97)
    doc.text(`${user.city || ''} ${user.pincode || ''}`, 20, 102)

    doc.setFont('helvetica', 'bold')
    doc.text('EVENT DETAILS:', 120, 85)
    doc.setFont('helvetica', 'normal')
    doc.text(`Type: ${booking.eventType}`, 120, 92)
    doc.text(`Date: ${format(new Date(booking.date), 'dd MMM yyyy')}`, 120, 97)
    doc.text(`Venue: ${booking.location || 'N/A'}`, 120, 102)

    // --- Table ---
    const tableData = [
        ['Description', 'Details', 'Amount'],
        ['DJ Package', booking.djPackage || 'Standard Package', `INR ${booking.amount.toLocaleString()}`],
        ['Additional Services', booking.notes ? 'Custom Requirements' : 'None', 'Included'],
    ]

    autoTable(doc, {
        startY: 115,
        head: [['Description', 'Details', 'Amount']],
        body: [
            ['DJ Package', booking.djPackage || 'Standard Package', `INR ${booking.amount.toLocaleString()}`],
            ['Additional Services', booking.notes || 'None', 'Included'],
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        columnStyles: {
            2: { halign: 'right' }
        }
    })

    // --- Financial Summary ---
    const finalY = (doc as any).lastAutoTable.finalY + 10

    doc.setFont('helvetica', 'bold')
    doc.text('SUMMARY:', 120, finalY)

    const summaryX = 140
    const summaryValueX = 190

    doc.setFont('helvetica', 'normal')
    doc.text('Total Amount:', summaryX, finalY + 10)
    doc.text(`INR ${booking.amount.toLocaleString()}`, summaryValueX, finalY + 10, { align: 'right' })

    doc.text('Advance Paid:', summaryX, finalY + 17)
    doc.setTextColor(34, 197, 94) // Green
    doc.text(`INR ${(booking.advanceAmount || 0).toLocaleString()}`, summaryValueX, finalY + 17, { align: 'right' })

    doc.setTextColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(summaryX, finalY + 22, 195, finalY + 22)

    doc.setFont('helvetica', 'bold')
    doc.text('Balance Due:', summaryX, finalY + 30)
    doc.setTextColor(212, 175, 55) // Gold
    doc.text(`INR ${(booking.balanceAmount || 0).toLocaleString()}`, summaryValueX, finalY + 30, { align: 'right' })

    // --- Terms & Footer ---
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('Notes:', 20, finalY + 50)
    doc.text('1. Advance payment is non-refundable.', 20, finalY + 55)
    doc.text('2. Balance payment must be settled before the event start.', 20, finalY + 60)
    doc.text('3. This is a computer generated invoice.', 20, finalY + 65)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text('THANK YOU FOR CHOOSING VETRI DJ EVENTS!', 105, finalY + 85, { align: 'center' })

    // Save PDF
    doc.save(`Invoice_${booking.customerName.replace(/\s+/g, '_')}_${format(new Date(booking.date), 'ddMMyy')}.pdf`)
}
