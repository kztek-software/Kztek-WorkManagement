"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, AtSign, Loader2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { MemberDto } from "@/lib/types";
import { RichTextToolbar, handleRichTextKeyDown } from "@/components/ui/rich-text-toolbar";
import { RichMarkdown } from "@/components/ui/rich-markdown";

export const MentionCommentInput = React.memo(function MentionCommentInput({
  members = [],
  onSubmit,
  disabled = false,
  placeholder = "Nhập bình luận... Gõ '@' để gắn thẻ thành viên",
}: {
  members: MemberDto[];
  onSubmit: (data: { body: string; mentionedUserIds: string[] }) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Memoize filtered members to prevent lag on every keystroke
  const filteredMembers = useMemo(() => {
    if (!mentionQuery) return members;
    const q = mentionQuery.toLowerCase();
    return members.filter((m) =>
      m.user.name.toLowerCase().includes(q) ||
      (m.user.email && m.user.email.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q))
    );
  }, [members, mentionQuery]);

  const insertMention = useCallback((member: MemberDto) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const before = text.slice(0, cursorPos);
    const after = text.slice(cursorPos);

    // Find the last '@' before cursor
    const atIndex = before.lastIndexOf("@");
    if (atIndex !== -1) {
      const newBefore = before.slice(0, atIndex);
      const mentionTag = `@${member.user.name} `;
      const newText = newBefore + mentionTag + after;

      setText(newText);
      setMentionedUserIds((prev) => Array.from(new Set([...prev, member.user.id])));
      setShowMentionMenu(false);
      setMentionQuery("");

      setTimeout(() => {
        if (textareaRef.current) {
          const nextPos = newBefore.length + mentionTag.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(nextPos, nextPos);
        }
      }, 0);
    }
  }, [text]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showMentionMenu && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const selected = filteredMembers[selectedIndex];
        if (selected) {
          insertMention(selected);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowMentionMenu(false);
        return;
      }
    }

    // Handle rich text hotkeys (Ctrl+B, Ctrl+I, Ctrl+U, etc.)
    if (handleRichTextKeyDown(e, textareaRef, text, setText)) {
      return;
    }

    // Submit on Ctrl+Enter or Cmd+Enter
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setText(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      // Check if there's no whitespace after @
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (!query.includes("\n") && query.length < 25) {
        setMentionQuery(query);
        setShowMentionMenu(true);
        setSelectedIndex(0);
        return;
      }
    }

    setShowMentionMenu(false);
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        body: text.trim(),
        mentionedUserIds,
      });
      setText("");
      setMentionedUserIds([]);
      setShowMentionMenu(false);
    } finally {
      setSubmitting(false);
    }
  }

  // Trigger @ button click
  function triggerMentionButton() {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const before = text.slice(0, cursorPos);
    const after = text.slice(cursorPos);

    const newText = before + "@" + after;
    setText(newText);
    setShowMentionMenu(true);
    setMentionQuery("");
    setSelectedIndex(0);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = cursorPos + 1;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
      }
    }, 0);
  }

  return (
    <div className="relative space-y-2">
      {/* Mention Autocomplete Dropdown */}
      {showMentionMenu && filteredMembers.length > 0 && (
        <div
          ref={menuRef}
          className="absolute bottom-full left-0 mb-1.5 w-72 rounded-xl border border-line bg-surface-2 p-1.5 shadow-2xl z-50 animate-fade-in-up"
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line/60 flex items-center gap-1">
            <AtSign className="h-3 w-3 text-accent" />
            Gắn thẻ thành viên ({filteredMembers.length})
          </div>
          <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
            {filteredMembers.map((m, idx) => {
              const active = idx === selectedIndex;
              return (
                <button
                  key={m.user.id}
                  type="button"
                  onClick={() => insertMention(m)}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    active ? "bg-accent text-white" : "hover:bg-surface text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6 shrink-0 border border-white/10">
                      <AvatarFallback color={m.user.avatarColor} className="text-[9px] font-bold">
                        {initials(m.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{m.user.name}</div>
                      <div className={`text-[10px] truncate ${active ? "text-white/80" : "text-muted"}`}>
                        {m.user.email || m.role}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded ${
                      active ? "bg-white/20 text-white" : "bg-surface-2 text-muted"
                    }`}
                  >
                    {m.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Comment Textarea Box with Rich Toolbar */}
      <div className="rounded-xl border border-line bg-surface-2/60 p-2 focus-within:border-accent transition-colors shadow-sm space-y-1.5">
        <RichTextToolbar
          textareaRef={textareaRef}
          value={text}
          onChange={setText}
          compact
          disabled={disabled || submitting}
          className="border-none bg-transparent p-0 mb-1"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || submitting}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-xs text-foreground placeholder:text-muted focus:outline-none leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between pt-2 border-t border-line/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerMentionButton}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 h-8 text-xs font-semibold text-muted hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
              title="Gắn thẻ thành viên (@mention)"
            >
              <AtSign className="h-4 w-4 text-accent" />
              <span>Gắn thẻ (@)</span>
            </button>
            <span className="text-[10px] text-muted hidden sm:inline">
              Ctrl+Enter để gửi
            </span>
          </div>

          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!text.trim() || submitting || disabled}
            className="h-9 sm:h-10 px-5 text-xs sm:text-sm font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25 cursor-pointer rounded-xl gap-2 transition-all"
          >
            {submitting ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin mr-0.5" />
            ) : (
              <Send className="h-4.5 w-4.5 mr-0.5" />
            )}
            <span>Gửi bình luận</span>
          </Button>
        </div>
      </div>
    </div>
  );
});

/**
 * Helper render comment body with rich markdown & styled mention badges
 */
export const RenderCommentContent = React.memo(function RenderCommentContent({
  body,
  members = [],
}: {
  body: string;
  members?: MemberDto[];
}) {
  if (!body) return null;

  return <RichMarkdown content={body} members={members} className="space-y-1 text-xs" />;
});
