import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCafes } from '../../hooks/useCafes'
import { useSimulacion } from '../../hooks/useSimulacion'
import { useEscenarios } from '../../hooks/useEscenarios'
import { CafeSelector } from '../../components/features/CafeSelector'
import { PriceSlider } from '../../components/features/PriceSlider'
import { ComparisonChart } from '../../components/features/SimulationResults/ComparisonChart'
import { GuardarEscenarioModal } from '../../components/features/Scenarios/GuardarEscenarioModal'
import { ListaEscenarios } from '../../components/features/Scenarios/ListaEscenarios'
import { PDFGenerator } from '../../components/features/PDFGenerator'
import { KPIGrid } from '../../components/features/KPIs'
import { MainLayout } from '../../components/layout/MainLayout'
import { Button } from '../../components/common/Button'
import { BookmarkIcon, LightBulbIcon } from '@heroicons/react/24/outline'

export const Dashboard = () => {
    const { cafes, selectedCafe, setSelectedCafe, loading: loadingCafes } = useCafes()
    const { resultadoLineal, resultadoRF, loading, simular } = useSimulacion()
    const { escenarios, guardarEscenario, eliminarEscenario } = useEscenarios()
    const [porcentaje, setPorcentaje] = useState(10)
    const [modalAbierto, setModalAbierto] = useState(false)

    // Cargar simulación por defecto cuando se selecciona un café
    useEffect(() => {
        if (selectedCafe && !resultadoLineal && !resultadoRF && !loading) {
            console.log('Cargando simulación por defecto para:', selectedCafe.nombre)
            simular({
                cafe_id: selectedCafe.id,
                porcentaje_cambio: 10
            })
        }
    }, [selectedCafe])

    const handleSimular = async () => {
        if (!selectedCafe) {
            toast.error('Por favor selecciona un café')
            return
        }

        toast.promise(
            simular({
                cafe_id: selectedCafe.id,
                porcentaje_cambio: porcentaje
            }),
            {
                loading: 'Calculando impacto...',
                success: '¡Simulación completada!',
                error: 'Error en la simulación'
            }
        )
    }

    const handleGuardar = async (nombre: string, descripcion: string) => {
        if (!selectedCafe || !resultadoRF) return

        toast.promise(
            guardarEscenario({
                nombre,
                descripcion,
                cafe_id: selectedCafe.id,
                cafe_nombre: selectedCafe.nombre,
                precio_original: resultadoRF.precio_actual,
                precio_nuevo: resultadoRF.nuevo_precio,
                porcentaje_cambio: resultadoRF.cambio_porcentaje,
                impacto_lineal: resultadoLineal?.impacto_ingreso || 0,
                impacto_rf: resultadoRF.impacto_ingreso,
                recomendacion: resultadoRF.recomendacion
            }),
            {
                loading: 'Guardando escenario...',
                success: '¡Escenario guardado!',
                error: 'Error al guardar'
            }
        )
        setModalAbierto(false)
    }

    if (loadingCafes) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue" />
                </div>
            </div>
        )
    }

    return (
        <MainLayout title="Dashboard">
            {/* KPIs Grid - Responsive */}
            <KPIGrid />

            {/* Main Grid - Responsive con reordenamiento */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">

                {/* Panel izquierdo - Se muestra segundo en móvil, primero en desktop */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">

                    {/* Panel de Control */}
                    <div className="card p-4 sm:p-6">
                        <h3 className="card-title text-base sm:text-lg mb-3 sm:mb-4">🎮 Panel de Control</h3>
                        <div className="space-y-3 sm:space-y-4">
                            <CafeSelector
                                cafes={cafes}
                                selectedCafe={selectedCafe}
                                onSelect={setSelectedCafe}
                            />

                            {selectedCafe && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-3 sm:space-y-4"
                                >
                                    <PriceSlider
                                        precioActual={selectedCafe.precio_sugerido}
                                        onChange={setPorcentaje}
                                    />

                                    <Button
                                        onClick={handleSimular}
                                        isLoading={loading}
                                        className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                                    >
                                        Simular Impacto
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Lista de Escenarios */}
                    <ListaEscenarios
                        escenarios={escenarios}
                        onEliminar={eliminarEscenario}
                    />
                </div>

                {/* Panel derecho - Se muestra primero en móvil, segundo en desktop */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                    <div className="card p-4 sm:p-6">

                        {/* Header con botones - Stack vertical en móvil, horizontal en desktop */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <h3 className="card-title text-base sm:text-lg">📊 Resultados</h3>

                            {resultadoLineal && resultadoRF && (
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    <PDFGenerator
                                        resultados={{ lineal: resultadoLineal, rf: resultadoRF }}
                                        tipo="simulacion"
                                    />
                                    <Button
                                        onClick={() => setModalAbierto(true)}
                                        variant="secondary"
                                        className="flex items-center gap-2 text-sm py-2"
                                    >
                                        <BookmarkIcon className="h-4 w-4" />
                                        <span className="sm:inline">Guardar</span>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {resultadoLineal && resultadoRF ? (
                            <div className="space-y-4 sm:space-y-6">

                                {/* KPIs de impacto - Grid responsivo */}
                                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-4">
                                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
                                        <p className="text-xs sm:text-sm text-blue-600 mb-1">Impacto Lineal</p>
                                        <p className={`text-base sm:text-2xl font-bold ${
                                            resultadoLineal.impacto_ingreso > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {resultadoLineal.impacto_ingreso > 0 ? '+' : ''}
                                            {resultadoLineal.impacto_ingreso.toFixed(1)}%
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
                                        <p className="text-xs sm:text-sm text-purple-600 mb-1">Impacto RF</p>
                                        <p className={`text-base sm:text-2xl font-bold ${
                                            resultadoRF.impacto_ingreso > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {resultadoRF.impacto_ingreso > 0 ? '+' : ''}
                                            {resultadoRF.impacto_ingreso.toFixed(1)}%
                                        </p>
                                    </div>

                                    <div className="bg-amber-50 p-3 sm:p-4 rounded-lg text-center">
                                        <p className="text-xs sm:text-sm text-amber-600 mb-1">Elasticidad</p>
                                        <p className="text-base sm:text-2xl font-bold text-amber-800">
                                            {resultadoLineal.elasticidad.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Gráfico - Altura responsiva */}
                                <div className="h-48 sm:h-64 lg:h-96">
                                    <ComparisonChart lineal={resultadoLineal} rf={resultadoRF} />
                                </div>

                                {/* Tabla con scroll horizontal */}
                                <div className="overflow-x-auto -mx-4 sm:mx-0">
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden border border-gray-700 sm:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-700">
                                                <thead className="bg-gray-800">
                                                <tr>
                                                    <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Modelo
                                                    </th>
                                                    <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Precio
                                                    </th>
                                                    <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Demanda
                                                    </th>
                                                    <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Ingreso
                                                    </th>
                                                    <th scope="col" className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Δ %
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-gray-900 divide-y divide-gray-800">
                                                {/* Actual */}
                                                <tr className="hover:bg-gray-800 transition-colors">
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                                                        Actual
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        ${resultadoLineal.precio_actual.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        {resultadoLineal.demanda_actual}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        ${resultadoLineal.ingreso_actual.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        -
                                                    </td>
                                                </tr>

                                                {/* Lineal */}
                                                <tr className="bg-gray-800/30 hover:bg-gray-800 transition-colors">
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-electric-blue">
                                                        Lineal
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        ${resultadoLineal.nuevo_precio.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        {resultadoLineal.demanda_estimada}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        ${resultadoLineal.ingreso_estimado.toFixed(2)}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right font-bold ${
                                                        resultadoLineal.impacto_ingreso > 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {resultadoLineal.impacto_ingreso > 0 ? '+' : ''}
                                                        {resultadoLineal.impacto_ingreso.toFixed(1)}%
                                                    </td>
                                                </tr>

                                                {/* Random Forest */}
                                                <tr className="hover:bg-gray-800 transition-colors">
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-cyan-neon">
                                                        Random Forest
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        ${resultadoRF.nuevo_precio.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        {resultadoRF.demanda_estimada}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right text-gray-300">
                                                        ${resultadoRF.ingreso_estimado.toFixed(2)}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right font-bold ${
                                                        resultadoRF.impacto_ingreso > 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {resultadoRF.impacto_ingreso > 0 ? '+' : ''}
                                                        {resultadoRF.impacto_ingreso.toFixed(1)}%
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Recomendación */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-r from-electric-blue/10 to-cyan-neon/10 border-l-4 border-electric-blue p-3 sm:p-4 rounded-lg"
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <LightBulbIcon className="h-5 w-5 sm:h-6 sm:w-6 text-electric-blue flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs sm:text-sm font-semibold text-cloud-white mb-1">
                                                Recomendación
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-300 break-words">
                                                {resultadoRF.recomendacion}
                                            </p>
                                            <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 mt-2 text-xs text-gray-400">
                                                <span>📈 Impacto: {resultadoRF.impacto_ingreso > 0 ? '+' : ''}{resultadoRF.impacto_ingreso.toFixed(1)}%</span>
                                                <span>📊 Elasticidad: {resultadoLineal.elasticidad.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-gray-500">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                >
                                    <span className="text-4xl sm:text-6xl mb-2 sm:mb-4">📊</span>
                                </motion.div>
                                <p className="text-sm sm:text-base text-center px-4">
                                    Selecciona un café y haz clic en "Simular Impacto"
                                </p>
                                <p className="text-xs sm:text-sm mt-2 text-center px-4">
                                    o ajusta el slider para ver resultados
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {resultadoRF && selectedCafe && (
                <GuardarEscenarioModal
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    onGuardar={handleGuardar}
                    cafeNombre={selectedCafe.nombre}
                    impacto={resultadoRF.impacto_ingreso}
                />
            )}
        </MainLayout>
    )
}