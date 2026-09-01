/* public/register-sw.js - registered only in production via next/script */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function (error) {
            console.error('Service worker registration failed:', error);
        });
    });
}