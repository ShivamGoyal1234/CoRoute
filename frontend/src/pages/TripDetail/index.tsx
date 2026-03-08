import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Loading, ActivityDetailModal } from '../../components';
import { landingColors } from '../../landing/theme';
import { tripsApi } from '../../lib/api';
import { useTripDetail } from './useTripDetail';
import { TripDetailHeader } from './TripDetailHeader';
import { BudgetTopNavHeader } from './BudgetTopNavHeader';
import { OrganizationTopNavHeader } from './OrganizationTopNavHeader';
import { TripDetailSidebar } from './TripDetailSidebar';
import { TripDetailMain } from './TripDetailMain';
import { CollaborationFeed } from './CollaborationFeed';
import { ShareTripModal } from './ShareTripModal';
import { EditTripModal } from './EditTripModal';

const SECTION_LABELS: Record<string, string> = {
  itinerary: 'Itinerary',
  budgeting: 'Budgeting',
  organization: 'Organization',
  'shared-map': 'Shared Map',
};

export default function TripDetailPage() {
  const state = useTripDetail();
  const { logout } = useAuth();
  const { joinTrip, leaveTrip, updateSection, seedFeed } = useSocket();

  useEffect(() => {
    if (state.id) {
      joinTrip(state.id, state.section);
      tripsApi.getFeed(state.id).then(({ data }) => seedFeed(data.feed)).catch(() => {});
      return () => leaveTrip();
    }
  }, [state.id, joinTrip, leaveTrip, seedFeed]);

  useEffect(() => {
    if (state.id && state.section) {
      updateSection(state.section);
    }
  }, [state.section, state.id, updateSection]);

  const {
    id,
    trip,
    members,
    loading,
    section,
    setSection,
    activityModalId,
    setActivityModalId,
    shareOpen,
    setShareOpen,
    showLogout,
    setShowLogout,
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
    tripNote,
    setTripNote,
    loadActivities,
    canEdit,
  } = state;

  if (loading || !id) return <Loading message="Loading trip…" />;

  if (!trip) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Trip not found.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="trip-detail-page h-screen flex flex-col w-full bg-white dark:bg-slate-900 overflow-hidden"
      style={{ backgroundColor: landingColors.background }}
    >
      {section === 'budgeting' ? (
        <BudgetTopNavHeader
          tripId={state.id!}
          tripTitle={trip.title}
          section={section}
          onSectionChange={setSection}
          onNewExpenseClick={() => state.setNewExpenseFormOpen(true)}
          showLogout={showLogout}
          onLogoutToggle={() => setShowLogout((p) => !p)}
          onLogout={logout}
        />
      ) : section === 'organization' ? (
        <OrganizationTopNavHeader
          tripId={state.id!}
          tripTitle={trip.title}
          section={section}
          onSectionChange={setSection}
          onUploadClick={() => {}}
          showLogout={showLogout}
          onLogoutToggle={() => setShowLogout((p) => !p)}
          onLogout={logout}
        />
      ) : (
        <TripDetailHeader
          trip={trip}
          members={members}
          section={section}
          onShareClick={() => setShareOpen(true)}
          onNewExpenseClick={() => state.setNewExpenseFormOpen(true)}
          showLogout={showLogout}
          onLogoutToggle={() => setShowLogout((p) => !p)}
          onLogout={logout}
        />
      )}

      <div className="flex-1 flex min-h-0">
        <TripDetailSidebar
          section={section}
          onSectionChange={setSection}
          presenceSectionLabels={SECTION_LABELS}
        />
        <TripDetailMain state={state} />
        <CollaborationFeed
          tripId={state.id ?? null}
          tripNote={tripNote}
          onTripNoteChange={setTripNote}
          useLiveFeed
        />
      </div>

      <EditTripModal
        isOpen={editTripOpen}
        title={editTitle}
        onTitleChange={setEditTitle}
        startDate={editStartDate}
        onStartDateChange={setEditStartDate}
        endDate={editEndDate}
        onEndDateChange={setEditEndDate}
        currency={editCurrency}
        onCurrencyChange={setEditCurrency}
        totalBudget={editTotalBudget}
        onTotalBudgetChange={setEditTotalBudget}
        onSave={state.handleSaveTrip}
        onClose={() => setEditTripOpen(false)}
      />

      <ShareTripModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        members={members}
        isOwner={state.isOwner}
        onInvite={state.handleInvite}
        onRemoveMember={state.handleRemoveMember}
        onUpdateRole={state.handleUpdateRole}
      />

      {activityModalId && (
        <ActivityDetailModal
          activityId={activityModalId}
          canEdit={canEdit}
          onClose={() => setActivityModalId(null)}
          onUpdate={loadActivities}
          onDelete={state.handleDeleteActivity}
          useRealtime
        />
      )}
    </div>
  );
}
