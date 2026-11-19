import { useMemo, useState } from 'react';
import type { CalendarEvent, Task } from '../../models';
import { EventEditor } from '../../components/calendar/EventEditor';
import { AgendaSection } from '../../components/dashboard/AgendaSection';
import { ConflictArea } from '../../components/dashboard/ConflictArea';
import { OverdueRecurringDialog } from '../../components/dashboard/OverdueRecurringDialog';
import { SeriesEndNotice } from '../../components/dashboard/SeriesEndNotice';
import { ImportantTaskCard, NextEventCard } from '../../components/dashboard/FocusCards';
import { Greeting } from '../../components/dashboard/Greeting';
import { CapacityBar } from '../../components/shared/CapacityBar';
import { Card } from '../../components/shared/Card';
import { ErrorNote } from '../../components/shared/Feedback';
import { TaskEditor } from '../../components/tasks/TaskEditor';
import { useCategories, useEvents, useSettings, useTasks } from '../../hooks/useData';
import { useNow } from '../../hooks/useNow';
import { useCurrentUser } from '../../hooks/useSession';
import { detectConflicts } from '../../services/dashboard/conflictEngine';
import {
  agendaFor,
  dayCapacity,
  isOverdue,
  mostImportantTask,
  nextEvent,
  openTasksFor,
  restOfWeekDays,
} from '../../services/dashboard/dashboardEngine';
import { overdueRecurring, seriesEndingSoon } from '../../services/recurrence/recurrenceEngine';
import { DEFAULT_OVERDUE_DIALOG_TIME } from '../../models';
import { addDays, toDateKey } from '../../utils/date';

export function DashboardPage() {
  const now = useNow();
  const { userId, profile } = useCurrentUser();
  const { data: tasks, error: tasksError } = useTasks();
  const { data: events, error: eventsError } = useEvents();
  const { byId: categoriesById } = useCategories();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { data: settings } = useSettings();
  // Overdue dialogs closed without a decision reappear on the next visit.
  const [postponed, setPostponed] = useState<string[]>([]);

  const view = useMemo(() => {
    const myOpenTasks = openTasksFor(tasks, userId);
    const important = mostImportantTask(tasks, userId);
    return {
      important,
      importantOverdue: important ? isOverdue(important, now) : false,
      next: nextEvent(events, now),
      conflicts: detectConflicts(events, myOpenTasks, now),
      today: agendaFor(now, events, myOpenTasks),
      tomorrow: agendaFor(addDays(now, 1), events, myOpenTasks),
      week: restOfWeekDays(now).map((d) => agendaFor(d, events, myOpenTasks)),
      capacity: dayCapacity(now, events, myOpenTasks, profile.availableHoursPerDay),
      endingSeries: seriesEndingSoon(tasks, userId, toDateKey(now), settings?.dismissedSeriesIds ?? []),
      overdue: overdueRecurring(tasks, userId, now, settings?.overdueDialogTime ?? DEFAULT_OVERDUE_DIALOG_TIME),
    };
  }, [tasks, events, userId, now, profile.availableHoursPerDay, settings]);
  const overdueTask = view.overdue.find((t) => !postponed.includes(t.id)) ?? null;

  return (
    <div className="page dashboard">
      <Greeting name={profile.displayName} now={now} />
      <ErrorNote message={tasksError ?? eventsError} />

      <div className="focus-grid">
        <ImportantTaskCard
          task={view.important}
          category={view.important ? categoriesById.get(view.important.categoryId) : undefined}
          overdue={view.importantOverdue}
          onOpen={setEditingTask}
        />
        <NextEventCard event={view.next} categoriesById={categoriesById} now={now} onOpen={setEditingEvent} />
      </div>

      <ConflictArea conflicts={view.conflicts} />
      <SeriesEndNotice userId={userId} series={view.endingSeries} />

      <div className="dashboard-grid">
        <AgendaSection
          title="Heute"
          days={[view.today]}
          categoriesById={categoriesById}
          onOpenTask={setEditingTask}
          onOpenEvent={setEditingEvent}
        />
        <AgendaSection
          title="Morgen"
          days={[view.tomorrow]}
          categoriesById={categoriesById}
          onOpenTask={setEditingTask}
          onOpenEvent={setEditingEvent}
        />
        <AgendaSection
          title="Diese Woche"
          days={view.week}
          categoriesById={categoriesById}
          showDayLabels
          onOpenTask={setEditingTask}
          onOpenEvent={setEditingEvent}
        />
        <Card title="Tagesauslastung">
          <CapacityBar
            plannedMinutes={view.capacity.plannedMinutes}
            availableMinutes={view.capacity.availableMinutes}
          />
        </Card>
      </div>

      {editingTask && <TaskEditor task={editingTask} onClose={() => setEditingTask(null)} />}
      {editingEvent && <EventEditor event={editingEvent} onClose={() => setEditingEvent(null)} />}
      {overdueTask && !editingTask && !editingEvent && (
        <OverdueRecurringDialog
          key={overdueTask.id}
          task={overdueTask}
          onClose={() => setPostponed((p) => [...p, overdueTask.id])}
        />
      )}
    </div>
  );
}
