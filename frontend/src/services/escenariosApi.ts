import axiosInstance from '../config/axios'
// import { Escenario, EscenarioGuardado } from '../types/escenario'

const API_URL = '/escenarios'

export const escenariosApi = {
  // Guardar un nuevo escenario
  guardar: async (data: any): Promise<any> => {
    const response = await axiosInstance.post(API_URL, data)
    return response.data
  },

  // Obtener todos los escenarios
  obtenerTodos: async (): Promise<any[]> => {
    const response = await axiosInstance.get(API_URL)
    return response.data
  },

  // Obtener un escenario por ID
  obtenerPorId: async (id: number): Promise<any> => {
    const response = await axiosInstance.get(`${API_URL}/${id}`)
    return response.data
  },

  // Eliminar un escenario
  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${API_URL}/${id}`)
  }
}
