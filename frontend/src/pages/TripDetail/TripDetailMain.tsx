import { ItinerarySection } from './ItinerarySection';
import { BudgetingSection } from './BudgetingSection';
import { OrganizationSection } from './OrganizationSection';
import { RouteMap } from '../../components/RouteMap';
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
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <ItinerarySection
              days={days}
              tripStartDate={trip?.startDate}
              tripEndDate={trip?.endDate}
              newDayError={state.newDayError}
              clearNewDayError={() => state.setNewDayError(null)}
              selectedDayId={selectedDayId}
              onSelectDay={state.setSelectedDayId}
              activities={activities}
              addActivityDayId={state.addActivityDayId}
              canEdit={state.canEdit}
              tripLocation={trip?.location}
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <BudgetingSection
          trip={trip}
          stats={stats}
          canEdit={state.canEdit}
          onEditBudget={state.openEditBudget}
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
        </div>
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
      {section === 'shared-map' && trip && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6">
          <RouteMap
            trip={trip}
            activitiesByDay={activitiesByDay}
            days={days}
            style={{ flex: 1, minHeight: 0 }}
          />
        </div>
      )}
    </main>
  );
}
