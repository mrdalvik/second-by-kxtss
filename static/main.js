/**
 * Секондхенд-витрина — Client-side JS
 * Loads statuses from API, updates badges, handles photo gallery and filters.
 */

(function () {
    'use strict';

    var config = window.__CONFIG__ || {};
    var API_URL = config.API_URL || '';
    var STATUS_TEXT = {
        available: 'Доступно',
        reserved: 'Забронировано',
        sold: 'Продано'
    };

    // --- Status Loading ---

    function loadStatuses() {
        if (!API_URL) return;

        fetch(API_URL + '/api/statuses', { mode: 'cors' })
            .then(function (res) {
                if (!res.ok) throw new Error('API error: ' + res.status);
                return res.json();
            })
            .then(function (statuses) {
                applyStatuses(statuses);
            })
            .catch(function () {
                showFallback();
            });
    }

    function applyStatuses(statuses) {
        // Update cards on catalog page
        var cards = document.querySelectorAll('.item-card[data-slug]');
        cards.forEach(function (card) {
            var slug = card.getAttribute('data-slug');
            var status = statuses[slug] || 'available';
            updateCardStatus(card, status);
        });

        // Update item detail page
        var detailEl = document.querySelector('.item-details[data-slug]');
        if (detailEl) {
            var slug = detailEl.getAttribute('data-slug');
            var status = statuses[slug] || 'available';
            updateDetailStatus(detailEl, status);
        }
    }

    function updateCardStatus(card, status) {
        // Remove old status classes
        card.classList.remove('status-available', 'status-reserved', 'status-sold');
        card.classList.add('status-' + status);

        // Update badge
        var badge = card.querySelector('.status-badge');
        if (badge) {
            badge.textContent = STATUS_TEXT[status] || status;
            badge.className = 'status-badge status-' + status;
        }

        // Update reserve button
        var btn = card.querySelector('.item-card-reserve');
        if (btn) {
            if (status !== 'available') {
                btn.textContent = STATUS_TEXT[status];
                btn.removeAttribute('href');
                btn.style.pointerEvents = 'none';
            }
        }
    }

    function updateDetailStatus(detailEl, status) {
        var slug = detailEl.getAttribute('data-slug');

        // Remove old status classes
        detailEl.classList.remove('status-available', 'status-reserved', 'status-sold');
        detailEl.classList.add('status-' + status);

        // Update badge
        var badge = detailEl.querySelector('.status-badge');
        if (badge) {
            badge.textContent = STATUS_TEXT[status] || status;
            badge.className = 'status-badge status-' + status;
        }

        // Update reserve button
        var btn = detailEl.querySelector('.reserve-btn');
        if (btn) {
            if (status !== 'available') {
                btn.textContent = STATUS_TEXT[status];
                btn.removeAttribute('href');
                btn.style.pointerEvents = 'none';
                btn.style.cursor = 'not-allowed';
                btn.style.background = 'var(--color-sold-bg)';
                btn.style.color = 'var(--color-sold)';
            }
        }

        // Update price strike-through for sold
        var priceEl = detailEl.querySelector('.item-price');
        if (priceEl && status === 'sold') {
            priceEl.style.textDecoration = 'line-through';
            priceEl.style.color = 'var(--color-text-light)';
        }
    }

    function showFallback() {
        var notice = document.getElementById('status-notice');
        if (notice) {
            notice.style.display = 'block';
        }

        // Mark all as available with a note
        var badges = document.querySelectorAll('.status-badge');
        badges.forEach(function (badge) {
            badge.textContent = 'Доступно';
        });
    }

    // --- Photo Gallery ---

    function initGallery() {
        var mainImg = document.getElementById('gallery-main-img');
        var thumbs = document.querySelectorAll('.gallery-thumb');

        if (!mainImg || thumbs.length === 0) return;

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var img = thumb.querySelector('img');
                if (!img) return;

                mainImg.src = img.src;
                mainImg.alt = img.alt || '';

                // Update active state
                thumbs.forEach(function (t) { t.classList.remove('active'); });
                thumb.classList.add('active');
            });
        });

        // Mark first thumbnail as active
        if (thumbs.length > 0) {
            thumbs[0].classList.add('active');
        }
    }

    // --- Filters ---

    function initFilters() {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var cards = document.querySelectorAll('.item-card[data-slug]');

        if (filterBtns.length === 0) return;

        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = btn.getAttribute('data-filter');

                // Update active button
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');

                // Filter cards
                cards.forEach(function (card) {
                    if (filter === 'all') {
                        card.classList.remove('hidden-by-filter');
                    } else {
                        var hasStatus = card.classList.contains('status-' + filter);
                        if (hasStatus) {
                            card.classList.remove('hidden-by-filter');
                        } else {
                            card.classList.add('hidden-by-filter');
                        }
                    }
                });
            });
        });
    }

    // --- Init ---

    document.addEventListener('DOMContentLoaded', function () {
        loadStatuses();
        initGallery();
        initFilters();
    });
})();
