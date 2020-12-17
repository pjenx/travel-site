import '../styles/styles.css';
import MobileMenu from './modules/MobileMenu';
import RevealOnScroll from './modules/RevealOnScroll';
import StickyHeader from './modules/StickyHeader';

new StickyHeader();
new MobileMenu();
new RevealOnScroll(document.querySelectorAll('.feature-item'), 75);
new RevealOnScroll(document.querySelectorAll('.testimonial'), 60);
let modal;

document.querySelectorAll('.open-modal').forEach(elem => {
    elem.addEventListener('click', e => {
        e.preventDefault();
        if (!modal) {
            import(/* webpackChunkName: "modal" */'./modules/Modal').then(x => {
                modal = new x.default();
                modal.openTheModal();
            }).catch(
                () => console.log('There was a problem')
            );
        } else {
            modal.openTheModal();
        }
    });
})

if (module.hot) {
    module.hot.accept();
}

