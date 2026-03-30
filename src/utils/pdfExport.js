import { createApp, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import PdfReportView from '../components/PdfReportView.vue'

const RENDER_WIDTH = 1120     // px at scale=1 – matches PdfReportView width
const RENDER_SCALE = 2        // retina quality
const PDF_MARGIN_MM = 10      // margin on all sides in mm

export async function generateProjectPdf(project) {
  // ── 1. Mount PdfReportView in an off-screen container ─────────────────────
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute;
    top: -99999px;
    left: 0;
    width: ${RENDER_WIDTH}px;
    overflow: visible;
  `
  document.body.appendChild(container)

  const app = createApp(PdfReportView, { project })
  app.mount(container)

  // Wait for Vue rendering and any SVG/font paint
  await nextTick()
  await new Promise(r => setTimeout(r, 200))

  try {
    // ── 2. Capture each pdf-section individually ──────────────────────────────
    const sections = container.querySelectorAll('.pdf-section')

    // ── 3. Create jsPDF in A4 landscape ──────────────────────────────────────
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageW = pdf.internal.pageSize.getWidth()   // 297 mm
    const pageH = pdf.internal.pageSize.getHeight()  // 210 mm
    const margin = PDF_MARGIN_MM
    const contentW = pageW - 2 * margin              // usable width in mm
    const contentH = pageH - 2 * margin              // usable height per page in mm

    let isFirstPage = true

    for (const section of sections) {
      const canvas = await html2canvas(section, {
        scale: RENDER_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: RENDER_WIDTH,
        windowWidth: RENDER_WIDTH,
      })

      // Physical dimensions of the captured canvas in pixels
      const canvasW = canvas.width   // RENDER_WIDTH * RENDER_SCALE
      const canvasH = canvas.height

      // How many canvas pixels correspond to one full PDF content-height?
      // contentH / contentW * canvasW  gives us the canvas pixel height for one page
      const pageCanvasPx = (contentH / contentW) * canvasW

      const totalSlices = Math.ceil(canvasH / pageCanvasPx)

      for (let slice = 0; slice < totalSlices; slice++) {
        if (!isFirstPage) {
          pdf.addPage()
        }
        isFirstPage = false

        const srcY = Math.round(slice * pageCanvasPx)
        const srcH = Math.round(Math.min(pageCanvasPx, canvasH - srcY))

        // Draw the slice on a temporary canvas
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvasW
        sliceCanvas.height = srcH
        const ctx = sliceCanvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvasW, srcH)
        ctx.drawImage(canvas, 0, srcY, canvasW, srcH, 0, 0, canvasW, srcH)

        const imgData = sliceCanvas.toDataURL('image/png')
        const scaledH = (srcH / canvasW) * contentW

        pdf.addImage(imgData, 'PNG', margin, margin, contentW, scaledH)
      }
    }

    // ── 4. Save ───────────────────────────────────────────────────────────────
    const safeName = project.name.replace(/[^a-zA-Z0-9äöüÄÖÜß \-_]/g, '').trim() || 'projekt'
    pdf.save(`${safeName}-schaetzung.pdf`)
  } finally {
    // ── 5. Clean up ───────────────────────────────────────────────────────────
    app.unmount()
    document.body.removeChild(container)
  }
}
