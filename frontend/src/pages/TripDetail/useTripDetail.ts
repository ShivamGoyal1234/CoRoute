import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLoadScript } from '@react-google-maps/api';
import {
  tripsApi,
  daysApi,
  activitiesApi,
  membersApi,
  checklistsApi,
  tripFilesApi,
} from '../../lib/api';
import { geocodeAddress } from '../../utils/geocode';
import type {
  Trip,
  Day,
  Activity,
  Membership,
  ChecklistItem,
  TripFile,
  TripStats,
  MemberRole,
} from '../../types';
import type { SectionId } from './types';
import { useSocket } from '../../contexts/SocketContext';

export function useTripDetail() {
  const { id } = useParams<{ id: string }>();
  const { onTripNotification } = useSocket();

  const [trip, setTrip] = useState<(Trip & { userRole?: MemberRole }) | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [tripFiles, setTripFiles] = useState<TripFile[]>([]);
  const [activitiesByDay, setActivitiesByDay] = useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(true);

  const [section, setSection] = useState<SectionId>('itinerary');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [activityModalId, setActivityModalId] = useState<string | null>(null);
  const [discussionActivityId, setDiscussionActivityId] = useState<string | null>(null);
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [newDayNumber, setNewDayNumber] = useState(1);
  const [newDayDate, setNewDayDate] = useState('');
  const [newDayNotes, setNewDayNotes] = useState('');
  const [newDayError, setNewDayError] = useState<string | null>(null);
  const [addActivityDayId, setAddActivityDayId] = useState<string | null>(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [newActivityLocation, setNewActivityLocation] = useState('');
  const [newActivityStartTime, setNewActivityStartTime] = useState('');
  const [newActivityImageUrl, setNewActivityImageUrl] = useState('');
  const [newChecklistTask, setNewChecklistTask] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState<string>('other');
  const [editTripOpen, setEditTripOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editTotalBudget, setEditTotalBudget] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [editDestination, setEditDestination] = useState('');
  const [tripNote, setTripNote] = useState('');
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [newExpenseFormOpen, setNewExpenseFormOpen] = useState(false);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
  const { isLoaded: isMapsLoaded } = useLoadScript({
    googleMapsApiKey,
    preventGoogleFontsLoading: true,
  });

  const canEdit = trip?.userRole === 'owner' || trip?.userRole === 'editor';
  const isOwner = trip?.userRole === 'owner';

  const loadTrip = async () => {
    if (!id) return;
    try {
      const [tripRes, statsRes] = await Promise.all([
        tripsApi.get(id),
        tripsApi.stats(id).catch(() => ({ data: { stats: { totalDays: 0, totalMembers: 0, totalExpenses: 0 } } })),
      ]);
      setTrip({ ...tripRes.data.trip, userRole: tripRes.data.trip.userRole });
      setMembers(tripRes.data.members);
      setDays(tripRes.data.days);
      setStats(statsRes.data.stats);
      if (!selectedDayId && tripRes.data.days.length > 0) {
        setSelectedDayId(tripRes.data.days[0]._id);
      }
    } catch {
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    const map: Record<string, Activity[]> = {};
    await Promise.all(
      days.map(async (d) => {
        const { data } = await activitiesApi.listByDay(d._id);
        map[d._id] = data.activities;
      })
    );
    setActivitiesByDay(map);
  };

  const loadStats = async () => {
    if (!id) return;
    try {
      const { data } = await tripsApi.stats(id);
      setStats(data.stats);
    } catch {
      // keep existing stats on error
    }
  };

  const loadChecklists = async () => {
    if (!id) return;
    const { data } = await checklistsApi.list(id);
    setChecklists(data.items);
  };

  const loadTripFiles = async () => {
    if (!id) return;
    try {
      const { data } = await tripFilesApi.list(id);
      setTripFiles(data.files);
    } catch {
      setTripFiles([]);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  useEffect(() => {
    if (days.length) loadActivities();
  }, [days.map((d) => d._id).join(',')]);

  useEffect(() => {
    if (id && section === 'organization') {
      loadChecklists();
      loadTripFiles();
    }
  }, [id, section]);

  useEffect(() => {
    if (days.length > 0 && !selectedDayId) setSelectedDayId(days[0]._id);
  }, [days, selectedDayId]);

  const handleAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newDayDate) return;
    try {
      setNewDayError(null);
      await daysApi.create({ tripId: id, dayNumber: newDayNumber, date: newDayDate, notes: newDayNotes || undefined });
      await loadTrip();
      setAddDayOpen(false);
      setNewDayNumber((n) => n + 1);
      setNewDayDate('');
      setNewDayNotes('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to add day';
      setNewDayError(msg);
    }
  };

  const resetNewActivityForm = () => {
    setAddActivityDayId(null);
    setNewActivityTitle('');
    setNewActivityDescription('');
    setNewActivityLocation('');
    setNewActivityStartTime('');
    setNewActivityImageUrl('');
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addActivityDayId || !newActivityTitle.trim()) return;
    try {
      await activitiesApi.create({
        dayId: addActivityDayId,
        title: newActivityTitle.trim(),
        description: newActivityDescription.trim() || undefined,
        location: newActivityLocation.trim() || undefined,
        startTime: newActivityStartTime || undefined,
        imageUrl: newActivityImageUrl.trim() || undefined,
      });
      await loadActivities();
      resetNewActivityForm();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to add activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await activitiesApi.delete(activityId);
      setActivitiesByDay((prev) => {
        const next = { ...prev };
        for (const dayId of Object.keys(next)) {
          next[dayId] = next[dayId].filter((a) => a._id !== activityId);
        }
        return next;
      });
      setActivityModalId(null);
      await loadActivities();
      await loadStats();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to delete activity');
    }
  };

  const handleReorderActivities = async (dayId: string, reordered: Activity[]) => {
    setActivitiesByDay((prev) => ({
      ...prev,
      [dayId]: reordered,
    }));
    try {
      await activitiesApi.reorder(
        reordered.map((a, i) => ({ id: a._id, orderIndex: i }))
      );
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to reorder activities');
      await loadActivities();
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newChecklistTask.trim()) return;
    try {
      await checklistsApi.create({
        tripId: id,
        task: newChecklistTask.trim(),
        category: newChecklistCategory as ChecklistItem['category'],
      });
      await loadChecklists();
      setNewChecklistTask('');
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to add item');
    }
  };

  const handleAddChecklistToCategory = async (task: string, category: string) => {
    if (!id || !task.trim()) return;
    try {
      await checklistsApi.create({
        tripId: id,
        task: task.trim(),
        category: category as ChecklistItem['category'],
      });
      await loadChecklists();
      setNewChecklistTask('');
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to add item');
    }
  };

  const toggleChecklist = async (item: ChecklistItem) => {
    try {
      await checklistsApi.update(item._id, { isCompleted: !item.isCompleted });
      setChecklists((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isCompleted: !i.isCompleted } : i))
      );
    } catch {
      /* noop */
    }
  };

  const deleteChecklistItem = async (itemId: string) => {
    try {
      await checklistsApi.delete(itemId);
      setChecklists((prev) => prev.filter((i) => i._id !== itemId));
    } catch {
      /* noop */
    }
  };

  const uploadTripFile = async (file: File) => {
    if (!id) return;
    try {
      await tripFilesApi.upload(id, file);
      await loadTripFiles();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Upload failed';
      alert(msg);
    }
  };

  const deleteTripFile = async (fileId: string) => {
    try {
      await tripFilesApi.delete(fileId);
      setTripFiles((prev) => prev.filter((f) => f._id !== fileId));
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onTripNotification((notification) => {
      if (notification.metadata?.tripId !== id) return;

      if (
        notification.type === 'activity_added' ||
        notification.type === 'activity_updated' ||
        notification.type === 'activity_deleted'
      ) {
        // Refresh everything touched by activities so itinerary and budgeting stay in sync
        loadTrip();
        loadActivities();
        loadStats();
      }

      if (
        notification.type === 'day_added' ||
        notification.type === 'day_deleted'
      ) {
        loadTrip();
        loadActivities();
        loadStats();
      }
    });
    return unsubscribe;
  }, [id, onTripNotification, loadTrip, loadActivities, loadStats]);

  const handleInvite = async (email: string, role: MemberRole) => {
    if (!id) return;
    await membersApi.invite(id, email, role);
    await loadTrip();
  };

  const handleRemoveMember = async (membershipId: string) => {
    await membersApi.remove(membershipId);
    await loadTrip();
  };

  const handleUpdateRole = async (membershipId: string, role: MemberRole) => {
    await membersApi.updateRole(membershipId, role);
    await loadTrip();
  };

  const openEditTrip = () => {
    if (trip) {
      setEditTitle(trip.title);
      setEditStartDate(trip.startDate.slice(0, 10));
      setEditEndDate(trip.endDate.slice(0, 10));
      setEditTotalBudget(String(trip.totalBudget ?? ''));
      setEditCurrency(trip.baseCurrency ?? 'USD');
      setEditDestination(trip.destination ?? '');
      setEditTripOpen(true);
    }
  };

  const openEditBudget = () => {
    if (trip) {
      setEditCurrency(trip.baseCurrency ?? 'USD');
      setEditTotalBudget(String(trip.totalBudget ?? ''));
      setEditBudgetOpen(true);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await tripsApi.update(id, {
        baseCurrency: editCurrency,
        totalBudget: editTotalBudget ? Number(editTotalBudget) : undefined,
      });
      await loadTrip();
      setEditBudgetOpen(false);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Update failed');
    }
  };

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      let location: { lat: number; lng: number; zoom?: number } | undefined;
      if (editDestination.trim() && isMapsLoaded) {
        const geocoded = await geocodeAddress(editDestination);
        if (geocoded) location = geocoded;
      }
      await tripsApi.update(id, {
        title: editTitle,
        startDate: editStartDate,
        endDate: editEndDate,
        totalBudget: editTotalBudget ? Number(editTotalBudget) : undefined,
        baseCurrency: editCurrency,
        ...(editDestination.trim() ? { destination: editDestination.trim() } : {}),
        ...(location ? { location } : {}),
      });
      await loadTrip();
      setEditTripOpen(false);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Update failed');
    }
  };

  return {
    id,
    trip,
    members,
    days,
    stats,
    checklists,
    tripFiles,
    activitiesByDay,
    loading,
    canEdit,
    isOwner,
    section,
    setSection,
    selectedDayId,
    setSelectedDayId,
    activityModalId,
    setActivityModalId,
    discussionActivityId,
    setDiscussionActivityId,
    addDayOpen,
    setAddDayOpen,
    newDayNumber,
    setNewDayNumber,
    newDayDate,
    setNewDayDate,
    newDayError,
    setNewDayError,
    newDayNotes,
    setNewDayNotes,
    addActivityDayId,
    setAddActivityDayId,
    newActivityTitle,
    setNewActivityTitle,
    newActivityDescription,
    setNewActivityDescription,
    newActivityLocation,
    setNewActivityLocation,
    newActivityStartTime,
    setNewActivityStartTime,
    newActivityImageUrl,
    setNewActivityImageUrl,
    newChecklistTask,
    setNewChecklistTask,
    newChecklistCategory,
    setNewChecklistCategory,
    editBudgetOpen,
    setEditBudgetOpen,
    openEditBudget,
    handleSaveBudget,
    editTripOpen,
    setEditTripOpen,
    editTitle,
    setEditTitle,
    editStartDate,
    setEditStartDate,
    editEndDate,
    setEditEndDate,
    editTotalBudget,
    setEditTotalBudget,
    editCurrency,
    setEditCurrency,
    editDestination,
    setEditDestination,
    tripNote,
    setTripNote,
    shareOpen,
    setShareOpen,
    showLogout,
    setShowLogout,
    newExpenseFormOpen,
    setNewExpenseFormOpen,
    handleAddDay,
    handleAddActivity,
    handleDeleteActivity,
    handleReorderActivities,
    resetNewActivityForm,
    handleAddChecklist,
    handleAddChecklistToCategory,
    toggleChecklist,
    deleteChecklistItem,
    uploadTripFile,
    deleteTripFile,
    loadTripFiles,
    handleInvite,
    handleRemoveMember,
    handleUpdateRole,
    openEditTrip,
    handleSaveTrip,
    loadTrip,
    loadActivities,
    loadStats,
    loadChecklists,
  };
}
