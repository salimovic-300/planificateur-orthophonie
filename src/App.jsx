import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, X, Calendar, TrendingUp } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const HOURS = [
  '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', 
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];
const STATUSES = [
  { value: 'présent', label: 'Présent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'absent', label: 'Absent', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'en_attente', label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'annulé', label: 'Annulé', color: 'bg-slate-50 text-slate-700 border-slate-200' }
];

function App() {
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [appointments, setAppointments] = useState({});
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', status: 'présent' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveData();
    }
  }, [appointments, loading]);

  async function loadData() {
    try {
      console.log('🔄 Chargement des données...');
      const response = await fetch('/api/appointments');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Données chargées:', data);
      
      if (data.appointments && Object.keys(data.appointments).length > 0) {
        setAppointments(data.appointments);
        console.log('📊 Rendez-vous trouvés:', Object.keys(data.appointments).length);
      } else {
        console.log('ℹ️ Aucun rendez-vous trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveData() {
    try {
      console.log('💾 Sauvegarde des données...', Object.keys(appointments).length, 'rendez-vous');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointments }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Données sauvegardées:', result);
    } catch (error) {
      console.error('❌ Erreur de sauvegarde:', error);
    }
  }

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function getWeekDates() {
    return DAYS.map((_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      return date;
    });
  }

  function previousWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  }

  function getSlotKey(dayIndex, hour) {
    const date = getWeekDates()[dayIndex];
    return `${formatDate(date)}_${hour}`;
  }

  function addAppointment(dayIndex, hour) {
    if (!formData.firstName.trim() || !formData.lastName.trim()) return;
    
    const key = getSlotKey(dayIndex, hour);
    setAppointments({
      ...appointments,
      [key]: { ...formData }
    });
    
    setFormData({ firstName: '', lastName: '', status: 'présent' });
    setEditingAppointment(null);
  }

  function updateAppointment(key) {
    if (!formData.firstName.trim() || !formData.lastName.trim()) return;
    
    setAppointments({
      ...appointments,
      [key]: { ...formData }
    });
    
    setFormData({ firstName: '', lastName: '', status: 'présent' });
    setEditingAppointment(null);
  }

  function deleteAppointment(key) {
    const newAppointments = { ...appointments };
    delete newAppointments[key];
    setAppointments(newAppointments);
  }

  function startEdit(key, appointment) {
    setEditingAppointment(key);
    setFormData(appointment);
  }

  function cancelEdit() {
    setEditingAppointment(null);
    setFormData({ firstName: '', lastName: '', status: 'présent' });
  }

  function getSessionsSummary() {
    const summary = {};
    Object.entries(appointments).forEach(([key, apt]) => {
      if (apt.status === 'présent') {
        const fullName = `${apt.firstName.trim().toLowerCase()}_${apt.lastName.trim().toLowerCase()}`;
        const displayName = `${apt.firstName} ${apt.lastName}`;
        
        if (!summary[fullName]) {
          summary[fullName] = { name: displayName, count: 0 };
        }
        summary[fullName].count += 1;
      }
    });
    return Object.values(summary).sort((a, b) => a.name.localeCompare(b.name));
  }

  const weekDates = getWeekDates();
  const sessionsSummary = getSessionsSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-lg text-slate-600 font-medium">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Cabinet d'Orthophonie
              </h1>
              <p className="text-sm text-slate-500 font-medium">Hilali Asmae</p>
            </div>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-6">
          {/* Navigation */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <button
                onClick={previousWeek}
                className="p-2.5 hover:bg-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-800">
                  {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - {weekDates[4].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
              </div>
              
              <button
                onClick={nextWeek}
                className="p-2.5 hover:bg-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 text-left font-semibold text-slate-700 min-w-[70px] rounded-tl-xl">
                    Heure
                  </th>
                  {DAYS.map((day, i) => (
                    <th key={i} className={`border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 text-center font-semibold text-slate-700 min-w-[130px] ${i === 4 ? 'rounded-tr-xl' : ''}`}>
                      <div className="text-sm">{day}</div>
                      <div className="text-xs font-normal text-slate-500 mt-1">
                        {weekDates[i].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour, hourIndex) => (
                  <tr key={hour}>
                    <td className={`border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 font-medium text-slate-700 text-sm ${hourIndex === HOURS.length - 1 ? 'rounded-bl-xl' : ''}`}>
                      {hour}
                    </td>
                    {DAYS.map((_, dayIndex) => {
                      const key = getSlotKey(dayIndex, hour);
                      const appointment = appointments[key];
                      const isEditing = editingAppointment === key;
                      const isHovered = hoveredSlot === key;

                      return (
                        <td
                          key={dayIndex}
                          className={`border border-slate-200/50 p-2 relative bg-white/50 ${hourIndex === HOURS.length - 1 && dayIndex === 4 ? 'rounded-br-xl' : ''}`}
                          onMouseEnter={() => setHoveredSlot(key)}
                          onMouseLeave={() => setHoveredSlot(null)}
                        >
                          {appointment && !isEditing ? (
                            <div className={`relative p-3 rounded-xl border-2 ${STATUSES.find(s => s.value === appointment.status)?.color || STATUSES[0].color} shadow-sm hover:shadow-md transition-all duration-200`}>
                              <div className="font-semibold text-sm">
                                {appointment.firstName} {appointment.lastName}
                              </div>
                              <div className="text-xs mt-1 opacity-75">
                                {STATUSES.find(s => s.value === appointment.status)?.label}
                              </div>
                              
                              {isHovered && (
                                <div className="absolute top-2 right-2 flex gap-1">
                                  <button
                                    onClick={() => startEdit(key, appointment)}
                                    className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-200"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                  </button>
                                  <button
                                    onClick={() => deleteAppointment(key)}
                                    className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-rose-50 transition-all duration-200"
                                  >
                                    <X className="w-3.5 h-3.5 text-rose-600" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : isEditing ? (
                            <div className="space-y-2 p-2 bg-blue-50/80 rounded-xl backdrop-blur-sm">
                              <input
                                type="text"
                                placeholder="Prénom"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                              />
                              <input
                                type="text"
                                placeholder="Nom"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                              />
                              <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                              >
                                {STATUSES.map(s => (
                                  <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                              </select>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => updateAppointment(key)}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-all duration-200 shadow-md"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingAppointment(key)}
                              className={`w-full h-full min-h-[70px] flex items-center justify-center rounded-xl transition-all duration-200 ${
                                isHovered ? 'bg-blue-50/80 border-2 border-blue-300/50 shadow-inner' : 'hover:bg-slate-50/50'
                              }`}
                            >
                              {isHovered && (
                                <div className="flex flex-col items-center gap-1">
                                  <Plus className="w-5 h-5 text-blue-600" />
                                  <span className="text-xs text-blue-600 font-medium">Ajouter</span>
                                </div>
                              )}
                            </button>
                          )}
                          
                          {editingAppointment === key && !appointment && (
                            <div className="absolute inset-0 bg-white border-2 border-blue-400 rounded-xl p-2.5 z-10 shadow-2xl">
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder="Prénom"
                                  value={formData.firstName}
                                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Nom"
                                  value={formData.lastName}
                                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                />
                                <select
                                  value={formData.status}
                                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                >
                                  {STATUSES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => addAppointment(dayIndex, hour)}
                                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                                  >
                                    Ajouter
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-all duration-200 shadow-md"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Résumé des Séances</h2>
          </div>
          
          {sessionsSummary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionsSummary.map(({name, count}) => (
                <div key={name} className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                  <span className="font-medium text-slate-800 text-sm">{name}</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-xs font-bold shadow-md">
                    {count} séance{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">Aucune séance présente enregistrée pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;