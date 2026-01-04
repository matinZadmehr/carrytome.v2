export function initRoleModal() {
    const modal = document.getElementById("role-modal");
    if (!modal) return;

    const show = () => {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    };

    const hide = () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    };

    const bigAddIcon = document.querySelector('span.material-symbols-outlined.text-3xl');
    const bigAddBtn = bigAddIcon?.closest('button');

    if (bigAddBtn) {
        bigAddBtn.setAttribute('data-open-role-modal', '');
        bigAddBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            show();
        });
    }

    modal.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.hasAttribute('data-close-role-modal')) {
            hide();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hide();
    });
}