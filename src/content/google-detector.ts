
document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    const googleCheckboxClass = 'pYTkkf-Bz112c-RLmnJb';

    const isGoogleCheckbox = target.classList.contains(googleCheckboxClass) ||
        target.closest(`.${googleCheckboxClass}`);

    if (isGoogleCheckbox) {
        console.log('Google Tasks checkbox interaction detected. Triggering sync.');
        chrome.runtime.sendMessage({ type: 'TRIGGER_SYNC' });
    }
});
