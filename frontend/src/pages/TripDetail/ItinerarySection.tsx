import { Reorder } from 'framer-motion';
import { landingColors } from '../../landing/theme';
import type { Day, Activity, TripLocation } from '../../types';
import { TripLocationMap } from '../../components/TripLocationMap';
import { ActivityTimelineCard } from './ActivityTimelineCard';
import { AddActivityForm } from './AddActivityForm';

interface ItinerarySectionProps {
  days: Day[];
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
  activities: Activity[];
  addActivityDayId: string | null;
  canEdit: boolean;
  tripLocation?: TripLocation | null;
  newActivityTitle: string;
  setNewActivityTitle: (v: string) => void;
  newActivityDescription: string;
  setNewActivityDescription: (v: string) => void;
  newActivityLocation: string;
  setNewActivityLocation: (v: string) => void;
  newActivityStartTime: string;
  setNewActivityStartTime: (v: string) => void;
  newActivityImageUrl: string;
  setNewActivityImageUrl: (v: string) => void;
  addDayOpen: boolean;
  setAddDayOpen: (v: boolean) => void;
  newDayNumber: number;
  setNewDayNumber: (v: number) => void;
  newDayDate: string;
  setNewDayDate: (v: string) => void;
  newDayNotes?: string;
  setNewDayNotes?: (v: string) => void;
  onAddDay: (e: React.FormEvent) => void;
  onAddActivity: (e: React.FormEvent) => void;
  onResetNewActivityForm: () => void;
  setAddActivityDayId: (v: string | null) => void;
  setSelectedDayId: (v: string | null) => void;
  onOpenActivity: (activityId: string) => void;
  discussionActivityId?: string | null;
  onOpenChat?: (activityId: string) => void;
  onCloseDiscussion?: () => void;
  onDiscussionUpdate?: () => void;
  onReorderActivities?: (reordered: Activity[]) => void;
}

export function ItinerarySection({
  days,
  selectedDayId,
  onSelectDay,
  activities,
  addActivityDayId,
  canEdit,
  tripLocation,
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
  addDayOpen,
  setAddDayOpen,
  newDayNumber,
  setNewDayNumber,
  newDayDate,
  setNewDayDate,
  newDayNotes: _newDayNotes = '',
  setNewDayNotes: _setNewDayNotes,
  onAddDay,
  onAddActivity,
  onResetNewActivityForm,
  setAddActivityDayId,
  setSelectedDayId: _setSelectedDayId,
  onOpenActivity,
  discussionActivityId,
  onOpenChat,
  onCloseDiscussion,
  onDiscussionUpdate,
  onReorderActivities,
}: ItinerarySectionProps) {
  return (
    <>
      <div
        className="shrink-0 px-6 pt-4 pb-3"
        style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}
      >
        <div className="flex items-end gap-8 flex-wrap">
          {days.map((day) => {
            const isActive = selectedDayId === day._id;
            return (
              <button
                key={day._id}
                type="button"
                onClick={() => onSelectDay(day._id)}
                className="text-sm font-semibold uppercase tracking-wide transition-colors focus:outline-none"
                style={{ color: isActive ? landingColors.primary : '#6c757d', marginTop: '24px', marginLeft: '24px' }}
              >
                <span
                  className="inline-block pb-1"
                  style={{
                    borderBottom: isActive ? `3px solid ${landingColors.primary}` : '3px solid transparent',
                  }}
                >
                  Day {day.dayNumber}
                </span>
              </button>
            );
          })}
          {canEdit && (
            <>
              {!addDayOpen ? (
                <div className="flex-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAddDayOpen(true)}
                    className="pb-1 text-sm font-medium uppercase tracking-wide transition-colors focus:outline-none"
                    style={{ color: '#6c757d' }}
                  >
                    + Add Day
                  </button>
                </div>
              ) : (
                <form onSubmit={onAddDay} className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={newDayNumber}
                    onChange={(e) => setNewDayNumber(Number(e.target.value))}
                    className="w-14 px-2 py-1.5 rounded border text-sm"
                    style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
                  />
                  <input
                    type="date"
                    value={newDayDate}
                    onChange={(e) => setNewDayDate(e.target.value)}
                    required
                    className="px-2 py-1.5 rounded border text-sm"
                    style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: landingColors.primary }}>
                    Add
                  </button>
                  <button type="button" onClick={() => setAddDayOpen(false)} className="px-3 py-1.5 rounded-lg text-sm border" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
                    Cancel
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {selectedDayId ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-6 py-4 w-full">
              <div className="relative pl-8">
                <div
                  className="absolute left-[11px] top-2 bottom-2 w-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
                />
                {activities.length === 0 && !addActivityDayId && (
                  <p className="text-sm py-6" style={{ color: landingColors.textMuted }}>
                    No activities yet for this day.
                  </p>
                )}
                {canEdit && onReorderActivities && activities.length > 0 ? (
                  <Reorder.Group
                    axis="y"
                    values={activities}
                    onReorder={onReorderActivities}
                    className="space-y-0"
                  >
                    {activities.map((activity, idx) => (
                      <Reorder.Item
                        key={activity._id}
                        value={activity}
                        className="cursor-grab active:cursor-grabbing list-none"
                      >
                        <ActivityTimelineCard
                          activity={activity as any}
                          index={idx}
                          onOpenDetail={() => onOpenActivity(activity._id)}
                          onOpenChat={onOpenChat}
                          onCloseDiscussion={onCloseDiscussion}
                          isDiscussionOpen={discussionActivityId === activity._id}
                          canEdit={canEdit}
                          onDiscussionUpdate={onDiscussionUpdate}
                          showDragHandle
                          useRealtimeTyping
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                ) : (
                  activities.map((activity, idx) => (
                    <ActivityTimelineCard
                      key={activity._id}
                      activity={activity as any}
                      index={idx}
                      onOpenDetail={() => onOpenActivity(activity._id)}
                      onOpenChat={onOpenChat}
                      onCloseDiscussion={onCloseDiscussion}
                      isDiscussionOpen={discussionActivityId === activity._id}
                      canEdit={canEdit}
                      onDiscussionUpdate={onDiscussionUpdate}
                      useRealtimeTyping
                    />
                  ))
                )}
              </div>
            </div>

            <div className="shrink-0 px-6 pb-4 space-y-4">
              {addActivityDayId === selectedDayId ? (
                <AddActivityForm
                  title={newActivityTitle}
                  onTitleChange={setNewActivityTitle}
                  description={newActivityDescription}
                  onDescriptionChange={setNewActivityDescription}
                  location={newActivityLocation}
                  onLocationChange={setNewActivityLocation}
                  startTime={newActivityStartTime}
                  onStartTimeChange={setNewActivityStartTime}
                  imageUrl={newActivityImageUrl}
                  onImageUrlChange={setNewActivityImageUrl}
                  onSubmit={onAddActivity}
                  onCancel={onResetNewActivityForm}
                />
              ) : canEdit ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setAddActivityDayId(selectedDayId)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white shadow-lg transition-opacity hover:opacity-95 cursor-pointer"
                    style={{
                      backgroundColor: landingColors.secondary,
                      boxShadow: '0 4px 14px 0 rgba(251, 146, 60, 0.4)',
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Activity
                  </button>
                </div>
              ) : null}

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
                <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
                  <span className="text-sm font-medium" style={{ color: landingColors.text }}>
                    Map Preview
                  </span>
                </div>
                <TripLocationMap location={tripLocation} style={{ minHeight: 192, height: 192 }} showZoomControl={false} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <p className="text-slate-500 dark:text-slate-400">Select a day or add one to build your itinerary.</p>
          </div>
        )}
      </div>
    </>
  );
}
