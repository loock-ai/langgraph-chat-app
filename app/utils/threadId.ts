export function getOrCreateThreadId() {
    if (typeof window === 'undefined') return '';
    let threadId = localStorage.getItem('thread_id');
    if (!threadId) {
        threadId = crypto.randomUUID();
        localStorage.setItem('thread_id', threadId);
    }
    return threadId;
}

export function setThreadId(id: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('thread_id', id);
} 