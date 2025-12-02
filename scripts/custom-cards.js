// Publication Card Custom Element
class PublicationCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['title', 'authors', 'venue', 'year', 'link', 'image', 'image-alt', 'description'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const title = this.getAttribute('title') || 'Untitled Publication';
        const authors = this.getAttribute('authors') || 'Unknown Authors';
        const venue = this.getAttribute('venue') || 'Conference';
        const year = this.getAttribute('year') || '2024';
        const link = this.getAttribute('link') || '#';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/300x200?text=Publication';
        const imageAlt = this.getAttribute('image-alt') || 'Publication thumbnail';
        const description = this.getAttribute('description') || 'No description available.';

        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    gap: 1.5rem;
                    background: var(--color-card-bg-light, #ffffff);
                    border: 2px solid var(--color-border-light, #e0e0e0);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    box-shadow: var(--color-card-shadow-light, 0 2px 8px rgba(0,0,0,0.1));
                    transition: all 0.3s ease;
                    font-family: var(--font-main, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
                }

                .card:hover {
                    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
                    transform: translateY(-2px);
                    border-color: var(--active-color, #0066cc);
                }

                .image-container {
                    display: flex;
                    align-items: flex-start;
                }

                picture {
                    display: block;
                    width: 100%;
                    height: auto;
                }

                img {
                    width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    object-fit: cover;
                    aspect-ratio: 3 / 2;
                }

                .content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    line-height: 1.4;
                    color: var(--color-text-primary-light, #1a1a1a);
                }

                h2 a {
                    color: var(--active-color, #0066cc);
                    text-decoration: none;
                    position: relative;
                }

                h2 a::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background-color: var(--active-color, #0066cc);
                    transition: width 0.3s ease;
                }

                h2 a:hover::after {
                    width: 100%;
                }

                h2 a:hover {
                    opacity: 0.8;
                }

                .metadata {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .authors {
                    font-size: 0.9rem;
                    color: var(--color-text-secondary-light, #666666);
                    font-style: italic;
                }

                .venue {
                    font-size: 0.9rem;
                    color: var(--color-text-secondary-light, #666666);
                    font-weight: 500;
                }

                .description {
                    font-size: 0.95rem;
                    color: var(--color-text-primary-light, #1a1a1a);
                    line-height: 1.6;
                    margin-top: 0.25rem;
                }

                .read-more {
                    margin-top: 0.5rem;
                }

                .read-more a {
                    color: var(--active-color, #0066cc);
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .read-more a:hover {
                    opacity: 0.8;
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .card {
                        grid-template-columns: 1fr;
                    }

                    .image-container {
                        order: -1;
                    }
                }
            </style>
            
            <div class="card">
                <div class="image-container">
                    <picture>
                        <img src="${image}" alt="${imageAlt}" loading="lazy">
                    </picture>
                </div>
                <div class="content">
                    <h2><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
                    <div class="metadata">
                        <div class="authors">${authors}</div>
                        <div class="venue">${venue}, ${year}</div>
                    </div>
                    <div class="description">${description}</div>
                    <div class="read-more">
                        <a href="${link}" target="_blank" rel="noopener noreferrer">Read Paper →</a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Experience Card Custom Element
class ExperienceCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['title', 'organization', 'period', 'location', 'image', 'image-alt', 'description', 'link'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const title = this.getAttribute('title') || 'Position Title';
        const organization = this.getAttribute('organization') || 'Organization';
        const period = this.getAttribute('period') || 'Date Range';
        const location = this.getAttribute('location') || '';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/300x200?text=Experience';
        const imageAlt = this.getAttribute('image-alt') || 'Organization logo';
        const description = this.getAttribute('description') || '';
        const link = this.getAttribute('link') || '#';

        // Get slotted content for bullet points/details
        const slotContent = this.innerHTML;

        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    display: grid;
                    grid-template-columns: 150px 1fr;
                    gap: 1.5rem;
                    background: var(--color-card-bg-light, #ffffff);
                    border: 2px solid var(--color-border-light, #e0e0e0);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    box-shadow: var(--color-card-shadow-light, 0 2px 8px rgba(0,0,0,0.1));
                    transition: all 0.3s ease;
                    font-family: var(--font-main, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
                    margin-bottom: 1.5rem;
                }

                .card:hover {
                    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
                    transform: translateY(-2px);
                    border-color: var(--active-color, #0066cc);
                }

                .image-container {
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                }

                picture {
                    display: block;
                    width: 100%;
                    height: auto;
                }

                img {
                    width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    object-fit: contain;
                    aspect-ratio: 1 / 1;
                }

                .content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    line-height: 1.3;
                    color: var(--color-text-primary-light, #1a1a1a);
                }

                h2 a {
                    color: var(--active-color, #0066cc);
                    text-decoration: none;
                }

                h2 a:hover {
                    opacity: 0.8;
                    text-decoration: underline;
                }

                .organization {
                    font-size: 1rem;
                    color: var(--active-color, #0066cc);
                    font-weight: 500;
                }

                .metadata {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--color-text-secondary-light, #666666);
                }

                .period, .location {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .description {
                    font-size: 0.95rem;
                    color: var(--color-text-primary-light, #1a1a1a);
                    line-height: 1.6;
                    margin-top: 0.25rem;
                }

                .details {
                    margin-top: 0.5rem;
                    color: var(--color-text-primary-light, #1a1a1a);
                    line-height: 1.6;
                }

                .read-more {
                    margin-top: 0.5rem;
                }

                .read-more a {
                    color: var(--active-color, #0066cc);
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .read-more a:hover {
                    opacity: 0.8;
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .card {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .image-container {
                        order: -1;
                    }

                    img {
                        max-width: 150px;
                        margin: 0 auto;
                    }
                }
            </style>
            
            <div class="card">
                <div class="image-container">
                    <picture>
                        <img src="${image}" alt="${imageAlt}" loading="lazy">
                    </picture>
                </div>
                <div class="content">
                    <h2>${link && link !== '#' ? `<a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}</h2>
                    <div class="organization">${organization}</div>
                    <div class="metadata">
                        <div class="period">📅 ${period}</div>
                        ${location ? `<div class="location">📍 ${location}</div>` : ''}
                    </div>
                    ${description ? `<div class="description">${description}</div>` : ''}
                    <div class="details">
                        <slot></slot>
                    </div>
                    ${link && link !== '#' ? `<div class="read-more"><a href="${link}" target="_blank" rel="noopener noreferrer">Learn More →</a></div>` : ''}
                </div>
            </div>
        `;
    }
}

// Register the custom elements
customElements.define('publication-card', PublicationCard);
customElements.define('experience-card', ExperienceCard);

