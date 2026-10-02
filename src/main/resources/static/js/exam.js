"use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const node = (tag, text, cls) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (cls) element.className = cls;
  return element;
};
const link = (text, href) => { const a = node('a', text, 'button'); a.href = href; return a; };
const button = (text, action, cls = 'button') => {
  const b = node('button', text, cls); b.type = 'button'; b.addEventListener('click', action); return b;
};
const attemptPath = id => `/exam-center/attempts/${encodeURIComponent(id)}`;
let csrf = { token: $('meta[name="csrf-token"]').content, headerName: $('meta[name="csrf-header"]').content };
async function api(path, method = 'GET', body) {
  let response;
  try {
    response = await fetch(path, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: { 'Accept': 'application/json', ...(method !== 'GET' ? { 'Content-Type': 'application/json', [csrf.headerName]: csrf.token } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch (_) { throw new Error('Connection lost. Your last change may not be saved. Check your connection and try again.'); }
  const data = await response.json().catch(() => ({ message: 'The server returned an unexpected response. Please try again.' }));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/login')) {
      location.assign('/login?expired=1&next=' + encodeURIComponent(location.pathname));
    }
    const error = new Error(data.message || 'Request failed. Please try again.');
    error.fields = data.errors; error.status = response.status; throw error;
  }
  return data;
}
const authShell = $('[data-auth-mode]');
if (authShell) {
  const form = $('#auth-form'), message = $('#auth-message');
  const params = new URLSearchParams(location.search);
  if (params.has('expired')) message.textContent = 'Your session has expired. Please log in again. Your saved progress is safe.';
  for (const input of form.querySelectorAll('input')) input.setAttribute('aria-describedby', input.name + '-error');
  const showFields = errors => {
    for (const input of form.querySelectorAll('input')) {
      const text = errors[input.name] || '';
      $('#' + input.name + '-error').textContent = text;
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
    }
    const invalid = form.querySelector('[aria-invalid="true"]');
    if (invalid) invalid.focus();
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.username = data.username.trim();
    const errors = {};
    for (const [key, value] of Object.entries(data)) if (!value) errors[key] = 'This field is required.';
    showFields(errors); message.textContent = '';
    if (Object.keys(errors).length) return;
    const submit = $('button[type="submit"]', form), label = submit.textContent;
    submit.disabled = true; submit.textContent = 'Logging in…';
    try {
      const response = await api('/api/auth/login', 'POST', data);
      const next = params.get('next');
      location.assign(response.user.role === 'ADMIN' ? response.redirectUrl : next && /^\/exam-center(?:\/[a-zA-Z0-9/-]*)?$/.test(next) ? next : '/exam-center');
    } catch (error) {
      showFields(error.fields || {}); message.textContent = error.message; message.className = 'exam-error';
      if (error.status === 403) csrf = await api('/api/auth/csrf').catch(() => csrf);
    } finally { submit.disabled = false; submit.textContent = label; }
  });
}
const app = $('#exam-app');
if (app) {
  const content = $('#exam-content'), errorBox = $('#exam-error'), retry = $('#exam-retry'), loading = $('#exam-loading');
  let attempt, busy = false, dirty = false, retryAction;
  const heading = (title, intro) => { $('#exam-heading').textContent = title; $('#exam-intro').textContent = intro; };
  const clearError = () => { errorBox.hidden = true; retry.hidden = true; };
  const showError = (error, action) => {
    errorBox.textContent = error.message; errorBox.hidden = false;
    retryAction = action; retry.hidden = !action;
  };
  retry.addEventListener('click', () => { if (retryAction && !busy) retryAction(); });
  window.addEventListener('beforeunload', event => { if (dirty || busy) { event.preventDefault(); event.returnValue = ''; } });
  $('#logout').addEventListener('click', async () => {
    if (busy) return;
    if (dirty && !window.confirm('Your latest answer has not been saved. Log out anyway?')) return;
    try { await api('/api/auth/logout', 'POST'); dirty = false; location.assign('/login'); }
    catch (error) { showError(error); }
  });
  async function center(historyOnly = false) {
    heading(historyOnly ? 'My results' : 'Exam Center', historyOnly ? 'Only your current attempt for each exam is shown.' : 'Choose an exam. Take your time. Every answer is a step forward.');
    const [exams, history] = await Promise.all([api('/api/exams'), api('/api/exams/attempts')]);
    content.replaceChildren();
    if (!historyOnly) for (const exam of exams) {
      const card = node('article', undefined, 'exam-card');
      card.append(node('p', 'PRACTICE EXAM', 'eyebrow'), node('h2', exam.title),
        node('p', `${exam.totalQuestions} questions · ${exam.marksPerQuestion} mark(s) per correct answer · ${exam.incorrectMarks} for incorrect answers · ${exam.unansweredMarks} for unanswered questions`),
        node('p', 'No time limit. Answers are saved to your account. You can return and continue later.', 'exam-muted'));
      const active = history.find(a => a.examId === exam.id && a.status === 'ACTIVE');
      if (active) card.append(link('Resume exam', attemptPath(active.attemptId)));
      else {
        const start = button('Start exam', async () => {
          start.disabled = true; start.textContent = 'Starting…'; clearError();
          try { const a = await api(`/api/exams/${encodeURIComponent(exam.id)}/start`, 'POST'); location.assign(attemptPath(a.attemptId)); }
          catch (error) { showError(error); start.disabled = false; start.textContent = 'Start exam'; }
        }, 'button button-primary');
        card.append(start);
      }
      content.append(card);
    }
    content.append(node('h2', 'Current attempts'));
    if (!history.length) content.append(node('p', 'No attempts yet. Start an exam to begin.'));
    const list = node('div', undefined, 'history-list');
    for (const row of history) {
      const card = node('article', undefined, 'exam-card'), details = node('div');
      details.append(node('h3', row.title), node('p', new Date(row.startedAt).toLocaleString()),
        node('p', row.status === 'ACTIVE' ? 'In progress' : `${row.result.obtainedMarks} / ${row.result.totalMarks} marks · ${row.result.percentage}%`));
      card.append(details, link(row.status === 'ACTIVE' ? 'Resume exam' : 'View result', attemptPath(row.attemptId) + (row.status === 'ACTIVE' ? '' : '/result')));
      list.append(card);
    }
    content.append(list);
  }
  function renderAttempt(focusOption = false) {
    heading(attempt.title, 'One question at a time. Your saved answers stay with you.');
    const index = attempt.currentQuestion, q = attempt.questions[index], total = attempt.questions.length;
    const answered = Object.keys(attempt.answers).length;
    const layout = node('div', undefined, 'exam-layout'), card = node('article', undefined, 'exam-card');
    card.append(node('p', `Question ${index + 1} of ${total}`, 'eyebrow'));
    const progressText = node('p', `Answered: ${answered} · Remaining: ${total - answered}`); progressText.id = 'exam-progress-text'; card.append(progressText);
    const progress = node('progress', undefined, 'exam-progress'); progress.max = total; progress.value = answered; progress.setAttribute('aria-label', 'Questions answered'); card.append(progress);
    const question = node('h2', q.question, 'exam-question'); question.id = 'current-question'; question.tabIndex = -1; card.append(question);
    const options = node('fieldset', undefined, 'exam-options'); options.setAttribute('aria-labelledby', 'current-question');
    for (const [i, option] of q.options.entries()) {
      const label = node('label', undefined, 'exam-option'), radio = document.createElement('input');
      radio.type = 'radio'; radio.name = 'answer'; radio.value = option; radio.id = 'option-' + i;
      radio.checked = attempt.answers[q.id] === option; radio.disabled = busy;
      radio.addEventListener('change', () => saveAnswer(q.id, option));
      label.append(radio, node('span', option)); options.append(label);
    }
    card.append(options);
    const clear = button('Clear answer', () => saveAnswer(q.id, null)); clear.disabled = busy || !(q.id in attempt.answers); card.append(clear);
    const status = node('p', busy ? 'Saving…' : dirty ? 'Unsaved change — use Try again before leaving this question.' : 'All changes saved.', 'exam-status');
    status.setAttribute('role', 'status'); card.append(status);
    const actions = node('div', undefined, 'exam-actions');
    const previous = button('Previous', () => move(index - 1)), next = button('Next', () => move(index + 1));
    previous.disabled = busy || dirty || index === 0; next.disabled = busy || dirty || index === total - 1;
    actions.append(previous, next); card.append(actions);
    const sidebar = node('aside', undefined, 'exam-card'); sidebar.append(node('h2', 'Questions'));
    sidebar.append(node('p', 'Green: answered · Gray: unanswered · Blue: current', 'exam-muted'));
    const grid = node('nav', undefined, 'question-grid'); grid.setAttribute('aria-label', 'Question navigator');
    attempt.questions.forEach((item, n) => {
      const done = item.id in attempt.answers;
      const b = button(String(n + 1), () => move(n), done ? 'answered' : '');
      b.setAttribute('aria-label', `Question ${n + 1}, ${done ? 'answered' : 'unanswered'}`);
      if (n === index) b.setAttribute('aria-current', 'step'); b.disabled = busy || dirty; grid.append(b);
    });
    sidebar.append(grid);
    const submit = button('Submit exam', confirmSubmit, 'button button-primary'); submit.disabled = busy || dirty; sidebar.append(submit);
    layout.append(card, sidebar); content.replaceChildren(layout);
    if (focusOption) $('input:checked', content)?.focus();
  }
  async function saveAnswer(questionId, selectedAnswer) {
    if (selectedAnswer === null) delete attempt.answers[questionId]; else attempt.answers[questionId] = selectedAnswer;
    dirty = true; busy = true; clearError(); renderAttempt();
    try { await api(`/api/exams/attempts/${attempt.attemptId}/answers`, 'POST', { questionId, selectedAnswer }); dirty = false; }
    catch (error) { showError(error, () => saveAnswer(questionId, selectedAnswer)); }
    finally { busy = false; renderAttempt(true); }
  }
  async function move(index) {
    if (busy || dirty) return;
    busy = true; clearError(); renderAttempt();
    try { await api(`/api/exams/attempts/${attempt.attemptId}/position`, 'POST', { currentQuestion: index }); attempt.currentQuestion = index; }
    catch (error) { showError(error, () => move(index)); }
    finally { busy = false; renderAttempt(); $('#current-question').focus(); }
  }
  function confirmSubmit() {
    const dialog = node('dialog', undefined, 'exam-dialog');
    dialog.setAttribute('aria-labelledby', 'submit-title');
    const title = node('h2', 'Submit your exam?'); title.id = 'submit-title';
    dialog.append(title, node('p', `You have answered ${Object.keys(attempt.answers).length} out of ${attempt.questions.length} questions. You cannot change answers after submission.`));
    const actions = node('div', undefined, 'exam-actions');
    const cancel = button('Cancel', () => dialog.close());
    const confirm = button('Submit exam', async () => {
      confirm.disabled = true; cancel.disabled = true; confirm.textContent = 'Submitting…'; busy = true; clearError();
      try {
        await api(`/api/exams/attempts/${attempt.attemptId}/submit`, 'POST'); busy = false;
        location.assign(attemptPath(attempt.attemptId) + '/result');
      } catch (error) {
        busy = false;
        if (error.status === 409) {
          try {
            await api(`/api/exams/attempts/${attempt.attemptId}/result`);
            location.assign(attemptPath(attempt.attemptId) + '/result'); return;
          } catch (_) { /* A lock conflict may still leave the attempt active. */ }
        }
        dialog.close(); showError(error, confirmSubmit);
      }
    }, 'button button-primary');
    actions.append(cancel, confirm); dialog.append(actions); document.body.append(dialog);
    dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
    dialog.addEventListener('close', () => dialog.remove()); dialog.showModal(); cancel.focus();
  }
  async function results(id) {
    const result = await api(`/api/exams/attempts/${encodeURIComponent(id)}/result`);
    heading('Exam Result', `${result.title} · Attempt ${result.attemptNumber}`);
    const card = node('article', undefined, 'exam-card');
    card.append(node('p', 'A step forward. Take a moment to review what you learned.'));
    const stats = node('dl', undefined, 'exam-stats');
    for (const [label, value] of [['Total questions', result.totalQuestions], ['Attempted', result.attempted], ['Unanswered', result.unanswered], ['Correct answers', result.correct], ['Incorrect answers', result.incorrect], ['Obtained marks', `${result.obtainedMarks} / ${result.totalMarks}`], ['Percentage', `${result.percentage}%`]]) {
      const item = node('div', undefined, 'exam-stat'); item.append(node('dt', label), node('dd', String(value))); stats.append(item);
    }
    card.append(stats);
    const actions = node('div', undefined, 'exam-actions'); actions.append(link('Review answers', attemptPath(id) + '/review'), link('Back to Exam Center', '/exam-center'));
    card.append(actions); content.replaceChildren(card);
  }
  async function review(id) {
    const data = await api(`/api/exams/attempts/${encodeURIComponent(id)}/review`);
    heading('Review Answers', data.title); content.replaceChildren(link('Back to result', attemptPath(id) + '/result'));
    for (const [i, q] of data.questions.entries()) {
      const card = node('article', undefined, 'exam-card'); card.append(node('p', `Question ${i + 1}`, 'eyebrow'), node('h2', q.question));
      const options = node('ul', undefined, 'review-options');
      for (const option of q.options) {
        const correct = option === q.correctAnswer, selected = option === q.selectedAnswer;
        options.append(node('li', `${selected ? '●' : '○'} ${option}${correct ? ' — Correct answer' : ''}${selected ? ' — Your answer' : ''}`, correct ? 'correct-option' : selected ? 'wrong-option' : ''));
      }
      card.append(options, node('p', `Your answer: ${q.selectedAnswer ?? 'Unanswered'}`), node('p', `Correct answer: ${q.correctAnswer}`),
        node('p', `${q.status === 'CORRECT' ? '✓ Correct' : q.status === 'INCORRECT' ? '✗ Incorrect' : '— Unanswered'} · Marks: ${q.marksObtained}`));
      content.append(card);
    }
  }
  async function load() {
    clearError(); loading.hidden = false;
    try {
      const me = await api('/api/auth/me'); $('#learner-name').textContent = me.user.name;
      const id = app.dataset.attempt;
      if (app.dataset.view === 'attempt') {
        attempt = await api(`/api/exams/attempts/${encodeURIComponent(id)}`);
        if (attempt.status === 'SUBMITTED') { location.replace(attemptPath(id) + '/result'); return; }
        renderAttempt();
      } else if (app.dataset.view === 'result') await results(id);
      else if (app.dataset.view === 'review') await review(id);
      else await center(app.dataset.view === 'history');
    } catch (error) { showError(error, load); }
    finally { loading.hidden = true; }
  }
  load();
}
