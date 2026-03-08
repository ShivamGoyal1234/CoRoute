import { ItinerarySection } from './ItinerarySection';
import { BudgetingSection } from './BudgetingSection';
import { OrganizationSection } from './OrganizationSection';
import type { useTripDetail } from './useTripDetail';

type TripDetailState = ReturnType<typeof useTripDetail>;

interface TripDetailMainProps {
  state: TripDetailState;
}

export function TripDetailMain({ state }: TripDetailMainProps) {
  const { section, trip, days, stats, checklists, activitiesByDay, selectedDayId, newExpenseFormOpen, setNewExpenseFormOpen, discussionActivityId, setDiscussionActivityId } = state;
  const activities = selectedDayId ? (activitiesByDay[selectedDayId] ?? []) : [];

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
      {section === 'itinerary' && (
        <div className="flex-1 flex min-w-0 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto">
            <ItinerarySection
              days={days}
              selectedDayId={selectedDayId}
              onSelectDay={state.setSelectedDayId}
              activities={activities}
              addActivityDayId={state.addActivityDayId}
              canEdit={state.canEdit}
              newActivityTitle={state.newActivityTitle}
              setNewActivityTitle={state.setNewActivityTitle}
              newActivityDescription={state.newActivityDescription}
              setNewActivityDescription={state.setNewActivityDescription}
              newActivityLocation={state.newActivityLocation}
              setNewActivityLocation={state.setNewActivityLocation}
              newActivityStartTime={state.newActivityStartTime}
              setNewActivityStartTime={state.setNewActivityStartTime}
              newActivityImageUrl={state.newActivityImageUrl}
              setNewActivityImageUrl={state.setNewActivityImageUrl}
              addDayOpen={state.addDayOpen}
              setAddDayOpen={state.setAddDayOpen}
              newDayNumber={state.newDayNumber}
              setNewDayNumber={state.setNewDayNumber}
              newDayDate={state.newDayDate}
              setNewDayDate={state.setNewDayDate}
              newDayNotes={state.newDayNotes}
              setNewDayNotes={state.setNewDayNotes}
              onAddDay={state.handleAddDay}
              onAddActivity={state.handleAddActivity}
              onResetNewActivityForm={state.resetNewActivityForm}
              setAddActivityDayId={state.setAddActivityDayId}
              setSelectedDayId={state.setSelectedDayId}
              onOpenActivity={state.setActivityModalId}
              discussionActivityId={discussionActivityId}
              onOpenChat={setDiscussionActivityId}
              onCloseDiscussion={() => setDiscussionActivityId(null)}
              onDiscussionUpdate={() => state.loadActivities()}
              onReorderActivities={
                selectedDayId
                  ? (reordered) => state.handleReorderActivities(selectedDayId, reordered)
                  : undefined
              }
            />
          </div>
          {/* Inline side panel for activity discussion – kept for later use
          {discussionActivityId && (
            <ActivityDiscussionPanel
              activityId={discussionActivityId}
              canEdit={state.canEdit}
              onClose={() => setDiscussionActivityId(null)}
              onOpenFullActivity={() => {
                state.setActivityModalId(discussionActivityId);
                setDiscussionActivityId(null);
              }}
              onUpdate={() => state.loadActivities()}
            />
          )}
          */}
        </div>
      )}
      {section === 'budgeting' && trip && (
        <BudgetingSection
          trip={trip}
          stats={stats}
          canEdit={state.canEdit}
          onEditBudget={state.openEditTrip}
          newExpenseFormOpen={newExpenseFormOpen}
          onConsumeNewExpenseOpen={() => setNewExpenseFormOpen(false)}
          activitiesByDay={activitiesByDay}
          days={days}
          members={state.members}
          onManualExpenseAdded={async () => {
            await state.loadActivities();
            await state.loadStats();
          }}
        />
      )}
      {section === 'organization' && trip && (
        <OrganizationSection
          tripTitle={trip.title}
          members={state.members}
          checklists={checklists}
          tripFiles={state.tripFiles}
          canEdit={state.canEdit}
          isViewer={trip.userRole === 'viewer'}
          newChecklistTask={state.newChecklistTask}
          setNewChecklistTask={state.setNewChecklistTask}
          onAddChecklistToCategory={state.handleAddChecklistToCategory}
          onToggleChecklist={state.toggleChecklist}
          onDeleteChecklistItem={state.deleteChecklistItem}
          onUploadFile={state.uploadTripFile}
          onDeleteFile={state.deleteTripFile}
        />
      )}
      {section === 'shared-map' && (
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <p className="text-slate-500">Shared Map coming soon.</p>
        </div>
      )}
    </main>
  );
}
