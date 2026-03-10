import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Loading, ActivityDetailModal } from '../../components';
import { useLandingColors } from '../../landing/theme';
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
import { EditBudgetModal } from './EditBudgetModal';

const SECTION_LABELS: Record<string, string> = {
  itinerary: 'Itinerary',
  budgeting: 'Budgeting',
  organization: 'Organization',
  'shared-map': 'Shared Map',
};

export default function TripDetailPage() {
  const colors = useLandingColors();
  const state = useTripDetail();
  const { logout } = useAuth();
  const { joinTrip, leaveTrip, updateSection, seedFeed } = useSocket();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    editBudgetOpen,
    setEditBudgetOpen,
    handleSaveBudget,
    editTripOpen,
    setEditTripOpen,
    editTitle,
    setEditTitle,
    editDestination,
    setEditDestination,
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
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <p style={{ color: colors.textMuted }}>Trip not found.</p>
          <Link to="/dashboard" className="mt-4 inline-block hover:underline" style={{ color: colors.primary }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="trip-detail-page h-screen flex flex-col w-full overflow-hidden"
      style={{ backgroundColor: colors.background }}
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
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          onShareClick={() => setShareOpen(true)}
          onEditTripClick={state.openEditTrip}
          onNewExpenseClick={() => state.setNewExpenseFormOpen(true)}
          canEdit={canEdit}
          showLogout={showLogout}
          onLogoutToggle={() => setShowLogout((p) => !p)}
          onLogout={logout}
        />
      )}

      <div className="flex-1 flex min-h-0">
        {/* Desktop sidebar */}
        <TripDetailSidebar
          section={section}
          onSectionChange={setSection}
          presenceSectionLabels={SECTION_LABELS}
          tripId={state.id ?? undefined}
          variant="desktop"
        />
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="flex-1 bg-black/40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <TripDetailSidebar
              section={section}
              onSectionChange={(s) => {
                setSection(s);
                setMobileSidebarOpen(false);
              }}
              presenceSectionLabels={SECTION_LABELS}
              tripId={state.id ?? undefined}
              variant="mobile"
            />
          </div>
        )}
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
        destination={editDestination}
        onDestinationChange={setEditDestination}
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

      <EditBudgetModal
        isOpen={editBudgetOpen}
        currency={editCurrency}
        onCurrencyChange={setEditCurrency}
        totalBudget={editTotalBudget}
        onTotalBudgetChange={setEditTotalBudget}
        onSave={handleSaveBudget}
        onClose={() => setEditBudgetOpen(false)}
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
