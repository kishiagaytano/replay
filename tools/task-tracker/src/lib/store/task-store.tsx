"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { DayGoal, Member, Task, TaskDraft, TaskStatus } from "@/lib/schema/task.schema";
import { createTaskFromDraft } from "@/lib/data/repository";
import { isSupabaseEnabled, taskRepository } from "@/lib/data/repository-factory";

/**
 * Global store (CLAUDE.md §7: Context + reducer, no Redux). It owns tasks +
 * members and talks to the repository — which is either shared Supabase or
 * local storage. Mutations are optimistic (update UI immediately, persist in
 * the background); on error we re-sync from the source of truth.
 */

interface TaskState {
  tasks: Task[];
  members: Member[];
  dayGoals: DayGoal[];
  hydrated: boolean;
}

type TaskAction =
  | { type: "SET"; tasks?: Task[]; members?: Member[]; dayGoals?: DayGoal[]; hydrated?: boolean }
  | { type: "ADD"; task: Task }
  | { type: "PATCH"; id: string; patch: Partial<Task> }
  | { type: "DELETE"; id: string }
  | { type: "PATCH_MEMBER"; id: string; patch: Partial<Member> };

function reducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET":
      return {
        tasks: action.tasks ?? state.tasks,
        members: action.members ?? state.members,
        dayGoals: action.dayGoals ?? state.dayGoals,
        hydrated: action.hydrated ?? state.hydrated,
      };
    case "ADD":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "PATCH":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };
    case "DELETE":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "PATCH_MEMBER":
      return {
        ...state,
        members: state.members.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
      };
    default:
      return state;
  }
}

interface TaskContextValue {
  tasks: Task[];
  members: Member[];
  dayGoals: DayGoal[];
  hydrated: boolean;
  /** True when reading/writing shared Supabase; false in localStorage mode. */
  isCloud: boolean;
  addTask: (draft: TaskDraft) => void;
  updateTask: (id: string, draft: TaskDraft) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  getMember: (id: string) => Member | undefined;
}

const TaskContext = createContext<TaskContextValue | null>(null);

const INITIAL: TaskState = { tasks: [], members: [], dayGoals: [], hydrated: false };

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Load everything from the repository, then keep it in sync via realtime.
  const refresh = useCallback(async () => {
    const [tasks, members] = await Promise.all([
      taskRepository.listTasks(),
      taskRepository.listMembers(),
    ]);
    dispatch({ type: "SET", tasks, members });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [tasks, members, dayGoals] = await Promise.all([
          taskRepository.listTasks(),
          taskRepository.listMembers(),
          taskRepository.listDayGoals(),
        ]);
        if (active) dispatch({ type: "SET", tasks, members, dayGoals, hydrated: true });
      } catch (err) {
        console.error("[tracker] failed to load data:", err);
        // Still mark hydrated so the UI renders (empty) instead of hanging.
        if (active) dispatch({ type: "SET", hydrated: true });
      }
    })();

    const unsubscribe = taskRepository.subscribe?.(() => {
      void refresh();
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [refresh]);

  // Persist helper: run a repository write, and on failure re-sync from source.
  const persist = useCallback(
    (op: Promise<void>) => {
      op.catch((err) => {
        console.error("[tracker] write failed, re-syncing:", err);
        void refresh();
      });
    },
    [refresh],
  );

  const addTask = useCallback(
    (draft: TaskDraft) => {
      const task = createTaskFromDraft(draft);
      dispatch({ type: "ADD", task });
      persist(taskRepository.createTask(task));
    },
    [persist],
  );

  const updateTask = useCallback(
    (id: string, draft: TaskDraft) => {
      const patch: Partial<Task> = { ...draft, updatedAt: new Date().toISOString() };
      dispatch({ type: "PATCH", id, patch });
      persist(taskRepository.updateTask(id, patch));
    },
    [persist],
  );

  const moveTask = useCallback(
    (id: string, status: TaskStatus) => {
      const patch: Partial<Task> = { status, updatedAt: new Date().toISOString() };
      dispatch({ type: "PATCH", id, patch });
      persist(taskRepository.updateTask(id, patch));
    },
    [persist],
  );

  const deleteTask = useCallback(
    (id: string) => {
      dispatch({ type: "DELETE", id });
      persist(taskRepository.deleteTask(id));
    },
    [persist],
  );

  const updateMember = useCallback(
    (id: string, patch: Partial<Member>) => {
      dispatch({ type: "PATCH_MEMBER", id, patch });
      persist(taskRepository.updateMember(id, patch));
    },
    [persist],
  );

  // Stable lookup that always sees the latest members list.
  const membersRef = useRef(state.members);
  membersRef.current = state.members;
  const getMember = useCallback((id: string) => membersRef.current.find((m) => m.id === id), []);

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks: state.tasks,
      members: state.members,
      dayGoals: state.dayGoals,
      hydrated: state.hydrated,
      isCloud: isSupabaseEnabled,
      addTask,
      updateTask,
      moveTask,
      deleteTask,
      updateMember,
      getMember,
    }),
    [state, addTask, updateTask, moveTask, deleteTask, updateMember, getMember],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskStore(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskStore must be used within a <TaskProvider>.");
  return ctx;
}
