import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useApp } from '../context/useApp';
import { useI18n } from '../i18n/useI18n';
import { formatNotificationDate, renderNotificationPreview } from '../lib/notificationInbox';

const getThreadStatusMeta = (status, isHe) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'in_progress') {
    return {
      label: isHe ? 'בטיפול' : 'In Progress',
      background: '#dbeafe',
      color: '#1d4ed8'
    };
  }

  return {
    label: isHe ? 'נשלח' : 'Submitted',
    background: '#fef3c7',
    color: '#92400e'
  };
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useI18n();
  const isHe = language === 'he';
  const activeContactId = searchParams.get('contact');
  const isThreadView = Boolean(activeContactId);
  const {
    getNotifications,
    markNotificationsRead,
    unreadNotificationCount,
    loading,
    getAdminContactThread,
    replyToAdminContact,
    addNotification
  } = useApp();

  const [items, setItems] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [thread, setThread] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const loadNotifications = async (onlyUnread = unreadOnly) => {
    setPageLoading(true);
    const result = await getNotifications({
      limit: 100,
      unreadOnly: onlyUnread
    });
    setPageLoading(false);

    if (!result.success) {
      return;
    }

    setThread(null);
    setItems(result.data || []);
  };

  const markThreadMessagesAsRead = async (messages = []) => {
    const unreadIds = messages
      .filter((item) => !item.isRead && !item.isOwnMessage)
      .map((item) => item.id);

    if (unreadIds.length === 0) {
      return;
    }

    const result = await markNotificationsRead(unreadIds);
    if (!result.success) {
      return;
    }

    setThread((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        messages: prev.messages.map((item) => (
          unreadIds.includes(item.id) ? { ...item, isRead: true } : item
        ))
      };
    });
  };

  const loadThread = async () => {
    if (!activeContactId) {
      setThread(null);
      return;
    }

    setPageLoading(true);
    const result = await getAdminContactThread(activeContactId);
    setPageLoading(false);

    if (!result.success) {
      setThread(null);
      return;
    }

    const payload = {
      ...(result.data || {}),
      messages: Array.isArray(result.data?.messages) ? result.data.messages : []
    };

    setItems([]);
    setThread(payload);
    await markThreadMessagesAsRead(payload.messages);
  };

  useEffect(() => {
    if (isThreadView) {
      setReplyDraft('');
      loadThread();
      return;
    }

    setReplyDraft('');
    loadNotifications(unreadOnly);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContactId, isThreadView, unreadOnly]);

  const handleMarkRead = async (notificationId) => {
    const result = await markNotificationsRead([notificationId]);
    if (!result.success) {
      return;
    }

    setItems((prev) => unreadOnly
      ? prev.filter((item) => item.id !== notificationId)
      : prev.map((item) => (
        item.id === notificationId ? { ...item, isRead: true } : item
      )));
  };

  const handleMarkAllRead = async () => {
    const result = await markNotificationsRead();
    if (!result.success) {
      return;
    }

    setItems((prev) => unreadOnly ? [] : prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleOpen = async (item) => {
    if (!item.isRead) {
      await handleMarkRead(item.id);
    }

    if (item.actionPath) {
      navigate(item.actionPath);
    }
  };

  const handleSendReply = async () => {
    if (!replyDraft.trim()) {
      addNotification(isHe ? 'נא לכתוב הודעה לפני השליחה' : 'Please write a message before sending', 'error');
      return;
    }

    if (!activeContactId) {
      return;
    }

    setIsSendingReply(true);
    const result = await replyToAdminContact(activeContactId, replyDraft.trim());
    setIsSendingReply(false);

    if (!result.success) {
      return;
    }

    setReplyDraft('');
    await loadThread();
  };

  if (isThreadView) {
    const messages = thread?.messages || [];
    const statusMeta = getThreadStatusMeta(thread?.status, isHe);
    const ownerName = thread?.ownerName || (isHe ? 'משתמש/ת' : 'User');

    return (
      <div style={styles.page}>
        {(loading || pageLoading) && <LoadingSpinner fullScreen />}

        <section style={styles.threadHero}>
          <div style={styles.threadHeroCopy}>
            <button type="button" onClick={() => navigate('/messages')} style={styles.backButton}>
              ← {isHe ? 'חזרה לתיבה' : 'Back to inbox'}
            </button>
            <h1 style={styles.title}>{thread?.subject || (isHe ? 'פנייה פרטית למנהלים' : 'Private admin thread')}</h1>
            <p style={styles.subtitle}>
              {thread?.viewerIsAdmin
                ? (isHe
                  ? `פנייה פרטית מ-${ownerName}. כל תגובה כאן נשלחת לכל המנהלים ולפותח/ת הפנייה.`
                  : `Private thread from ${ownerName}. Every reply here is shared with all admins and the original requester.`)
                : (isHe
                  ? 'זהו שרשור פרטי עם המנהלים. כל תגובת מנהל תופיע כאן ותהיה גלויה לכל צוות הניהול.'
                  : 'This is a private thread with the admin team. Any admin reply will appear here and be shared across the managers.')}
            </p>
          </div>

          <div style={styles.threadMeta}>
            <span style={{ ...styles.statusPill, background: statusMeta.background, color: statusMeta.color }}>
              {statusMeta.label}
            </span>
            <span style={styles.threadMetaText}>
              {formatNotificationDate(thread?.submittedAt, language)}
            </span>
          </div>
        </section>

        {!thread ? (
          <Card style={styles.emptyCard} hoverable={false}>
            <div style={styles.emptyIcon}>✉️</div>
            <div style={styles.emptyTitle}>{isHe ? 'השרשור לא זמין' : 'Thread unavailable'}</div>
            <div style={styles.emptyText}>
              {isHe
                ? 'לא הצלחנו לטעון את השרשור הזה או שאין לך הרשאה לצפות בו.'
                : 'We could not load this thread, or you do not have permission to view it.'}
            </div>
          </Card>
        ) : (
          <Card style={styles.threadCard} hoverable={false}>
            <div style={styles.threadWrap}>
              {messages.length === 0 ? (
                <div style={styles.emptyThread}>
                  {isHe ? 'עדיין אין הודעות בשרשור הזה.' : 'There are no messages in this thread yet.'}
                </div>
              ) : (
                messages
                  .slice()
                  .reverse()
                  .map((item) => {
                    const senderLabel = item.isOwnMessage
                      ? (isHe ? 'אני' : 'You')
                      : (item.senderName || (thread.viewerIsAdmin ? ownerName : (isHe ? 'מנהל/ת' : 'Admin')));

                    return (
                      <div
                        key={item.id}
                        style={{
                          ...styles.messageBubble,
                          ...(item.isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther)
                        }}
                      >
                        <div style={styles.messageMetaRow}>
                          <strong>{senderLabel}</strong>
                          <span style={styles.smallMeta}>
                            {formatNotificationDate(item.createdAt || item.scheduledAt, language)}
                          </span>
                        </div>
                        <div style={styles.messageBody}>
                          {item.messageBody}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div style={styles.composeWrap}>
              <textarea
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
                placeholder={isHe
                  ? 'כתבו כאן תגובה שתישלח למשתמש ולכל המנהלים בשרשור.'
                  : 'Write a reply that will be shared with the user and all admins in this thread.'}
                style={styles.textarea}
                rows={4}
              />
              <div style={styles.composeActions}>
                <Button variant="secondary" onClick={() => navigate('/messages')}>
                  {isHe ? 'חזרה לתיבה' : 'Back'}
                </Button>
                <Button onClick={handleSendReply} disabled={isSendingReply}>
                  {isSendingReply ? (isHe ? 'שולח/ת...' : 'Sending...') : (isHe ? 'שליחת תגובה' : 'Send Reply')}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {(loading || pageLoading) && <LoadingSpinner fullScreen />}

      <section style={styles.hero}>
        <div>
          <h1 style={styles.title}>{isHe ? 'תיבת הודעות' : 'Message Inbox'}</h1>
          <p style={styles.subtitle}>
            {isHe
              ? `כאן מופיעים אישורים, ביטולים, תזכורות, הודעות תיאום ושרשורים פרטיים מול המנהלים. ${unreadNotificationCount > 0 ? `יש ${unreadNotificationCount} הודעות שלא נקראו.` : 'אין כרגע הודעות שלא נקראו.'}`
              : `Approvals, cancellations, reminders, coordination messages, and private admin threads appear here. ${unreadNotificationCount > 0 ? `You have ${unreadNotificationCount} unread messages.` : 'You have no unread messages right now.'}`}
          </p>
        </div>

        <div style={styles.toolbar}>
          <Button variant={unreadOnly ? 'secondary' : 'primary'} onClick={() => setUnreadOnly(false)}>
            {isHe ? 'הכול' : 'All'}
          </Button>
          <Button variant={unreadOnly ? 'primary' : 'secondary'} onClick={() => setUnreadOnly(true)}>
            {isHe ? 'רק לא נקראו' : 'Unread Only'}
          </Button>
          <Button variant="secondary" onClick={handleMarkAllRead} disabled={unreadNotificationCount === 0}>
            {isHe ? 'סימון הכול כנקרא' : 'Mark All Read'}
          </Button>
        </div>
      </section>

      <section style={styles.list}>
        {items.length === 0 ? (
          <Card style={styles.emptyCard} hoverable={false}>
            <div style={styles.emptyIcon}>✉️</div>
            <div style={styles.emptyTitle}>{isHe ? 'אין הודעות להצגה' : 'No messages to show'}</div>
            <div style={styles.emptyText}>
              {unreadOnly
                ? (isHe ? 'כל ההודעות כבר נקראו.' : 'All messages are already read.')
                : (isHe ? 'כאשר יהיו עדכונים במערכת, הם יופיעו כאן.' : 'When new updates arrive, they will appear here.')}
            </div>
          </Card>
        ) : (
          items.map((item) => {
            const preview = renderNotificationPreview(item, language);

            return (
              <Card
                key={item.id}
                style={{
                  ...styles.card,
                  ...(item.isRead ? styles.cardRead : styles.cardUnread)
                }}
                hoverable={false}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.headerLeft}>
                    <div style={styles.cardTitle}>{preview.title}</div>
                    {!item.isRead && <span style={styles.unreadPill}>{isHe ? 'חדש' : 'New'}</span>}
                  </div>
                  <div style={styles.timeLabel}>{formatNotificationDate(item.createdAt || item.scheduledAt, language)}</div>
                </div>

                <div style={styles.cardBody}>{preview.body}</div>

                <div style={styles.cardFooter}>
                  <div style={styles.metaRow}>
                    {item.courseName && <span style={styles.coursePill}>{item.courseName}</span>}
                    {item.counterpartName && <span style={styles.counterpartLabel}>{item.counterpartName}</span>}
                  </div>

                  <div style={styles.actions}>
                    {!item.isRead && (
                      <Button variant="secondary" onClick={() => handleMarkRead(item.id)}>
                        {isHe ? 'סימון כנקרא' : 'Mark Read'}
                      </Button>
                    )}
                    {item.actionPath && (
                      <Button onClick={() => handleOpen(item)}>
                        {isHe ? 'פתיחה' : 'Open'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    display: 'grid',
    gap: 18,
    padding: 18
  },
  threadHero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    flexWrap: 'wrap',
    padding: 24,
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(34,197,94,0.10), rgba(255,255,255,0.92))',
    border: '1px solid rgba(14, 165, 233, 0.18)'
  },
  threadHeroCopy: {
    display: 'grid',
    gap: 12,
    maxWidth: 760
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    flexWrap: 'wrap',
    padding: 24,
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(14,165,233,0.10), rgba(251,191,36,0.10), rgba(255,255,255,0.88))',
    border: '1px solid rgba(14, 165, 233, 0.18)'
  },
  title: {
    margin: 0,
    fontSize: 30,
    color: '#0f172a'
  },
  subtitle: {
    margin: '10px 0 0 0',
    color: '#475569',
    lineHeight: 1.7,
    maxWidth: 760
  },
  backButton: {
    width: 'fit-content',
    padding: '8px 12px',
    borderRadius: 999,
    border: '1px solid rgba(148, 163, 184, 0.32)',
    background: 'rgba(255,255,255,0.84)',
    color: '#0f172a',
    fontWeight: 700,
    cursor: 'pointer'
  },
  threadMeta: {
    display: 'grid',
    gap: 10,
    justifyItems: 'end'
  },
  threadMetaText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: 600
  },
  statusPill: {
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  list: {
    display: 'grid',
    gap: 14
  },
  card: {
    maxWidth: '100%',
    display: 'grid',
    gap: 16
  },
  threadCard: {
    maxWidth: '100%',
    display: 'grid',
    gap: 18
  },
  cardUnread: {
    borderColor: 'rgba(14, 165, 233, 0.35)',
    boxShadow: '0 18px 40px rgba(14, 165, 233, 0.10)'
  },
  cardRead: {
    opacity: 0.94
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#0f172a'
  },
  unreadPill: {
    padding: '5px 10px',
    borderRadius: 999,
    background: '#dbeafe',
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: 800
  },
  timeLabel: {
    color: '#64748b',
    fontSize: 13
  },
  cardBody: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    color: '#334155'
  },
  threadWrap: {
    display: 'grid',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    background: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  emptyThread: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 1.7
  },
  messageBubble: {
    maxWidth: '88%',
    padding: '12px 14px',
    borderRadius: 14,
    display: 'grid',
    gap: 8
  },
  messageBubbleOwn: {
    justifySelf: 'end',
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    border: '1px solid #93c5fd',
    color: '#1e3a8a'
  },
  messageBubbleOther: {
    justifySelf: 'start',
    background: 'linear-gradient(135deg, #ecfeff, #cffafe)',
    border: '1px solid #67e8f9',
    color: '#155e75'
  },
  messageMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    fontSize: 12
  },
  smallMeta: {
    fontSize: 12,
    color: '#64748b'
  },
  messageBody: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  metaRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  coursePill: {
    padding: '6px 10px',
    borderRadius: 999,
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#334155',
    fontSize: 12,
    fontWeight: 700
  },
  counterpartLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: 600
  },
  actions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  composeWrap: {
    display: 'grid',
    gap: 12
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    fontSize: 14
  },
  composeActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    flexWrap: 'wrap'
  },
  emptyCard: {
    maxWidth: '100%',
    alignItems: 'center',
    textAlign: 'center',
    padding: 36,
    gap: 12
  },
  emptyIcon: {
    fontSize: 42
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0f172a'
  },
  emptyText: {
    color: '#64748b',
    lineHeight: 1.7
  }
};
