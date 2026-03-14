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

const COLORS = {
  electricBlue: '#0984E3',
  cyanNeon: '#00CEC9',
  nightBlack: '#1E272E',
  cloudWhite: '#F5F6FA',
  gray700: '#334155',
  gray600: '#475569',
  actual: '#64748B',
  lineal: '#0984E3',
  rf: '#00CEC9'
}

export const ComparisonChart: React.FC<Props> = ({ lineal, rf }) => {
  if (!lineal || !rf) return null

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

  const generarCurvaDemanda = () => {
    const puntos = []
    const precioBase = lineal.precio_actual
    const demandaBase = lineal.demanda_actual
    const elasticidad = lineal.elasticidad

    for (let i = -30; i <= 30; i += 5) {
      const precio = precioBase * (1 + i / 100)
      const demandaLineal = demandaBase * Math.pow(precio / precioBase, elasticidad)
      puntos.push({
        precio: Math.round(precio),
        cambio: i,
        demandaLineal: Math.round(demandaLineal),
      })
    }
    return puntos
  }

  const curvaData = generarCurvaDemanda()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-cloud-white text-sm">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Gráfico 1: Comparación de Ingresos y Demanda */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-cloud-white mb-4">
          Comparación de Modelos
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray700} />
            <XAxis dataKey="name" stroke={COLORS.gray700} />
            <YAxis stroke={COLORS.gray700} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: COLORS.cloudWhite }} />
            <Bar dataKey="Actual" fill={COLORS.actual} />
            <Bar dataKey="Lineal" fill={COLORS.lineal} />
            <Bar dataKey="Random Forest" fill={COLORS.rf} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 2: Curva de Demanda */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-cloud-white mb-4">
          Curva de Demanda (Elasticidad: {lineal.elasticidad.toFixed(2)})
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={curvaData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray700} />
            <XAxis 
              dataKey="precio" 
              stroke={COLORS.gray700}
              label={{ value: 'Precio ($)', position: 'insideBottom', offset: -5, fill: COLORS.gray700 }}
            />
            <YAxis 
              stroke={COLORS.gray700}
              label={{ value: 'Demanda', angle: -90, position: 'insideLeft', fill: COLORS.gray700 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: COLORS.cloudWhite }} />
            <Area 
              type="monotone" 
              dataKey="demandaLineal" 
              fill={COLORS.lineal} 
              stroke={COLORS.cyanNeon} 
              fillOpacity={0.3}
              name="Demanda estimada"
            />
            <Line
              type="monotone"
              dataKey="demandaLineal"
              stroke={COLORS.cyanNeon}
              strokeWidth={2}
              dot={{ fill: COLORS.electricBlue, r: 4 }}
              name="Curva de demanda"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 3: Impacto en Ingresos */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-cloud-white mb-4">
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
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray700} />
            <XAxis dataKey="name" stroke={COLORS.gray700} />
            <YAxis stroke={COLORS.gray700} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="ingresos"
              stroke={COLORS.cyanNeon}
              strokeWidth={3}
              dot={{ fill: COLORS.electricBlue, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
