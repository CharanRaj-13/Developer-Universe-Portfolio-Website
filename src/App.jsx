
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { achievementCategories, achievements } from './data/achievements.js'
import { projects } from './data/projects.js'
import profileImage from './assets/social-pfp.jpg'
import './App.css'

const destinations = [
  { number: '00', label: 'Home', id: 'home' },
  { number: '01', label: 'About', id: 'about' },
  { number: '02', label: 'Skills', id: 'skills' },
  { number: '03', label: 'Projects', id: 'projects' },
  { number: '04', label: 'Achievements', id: 'achievements' },
]

const technologyGroups = [
  { title: 'Web & Full-Stack', level: 'Learning and building', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Angular'] },
  { title: 'Programming', level: 'Used in projects and study', items: ['Python', 'Java', 'C', 'Dart', 'Data Structures & Algorithms'] },
  { title: 'Security & Linux', level: 'Exploring through tools and projects', items: ['Linux', 'Bash', 'Network security', 'Wireshark', 'Metasploit', 'SQLMap'] },
  { title: 'AI & Emerging Tech', level: 'Learning interests', items: ['Generative AI', 'Agentic AI', 'RAG', 'Prompt engineering', 'Computer vision'] },
  { title: 'Mobile & Data', level: 'Project experience', items: ['Flutter', 'MySQL', 'SQLite', 'Firebase', 'OpenCV', 'MediaPipe'] },
]

function ProjectVisual({ kind }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const artwork = {
    siem: <><rect x="13" y="16" width="38" height="26" rx="3" /><path d="M19 35v-5m8 5V25m8 10v-9m8 9v-3M19 21h25" /><circle cx="48" cy="21" r="2" /></>,
    mobile: <><rect x="22" y="9" width="20" height="38" rx="4" /><path d="M29 15h6m-9 10 4 4 8-8m-12 14h12" /><circle cx="32" cy="42" r="1" /></>,
    gesture: <><path d="M21 42V23a2.5 2.5 0 0 1 5 0v10-16a2.5 2.5 0 0 1 5 0v15-12a2.5 2.5 0 0 1 5 0v13-9a2.5 2.5 0 0 1 5 0v15c0 6-4 10-10 10h-2c-4 0-7-2-9-5l-5-7a2.5 2.5 0 0 1 4-3l4 4" /><path d="M12 13l4-4m28 0 4 4M32 5v5" /></>,
    chat: <><path d="M12 16a4 4 0 0 1 4-4h25a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H27l-9 7v-7h-2a4 4 0 0 1-4-4z" /><path d="M20 21h17m-17 7h12" /><circle cx="46" cy="41" r="5" /></>,
    metadata: <><rect x="10" y="12" width="30" height="34" rx="3" /><circle cx="20" cy="23" r="4" /><path d="m12 41 9-10 6 6 5-5 8 9m5-22h9m-9 6h9m-9 6h9m-9 6h7" /></>,
    currency: <><rect x="10" y="17" width="44" height="27" rx="4" /><circle cx="32" cy="30.5" r="8" /><path d="M15 23c4 0 5-1 6-4m28 20c-4 0-5 1-6 4M32 27v7m-3-4h6" /></>,
    attendance: <><rect x="12" y="13" width="40" height="34" rx="3" /><path d="M12 22h40M22 13v34m10-25v25m10-25v25M17 18h1m10 0h1m10 0h1m-17 9h2m-2 7h2m8-7h2m8 0h2" /></>,
  }

  return <svg className="project-illustration" viewBox="0 0 64 64" aria-hidden="true" focusable="false" {...common}>{artwork[kind]}</svg>
}

function AchievementImage({ achievement, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (failed || !achievement.image) return <div className={`achievement-image-fallback ${className}`}>Preview unavailable</div>
  return <img className={className} src={achievement.image} alt={`Preview of ${achievement.title}`} loading="lazy" decoding="async" onError={() => setFailed(true)} />
}

function AchievementDialog({ achievement, onClose, returnFocusRef }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  useLayoutEffect(() => {
    const previousOverflow = document.body.style.overflow
    const focusTarget = returnFocusRef.current
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const controls = dialogRef.current?.querySelectorAll('button, a[href]')
        if (!controls?.length) return
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      focusTarget?.focus()
    }
  }, [onClose, returnFocusRef])
  const categoryLabel = achievementCategories.find(({ id }) => id === achievement.category)?.label
  const displayDate = achievement.publicationPeriod || achievement.date
  return (
    <div className="achievement-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { event.preventDefault(); onClose() } }}>
      <section className="achievement-dialog" role="dialog" aria-modal="true" aria-labelledby="achievement-dialog-title" ref={dialogRef}>
        <button className="dialog-close" type="button" onClick={onClose} ref={closeRef} aria-label="Close achievement details">×</button>
        <div className="dialog-preview"><AchievementImage achievement={achievement} /></div>
        <div className="dialog-details">
          <span className="section-index">{categoryLabel}</span>
          <h2 id="achievement-dialog-title">{achievement.title}</h2>
          {achievement.issuer && <p className="achievement-issuer">{achievement.issuer}</p>}
          {displayDate && <p><strong>{achievement.publicationPeriod ? 'Publication period' : 'Date'}:</strong> {displayDate}</p>}
          {achievement.instructor && <p><strong>Instructor:</strong> {achievement.instructor}</p>}
          {achievement.subtitle && <p>{achievement.subtitle}</p>}
          {achievement.details && <p>{achievement.details}</p>}
          {achievement.doi && <p><strong>DOI:</strong> {achievement.doi}</p>}
          <div className="dialog-links">
            {achievement.externalUrl && <a href={achievement.externalUrl} target="_blank" rel="noopener noreferrer">View publication <span aria-hidden="true">↗</span></a>}
            {achievement.verificationUrl && <a href={achievement.verificationUrl} target="_blank" rel="noopener noreferrer">Open validation service <span aria-hidden="true">↗</span></a>}
          </div>
        </div>
      </section>
    </div>
  )
}

function RocketCursor() {
  const cursorRef = useRef(null)
  const trailRef = useRef(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!finePointer.matches) return undefined

    const cursor = cursorRef.current
    const trail = trailRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = null
    let lastX = null
    let lastY = null
    let lastParticleAt = 0
    let nextX = 0
    let nextY = 0
    let nextAngle = 0
    let currentX = null
    let currentY = null
    let currentAngle = 0
    let previousFrameAt = 0

    document.body.classList.add('rocket-cursor-enabled')

    function hideCursor() {
      cursor.classList.remove('is-visible')
      document.body.classList.remove('rocket-cursor-enabled')
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      lastX = null
      lastY = null
      currentX = null
      currentY = null
    }

    function renderCursor(now) {
      frame = null
      const elapsed = previousFrameAt ? now - previousFrameAt : 16.67
      previousFrameAt = now
      const smoothing = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 20)
      currentX += (nextX - currentX) * smoothing
      currentY += (nextY - currentY) * smoothing

      const angleDifference = ((nextAngle - currentAngle + 540) % 360) - 180
      currentAngle += angleDifference * (reducedMotion.matches ? 1 : smoothing * 0.82)
      cursor.style.transform = `translate3d(${currentX - 16}px, ${currentY - 1}px, 0) rotate(${currentAngle}deg)`

      if (Math.hypot(nextX - currentX, nextY - currentY) > 0.3 || Math.abs(angleDifference) > 0.35) {
        frame = requestAnimationFrame(renderCursor)
      } else {
        currentX = nextX
        currentY = nextY
        currentAngle = nextAngle
        previousFrameAt = 0
      }
    }

    function addParticle(x, y, directionX, directionY) {
      if (trail.childElementCount >= 8) trail.firstElementChild?.remove()
      const particle = document.createElement('span')
      particle.className = 'rocket-particle'
      particle.style.left = `${x}px`
      particle.style.top = `${y}px`
      particle.style.setProperty('--trail-x', `${-directionX * 9}px`)
      particle.style.setProperty('--trail-y', `${-directionY * 9}px`)
      particle.addEventListener('animationend', () => particle.remove(), { once: true })
      trail.append(particle)
    }

    function handlePointerMove(event) {
      if (event.pointerType === 'touch') return
      document.body.classList.add('rocket-cursor-enabled')
      const dx = lastX === null ? 0 : event.clientX - lastX
      const dy = lastY === null ? 0 : event.clientY - lastY
      const distance = Math.hypot(dx, dy)
      if (distance > 1.25) nextAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90
      nextX = event.clientX
      nextY = event.clientY
      lastX = nextX
      lastY = nextY

      const target = event.target instanceof Element ? event.target : null
      cursor.classList.toggle('is-hidden', Boolean(target?.closest('input, textarea, [contenteditable="true"]')))
      cursor.classList.add('is-visible')

      const now = performance.now()
      if (!reducedMotion.matches && distance > 2 && now - lastParticleAt >= 45) {
        const directionX = dx / distance
        const directionY = dy / distance
        addParticle(nextX - directionX * 13, nextY - directionY * 13, directionX, directionY)
        lastParticleAt = now
      }

      if (currentX === null) {
        currentX = nextX
        currentY = nextY
        currentAngle = nextAngle
        cursor.style.transform = `translate3d(${currentX - 16}px, ${currentY - 1}px, 0) rotate(${currentAngle}deg)`
      } else if (frame === null) {
        previousFrameAt = performance.now()
        frame = requestAnimationFrame(renderCursor)
      }
    }

    function handlePointerOut(event) {
      if (!event.relatedTarget) hideCursor()
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerout', handlePointerOut)
    window.addEventListener('blur', hideCursor)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('blur', hideCursor)
      document.body.classList.remove('rocket-cursor-enabled')
      if (frame !== null) cancelAnimationFrame(frame)
      trail.replaceChildren()
    }
  }, [])

  return (
    <>
      <div className="rocket-trail" ref={trailRef} aria-hidden="true" />
      <div className="rocket-cursor" ref={cursorRef} aria-hidden="true">
        <svg viewBox="0 0 32 42" focusable="false">
          <path className="rocket-wing" d="m8 21-5 8 6-2m15-6 5 8-6-2" />
          <path className="rocket-body" d="M16 1C10.2 7.7 8 15.3 8 25v6l5-3h6l5 3v-6C24 15.3 21.8 7.7 16 1Z" />
          <circle className="rocket-window" cx="16" cy="16" r="3.2" />
          <path className="rocket-detail" d="M12.5 24h7M13 31l3 3 3-3" />
        </svg>
      </div>
    </>
  )
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [activeSection, setActiveSection] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const returnFocusRef = useRef(null)
  const heroRef = useRef(null)
  const closeAchievementDialog = useCallback(() => setSelectedAchievement(null), [])
  const visibleAchievements = useMemo(() => achievements
    .map((achievement, index) => ({ achievement, index }))
    .filter(({ achievement }) => selectedCategory === 'all' || achievement.category === selectedCategory)
    .sort((left, right) => {
      const leftDate = left.achievement.date || left.achievement.publicationPeriod
      const rightDate = right.achievement.date || right.achievement.publicationPeriod
      if (!leftDate && !rightDate) return left.index - right.index
      if (!leftDate) return 1
      if (!rightDate) return -1
      return rightDate.localeCompare(leftDate) || left.index - right.index
    })
    .map(({ achievement }) => achievement), [selectedCategory])

  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-reveal')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    document.documentElement.classList.add('reveal-ready')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' })

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [visibleAchievements])

  useEffect(() => {
    const sections = destinations.map(({ id }) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top))[0]
      if (visible) setActiveSection(visible.target.id)
    }, { rootMargin: '-22% 0px -62% 0px', threshold: 0 })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!hero || !media.matches || reducedMotion.matches) return undefined

    let frame = 0
    function handlePointerMove(event) {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect()
        hero.style.setProperty('--pointer-x', ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3))
        hero.style.setProperty('--pointer-y', ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3))
        frame = 0
      })
    }
    function resetPointer() {
      hero.style.setProperty('--pointer-x', 0)
      hero.style.setProperty('--pointer-y', 0)
    }
    hero.addEventListener('pointermove', handlePointerMove, { passive: true })
    hero.addEventListener('pointerleave', resetPointer)
    return () => {
      hero.removeEventListener('pointermove', handlePointerMove)
      hero.removeEventListener('pointerleave', resetPointer)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return undefined
    let frame = 0
    function updateBackground() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--space-scroll', `${window.scrollY * 0.055}px`)
        frame = 0
      })
    }
    window.addEventListener('scroll', updateBackground, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateBackground)
      if (frame) cancelAnimationFrame(frame)
      document.documentElement.style.removeProperty('--space-scroll')
    }
  }, [])

  return (
    <>
      <RocketCursor />
      <main className="universe">
      <div className="space-background" aria-hidden="true">
        <div className="stars stars-small" />
        <div className="stars stars-small stars-travel-copy" />
        <div className="stars stars-large" />
        <div className="stars stars-large stars-travel-copy" />
        <div className="stars stars-distant" />
        <div className="stars stars-distant stars-travel-copy" />
        <div className="nebula" />
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <span className="shooting-star shooting-star-one" />
        <span className="shooting-star shooting-star-two" />
      </div>

      <header className="navbar">
        <a className="brand" href="#home" aria-label="Developer Universe home">
          <span className="brand-mark">CR</span>
          <span className="brand-name">DEVELOPER UNIVERSE</span>
        </a>

        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span className="menu-toggle-icon" aria-hidden="true"><span /><span /></span>
          <span className="menu-toggle-label">{menuOpen ? 'Close' : 'Menu'}</span>
        </button>

        <nav className={`nav-links${menuOpen ? ' is-open' : ''}`} id="main-navigation" aria-label="Main navigation">
          {destinations.map((destination) => (
            <a key={destination.id} href={`#${destination.id}`} aria-current={activeSection === destination.id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>
              <span>{destination.number}</span>
              {destination.label}
            </a>
          ))}
        </nav>

        <a className="contact-link" href="#contact">
          LET'S CONNECT <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="home" ref={heroRef}>
        <div className="hero-copy">
          <div className="system-status">
            <span className="status-dot" />
            PERSONAL SYSTEM ONLINE
          </div>

          <p className="eyebrow">EXPLORING THE DIGITAL FRONTIER</p>

          <h1>
            Hello, universe.
            <br />
            I'm <span className="gradient-text">Charan Raj.</span>
          </h1>

          <p className="hero-description">
            Developer, builder and technology explorer.
            I turn curious ideas into real projects, one
            line of code at a time.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#projects">
              EXPLORE MY PROJECTS <span aria-hidden="true">↗</span>
            </a>
            <a className="secondary-button" href="#about">
              DISCOVER MY STORY <span aria-hidden="true">↓</span>
            </a>
            <a className="tertiary-button" href="/Charan_Raj_Resume.pdf" download>
              DOWNLOAD RESUME <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="hero-footer">
            <span>INDEPENDENTLY CURIOUS.</span>
            <span>CONSTANTLY BUILDING.</span>
          </div>
        </div>

        <div className="station-scene" aria-label="Illustration of a space station">
          <div className="scene-label scene-label-top">
            <span>STATION CR-01</span>
            <span>SECTOR 001</span>
          </div>

          <div className="planet planet-back" />
          <div className="planet-ring" />
          <div className="planet planet-main">
            <div className="saturn-bands" />
            <div className="planet-highlight" />
          </div>
          <div className="planet-ring planet-ring-front" />

          <div className="moon-orbit" aria-hidden="true">
            <div className="moon">
              <div className="moon-features" />
            </div>
          </div>

          <div className="satellite-orbit" aria-hidden="true">
            <div className="satellite-counter-orbit">
              <div className="space-station">
                <div className="station-wing station-wing-left" />
                <div className="station-core">
                  <span className="station-symbol">CR</span>
                  <span className="station-light" />
                </div>
                <div className="station-wing station-wing-right" />
                <div className="station-antenna" />
              </div>
            </div>
          </div>

          <div className="scene-label scene-label-bottom">
            <span>HOME BASE</span>
            <span>AWAITING EXPLORATION <span className="status-dot" /></span>
          </div>
        </div>

        <a className="scroll-cue" href="#about">
          <span className="scroll-line" />
          SCROLL TO EXPLORE
        </a>
      </section>

      <section className="intro-section scroll-reveal" id="about">
        <span className="section-index">01 / THE EXPLORER</span>
        <div className="about-layout">
          <div>
            <h2>Curious about how things work. Driven to build them.</h2>
            <p>I’m Charan Raj, learning full-stack development through practical projects and a lot of exploration. I like understanding how a system works from the inside, then turning that curiosity into something useful.</p>
            <p>My projects span web development, cybersecurity, computer vision, and Python tools. I’m continuing to learn across React, Node.js, databases, AI, and problem solving.</p>
          </div>
          <figure className="profile-card"><img src={profileImage} alt="Illustrated profile portrait of Charan Raj" /><figcaption><span className="status-dot" /> EXPLORER / BUILDER</figcaption></figure>
        </div>
      </section>

      <section className="content-section scroll-reveal" id="skills" aria-labelledby="skills-title">
        <div className="section-heading"><span className="section-index">02 / FLIGHT SYSTEMS</span><h2 id="skills-title">Technologies &amp; Learning Interests</h2><p>A snapshot of tools I’ve used in projects and areas I’m actively exploring. This is a learning map, not a proficiency ranking.</p></div>
        <div className="technology-grid">{technologyGroups.map((group) => <article className="technology-card" key={group.title}><div className="technology-card-heading"><span className="tech-orbit" aria-hidden="true">✦</span><div><h3>{group.title}</h3><p>{group.level}</p></div></div><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>
      </section>

      <section className="content-section scroll-reveal" id="projects" aria-labelledby="projects-title">
        <div className="section-heading"><span className="section-index">03 / DISCOVERIES</span><h2 id="projects-title">Things I’ve built and explored.</h2><p>Personal projects and experiments that help me learn by making. Some are private or still evolving; links appear only where a public reference exists.</p></div>
        <div className="project-grid">{projects.map((project, index) => <article className="project-card scroll-reveal" key={project.title} style={{ '--reveal-order': index }}><div className={`project-visual project-visual--${project.visual}`}><ProjectVisual kind={project.visual} /></div><div className="project-card-top"><span className="project-number">MISSION {String(index + 1).padStart(2, '0')}</span></div><h3>{project.title}</h3><p>{project.description}</p><ul className="project-tags" aria-label="Technologies">{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>{project.note && <p className="project-note">{project.note}</p>}<div className="project-actions"><a className="project-link" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">View on GitHub <span aria-hidden="true">↗</span></a>{project.publicationUrl && <a className="project-link project-link-secondary" href={project.publicationUrl} target="_blank" rel="noopener noreferrer">Publication <span aria-hidden="true">↗</span></a>}</div></article>)}</div>
      </section>

      <section className="achievements-section scroll-reveal" id="achievements" aria-labelledby="achievements-title">
        <div className="achievements-heading">
          <span className="section-index">04 / MILESTONES</span>
          <h2 id="achievements-title">Achievements &amp; Credentials</h2>
          <p>Learning milestones, awards, participation, research, and job simulations collected along the way.</p>
        </div>
        <div className="achievement-filters" role="group" aria-label="Filter achievements by category">
          {achievementCategories.map((category) => {
            const count = category.id === 'all' ? achievements.length : achievements.filter(({ category: itemCategory }) => itemCategory === category.id).length
            return <button className="filter-chip" key={category.id} type="button" aria-pressed={selectedCategory === category.id} onClick={() => setSelectedCategory(category.id)}>{category.label}<span className="filter-count">{count}</span></button>
          })}
        </div>
        <div className="achievement-grid" aria-live="polite">
          {visibleAchievements.map((achievement) => (
            <button className="achievement-card scroll-reveal" key={achievement.id} type="button" style={{ '--reveal-order': visibleAchievements.indexOf(achievement) }} onClick={(event) => { returnFocusRef.current = event.currentTarget; setSelectedAchievement(achievement) }} aria-label={`View details for ${achievement.title}`}>
              <div className="achievement-card-image"><AchievementImage achievement={achievement} /></div>
              <span className="achievement-card-category">{achievementCategories.find(({ id }) => id === achievement.category)?.label}</span>
              <h3>{achievement.title}</h3>
              {achievement.issuer && <p className="achievement-issuer">{achievement.issuer}</p>}
              {(achievement.publicationPeriod || achievement.date) && <time dateTime={achievement.date}>{achievement.publicationPeriod || new Date(`${achievement.date}T00:00:00`).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
            </button>
          ))}
        </div>
      </section>

      <section className="contact-section scroll-reveal" id="contact" aria-labelledby="contact-title">
        <span className="section-index">05 / OPEN CHANNEL</span>
        <h2 id="contact-title">Let’s connect.</h2>
        <p>Have a project, idea, or opportunity to talk about? Reach me through one of these channels.</p>
        <div className="contact-actions"><a className="primary-button" href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=kcharanraj13%40gmail.com" target="_blank" rel="noopener noreferrer">SEND AN EMAIL <span aria-hidden="true">↗</span></a><a className="secondary-button" href="https://github.com/CharanRaj-13/" target="_blank" rel="noopener noreferrer">GITHUB <span aria-hidden="true">↗</span></a><a className="secondary-button" href="https://www.linkedin.com/in/charan-raj-k-63414031b" target="_blank" rel="noopener noreferrer">LINKEDIN <span aria-hidden="true">↗</span></a><a className="secondary-button" href="https://x.com/charanraj13k?s=11" target="_blank" rel="noopener noreferrer">X / TWITTER <span aria-hidden="true">↗</span></a><a className="secondary-button" href="https://leetcode.com/u/charanraj-13/" target="_blank" rel="noopener noreferrer">LEETCODE <span aria-hidden="true">↗</span></a><a className="secondary-button" href="https://www.hackerrank.com/profile/charanraj2327131" target="_blank" rel="noopener noreferrer">HACKERRANK <span aria-hidden="true">↗</span></a></div>
      </section>

      <footer className="footer">
        <a className="footer-brand" href="#home">CR / DEVELOPER UNIVERSE</a>
        <nav aria-label="Footer navigation">{destinations.map((destination) => <a key={destination.id} href={`#${destination.id}`}>{destination.label}</a>)}<a href="#contact">Contact</a></nav>
        <span>BUILT WITH CURIOSITY © {new Date().getFullYear()}</span>
      </footer>
      {selectedAchievement && <AchievementDialog achievement={selectedAchievement} onClose={closeAchievementDialog} returnFocusRef={returnFocusRef} />}
      </main>
    </>
  )
}

export default App
