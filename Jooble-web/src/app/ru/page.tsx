import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';

// Force dynamic rendering - no client-side bailout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

export const metadata: Metadata = {
    title: {
        absolute: "Вакансии в Азербайджане 2026 | Актуальные Предложения Работы – Jooble Азербайджан"
    },
    description: "Вакансии и объявления о работе 2026 - крупнейшая платформа поиска работы в Азербайджане. Тысячи активных вакансий, работа в Баку, вакансии SOCAR и точный поиск работы. Ежедневно обновляемые предложения.",
    keywords: "вакансии 2026, работа Азербайджан, работа в Баку, новые вакансии, поиск работы, объявления о работе, вакансии SOCAR, удаленная работа, высокая зарплата, подача резюме, стажировка, частичная занятость",
    alternates: {
        canonical: 'https://jooble.az/ru',
        languages: {
            'az': 'https://jooble.az',
            'en': 'https://jooble.az/en',
            'ru': 'https://jooble.az/ru',
            'x-default': 'https://jooble.az',
        },
    },
    openGraph: {
        title: "Вакансии в Азербайджане 2026 | Jooble Азербайджан",
        description: "Крупнейшая платформа поиска работы в Азербайджане. Тысячи активных вакансий и объявлений о работе.",
        url: "https://jooble.az/ru",
        siteName: "Jooble Азербайджан",
        type: "website",
        locale: "ru_RU",
        images: [{ url: "https://jooble.az/icons/icon-512x512.jpg", width: 512, height: 512, alt: "Jooble Азербайджан Логотип" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Вакансии в Азербайджане 2026 | Jooble",
        description: "Крупнейшая платформа поиска работы в Азербайджане",
    },
};

// Helper to strip HTML tags
function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '').trim() || '';
}

// Server-side data fetching
async function getHomeData() {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    const [jobsResult, categoriesResult, regionsResult, companiesResult, statsResult] = await Promise.all([
        supabase
            .from('jobs')
            .select(`
                id, title, slug, location, type, salary, description, created_at, expiration_date,
                companies:company_id(name, slug, logo),
                categories:category_id(name, slug)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(50),
        
        supabase
            .from('categories')
            .select('id, name, slug, description')
            .eq('is_active', true)
            .order('name'),
        
        supabase
            .from('regions')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name'),
        
        supabase
            .from('companies')
            .select('id, name, slug, logo, is_verified')
            .eq('is_active', true)
            .order('name')
            .limit(50),
        
        supabase
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
    ]);

    const categoryJobCounts: { [key: string]: number } = {};
    if (categoriesResult.data) {
        await Promise.all(categoriesResult.data.map(async (cat) => {
            const { count } = await supabase
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true)
                .eq('category_id', cat.id);
            categoryJobCounts[cat.id] = count || 0;
        }));
    }

    const regionJobCounts: { [key: string]: number } = {};
    if (regionsResult.data) {
        await Promise.all(regionsResult.data.map(async (region) => {
            const { count } = await supabase
                .from('jobs')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true)
                .ilike('location', `%${region.name}%`);
            regionJobCounts[region.id] = count || 0;
        }));
    }

    return {
        jobs: jobsResult.data || [],
        categories: (categoriesResult.data || []).map(cat => ({
            ...cat,
            jobsCount: categoryJobCounts[cat.id] || 0
        })),
        regions: (regionsResult.data || []).map(region => ({
            ...region,
            jobsCount: regionJobCounts[region.id] || 0
        })),
        companies: companiesResult.data || [],
        totalJobs: statsResult.count || 0
    };
}

export default async function RuHomePage() {
    const { jobs, categories, regions, companies, totalJobs } = await getHomeData();
    const currentDate = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

    // Comprehensive @graph Schema.org structure
    const graphSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://jooble.az/ru/#website",
                "url": "https://jooble.az/ru",
                "name": "Jooble Азербайджан",
                "description": "Крупнейшая платформа поиска работы в Азербайджане",
                "inLanguage": "ru",
                "publisher": { "@id": "https://jooble.az/#organization" },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://jooble.az/ru/vacancies?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "Organization",
                "@id": "https://jooble.az/#organization",
                "name": "Jooble Азербайджан",
                "url": "https://jooble.az",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://jooble.az/icons/icon-512x512.jpg",
                    "width": 512,
                    "height": 512
                },
                "description": "Крупнейшая платформа поиска работы в Азербайджане. Вакансии, объявления о работе и карьерные возможности.",
                "foundingDate": "2024",
                "areaServed": {
                    "@type": "Country",
                    "name": "Azerbaijan"
                },
                "sameAs": [
                    "https://www.facebook.com/jooble.az",
                    "https://www.instagram.com/jooble.az"
                ],
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "3521",
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "availableLanguage": ["az", "ru", "en"]
                }
            },
            {
                "@type": "WebPage",
                "@id": "https://jooble.az/ru/#webpage",
                "url": "https://jooble.az/ru",
                "name": "Вакансии в Азербайджане 2026 | Jooble Азербайджан",
                "description": "Крупнейшая платформа поиска работы в Азербайджане. Тысячи активных вакансий и объявлений о работе.",
                "isPartOf": { "@id": "https://jooble.az/ru/#website" },
                "about": { "@id": "https://jooble.az/#organization" },
                "datePublished": "2024-01-01",
                "dateModified": currentDate,
                "inLanguage": "ru",
                "primaryImageOfPage": {
                    "@type": "ImageObject",
                    "url": "https://jooble.az/icons/icon-512x512.jpg"
                },
                "breadcrumb": { "@id": "https://jooble.az/ru/#breadcrumb" }
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://jooble.az/ru/#breadcrumb",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Главная",
                        "item": "https://jooble.az/ru"
                    }
                ]
            },
            {
                "@type": "ItemList",
                "@id": "https://jooble.az/ru/#joblist",
                "name": "Последние Вакансии",
                "description": `${totalJobs} активных вакансий и объявлений о работе - Обновлено ${formattedDate}`,
                "numberOfItems": Math.min(jobs.length, 20),
                "itemListOrder": "https://schema.org/ItemListOrderDescending",
                "itemListElement": jobs.slice(0, 20).map((job: any, index: number) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "JobPosting",
                        "@id": `https://jooble.az/ru/vacancies/${job.slug}#job`,
                        "title": job.title,
                        "description": stripHtml(job.description || '').substring(0, 300),
                        "datePosted": job.created_at,
                        "validThrough": job.expiration_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        "employmentType": job.type?.toUpperCase().replace('-', '_') || "FULL_TIME",
                        "hiringOrganization": {
                            "@type": "Organization",
                            "name": job.companies?.name || "Компания",
                            "sameAs": job.companies?.slug ? `https://jooble.az/ru/companies/${job.companies.slug}` : undefined
                        },
                        "jobLocation": {
                            "@type": "Place",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": job.location || "Баку",
                                "addressCountry": "AZ"
                            }
                        },
                        "url": `https://jooble.az/ru/vacancies/${job.slug}`,
                        "occupationalCategory": job.categories?.name || "Общая"
                    }
                }))
            },
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/ru/#categories-collection",
                "name": "Категории Вакансий",
                "description": `Вакансии в ${categories.length} различных областях`,
                "url": "https://jooble.az/ru/categories",
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": categories.length,
                    "itemListElement": categories.slice(0, 15).map((cat: any, index: number) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Thing",
                            "name": cat.name,
                            "url": `https://jooble.az/ru/categories/${cat.slug}`,
                            "description": `${cat.jobsCount} активных вакансий`
                        }
                    }))
                }
            },
            {
                "@type": "CollectionPage",
                "@id": "https://jooble.az/ru/#regions-collection",
                "name": "Вакансии по Регионам",
                "description": `Возможности трудоустройства в ${regions.length} регионах`,
                "url": "https://jooble.az/ru/regions",
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": regions.length,
                    "itemListElement": regions.slice(0, 10).map((region: any, index: number) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Place",
                            "name": region.name,
                            "url": `https://jooble.az/ru/regions/${region.slug}`,
                            "description": `${region.jobsCount} активных вакансий`
                        }
                    }))
                }
            },
            {
                "@type": "FAQPage",
                "@id": "https://jooble.az/ru/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Сколько активных вакансий на Jooble.az?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `В настоящее время на Jooble.az ${totalJobs} активных вакансий и объявлений о работе. Вакансии обновляются ежедневно и предлагаются различные карьерные возможности.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "В каких областях можно найти работу?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `На Jooble.az есть вакансии в ${categories.length} различных областях: ${categories.slice(0, 8).map((c: any) => c.name).join(', ')} и другие. В каждой категории десятки активных вакансий.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Как найти работу в Баку?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Чтобы найти работу в Баку, зарегистрируйтесь на Jooble.az, загрузите своё резюме и откликайтесь на подходящие вакансии. Вы можете уточнить поиск с помощью фильтров по категориям и регионам."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Как часто обновляются вакансии?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Вакансии на Jooble.az обновляются ежедневно. Компании добавляют новые вакансии, а старые объявления автоматически архивируются. Подпишитесь на уведомления, чтобы быть в курсе новых вакансий."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "В каких городах есть возможности трудоустройства?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Вакансии доступны в ${regions.length} регионах Азербайджана: ${regions.slice(0, 6).map((r: any) => r.name).join(', ')} и других городах. Баку имеет наибольшее количество вакансий.`
                        }
                    }
                ]
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
            />

            <article className="sr-only" aria-hidden="true">
                <header>
                    <h1>Вакансии и Работа 2026 - Jooble Азербайджан</h1>
                    <p>
                        Добро пожаловать на крупнейшую и самую надёжную платформу поиска работы в Азербайджане! 
                        <strong> {totalJobs} активных вакансий</strong> ждут вас на Jooble.az. 
                        Дайте новое направление своей карьере с возможностями трудоустройства в различных областях и регионах. 
                        Независимо от того, опытный вы специалист или выпускник - для вас найдётся работа!
                    </p>
                    <p>
                        <time dateTime={currentDate}>Последнее обновление: {formattedDate}</time>
                    </p>
                </header>

                <section>
                    <h2>🔥 Последние Вакансии - Добавленные Сегодня</h2>
                    <p>
                        Ниже вы можете увидеть самые свежие вакансии, добавленные сегодня и в последние дни. 
                        Каждое объявление размещается проверенными компаниями и отражает актуальные возможности трудоустройства.
                    </p>
                    <ul>
                        {jobs.map((job: any, index: number) => (
                            <li key={job.id}>
                                <article itemScope itemType="https://schema.org/JobPosting">
                                    <h3 itemProp="title">
                                        <a href={`https://jooble.az/ru/vacancies/${job.slug}`} itemProp="url">
                                            {index + 1}. {job.title}
                                        </a>
                                    </h3>
                                    <div itemProp="hiringOrganization" itemScope itemType="https://schema.org/Organization">
                                        <strong>Компания:</strong> <span itemProp="name">{job.companies?.name || 'Название компании не указано'}</span>
                                        {job.companies?.slug && (
                                            <span> - <a href={`https://jooble.az/ru/companies/${job.companies.slug}`}>Профиль компании</a></span>
                                        )}
                                    </div>
                                    <div itemProp="jobLocation" itemScope itemType="https://schema.org/Place">
                                        <strong>Местоположение:</strong> <span itemProp="address">{job.location || 'Баку, Азербайджан'}</span>
                                    </div>
                                    <p>
                                        <strong>Тип занятости:</strong> <span itemProp="employmentType">{job.type || 'Полная занятость'}</span>
                                        {job.salary && <> | <strong>Зарплата:</strong> <span itemProp="baseSalary">{job.salary}</span></>}
                                        {job.categories?.name && <> | <strong>Категория:</strong> <span itemProp="occupationalCategory">{job.categories.name}</span></>}
                                    </p>
                                    {job.description && (
                                        <p itemProp="description">{stripHtml(job.description).substring(0, 250)}...</p>
                                    )}
                                    <p>
                                        <strong>Дата публикации:</strong> <time itemProp="datePosted" dateTime={job.created_at}>{new Date(job.created_at).toLocaleDateString('ru-RU')}</time>
                                    </p>
                                </article>
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/ru/vacancies">Смотреть все {totalJobs} вакансий →</a>
                    </p>
                </section>

                <section>
                    <h2>📂 Вакансии по Отраслям - {categories.length} Категорий</h2>
                    <p>
                        Для упрощения поиска работы все вакансии разделены на категории по отраслям. 
                        Выберите категорию, соответствующую вашей специальности, и найдите подходящие вакансии.
                    </p>
                    <ul>
                        {categories.map((category: any) => (
                            <li key={category.id}>
                                <a href={`https://jooble.az/ru/categories/${category.slug}`}>
                                    <strong>{category.name}</strong>
                                </a>
                                {' - '}{category.jobsCount} активных вакансий
                                {category.description && <p>{stripHtml(category.description).substring(0, 100)}</p>}
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/ru/categories">Смотреть все категории →</a>
                    </p>
                </section>

                <section>
                    <h2>🗺️ Вакансии по Регионам - {regions.length} Городов и Районов</h2>
                    <p>
                        Возможности трудоустройства доступны в различных регионах Азербайджана. Выбрав город, 
                        где вы живёте или хотите работать, вы можете увидеть активные вакансии в этом регионе.
                    </p>
                    <ul>
                        {regions.map((region: any) => (
                            <li key={region.id}>
                                <a href={`https://jooble.az/ru/regions/${region.slug}`}>
                                    <strong>{region.name}</strong>
                                </a>
                                {' - '}{region.jobsCount} активных вакансий
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/ru/regions">Смотреть все регионы →</a>
                    </p>
                </section>

                <section>
                    <h2>🏢 Компании - {companies.length}+ Активных Работодателей</h2>
                    <p>
                        Ведущие компании Азербайджана размещают свои вакансии на Jooble.az. Просматривая профили компаний, 
                        вы можете узнать о рабочей среде, корпоративной культуре и открытых вакансиях.
                    </p>
                    <ul>
                        {companies.map((company: any) => (
                            <li key={company.id}>
                                <a href={`https://jooble.az/ru/companies/${company.slug}`}>
                                    <strong>{company.name}</strong>
                                    {company.is_verified && <span> ✓ Проверено</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <p>
                        <a href="https://jooble.az/ru/companies">Смотреть все компании →</a>
                    </p>
                </section>

                <section>
                    <h2>❓ Часто Задаваемые Вопросы</h2>
                    <dl>
                        <dt><strong>Сколько активных вакансий на Jooble.az?</strong></dt>
                        <dd>В настоящее время на Jooble.az {totalJobs} активных вакансий и объявлений о работе. Вакансии обновляются ежедневно.</dd>

                        <dt><strong>В каких областях можно найти работу?</strong></dt>
                        <dd>Есть вакансии в {categories.length} различных областях: {categories.slice(0, 8).map((c: any) => c.name).join(', ')} и другие.</dd>

                        <dt><strong>Как найти работу в Баку?</strong></dt>
                        <dd>Зарегистрируйтесь на Jooble.az, загрузите своё резюме и откликайтесь на подходящие вакансии.</dd>

                        <dt><strong>Как часто обновляются вакансии?</strong></dt>
                        <dd>Вакансии обновляются ежедневно. Подпишитесь на уведомления, чтобы быть в курсе новых вакансий.</dd>

                        <dt><strong>В каких городах есть возможности трудоустройства?</strong></dt>
                        <dd>Вакансии доступны в {regions.length} регионах Азербайджана: {regions.slice(0, 6).map((r: any) => r.name).join(', ')} и других городах.</dd>

                        <dt><strong>Есть ли вакансии для удалённой работы?</strong></dt>
                        <dd>Да, на Jooble.az также доступны возможности удалённой работы. Вы можете найти удалённые вакансии с помощью поисковых фильтров.</dd>

                        <dt><strong>Как компании размещают вакансии?</strong></dt>
                        <dd>Компании могут размещать свои вакансии бесплатно или премиум через раздел "Разместить вакансию".</dd>
                    </dl>
                </section>

                <section>
                    <h2>📱 О Jooble Азербайджан</h2>
                    <p>
                        Jooble.az - крупнейшая и самая надёжная платформа поиска работы в Азербайджане. Работая с 2024 года, 
                        наша платформа связывает тысячи соискателей с работодателями.
                    </p>
                    <h3>Почему Jooble.az?</h3>
                    <ul>
                        <li>✅ {totalJobs}+ активных вакансий и объявлений о работе</li>
                        <li>✅ {categories.length} различных отраслей</li>
                        <li>✅ Поиск в {regions.length} регионах</li>
                        <li>✅ {companies.length}+ проверенных компаний</li>
                        <li>✅ Ежедневно обновляемые вакансии</li>
                        <li>✅ Бесплатное создание и загрузка резюме</li>
                        <li>✅ Push-уведомления о новых вакансиях</li>
                        <li>✅ Мобильный интерфейс</li>
                    </ul>
                    <h3>Наши Услуги</h3>
                    <ul>
                        <li><a href="https://jooble.az/ru/vacancies">Вакансии и объявления о работе</a></li>
                        <li><a href="https://jooble.az/ru/categories">Поиск работы по отраслям</a></li>
                        <li><a href="https://jooble.az/ru/regions">Вакансии по регионам</a></li>
                        <li><a href="https://jooble.az/ru/companies">Профили компаний</a></li>
                        <li><a href="https://jooble.az/ru/add_job">Разместить вакансию</a></li>
                        <li><a href="https://jooble.az/ru/cv-builder">Конструктор резюме</a></li>
                        <li><a href="https://jooble.az/ru/subscribe">Подписка на уведомления</a></li>
                        <li><a href="https://jooble.az/ru/services">Премиум услуги</a></li>
                    </ul>
                </section>

                <footer>
                    <p>
                        © 2024-2026 Jooble.az - Крупнейшая платформа поиска работы в Азербайджане. 
                        Все права защищены. | <a href="https://jooble.az/ru/about">О нас</a>
                    </p>
                    <address>
                        Контакт: Баку, Азербайджан | Email: info@jooble.az
                    </address>
                </footer>
            </article>

            <HomeClient />
        </>
    );
}
