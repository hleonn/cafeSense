import React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'
import { SimulacionResponse } from '../../../hooks/useSimulacion'

interface Props {
  lineal: SimulacionResponse | null
  rf: SimulacionResponse | null
}

export const ComparisonChart: React.FC<Props> = ({ lineal, rf }) => {
  if (!lineal || !rf) return null

  // Datos para el gráfico de barras (comparación de ingresos y demanda)
  const barData = [
    {
      name: 'Ingresos',
      'Actual': lineal.ingreso_actual,
      'Lineal': lineal.ingreso_estimado,
      'Random Forest': rf.ingreso_estimado,
    },
    {
      name: 'Demanda',
      'Actual': lineal.demanda_actual,
      'Lineal': lineal.demanda_estimada,
      'Random Forest': rf.demanda_estimada,
    }
  ]

  // Datos para el gráfico de elasticidad (simulación de diferentes precios)
  const generarCurvaDemanda = () => {
    const puntos = []
    const precioBase = lineal.precio_actual
    const demandaBase = lineal.demanda_actual
    const elasticidad = lineal.elasticidad

    for (let i = -30; i <= 30; i += 5) {
      const precio = precioBase * (1 + i / 100)
      const demandaLineal = demandaBase * Math.pow(precio / precioBase, elasticidad)
      puntos.push({
        precio: precio.toFixed(2),
        cambio: i,
        demandaLineal: Math.round(demandaLineal),
        // RF podría tener diferentes valores aquí
      })
    }
    return puntos
  }

  const curvaData = generarCurvaDemanda()

  return (
    <div className="space-y-6">
      {/* Gráfico 1: Comparación de Ingresos y Demanda */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          Comparación de Modelos
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Actual" fill="#9ca3af" />
            <Bar dataKey="Lineal" fill="#c17f59" />
            <Bar dataKey="Random Forest" fill="#4a3729" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 2: Curva de Demanda vs Precio */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          Curva de Demanda (Elasticidad: {lineal.elasticidad.toFixed(2)})
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={curvaData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="cambio" 
              label={{ value: 'Cambio de Precio (%)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Demanda (unidades)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="demandaLineal" 
              fill="#c17f59" 
              stroke="#a5673f" 
              fillOpacity={0.3}
              name="Demanda estimada"
            />
            <Line
              type="monotone"
              dataKey="demandaLineal"
              stroke="#4a3729"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Punto actual"
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-brown-500 rounded"></span> Punto actual
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-brown-300 rounded"></span> Proyección
          </span>
        </div>
      </div>

      {/* Gráfico 3: Impacto en Ingresos por Modelo */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          Impacto en Ingresos por Modelo
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={[
              { name: 'Actual', ingresos: lineal.ingreso_actual },
              { name: 'Lineal', ingresos: lineal.ingreso_estimado },
              { name: 'RF', ingresos: rf.ingreso_estimado },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="ingresos"
              stroke="#c17f59"
              strokeWidth={3}
              dot={{ r: 6, fill: '#4a3729' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
