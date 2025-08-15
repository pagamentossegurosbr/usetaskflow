import { useState, useEffect, useCallback } from 'react';

export interface Appointment {
  id: string;
  title: string;
  time: string;
  description?: string;
  date: string;
  category: string;
}

export const APPOINTMENT_CATEGORIES = [
  { id: 'work', name: 'Trabalho', color: 'blue', icon: '💼' },
  { id: 'personal', name: 'Pessoal', color: 'green', icon: '👤' },
  { id: 'health', name: 'Saúde', color: 'red', icon: '🏥' },
  { id: 'education', name: 'Educação', color: 'purple', icon: '📚' },
  { id: 'social', name: 'Social', color: 'pink', icon: '👥' },
  { id: 'finance', name: 'Financeiro', color: 'yellow', icon: '💰' },
  { id: 'travel', name: 'Viagem', color: 'indigo', icon: '✈️' },
  { id: 'other', name: 'Outro', color: 'gray', icon: '📌' },
];

export function useCalendarData() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar compromissos do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAppointments = localStorage.getItem('calendar-appointments');
      if (savedAppointments) {
        try {
          const parsedAppointments = JSON.parse(savedAppointments);
          // Migrar compromissos antigos que não têm categoria
          const migratedAppointments = parsedAppointments.map((appointment: any) => ({
            ...appointment,
            category: appointment.category || 'other'
          }));
          setAppointments(migratedAppointments);
        } catch (error) {
          console.error('Erro ao carregar compromissos:', error);
          setAppointments([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Salvar compromissos no localStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('calendar-appointments', JSON.stringify(appointments));
    }
  }, [appointments, isLoaded]);

  // Adicionar novo compromisso
  const addAppointment = useCallback((appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, []);

  // Remover compromisso
  const removeAppointment = useCallback((appointmentId: string) => {
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
  }, []);

  // Atualizar compromisso
  const updateAppointment = useCallback((appointmentId: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(app => 
      app.id === appointmentId ? { ...app, ...updates } : app
    ));
  }, []);

  // Obter compromissos de uma data específica
  const getAppointmentsByDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment.date.startsWith(dateString)
    );
  }, [appointments]);

  // Obter compromissos de um período
  const getAppointmentsByPeriod = useCallback((startDate: Date, endDate: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  }, [appointments]);

  // Verificar se uma data tem compromissos
  const hasAppointmentsOnDate = useCallback((date: Date) => {
    return getAppointmentsByDate(date).length > 0;
  }, [getAppointmentsByDate]);

  // Obter categorias únicas de compromissos em uma data
  const getAppointmentCategoriesOnDate = useCallback((date: Date) => {
    const dayAppointments = getAppointmentsByDate(date);
    const categories = Array.from(new Set(dayAppointments.map(app => app.category)));
    return categories;
  }, [getAppointmentsByDate]);

  // Limpar todos os compromissos
  const clearAllAppointments = useCallback(() => {
    setAppointments([]);
  }, []);

  // Exportar compromissos
  const exportAppointments = useCallback(() => {
    const dataStr = JSON.stringify(appointments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compromissos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [appointments]);

  // Importar compromissos
  const importAppointments = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedAppointments = JSON.parse(content);
          
          if (Array.isArray(importedAppointments)) {
            // Migrar compromissos importados que não têm categoria
            const migratedAppointments = importedAppointments.map((appointment: any) => ({
              ...appointment,
              category: appointment.category || 'other'
            }));
            setAppointments(migratedAppointments);
            resolve();
          } else {
            reject(new Error('Formato de arquivo inválido'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, []);

  return {
    appointments,
    isLoaded,
    addAppointment,
    removeAppointment,
    updateAppointment,
    getAppointmentsByDate,
    getAppointmentsByPeriod,
    hasAppointmentsOnDate,
    getAppointmentCategoriesOnDate,
    clearAllAppointments,
    exportAppointments,
    importAppointments,
  };
} 