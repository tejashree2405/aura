import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  Send,
  Sparkles,
  MessageSquare,
  Pencil,
  Trash2,
  Menu,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Nav } from "@/components/aura/Nav";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/ask-aura/$conversationId")({
  head: () => ({ meta: [{ title: "Ask Aûra AI — Concierge" }] }),
  component: ConciergePage,
});

type ConvRow = {
  id: string;
  title: string;
  category?: "bridal" | "skincare" | "haircare" | "makeup" | "wellness" | "general";
  createdAt: string;
  updatedAt: string;
};
type MsgRow = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};
type ConversationDetail = { conversation: ConvRow; messages: MsgRow[] };

const CATEGORY_LABEL: Record<NonNullable<ConvRow["category"]>, string> = {
  bridal: "Bridal",
  skincare: "Skincare",
  haircare: "Haircare",
  makeup: "Makeup",
  wellness: "Wellness",
  general: "General",
};

const QUICK_ACTIONS = [
  {
    label: "Build My Skincare Routine",
    prompt: "Help me build a complete skincare routine tailored to my skin.",
  },
  {
    label: "Find My Ideal Salon",
    prompt: "Help me find an ideal luxury salon in Bangalore for my needs.",
  },
  {
    label: "Bridal Beauty Consultation",
    prompt: "I'm getting married soon. Plan a complete bridal beauty preparation.",
  },
  {
    label: "Product Pairing",
    prompt: "Pair me a curated set of beauty products for my goals and budget.",
  },
  {
    label: "Haircare Analysis",
    prompt: "Analyze my haircare needs and suggest a thoughtful routine.",
  },
  { label: "Wellness Ritual Builder", prompt: "Compose a calming weekly wellness ritual for me." },
];

function ConciergePage() {
  const { conversationId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isDraft = conversationId === "new";

  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQ(searchQ.trim()), 220);
    return () => clearTimeout(timeout);
  }, [searchQ]);

  const convsQ = useQuery({
    queryKey: ["concierge", "list", user?.id, debouncedQ],
    queryFn: () => api.listSessions(debouncedQ || undefined) as Promise<ConvRow[]>,
    enabled: !!user,
  });

  const convQ = useQuery({
    queryKey: ["concierge", "conv", conversationId],
    queryFn: () => api.getSession(conversationId) as Promise<ConversationDetail>,
    enabled: !!user && !!conversationId && !isDraft,
  });

  const conv = convQ.data?.conversation ?? null;
  const messages = convQ.data?.messages ?? [];

  const [draft, setDraft] = useState("");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMu = useMutation({
    mutationFn: async (content: string) => {
      const activeId = isDraft ? ((await api.createSession()) as ConvRow).id : conversationId;
      await api.sendMessage(activeId, content);
      return activeId;
    },
    onMutate: (content) => {
      setPendingPrompt(content);
      setDraft("");
    },
    onSuccess: (activeId) => {
      setPendingPrompt(null);
      qc.invalidateQueries({ queryKey: ["concierge", "conv", activeId] });
      qc.invalidateQueries({ queryKey: ["concierge", "list"] });
      if (isDraft) {
        navigate({
          to: "/ask-aura/$conversationId",
          params: { conversationId: activeId },
          replace: true,
        });
      }
    },
    onError: (error) => {
      setPendingPrompt(null);
      toast.error(error instanceof Error ? error.message : "Aûra is momentarily unavailable");
    },
  });

  const submit = (text?: string) => {
    const content = (text ?? draft).trim();
    if (!content || sendMu.isPending) return;
    sendMu.mutate(content);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  useEffect(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [conversationId, sendMu.isPending]);

  useEffect(() => {
    if (convQ.isFetching) return;
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      textareaRef.current?.focus();
    });
  }, [conversationId, convQ.isFetching, messages.length, pendingPrompt]);

  const grouped = useMemo(() => groupByTime(convsQ.data ?? []), [convsQ.data]);

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col">
      <Nav />
      <div className="pt-24 md:pt-28 flex-1 flex">
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`fixed md:sticky top-24 md:top-28 left-0 z-50 md:z-auto h-[calc(100dvh-6rem)] md:h-[calc(100dvh-7rem)] w-[300px] bg-[var(--cream)]/60 backdrop-blur border-r border-foreground/10 flex flex-col transition-transform md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-4 border-b border-foreground/10 flex items-center justify-between md:block">
            <button
              onClick={() => {
                navigate({ to: "/ask-aura/$conversationId", params: { conversationId: "new" } });
                setMobileOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-4 py-2.5 text-sm hover:bg-[var(--earth)] transition-colors disabled:opacity-60"
            >
              <Plus size={14} /> New Consultation
            </button>
            <button onClick={() => setMobileOpen(false)} className="ml-3 md:hidden">
              <X size={18} />
            </button>
          </div>

          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                value={searchQ}
                onChange={(event) => setSearchQ(event.target.value)}
                placeholder="Search consultations"
                className="w-full rounded-full border border-foreground/10 bg-background pl-9 pr-3 py-2 text-xs outline-none focus:border-foreground/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
            {convsQ.isLoading && (
              <p className="px-3 py-6 text-xs text-foreground/40">Loading consultations…</p>
            )}
            {convsQ.isError && (
              <p className="px-3 py-6 text-xs text-foreground/40">
                {getErrorMessage(convsQ.error, "Could not load consultations.")}
              </p>
            )}
            {!convsQ.isLoading && !convsQ.isError && (convsQ.data ?? []).length === 0 && (
              <p className="px-3 py-6 text-xs text-foreground/40">
                {debouncedQ ? "No matches yet." : "No consultations yet. Begin one."}
              </p>
            )}
            {grouped.map(({ label, items }) => (
              <div key={label}>
                <p className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                  {label}
                </p>
                <ul className="space-y-0.5">
                  {items.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      c={conversation}
                      active={conversation.id === conversationId}
                      onOpen={() => {
                        navigate({
                          to: "/ask-aura/$conversationId",
                          params: { conversationId: conversation.id },
                        });
                        setMobileOpen(false);
                      }}
                      onRename={async (title) => {
                        try {
                          await api.renameSession(conversation.id, title);
                          qc.invalidateQueries({ queryKey: ["concierge", "list"] });
                          qc.invalidateQueries({
                            queryKey: ["concierge", "conv", conversation.id],
                          });
                        } catch (error) {
                          toast.error(getErrorMessage(error, "Rename failed"));
                        }
                      }}
                      onDelete={async () => {
                        try {
                          await api.deleteSession(conversation.id);
                          qc.invalidateQueries({ queryKey: ["concierge", "list"] });
                          if (conversation.id === conversationId) navigate({ to: "/ask-aura" });
                          toast.success("Consultation removed");
                        } catch (error) {
                          toast.error(getErrorMessage(error, "Delete failed"));
                        }
                      }}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          <div className="px-4 md:px-8 pt-4 pb-3 border-b border-foreground/10 flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2" onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/40">
                Aûra · Concierge
              </p>
              <h1 className="font-display text-xl md:text-2xl truncate">
                {conv?.title ?? "Consultation"}
              </h1>
            </div>
            {conv && <CategoryBadge category={conv.category ?? "general"} />}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 py-8">
            {convQ.isLoading && !isDraft ? (
              <p className="text-sm text-foreground/40">Opening conversation…</p>
            ) : convQ.isError ? (
              <p className="text-sm text-foreground/40">
                {getErrorMessage(convQ.error, "Could not open this conversation.")}
              </p>
            ) : !convQ.data && !isDraft ? (
              <p className="text-sm text-foreground/40">Opening conversation…</p>
            ) : messages.length === 0 && !pendingPrompt ? (
              <EmptyState onPick={(prompt) => submit(prompt)} />
            ) : (
              <div className="max-w-[760px] mx-auto space-y-6">
                {messages.map((message) => (
                  <Bubble key={message.id} role={message.role} content={message.content} />
                ))}
                {pendingPrompt && <Bubble role="USER" content={pendingPrompt} />}
                {sendMu.isPending && <ComposingShimmer />}
                <div ref={bottomRef} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="px-4 md:px-12 pb-8 pt-4 border-t border-foreground/10 bg-background">
            <div className="max-w-[760px] mx-auto rounded-3xl border border-foreground/15 bg-background p-3 flex items-end gap-3 shadow-[var(--shadow-soft)]">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submit();
                  }
                }}
                rows={2}
                placeholder="Tell Aûra what you're seeking…"
                disabled={sendMu.isPending || convQ.isError}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-foreground/40 disabled:opacity-60"
              />
              <button
                onClick={() => submit()}
                disabled={sendMu.isPending || convQ.isError || !draft.trim()}
                aria-label="Send"
                className="h-10 w-10 shrink-0 grid place-items-center rounded-full bg-foreground text-background hover:bg-[var(--earth)] transition-colors disabled:opacity-40"
              >
                {sendMu.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-foreground/40 text-center">
              Aûra remembers this conversation and may reference what you've shared before.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function CategoryBadge({ category }: { category: NonNullable<ConvRow["category"]> }) {
  return (
    <span className="hidden sm:inline-flex rounded-full bg-[var(--gold)]/15 text-[var(--earth)] text-[10px] uppercase tracking-[0.25em] px-3 py-1">
      {CATEGORY_LABEL[category]}
    </span>
  );
}

function ConversationItem({
  c,
  active,
  onOpen,
  onRename,
  onDelete,
}: {
  c: ConvRow;
  active: boolean;
  onOpen: () => void;
  onRename: (title: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(c.title);
  useEffect(() => {
    setTitle(c.title);
  }, [c.title]);

  if (editing) {
    return (
      <li className="px-2">
        <div className="flex items-center gap-1 rounded-xl bg-background border border-foreground/15 px-2 py-1.5">
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setEditing(false);
                if (title.trim() && title.trim() !== c.title) onRename(title.trim());
              }
              if (event.key === "Escape") {
                setEditing(false);
                setTitle(c.title);
              }
            }}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={() => {
              setEditing(false);
              if (title.trim() && title.trim() !== c.title) onRename(title.trim());
            }}
          >
            <Check size={14} className="text-foreground/60" />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="px-2 group/item">
      <div
        className={`relative flex items-start gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${active ? "bg-background border border-foreground/10 shadow-[var(--shadow-soft)]" : "hover:bg-background/60"}`}
      >
        <button onClick={onOpen} className="flex-1 min-w-0 text-left">
          <p className="text-sm truncate">{c.title}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-foreground/40">
            <span className="rounded-full bg-foreground/5 px-1.5 py-0.5">
              {CATEGORY_LABEL[c.category ?? "general"]}
            </span>
            <span>{formatRelative(c.updatedAt)}</span>
          </div>
        </button>
        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-0.5">
          <button
            title="Rename"
            onClick={(event) => {
              event.stopPropagation();
              setEditing(true);
            }}
            className="p-1 text-foreground/50 hover:text-foreground"
          >
            <Pencil size={12} />
          </button>
          <button
            title="Delete"
            onClick={(event) => {
              event.stopPropagation();
              if (confirm("Delete this consultation?")) onDelete();
            }}
            className="p-1 text-foreground/50 hover:text-[var(--earth)]"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </li>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="max-w-[720px] mx-auto text-center pt-6 md:pt-12">
      <Sparkles size={22} className="mx-auto text-[var(--gold)]" />
      <h2 className="mt-6 font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.1]">
        Your Personal <em className="italic text-[var(--earth)]">Beauty Concierge</em>
      </h2>
      <p className="mt-5 text-sm md:text-base text-foreground/60 max-w-lg mx-auto leading-relaxed">
        Receive tailored recommendations, routines, salon matches, and product guidance designed
        around your goals.
      </p>
      <div className="mt-10 grid sm:grid-cols-2 gap-3 text-left">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onPick(action.prompt)}
            className="rounded-2xl border border-foreground/10 bg-[var(--cream)]/30 p-4 hover:bg-foreground/5 hover:border-foreground/20 transition-all flex items-center gap-3 group"
          >
            <span className="h-9 w-9 rounded-full bg-[var(--gold)]/20 grid place-items-center shrink-0">
              <MessageSquare size={14} className="text-[var(--earth)]" />
            </span>
            <span className="text-sm flex-1">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ role, content }: { role: MsgRow["role"]; content: string }) {
  if (role === "USER") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl bg-foreground text-background px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="h-8 w-8 rounded-full bg-[var(--gold)]/20 grid place-items-center shrink-0">
        <Sparkles size={12} className="text-[var(--earth)]" />
      </span>
      <div className="flex-1 prose prose-sm max-w-none text-foreground/90 leading-relaxed prose-headings:font-display prose-headings:text-foreground prose-p:my-2 prose-li:my-1 prose-blockquote:border-foreground/20 prose-blockquote:text-foreground/70">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function ComposingShimmer() {
  return (
    <div className="flex gap-3 items-center text-sm text-foreground/50">
      <span className="h-8 w-8 rounded-full bg-[var(--gold)]/20 grid place-items-center">
        <Sparkles size={12} className="text-[var(--earth)] animate-pulse" />
      </span>
      <span className="italic">Aûra is composing…</span>
    </div>
  );
}

function groupByTime(items: ConvRow[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const week = new Date(today);
  week.setDate(week.getDate() - 7);
  const groups: Record<string, ConvRow[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };
  for (const conversation of items) {
    const date = new Date(conversation.updatedAt);
    if (date >= today) groups.Today.push(conversation);
    else if (date >= yesterday) groups.Yesterday.push(conversation);
    else if (date >= week) groups["Previous 7 Days"].push(conversation);
    else groups.Older.push(conversation);
  }
  return Object.entries(groups)
    .filter(([, values]) => values.length)
    .map(([label, values]) => ({ label, items: values }));
}

function formatRelative(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
