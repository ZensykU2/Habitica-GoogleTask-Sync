
document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    const habiticaClasses = [
        'task-control',
        'daily-todo-control',
        'task-neutral-control-inner-daily-todo'
    ];

    const isHabiticaCheckbox = habiticaClasses.some(cls => target.classList.contains(cls)) ||
        target.closest('.task-control, .daily-todo-control');

    if (isHabiticaCheckbox) {
        console.log('Habitica checkbox interaction detected. Triggering sync.');
        chrome.runtime.sendMessage({ type: 'TRIGGER_SYNC' });
    }
});
