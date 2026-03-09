import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { SimulacionResponse } from '../../../hooks/useSimulacion'
import { EscenarioGuardado } from '../../../types/escenario'
import { Button } from '../../common/Button'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

interface Props {
  resultados?: {
    lineal: SimulacionResponse
    rf: SimulacionResponse
  }
  escenario?: EscenarioGuardado
  tipo: 'simulacion' | 'escenario'
  cafeNombre?: string
}

export const PDFGenerator: React.FC<Props> = ({ 
  resultados, 
  escenario, 
  tipo,
  cafeNombre 
}) => {
  const generarPDF = async () => {
    try {
      const doc = new jsPDF()
      let yPos = 20

      // Título
      doc.setFontSize(20)
      doc.setTextColor(101, 78, 59) // brown-700
      doc.text('☕ CafeSense - Informe', 20, yPos)
      yPos += 15

      // Fecha
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos)
      yPos += 15

      if (tipo === 'simulacion' && resultados) {
        // Información de la simulación
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text('Resultados de Simulación', 20, yPos)
        yPos += 10

        doc.setFontSize(12)
        doc.text(`Café: ${resultados.lineal.cafe_nombre}`, 20, yPos)
        yPos += 8
        doc.text(`Precio actual: $${resultados.lineal.precio_actual.toFixed(2)}`, 20, yPos)
        yPos += 8
        doc.text(`Nuevo precio: $${resultados.lineal.nuevo_precio.toFixed(2)}`, 20, yPos)
        yPos += 8
        doc.text(`Cambio: ${resultados.lineal.cambio_porcentaje > 0 ? '+' : ''}${resultados.lineal.cambio_porcentaje.toFixed(1)}%`, 20, yPos)
        yPos += 15

        // Tabla comparativa
        autoTable(doc, {
          startY: yPos,
          head: [['Modelo', 'Demanda', 'Ingreso', 'Impacto']],
          body: [
            ['Actual', 
             resultados.lineal.demanda_actual.toString(), 
             `$${resultados.lineal.ingreso_actual.toFixed(2)}`, 
             '-'],
            ['Lineal', 
             resultados.lineal.demanda_estimada.toString(), 
             `$${resultados.lineal.ingreso_estimado.toFixed(2)}`, 
             `${resultados.lineal.impacto_ingreso > 0 ? '+' : ''}${resultados.lineal.impacto_ingreso.toFixed(1)}%`],
            ['Random Forest', 
             resultados.rf.demanda_estimada.toString(), 
             `$${resultados.rf.ingreso_estimado.toFixed(2)}`, 
             `${resultados.rf.impacto_ingreso > 0 ? '+' : ''}${resultados.rf.impacto_ingreso.toFixed(1)}%`]
          ],
          headStyles: { fillColor: [101, 78, 59] }, // brown-700
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { top: 20 },
        })

        yPos = (doc as any).lastAutoTable.finalY + 15

        // Recomendación - SIN caracteres especiales
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.text('Recomendación:', 20, yPos)
        yPos += 8
        doc.setFontSize(10)
        doc.setTextColor(100)
        
        // Limpiar la recomendación de caracteres especiales
        const recomendacionLimpia = resultados.rf.recomendacion
          .replace(/[^\x20-\x7E]/g, '') // Eliminar caracteres no ASCII
          .replace('ð', '📈')
          .replace('â', '⚖️')
          .replace('ï¸', '')
          .trim()
        
        const recomendacion = doc.splitTextToSize(recomendacionLimpia, 170)
        doc.text(recomendacion, 20, yPos)

      } else if (tipo === 'escenario' && escenario) {
        // Información del escenario guardado
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text('Escenario Guardado', 20, yPos)
        yPos += 10

        doc.setFontSize(12)
        doc.text(`Nombre: ${escenario.nombre}`, 20, yPos)
        yPos += 8
        if (escenario.descripcion) {
          doc.text(`Descripción: ${escenario.descripcion}`, 20, yPos)
          yPos += 8
        }
        doc.text(`Café: ${escenario.cafe_nombre}`, 20, yPos)
        yPos += 8
        doc.text(`Precio original: $${escenario.precio_original.toFixed(2)}`, 20, yPos)
        yPos += 8
        doc.text(`Precio nuevo: $${escenario.precio_nuevo.toFixed(2)}`, 20, yPos)
        yPos += 8
        doc.text(`Cambio: ${escenario.porcentaje_cambio > 0 ? '+' : ''}${escenario.porcentaje_cambio.toFixed(1)}%`, 20, yPos)
        yPos += 8
        doc.text(`Impacto estimado: ${escenario.impacto_rf > 0 ? '+' : ''}${escenario.impacto_rf.toFixed(1)}%`, 20, yPos)
        yPos += 8
        
        // Recomendación limpia para escenario
        const recomendacionLimpia = (escenario.recomendacion || 'No disponible')
          .replace(/[^\x20-\x7E]/g, '')
          .replace('ð', '📈')
          .replace('â', '⚖️')
          .replace('ï¸', '')
          .trim()
        
        doc.text(`Recomendación: ${recomendacionLimpia}`, 20, yPos)
      }

      // Guardar PDF
      const nombreArchivo = tipo === 'simulacion' 
        ? `simulacion_${resultados?.lineal.cafe_nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        : `escenario_${escenario?.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      
      doc.save(nombreArchivo)

    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Por favor intenta de nuevo.')
    }
  }

  return (
    <Button
      onClick={generarPDF}
      variant="secondary"
      className="flex items-center gap-2"
      title="Exportar a PDF"
    >
      <DocumentArrowDownIcon className="h-4 w-4" />
      PDF
    </Button>
  )
}
