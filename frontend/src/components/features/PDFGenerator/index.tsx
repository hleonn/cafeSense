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
}

// Colores del tema High-Contrast-Tech
// const COLORS = {
//   electricBlue: '#0984E3',
//   cyanNeon: '#00CEC9',
//   nightBlack: '#1E272E',
//   cloudWhite: '#F5F6FA',
//   gray700: '#334155',
//   gray600: '#475569',
//   gray500: '#64748B',
//   greenSuccess: '#10B981',
//   redError: '#EF4444'
// }

export const PDFGenerator: React.FC<Props> = ({ 
  resultados, 
  escenario, 
  tipo 
}) => {
  const generarPDF = async () => {
    try {
      const doc = new jsPDF()
      let yPos = 20

      // Título con color electric-blue
      doc.setFontSize(24)
      doc.setTextColor(9, 132, 227) // #0984E3
      doc.text('☕ CafeSense', 20, yPos)
      yPos += 8

      // Subtítulo
      doc.setFontSize(16)
      doc.setTextColor(0, 206, 201) // #00CEC9
      doc.text('Informe de Simulación', 20, yPos)
      yPos += 12

      // Línea separadora
      doc.setDrawColor(9, 132, 227)
      doc.setLineWidth(0.5)
      doc.line(20, yPos - 4, 190, yPos - 4)
      
      // Fecha
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139) // gray-500
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}`, 20, yPos)
      yPos += 15

      if (tipo === 'simulacion' && resultados) {
        // Información de la simulación en caja
        doc.setFillColor(30, 39, 46) // night-black
        doc.setDrawColor(9, 132, 227) // electric-blue
        doc.roundedRect(20, yPos - 5, 170, 45, 3, 3, 'FD')
        
        doc.setTextColor(245, 246, 250) // cloud-white
        doc.setFontSize(12)
        doc.text(`Café: ${resultados.lineal.cafe_nombre}`, 25, yPos + 5)
        yPos += 8
        doc.text(`Precio actual: $${resultados.lineal.precio_actual.toFixed(2)}`, 25, yPos + 5)
        yPos += 8
        doc.text(`Nuevo precio: $${resultados.lineal.nuevo_precio.toFixed(2)}`, 25, yPos + 5)
        yPos += 8
        doc.text(`Cambio: ${resultados.lineal.cambio_porcentaje > 0 ? '+' : ''}${resultados.lineal.cambio_porcentaje.toFixed(1)}%`, 25, yPos + 5)
        yPos += 20

        // Tabla comparativa con colores
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
             {
               content: `${resultados.lineal.impacto_ingreso > 0 ? '+' : ''}${resultados.lineal.impacto_ingreso.toFixed(1)}%`,
               styles: {
                 textColor: resultados.lineal.impacto_ingreso > 0 ? [16, 185, 129] : [239, 68, 68] // green o red
               }
             }],
            ['Random Forest', 
             resultados.rf.demanda_estimada.toString(), 
             `$${resultados.rf.ingreso_estimado.toFixed(2)}`, 
             {
               content: `${resultados.rf.impacto_ingreso > 0 ? '+' : ''}${resultados.rf.impacto_ingreso.toFixed(1)}%`,
               styles: {
                 textColor: resultados.rf.impacto_ingreso > 0 ? [16, 185, 129] : [239, 68, 68]
               }
             }]
          ],
          headStyles: { 
            fillColor: [9, 132, 227], // electric-blue
            textColor: [245, 246, 250], // cloud-white
            fontStyle: 'bold'
          },
          alternateRowStyles: { 
            fillColor: [30, 39, 46] // night-black
          },
          bodyStyles: {
            textColor: [245, 246, 250] // cloud-white
          },
          margin: { top: 20, left: 20, right: 20 },
        })

        yPos = (doc as any).lastAutoTable.finalY + 15

        // Recomendación en caja destacada
        doc.setFillColor(30, 39, 46) // night-black
        doc.setDrawColor(0, 206, 201) // cyan-neon
        doc.roundedRect(20, yPos - 5, 170, 25, 3, 3, 'FD')
        
        doc.setFontSize(12)
        doc.setTextColor(0, 206, 201) // cyan-neon
        doc.text('Recomendación:', 25, yPos + 5)
        
        doc.setFontSize(11)
        doc.setTextColor(245, 246, 250) // cloud-white
        
        // Limpiar caracteres especiales
        const recomendacionLimpia = resultados.rf.recomendacion
          .replace(/[^\x20-\x7E]/g, '')
          .replace('ð', '📈')
          .replace('â', '⚖️')
          .replace('ï¸', '')
          .trim()
        
        doc.text(recomendacionLimpia, 25, yPos + 15)

      } else if (tipo === 'escenario' && escenario) {
        // Información del escenario
        doc.setFillColor(30, 39, 46)
        doc.setDrawColor(9, 132, 227)
        doc.roundedRect(20, yPos - 5, 170, 60, 3, 3, 'FD')
        
        doc.setTextColor(245, 246, 250)
        doc.setFontSize(14)
        doc.text(`Escenario: ${escenario.nombre}`, 25, yPos + 5)
        yPos += 10
        
        doc.setFontSize(11)
        doc.text(`Café: ${escenario.cafe_nombre}`, 25, yPos + 5)
        yPos += 7
        doc.text(`Precio original: $${escenario.precio_original.toFixed(2)}`, 25, yPos + 5)
        yPos += 7
        doc.text(`Precio nuevo: $${escenario.precio_nuevo.toFixed(2)}`, 25, yPos + 5)
        yPos += 7
        doc.text(`Cambio: ${escenario.porcentaje_cambio > 0 ? '+' : ''}${escenario.porcentaje_cambio.toFixed(1)}%`, 25, yPos + 5)
        yPos += 7
        
        const impactoColor = escenario.impacto_rf > 0 ? [16, 185, 129] : [239, 68, 68]
        doc.setTextColor(impactoColor[0], impactoColor[1], impactoColor[2])
        doc.text(`Impacto: ${escenario.impacto_rf > 0 ? '+' : ''}${escenario.impacto_rf.toFixed(1)}%`, 25, yPos + 5)
        yPos += 15
        
        if (escenario.descripcion) {
          doc.setTextColor(148, 163, 184) // gray-400
          doc.text(`Descripción: ${escenario.descripcion}`, 25, yPos + 5)
        }
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
