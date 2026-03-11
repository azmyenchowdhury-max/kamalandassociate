/* ===================================
   Kamal & Associates - Main JavaScript
   Pure HTML/CSS/JS/Bootstrap Version
   Created by: Azmyen Mustafa Chowdhury
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // ===== Navbar Scroll Effect =====
    const navbar = document.querySelector('.navbar');

    function loadChatbotWidget() {
        if (document.querySelector('script[src="js/chatbot.js"]')) return;
        const script = document.createElement('script');
        script.src = 'js/chatbot.js';
        script.defer = true;
        document.body.appendChild(script);
    }

    loadChatbotWidget();

    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function updateNavbarPhoneLabel() {
        const phoneLinks = document.querySelectorAll('.phone-number');
        if (!phoneLinks.length) return;

        const isMediumWidth = window.innerWidth >= 992 && window.innerWidth <= 1260;

        phoneLinks.forEach((link) => {
            if (!link.dataset.fullText) {
                link.dataset.fullText = (link.textContent || '').trim();
            }

            const fullText = link.dataset.fullText;
            if (!fullText) return;

            link.textContent = isMediumWidth ? fullText.replace(/\s+/g, '') : fullText;
        });
    }

    function injectMobileConsultationCta() {
        const navList = document.querySelector('#mainNav .navbar-nav');
        if (!navList) return;
        if (navList.querySelector('.nav-mobile-cta-item')) return;

        const sourceCta = document.querySelector('.action-zone .btn-gold');
        const ctaHref = (sourceCta && sourceCta.getAttribute('href')) || 'consultation.html';
        const ctaLabel = (sourceCta && sourceCta.textContent && sourceCta.textContent.trim()) || 'Free Consultation';

        const li = document.createElement('li');
        li.className = 'nav-item nav-mobile-cta-item';

        const link = document.createElement('a');
        link.className = 'nav-link nav-mobile-cta-link';
        link.href = ctaHref;
        link.innerHTML = '<i class="fas fa-calendar-check me-2"></i>' + ctaLabel;

        li.appendChild(link);
        navList.insertBefore(li, navList.firstChild);

        link.addEventListener('click', function () {
            const collapseEl = document.getElementById('mainNav');
            if (!collapseEl || !collapseEl.classList.contains('show')) return;

            if (window.bootstrap && window.bootstrap.Collapse) {
                const instance = window.bootstrap.Collapse.getOrCreateInstance(collapseEl);
                instance.hide();
            } else {
                collapseEl.classList.remove('show');
            }
        });
    }

    injectMobileConsultationCta();
    updateNavbarPhoneLabel();

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();
    window.addEventListener('resize', updateNavbarPhoneLabel);

    // ===== Theme Toggle (Light/Dark Mode) =====
    const themeToggleButtons = document.querySelectorAll('.theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        const root = document.documentElement;

        root.classList.toggle('dark-mode', isDark);

        themeToggleButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-moon', !isDark);
                icon.classList.toggle('fa-sun', isDark);
            } else {
                btn.textContent = isDark ? '☀️' : '🌙';
            }

            btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        });
    }

    function setTheme(theme) {
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    }

    if (savedTheme === 'dark' || savedTheme === 'light') {
        applyTheme(savedTheme);
    } else {
        // Default to light mode, but respect system preference if available
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }

    themeToggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentlyDark = document.documentElement.classList.contains('dark-mode');
            setTheme(currentlyDark ? 'light' : 'dark');
        });
    });

    // ===== Rotating Text Animation =====
    const rotatingTextElement = document.getElementById('rotatingText');
    if (rotatingTextElement) {
        const words = ['Freedom.', 'Rights.', 'Case.', 'Custody.'];
        let currentIndex = 0;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % words.length;
            rotatingTextElement.style.animation = 'none';
            rotatingTextElement.offsetHeight; // Trigger reflow
            rotatingTextElement.textContent = words[currentIndex];
            rotatingTextElement.style.animation = 'fadeInUp 0.5s ease';
        }, 2500);
    }

    // ===== Counter Animation =====
    const counters = document.querySelectorAll('.counter');
    let countersAnimated = false;

    function animateCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, duration / steps);
        });
    }


    // TYPEWRITER / ROTATING TEXT FUNCTION
    var TxtRotate = function (el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtRotate.prototype.tick = function () {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

        var that = this;
        var delta = 300 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(function () {
            that.tick();
        }, delta);
    };

    window.onload = function () {
        var elements = document.getElementsByClassName('txt-rotate');
        for (var i = 0; i < elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-rotate');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
                new TxtRotate(elements[i], JSON.parse(toRotate), period);
            }
        }
    };

    // Intersection Observer for Counter Animation
    const statsSection = document.getElementById('statsSection');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // ===== Case Studies Filter =====
    const filterButtons = document.querySelectorAll('#caseFilter .nav-link');
    const caseItems = document.querySelectorAll('.case-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            caseItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
        });
    });

    // ===== Service Areas Modal & Search =====
    (function initServiceAreas() {
        const modal = document.getElementById('serviceModal');
        if (!modal) return;

        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalServices = document.getElementById('modalServices');
        const closeButton = modal.querySelector('.service-modal-close');

        // Service data object
        const serviceData = {
            'administrative-law': {
                title: 'Administrative Law in Bangladesh',
                description: 'Our administrative law practice covers regulatory compliance, government relations, and administrative proceedings. We provide comprehensive legal support for businesses and individuals dealing with government agencies and regulatory bodies.',
                services: [
                    'Regulatory compliance and licensing',
                    'Administrative appeals and reviews',
                    'Government contract disputes',
                    'Public procurement law',
                    'Environmental regulatory matters',
                    'Telecommunications regulation'
                ]
            },
            'admiralty-shipping': {
                title: 'Admiralty and Shipping',
                description: 'We offer specialized legal services in maritime law, including ship registration, marine insurance claims, and international shipping disputes. Our expertise covers all aspects of admiralty and shipping law in Bangladesh and internationally.',
                services: [
                    'Ship registration and documentation',
                    'Marine insurance claims',
                    'Cargo disputes and claims',
                    'Ship arrest and detention',
                    'Maritime liens and mortgages',
                    'International shipping contracts'
                ]
            },
            'alternative-dispute': {
                title: 'Alternative Dispute Resolution',
                description: 'Our ADR practice focuses on mediation, arbitration, and other alternative dispute resolution methods. We help clients resolve conflicts efficiently and cost-effectively outside traditional court litigation.',
                services: [
                    'Commercial arbitration',
                    'Mediation services',
                    'Arbitration agreement drafting',
                    'International arbitration',
                    'Dispute resolution consulting',
                    'Settlement negotiations'
                ]
            },
            'aviation-matters': {
                title: 'Aviation Matters',
                description: 'We provide comprehensive legal services for aviation industry clients, including aircraft financing, regulatory compliance, and aviation litigation. Our team has extensive experience in both domestic and international aviation law.',
                services: [
                    'Aircraft financing and leasing',
                    'Aviation regulatory compliance',
                    'Airport development projects',
                    'Aviation insurance claims',
                    'International air transport agreements',
                    'Drone and UAV regulations'
                ]
            },
            'banking-litigation': {
                title: 'Banking Litigation',
                description: 'Our banking litigation practice handles complex financial disputes, regulatory compliance, and banking law matters. We represent banks, financial institutions, and clients in banking-related legal proceedings.',
                services: [
                    'Banking regulatory compliance',
                    'Loan recovery litigation',
                    'Financial fraud investigations',
                    'Banking license applications',
                    'Consumer banking disputes',
                    'International banking transactions'
                ]
            },
            'business-setup': {
                title: 'Business Setup',
                description: 'We assist entrepreneurs and businesses in establishing and structuring their operations in Bangladesh. Our comprehensive business setup services cover all legal aspects of company formation and business establishment.',
                services: [
                    'Company incorporation and registration',
                    'Business license applications',
                    'Foreign investment approvals',
                    'Joint venture formations',
                    'Business restructuring',
                    'Tax registration and compliance'
                ]
            },
            'civil-litigation': {
                title: 'Civil Litigation',
                description: 'Our civil litigation team handles a wide range of civil disputes, from contract breaches to property matters. We provide aggressive representation while seeking efficient resolutions for our clients.',
                services: [
                    'Contract dispute resolution',
                    'Property and real estate litigation',
                    'Tort claims and negligence',
                    'Commercial disputes',
                    'Civil appeals',
                    'Injunction applications'
                ]
            },
            'commercial-litigation': {
                title: 'Commercial Litigation',
                description: 'We specialize in complex commercial disputes involving businesses and corporations. Our commercial litigation practice covers all aspects of business law disputes and corporate conflicts.',
                services: [
                    'Corporate governance disputes',
                    'Shareholder litigation',
                    'Commercial contract disputes',
                    'Intellectual property disputes',
                    'Competition law matters',
                    'Business tort litigation'
                ]
            },
            'company-formation': {
                title: 'Company Formation and Registration',
                description: 'Our company formation services provide end-to-end support for establishing businesses in Bangladesh. We handle all legal requirements and regulatory filings for various business structures.',
                services: [
                    'Private limited company formation',
                    'Public limited company registration',
                    'Partnership firm establishment',
                    'Foreign company branch registration',
                    'NGO and society registration',
                    'Business name registration'
                ]
            },
            'constitutional-law': {
                title: 'Constitutional Law',
                description: 'We provide expert legal services in constitutional matters, including fundamental rights enforcement and constitutional challenges. Our team has extensive experience in constitutional litigation and public law.',
                services: [
                    'Fundamental rights petitions',
                    'Constitutional writs and PIL',
                    'Election law matters',
                    'Administrative law challenges',
                    'Human rights litigation',
                    'Constitutional interpretation'
                ]
            },
            'contracts': {
                title: 'Contracts',
                description: 'Our contract law practice covers drafting, negotiation, and enforcement of commercial agreements. We ensure that our clients\' contractual relationships are legally sound and enforceable.',
                services: [
                    'Contract drafting and review',
                    'Commercial agreement negotiation',
                    'Contract dispute resolution',
                    'Terms and conditions development',
                    'Supply chain agreements',
                    'Service level agreements'
                ]
            },
            'criminal-defense': {
                title: 'Criminal Prosecution and Defense',
                description: 'We provide comprehensive criminal law services for both prosecution and defense matters. Our experienced criminal lawyers handle cases ranging from minor offenses to complex white-collar crimes.',
                services: [
                    'Criminal defense representation',
                    'Prosecution services',
                    'Bail applications and hearings',
                    'Criminal appeals',
                    'White-collar crime defense',
                    'Corporate criminal liability'
                ]
            },
            'domestic-arbitration': {
                title: 'Domestic and International Arbitration',
                description: 'Our arbitration practice handles both domestic and international commercial disputes. We represent clients in arbitration proceedings under various institutional rules and ad-hoc arbitrations.',
                services: [
                    'International commercial arbitration',
                    'Investment treaty arbitration',
                    'Construction arbitration',
                    'Arbitration award enforcement',
                    'Arbitration agreement drafting',
                    'Arbitrator appointments'
                ]
            },
            'entertainment-litigation': {
                title: 'Entertainment and Media Litigation',
                description: 'We represent clients in entertainment industry disputes, including copyright infringement, defamation, and media law matters. Our practice covers film, music, publishing, and digital media.',
                services: [
                    'Copyright and trademark disputes',
                    'Defamation and privacy claims',
                    'Entertainment contract disputes',
                    'Media law compliance',
                    'Celebrity and talent representation',
                    'Digital content disputes'
                ]
            },
            'environmental-law': {
                title: 'Environmental Law',
                description: 'Our environmental law practice addresses regulatory compliance, environmental litigation, and sustainable development matters. We help businesses navigate complex environmental regulations.',
                services: [
                    'Environmental impact assessments',
                    'Regulatory compliance',
                    'Environmental litigation',
                    'Climate change law',
                    'Natural resource management',
                    'Sustainable development projects'
                ]
            },
            'family-matters': {
                title: 'Family Matters and Child Custody',
                description: 'We provide compassionate and expert legal services in family law matters, including divorce, child custody, and domestic relations. Our focus is on achieving fair and equitable outcomes for families.',
                services: [
                    'Divorce and separation proceedings',
                    'Child custody and visitation',
                    'Child support arrangements',
                    'Domestic violence protection',
                    'Adoption and guardianship',
                    'Family property disputes'
                ]
            },
            'foreign-investment': {
                title: 'Foreign Investment',
                description: 'Our foreign investment practice assists international investors in establishing and operating businesses in Bangladesh. We provide comprehensive legal support for FDI and international business ventures.',
                services: [
                    'Foreign direct investment approvals',
                    'Investment license applications',
                    'Joint venture structuring',
                    'Repatriation of profits',
                    'Investment protection agreements',
                    'Cross-border M&A transactions'
                ]
            },
            'fraud-crimes': {
                title: 'Fraud and White Collar Crimes',
                description: 'We specialize in investigating and defending white-collar crimes, financial fraud, and corporate misconduct. Our team has extensive experience in complex financial crime litigation.',
                services: [
                    'Financial fraud investigations',
                    'Money laundering defense',
                    'Securities fraud litigation',
                    'Corporate fraud matters',
                    'Regulatory enforcement defense',
                    'Asset recovery and forfeiture'
                ]
            },
            'global-investment': {
                title: 'Global Investment and Citizenship',
                description: 'Our global investment practice helps clients with international investment strategies and citizenship programs. We provide legal support for offshore investments and residency programs.',
                services: [
                    'Citizenship by investment programs',
                    'Offshore company formation',
                    'International tax planning',
                    'Asset protection structures',
                    'Immigration and residency',
                    'Global investment advisory'
                ]
            },
            'government-contracts': {
                title: 'Government Contracts and Litigation',
                description: 'We handle government contracting matters, including bid protests, contract disputes, and procurement litigation. Our practice covers all aspects of public sector contracting.',
                services: [
                    'Government contract bidding',
                    'Contract dispute resolution',
                    'Bid protest litigation',
                    'Public procurement compliance',
                    'Government relations',
                    'Contract performance disputes'
                ]
            },
            'immigration-law': {
                title: 'Immigration Law in Bangladesh',
                description: 'Our immigration practice provides comprehensive legal services for visa applications, residency permits, and citizenship matters. We assist individuals and businesses with immigration compliance.',
                services: [
                    'Work permit applications',
                    'Residency visa processing',
                    'Citizenship applications',
                    'Immigration appeals',
                    'Family reunification',
                    'Business immigration'
                ]
            },
            'insurance-recovery': {
                title: 'Insurance Recovery',
                description: 'We assist clients in insurance claim disputes and recovery matters. Our practice covers property insurance, liability insurance, and complex insurance litigation.',
                services: [
                    'Insurance claim disputes',
                    'Bad faith insurance litigation',
                    'Property damage claims',
                    'Liability insurance recovery',
                    'Life insurance disputes',
                    'Insurance contract interpretation'
                ]
            },
            'intellectual-property': {
                title: 'Intellectual Property (Trademark Patent Copyright)',
                description: 'Our IP practice protects and enforces intellectual property rights across trademarks, patents, and copyrights. We provide comprehensive IP legal services for businesses and creators.',
                services: [
                    'Trademark registration and protection',
                    'Patent prosecution and litigation',
                    'Copyright registration and enforcement',
                    'IP licensing and transactions',
                    'Trade secret protection',
                    'IP infringement litigation'
                ]
            },
            'international-trade': {
                title: 'International Trade',
                description: 'We provide legal services for international trade and commerce, including import/export regulations, trade agreements, and customs matters. Our practice supports global business operations.',
                services: [
                    'International trade agreements',
                    'Import/export compliance',
                    'Customs and tariff matters',
                    'Trade dispute resolution',
                    'WTO compliance',
                    'International sanctions'
                ]
            },
            'judicial-review': {
                title: 'Judicial Review of Administrative Action',
                description: 'Our judicial review practice challenges administrative decisions and government actions. We represent clients in high court proceedings against administrative overreach.',
                services: [
                    'Administrative decision challenges',
                    'Judicial review applications',
                    'Government action appeals',
                    'Regulatory decision review',
                    'Administrative fairness claims',
                    'Public law litigation'
                ]
            },
            'labour-employment': {
                title: 'Labour and Employment Matters',
                description: 'We provide comprehensive employment law services for employers and employees. Our practice covers workplace disputes, employment contracts, and labor regulatory compliance.',
                services: [
                    'Employment contract drafting',
                    'Workplace dispute resolution',
                    'Labor law compliance',
                    'Wrongful termination claims',
                    'Employee rights protection',
                    'Collective bargaining'
                ]
            },
            'land-documentation': {
                title: 'Land Related Documentation',
                description: 'Our land law practice handles property documentation, land registration, and real estate transactions. We ensure proper legal documentation for all land-related matters.',
                services: [
                    'Land registration and transfer',
                    'Property documentation',
                    'Title verification',
                    'Land dispute resolution',
                    'Real estate transactions',
                    'Property development agreements'
                ]
            },
            'marine-insurance': {
                title: 'Marine Insurance',
                description: 'We specialize in marine insurance claims and disputes, including cargo insurance, hull insurance, and marine liability. Our practice covers all aspects of maritime insurance law.',
                services: [
                    'Cargo insurance claims',
                    'Hull and machinery insurance',
                    'Marine liability claims',
                    'Insurance dispute resolution',
                    'Salvage and general average',
                    'Marine insurance contracts'
                ]
            },
            'natural-resources': {
                title: 'Natural Resources',
                description: 'Our natural resources practice covers mining, energy, and environmental resource matters. We provide legal support for resource extraction and environmental compliance.',
                services: [
                    'Mining and extraction rights',
                    'Energy project development',
                    'Environmental impact assessments',
                    'Resource licensing',
                    'Land use and zoning',
                    'Sustainable resource management'
                ]
            },
            'oil-gas-law': {
                title: 'Oil and Gas Law',
                description: 'We provide specialized legal services for the oil and gas industry, including exploration contracts, regulatory compliance, and energy project development.',
                services: [
                    'Oil and gas exploration contracts',
                    'Regulatory compliance',
                    'Energy project financing',
                    'Environmental compliance',
                    'Pipeline and infrastructure',
                    'Energy dispute resolution'
                ]
            },
            'private-equity': {
                title: 'Private Equity Loan Syndication',
                description: 'Our private equity practice handles complex financing transactions and loan syndications. We provide legal support for private equity investments and structured finance.',
                services: [
                    'Private equity transactions',
                    'Loan syndication agreements',
                    'Investment fund formation',
                    'Structured finance deals',
                    'Equity financing',
                    'Investment advisory'
                ]
            },
            'procurement-bidding': {
                title: 'Procurement Bidding and Government Contracts',
                description: 'We assist clients in government procurement processes, bid preparation, and contract negotiation. Our practice ensures compliance with public procurement regulations.',
                services: [
                    'Bid preparation and submission',
                    'Government procurement compliance',
                    'Contract negotiation',
                    'Bid protest defense',
                    'Public tender processes',
                    'Procurement dispute resolution'
                ]
            },
            'project-finance': {
                title: 'Project Finance Documentation',
                description: 'Our project finance practice handles complex infrastructure and development project financing. We provide comprehensive legal documentation for large-scale projects.',
                services: [
                    'Project finance agreements',
                    'Infrastructure project documentation',
                    'Development financing',
                    'Security documentation',
                    'Project risk assessment',
                    'Financial closing documentation'
                ]
            },
            'real-estate': {
                title: 'Real Estate and Property Matters',
                description: 'We provide comprehensive real estate legal services, including property transactions, development, and dispute resolution. Our practice covers residential and commercial property matters.',
                services: [
                    'Property purchase and sale',
                    'Real estate development',
                    'Property dispute resolution',
                    'Lease agreements',
                    'Mortgage and financing',
                    'Property management'
                ]
            },
            'security-documentation': {
                title: 'Security Documentation',
                description: 'Our security documentation practice handles collateral agreements, guarantees, and security interests. We ensure proper documentation for secured transactions.',
                services: [
                    'Security agreements',
                    'Mortgage documentation',
                    'Guarantee agreements',
                    'Pledge and hypothecation',
                    'Security registration',
                    'Enforcement of security interests'
                ]
            },
            'ship-building': {
                title: 'Ship Building and Ship Breaking Matters',
                description: 'We provide legal services for shipbuilding contracts, ship breaking operations, and maritime construction matters. Our practice covers the entire shipbuilding lifecycle.',
                services: [
                    'Shipbuilding contracts',
                    'Ship breaking regulations',
                    'Maritime construction disputes',
                    'Vessel financing',
                    'Shipyard agreements',
                    'Environmental compliance'
                ]
            },
            'taxation-systems': {
                title: 'Taxation Systems',
                description: 'Our tax practice provides comprehensive tax planning, compliance, and dispute resolution services. We help clients navigate complex tax regulations and optimize their tax positions.',
                services: [
                    'Tax planning and advisory',
                    'Tax compliance and filing',
                    'Tax dispute resolution',
                    'Transfer pricing',
                    'International tax matters',
                    'Tax audit defense'
                ]
            },
            'tenant-rights': {
                title: 'Tenant Rights in Bangladesh',
                description: 'We protect tenant rights and handle landlord-tenant disputes. Our practice ensures fair treatment and legal compliance in rental relationships.',
                services: [
                    'Tenant rights protection',
                    'Rent dispute resolution',
                    'Eviction defense',
                    'Lease agreement review',
                    'Housing discrimination claims',
                    'Tenant security deposits'
                ]
            },
            'telecommunication': {
                title: 'Telecommunication and IT Law',
                description: 'Our technology law practice covers telecommunications regulation, IT contracts, and digital law matters. We provide legal support for technology businesses and digital transformation.',
                services: [
                    'Telecommunications licensing',
                    'IT contract drafting',
                    'Data protection compliance',
                    'Technology dispute resolution',
                    'Digital content regulation',
                    'Cybersecurity legal matters'
                ]
            },
            'vat-tax': {
                title: 'VAT Tax and Customs Matters',
                description: 'We specialize in VAT compliance, customs regulations, and international trade taxation. Our practice helps businesses navigate complex indirect tax requirements.',
                services: [
                    'VAT registration and compliance',
                    'Customs duty assessment',
                    'Import/export taxation',
                    'VAT audit defense',
                    'Indirect tax planning',
                    'Customs dispute resolution'
                ]
            },
            'verification-documents': {
                title: 'Verification and Land Documents',
                description: 'Our document verification practice ensures authenticity and legal validity of land documents and property records. We provide comprehensive due diligence services.',
                services: [
                    'Land document verification',
                    'Title search and verification',
                    'Property due diligence',
                    'Document authentication',
                    'Legal opinion on documents',
                    'Chain of title verification'
                ]
            },
            'vetting-documents': {
                title: 'Vetting of Documents',
                description: 'We provide thorough document vetting and legal review services. Our practice ensures that all legal documents meet regulatory standards and legal requirements.',
                services: [
                    'Legal document review',
                    'Contract vetting',
                    'Regulatory compliance check',
                    'Document authentication',
                    'Legal risk assessment',
                    'Document standardization'
                ]
            },
            'writ-matters': {
                title: 'Writ and High Court Matters',
                description: 'Our constitutional and public law practice handles writ petitions and high court matters. We represent clients in fundamental rights cases and public interest litigation.',
                services: [
                    'Writ petition drafting',
                    'Fundamental rights enforcement',
                    'Public interest litigation',
                    'Judicial review applications',
                    'Constitutional challenges',
                    'High court appeals'
                ]
            }
        };

        const searchInput = document.getElementById('serviceSearch');
        const alphabetNav = document.getElementById('alphabetNav');
        const directoryContainer = document.getElementById('serviceDirectory');
        const popularContainer = document.getElementById('popularServices');

        const popularServiceKeys = [
            'civil-litigation',
            'company-formation',
            'criminal-defense',
            'family-matters',
            'intellectual-property',
            'real-estate'
        ];

        const serviceIcons = {
            'civil-litigation': 'fa-gavel',
            'company-formation': 'fa-building',
            'criminal-defense': 'fa-shield-halved',
            'family-matters': 'fa-users',
            'intellectual-property': 'fa-lightbulb',
            'real-estate': 'fa-landmark'
        };

        const serviceItems = Array.from(document.querySelectorAll('.service-item'));

        let lastFocusedElement = null;

        function getIconForService(key) {
            return serviceIcons[key] || 'fa-gavel';
        }

        function renderPopularServices() {
            if (!popularContainer) return;

            popularContainer.innerHTML = '';

            popularServiceKeys.forEach(key => {
                const data = serviceData[key];
                if (!data) return;

                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4';

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'service-item popular-service-card';
                button.setAttribute('data-service', key);
                button.setAttribute('aria-label', `Open details for ${data.title}`);
                button.addEventListener('click', () => openModal(key));

                const icon = document.createElement('div');
                icon.className = 'service-item-icon';
                icon.innerHTML = `<i class="fas ${getIconForService(key)}"></i>`;

                const title = document.createElement('p');
                title.className = 'service-item-title';
                title.textContent = data.title;

                button.appendChild(icon);
                button.appendChild(title);

                col.appendChild(button);
                popularContainer.appendChild(col);
            });
        }

        const alphabetLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        function initAlphabetNav() {
            const sections = Array.from(directoryContainer.querySelectorAll('.service-section'));
            const availableLetters = new Set(sections.map(s => s.id.replace('section-', '')));

            alphabetNav.innerHTML = '';

            alphabetLetters.forEach(letter => {
                const li = document.createElement('li');
                li.className = 'list-inline-item';

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'alphabet-link';
                button.textContent = letter;
                button.disabled = !availableLetters.has(letter);
                if (!availableLetters.has(letter)) {
                    button.classList.add('disabled');
                }

                button.addEventListener('click', () => {
                    const target = document.getElementById(`section-${letter}`);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        document.querySelectorAll('.alphabet-link').forEach(el => el.classList.remove('active'));
                        button.classList.add('active');
                    }
                });

                li.appendChild(button);
                alphabetNav.appendChild(li);
            });
        }

        function filterServices(query) {
            const term = query.trim().toLowerCase();
            const matches = [];

            serviceItems.forEach(item => {
                const key = item.dataset.service;
                const data = serviceData[key] || {};
                const title = (item.querySelector('.service-item-title')?.textContent || '').toLowerCase();
                const description = (data.description || '').toLowerCase();
                const keywords = (data.services || []).join(' ').toLowerCase();

                const haystack = `${title} ${description} ${keywords}`;
                const visible = term === '' || haystack.includes(term);

                item.style.display = visible ? '' : 'none';
                if (visible) matches.push(item);
            });

            directoryContainer.querySelectorAll('.service-section').forEach(section => {
                const visibleItems = section.querySelectorAll('.service-item:not([style*="display: none"])');
                section.style.display = visibleItems.length ? '' : 'none';
            });

            const noResults = document.getElementById('noResultsMessage');
            const anyVisible = matches.length > 0;

            if (!anyVisible) {
                if (!noResults) {
                    const message = document.createElement('p');
                    message.id = 'noResultsMessage';
                    message.className = 'text-center mt-4 text-muted';
                    message.textContent = 'No services match your search. Try different keywords.';
                    directoryContainer.parentElement.appendChild(message);
                }
            } else if (noResults) {
                noResults.remove();
            }

            if (term !== '' && matches.length) {
                matches[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function openModal(serviceKey) {
            const data = serviceData[serviceKey];
            if (!data) return;

            lastFocusedElement = document.activeElement;

            modalTitle.textContent = data.title;
            modalDescription.textContent = data.description;
            modalServices.innerHTML = '';

            data.services.forEach(service => {
                const li = document.createElement('li');
                li.textContent = service;
                modalServices.appendChild(li);
            });

            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            closeButton.focus();
        }

        function closeModal() {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        }

        serviceItems.forEach(item => {
            item.addEventListener('click', () => openModal(item.dataset.service));
        });

        searchInput.addEventListener('input', e => filterServices(e.target.value));

        closeButton.addEventListener('click', closeModal);

        modal.addEventListener('click', event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });

        let scrollTicking = false;
        function updateActiveLetterOnScroll() {
            const sections = document.querySelectorAll('.service-section');
            const offset = window.innerHeight * 0.35;
            let activeLetter = null;

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= offset && rect.bottom > offset) {
                    activeLetter = section.id.replace('section-', '');
                }
            });

            if (activeLetter) {
                document.querySelectorAll('.alphabet-link').forEach(btn => {
                    btn.classList.toggle('active', btn.textContent === activeLetter);
                });
            }
        }

        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                scrollTicking = true;
                window.requestAnimationFrame(() => {
                    updateActiveLetterOnScroll();
                    scrollTicking = false;
                });
            }
        });

        modal.addEventListener('wheel', event => {
            if (modal.classList.contains('show')) {
                event.stopPropagation();
            }
        });

        modal.addEventListener('keydown', event => {
            if (event.key === 'Tab') {
                const focusableElements = modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });

        initAlphabetNav();
        renderPopularServices();
        filterServices('');
        updateActiveLetterOnScroll();
    })();

    // ===== Testimonials Carousel =====
    const testimonials = [
        {
            text: '"Kamal & Associates provided exceptional guidance during our merger. Their expertise in corporate law and attention to detail ensured a smooth transaction. Highly recommended for any business legal needs."',
            name: 'Rahman Industries Ltd.',
            role: 'Corporate Client',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
        },
        {
            text: '"During my property dispute, the team at Kamal & Associates showed remarkable dedication. They handled my case with professionalism and achieved the best outcome. I am forever grateful."',
            name: 'Fatima Begum',
            role: 'Individual Client',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        },
        {
            text: '"Outstanding intellectual property services. They helped us protect our innovations and navigate complex IP regulations with ease. Their expertise is unmatched in the industry."',
            name: 'Bangladesh Tech Solutions',
            role: 'Corporate Client',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        }
    ];

    let currentTestimonial = 0;
    const testimonialText = document.getElementById('testimonialText');
    const testimonialName = document.getElementById('testimonialName');
    const testimonialRole = document.getElementById('testimonialRole');
    const testimonialImg = document.getElementById('testimonialImg');
    const testimonialDots = document.querySelectorAll('#testimonialDots .dot');

    function updateTestimonial(index) {
        if (!testimonialText) return;

        currentTestimonial = index;
        const t = testimonials[index];

        testimonialText.textContent = t.text;
        testimonialName.textContent = t.name;
        testimonialRole.textContent = t.role;
        testimonialImg.src = t.image;

        testimonialDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // Auto-rotate testimonials
    if (testimonialText) {
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            updateTestimonial(currentTestimonial);
        }, 5000);

        // Click on dots
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => updateTestimonial(index));
        });
    }

    if (window.jQuery) {
        (function ($) {
            "use strict";

            $(document).ready(function () {

                /* =================================
                   TESTIMONIALS CAROUSEL INITIALIZATION
                   ================================= */
                $(".testimonial-carousel").owlCarousel({
                    loop: true,
                    margin: 30,
                    nav: false,       /* No left/right arrows */
                    dots: true,       /* Show bottom dots */
                    autoplay: true,
                    autoplayTimeout: 4000,
                    smartSpeed: 700,
                    responsive: {
                        0: {
                            items: 1  /* Mobile: 1 card */
                        },
                        768: {
                            items: 2  /* Tablet: 2 cards */
                        },
                        992: {
                            items: 3  /* Desktop: 3 cards */
                        }
                    }
                });

            });

        })(jQuery);


        /* =================================
           CLIENT LOGO CAROUSEL INITIALIZATION
           ================================= */
        $(".logo-carousel").owlCarousel({
            rtl: true,       /* Right to Left */
            loop: true,
            margin: 30,
            nav: false,         /* No arrows */
            dots: false,        /* No dots needed for logos */
            autoplay: true,     /* Auto Scroll */
            autoplayTimeout: 2000, /* Speed of slide */
            autoplayHoverPause: true, /* Stops if user hovers to look closer */
            responsive: {
                0: {
                    items: 2    /* 2 logos on mobile */
                },
                600: {
                    items: 3    /* 3 logos on tablet */
                },
                1000: {
                    items: 5    /* 5 logos on desktop */
                }
            }
        });
    }

    // ===== Video Modal =====
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('show.bs.modal', function () {
            document.getElementById('videoFrame').src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
        });

        videoModal.addEventListener('hide.bs.modal', function () {
            document.getElementById('videoFrame').src = '';
        });
    }

    // ===== Back to Top Button =====
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== Newsletter Form =====
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert('Thank you for subscribing! We will send updates to: ' + email);
            this.reset();
        });
    }

    // ===== Contact Form =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            submitBtn.disabled = true;

            // Simulate form submission
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Show success message
                const successDiv = document.createElement('div');
                successDiv.className = 'alert alert-success mt-3';
                successDiv.innerHTML = '<i class="fas fa-check-circle me-2"></i>Thank you for your message! We will get back to you shortly.';
                contactForm.appendChild(successDiv);

                contactForm.reset();

                setTimeout(() => successDiv.remove(), 5000);
            }, 1500);
        });
    }

    // ===== Flip Cards Touch Support =====
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('touchstart', function () {
            this.querySelector('.flip-card-inner').style.transform = 'rotateY(180deg)';
        });

        card.addEventListener('touchend', function () {
            setTimeout(() => {
                this.querySelector('.flip-card-inner').style.transform = '';
            }, 3000);
        });
    });

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ===== Active Nav Link =====
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ===== Practice Areas Modal Logic =====
    const practiceData = {
        corporate: {
            title: "Corporate & Commercial",
            icon: "fas fa-briefcase",
            description: "Our corporate and commercial practice provides comprehensive legal solutions for businesses at every stage of their lifecycle. From company formation and governance to mergers and acquisitions, we guide our clients through complex business transactions.",
            services: [
                "Company Formation & Registration",
                "Mergers & Acquisitions",
                "Corporate Governance",
                "Joint Ventures & Partnerships",
                "Commercial Contracts",
                "Due Diligence"
            ],
            whyChoose: [
                { icon: "fas fa-briefcase", text: "Business-Centric Approach" },
                { icon: "fas fa-handshake", text: "Strategic Negotiation" }
            ]
        },
        banking: {
            title: "Banking & Finance",
            icon: "fas fa-university",
            description: "We advise banks, financial institutions, and corporations on all aspects of banking and finance law. Our team has extensive experience in loan documentation, project finance, and regulatory compliance.",
            services: [
                "Loan Documentation",
                "Project Finance",
                "Regulatory Compliance",
                "Banking Disputes",
                "Securities & Capital Markets",
                "Islamic Finance"
            ],
            whyChoose: [
                { icon: "fas fa-chart-line", text: "Financial Acumen" },
                { icon: "fas fa-gavel", text: "Regulatory Expertise" }
            ]
        },
        realestate: {
            title: "Real Estate & Property",
            icon: "fas fa-home",
            description: "Our real estate practice handles all aspects of property law, from land acquisition and development to property disputes. We represent developers, investors, and individuals in complex real estate transactions.",
            services: [
                "Land Acquisition",
                "Property Development",
                "Title Verification",
                "Property Disputes",
                "Lease Agreements",
                "Construction Contracts"
            ],
            whyChoose: [
                { icon: "fas fa-map-marked-alt", text: "Deep Market Knowledge" },
                { icon: "fas fa-file-signature", text: "Thorough Due Diligence" }
            ]
        },
        family: {
            title: "Family Law",
            icon: "fas fa-heart",
            description: "We provide sensitive and effective representation in all family law matters. Our attorneys understand the emotional challenges involved and work to achieve the best outcomes while minimizing conflict.",
            services: [
                "Divorce & Separation",
                "Child Custody",
                "Inheritance & Succession",
                "Marriage Registration",
                "Domestic Violence",
                "Adoption"
            ],
            whyChoose: [
                { icon: "fas fa-hands-helping", text: "Compassionate Counsel" },
                { icon: "fas fa-child", text: "Child-Centric Focus" }
            ]
        },
        criminal: {
            title: "Criminal Defense",
            icon: "fas fa-shield-alt",
            description: "Our criminal defense team provides aggressive representation for individuals facing criminal charges. We have a proven track record of successful defenses in cases ranging from white-collar crimes to serious offenses.",
            services: [
                "White-Collar Crimes",
                "Bail Applications",
                "Trial Representation",
                "Appeals",
                "Cyber Crimes",
                "Financial Crimes"
            ],
            whyChoose: [
                { icon: "fas fa-user-shield", text: "Aggressive Defense" },
                { icon: "fas fa-balance-scale", text: "Fair Trial Advocacy" }
            ]
        },
        ip: {
            title: "Intellectual Property",
            icon: "fas fa-lightbulb",
            description: "We help clients protect and monetize their intellectual property assets. Our IP practice covers trademarks, copyrights, patents, and trade secrets, providing comprehensive protection strategies.",
            services: [
                "Trademark Registration",
                "Copyright Protection",
                "Patent Applications",
                "IP Litigation",
                "Licensing Agreements",
                "Trade Secrets"
            ],
            whyChoose: [
                { icon: "fas fa-copyright", text: "Brand Protection" },
                { icon: "fas fa-globe", text: "Global IP Strategy" }
            ]
        },
        tax: {
            title: "Tax & Revenue",
            icon: "fas fa-calculator",
            description: "Our tax practice offers strategic tax planning, compliance, and dispute resolution services. We help businesses and individuals navigate complex tax regulations to minimize liability and ensure compliance.",
            services: [
                "Corporate Tax Planning",
                "VAT & Sales Tax",
                "Tax Dispute Resolution",
                "Income Tax Findings",
                "International Taxation",
                "Tax Compliance Audits"
            ],
            whyChoose: [
                { icon: "fas fa-coins", text: "Cost-Saving Strategies" },
                { icon: "fas fa-file-invoice-dollar", text: "Regulatory Compliance" }
            ]
        },
        immigration: {
            title: "Immigration Law",
            icon: "fas fa-globe",
            description: "We provide expert legal assistance for visa applications, work permits, citizenship matters, and immigration appeals. Our team ensures a smooth process for individuals and businesses relocating or hiring abroad.",
            services: [
                "Business & Work Visas",
                "Citizenship Applications",
                "Family Sponsorship",
                "Immigration Appeals",
                "Residency Permits",
                "Corporate Immigration Compliance"
            ],
            whyChoose: [
                { icon: "fas fa-passport", text: "Global Mobility Experts" },
                { icon: "fas fa-plane", text: "Streamlined Process" }
            ]
        },
        labor: {
            title: "Labor & Employment",
            icon: "fas fa-users",
            description: "We represent employers and employees in matters involving employment contracts, workplace disputes, labor compliance, and termination. We strive to foster fair and legally compliant workplace environments.",
            services: [
                "Employment Contracts",
                "Workplace Discrimination",
                "Termination & Severance",
                "Labor Law Compliance",
                "Employee Handbooks",
                "Dispute Mediation"
            ],
            whyChoose: [
                { icon: "fas fa-handshake", text: "Fair Conflict Resolution" },
                { icon: "fas fa-briefcase", text: "Workplace Compliance" }
            ]
        }
    };

    // Event Listeners for Modal Triggers
    const modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"][data-practice]');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function () {
            const practiceKey = this.getAttribute('data-practice');
            const data = practiceData[practiceKey];

            if (data) {
                // Update Modal Content
                document.getElementById('modalTitle').textContent = data.title;
                document.getElementById('modalDescription').textContent = data.description;

                // Update Icon
                const iconContainer = document.getElementById('modalIcon');
                iconContainer.innerHTML = `<i class="${data.icon}"></i>`;

                // Update Services
                const servicesList = document.getElementById('modalServices');
                servicesList.innerHTML = data.services.map(service =>
                    `<li><i class="fas fa-check-circle text-accent me-2"></i>${service}</li>`
                ).join('');

                // Update Why Choose Us (simulated for now as we don't have this data yet)
                const whyChooseContainer = document.getElementById('modalWhyChoose');
                if (data.whyChoose) {
                    whyChooseContainer.innerHTML = data.whyChoose.map(item => `
                        <div class="col-md-6 mb-3">
                            <div class="d-flex align-items-center">
                                <div class="me-3" style="width: 40px; height: 40px; background: rgba(175, 169, 57, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                    <i class="${item.icon} text-accent"></i>
                                </div>
                                <span class="fw-medium text-light">${item.text}</span>
                            </div>
                        </div>
                     `).join('');
                }
            }
        });
    });

});

// ===== Page Header Animation =====
function initPageHeader() {
    const pageHeader = document.querySelector('.page-header');
    // ===== Attorney Card Click Handler =====
    const attorneyCards = document.querySelectorAll('.attorney-card-link');
    attorneyCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Prevent any carousel interference
            e.stopPropagation();
            // The link should work normally
        });
    });

    // ===== Smooth Scrolling for Anchor Links =====
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Skip social links

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    if (pageHeader) {
        pageHeader.style.opacity = '1';
    }
}

window.addEventListener('load', initPageHeader);
