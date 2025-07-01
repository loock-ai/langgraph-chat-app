export function getOrCreateThreadId() {
    if (typeof window === 'undefined') return '';
    let threadId = localStorage.getItem('thread_id');
    if (!threadId) {
        threadId = crypto.randomUUID();
        localStorage.setItem('thread_id', threadId);
    }
    return threadId;
} 