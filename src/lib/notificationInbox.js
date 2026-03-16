export function formatNotificationDate(value, language) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString(language === 'he' ? 'he-IL' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function renderNotificationPreview(notification, language = 'he') {
  const isHe = language === 'he';
  const eventType = String(notification?.eventType || '').toUpperCase();
  const counterpartName = String(notification?.counterpartName || '').trim();
  const senderName = String(notification?.senderName || counterpartName || '').trim();
  const courseName = String(notification?.courseName || '').trim();
  const subject = String(notification?.subject || courseName || '').trim();
  const reason = String(notification?.rejectionReason || '').trim();
  const messageBody = String(notification?.messageBody || '').trim();
  const scheduledAt = formatNotificationDate(notification?.scheduledAt, language);
  const courseFragment = courseName
    ? (isHe ? ` עבור ${courseName}` : ` for ${courseName}`)
    : '';
  const scheduledFragment = scheduledAt
    ? (isHe ? ` ב-${scheduledAt}` : ` at ${scheduledAt}`)
    : '';

  if (eventType === 'LESSON_REQUEST_CREATED') {
    return {
      tone: 'info',
      title: isHe ? 'בקשת שיעור חדשה' : 'New lesson request',
      body: isHe
        ? `${counterpartName || 'תלמיד/ה'} שלח/ה בקשת שיעור חדשה${courseFragment}${scheduledFragment}.`
        : `${counterpartName || 'A student'} sent a new lesson request${courseFragment}${scheduledFragment}.`
    };
  }

  if (eventType === 'LESSON_REQUEST_APPROVED') {
    return {
      tone: 'success',
      title: isHe ? 'בקשת השיעור אושרה' : 'Lesson request approved',
      body: isHe
        ? `${counterpartName || 'המורה'} אישר/ה את בקשת השיעור שלך${courseFragment}${scheduledFragment}.`
        : `${counterpartName || 'Your tutor'} approved your lesson request${courseFragment}${scheduledFragment}.`
    };
  }

  if (eventType === 'LESSON_REQUEST_REJECTED') {
    return {
      tone: 'warning',
      title: isHe ? 'בקשת השיעור נדחתה' : 'Lesson request rejected',
      body: isHe
        ? `${counterpartName || 'המורה'} דחה/תה את בקשת השיעור שלך${courseFragment}${reason ? `. סיבה: ${reason}` : '.'}`
        : `${counterpartName || 'Your tutor'} rejected your lesson request${courseFragment}${reason ? `. Reason: ${reason}` : '.'}`
    };
  }

  if (eventType === 'LESSON_CANCELLED') {
    return {
      tone: 'warning',
      title: isHe ? 'השיעור בוטל' : 'Lesson cancelled',
      body: isHe
        ? `${counterpartName || 'הצד השני'} ביטל/ה את השיעור${courseFragment}${scheduledFragment}${reason ? `. סיבה: ${reason}` : '.'}`
        : `${counterpartName || 'The other participant'} cancelled the lesson${courseFragment}${scheduledFragment}${reason ? `. Reason: ${reason}` : '.'}`
    };
  }

  if (eventType === 'LESSON_REMINDER') {
    return {
      tone: 'info',
      title: isHe ? 'תזכורת לשיעור קרוב' : 'Upcoming lesson reminder',
      body: isHe
        ? `יש לך שיעור קרוב עם ${counterpartName || 'הצד השני'}${courseFragment}${scheduledFragment}.`
        : `You have an upcoming lesson with ${counterpartName || 'the other participant'}${courseFragment}${scheduledFragment}.`
    };
  }

  if (eventType === 'LESSON_MESSAGE') {
    return {
      tone: 'info',
      title: notification?.isOwnMessage
        ? (isHe ? 'הודעה שנשלחה' : 'Message sent')
        : (isHe ? `הודעה חדשה מ-${senderName || 'הצד השני'}` : `New message from ${senderName || 'the other participant'}`),
      body: messageBody || (isHe ? 'נשלחה אליך הודעת תיאום חדשה.' : 'A new coordination message was sent.')
    };
  }

  if (eventType === 'ADMIN_CONTACT_MESSAGE') {
    const senderLabel = notification?.isOwnMessage
      ? (isHe ? 'את/ה' : 'You')
      : (senderName || (isHe ? 'מנהל/ת' : 'An admin'));

    return {
      tone: 'info',
      title: subject
        ? (isHe ? `פנייה למנהלים: ${subject}` : `Admin thread: ${subject}`)
        : (isHe ? 'פנייה פרטית למנהלים' : 'Private admin thread'),
      body: messageBody
        ? `${senderLabel}: ${messageBody}`
        : (isHe ? 'נוספה הודעה חדשה בשרשור הפרטי עם המנהלים.' : 'A new message was added to the private admin thread.')
    };
  }

  return {
    tone: 'info',
    title: isHe ? 'התראה חדשה' : 'New notification',
    body: messageBody || (isHe ? 'יש לך עדכון חדש במערכת.' : 'You have a new update in the system.')
  };
}
