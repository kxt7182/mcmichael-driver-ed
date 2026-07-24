import React from 'react';
import { BookOpen, ShieldCheck, Clock, Award, Bell, CheckCircle } from 'lucide-react';

const CATALOG_COURSES = [
  {
    id: 'c1',
    title: 'Teen Drivers Ed (30-Hour Online)',
    category: 'Teen Driver (Ages 15-17)',
    duration: '30 Hours Classroom',
    price: '$89.00',
    description: 'Fully DMV-authorized 30-hour online drivers education curriculum. Complete at your own pace from laptop, phone, or tablet. Certificate of completion issued automatically.',
    features: ['DMV OL 237 Certificate', 'Unlimited Practice Exams', 'Parent Progress Dashboard']
  },
  {
    id: 'c2',
    title: 'Behind-the-Wheel In-Car Training',
    category: 'In-Car Practice',
    duration: '6 Hours (3 Sessions of 2-Hrs)',
    price: '$349.00',
    description: 'Private 1-on-1 dual-control vehicle instruction with licensed instructor. Includes free home or school pick-up and drop-off.',
    features: ['Free Pick-up & Drop-off', 'Parallel Parking Mastery', 'Freeway & Night Driving']
  },
  {
    id: 'c3',
    title: 'Adult Defensive Driving & Traffic Safety',
    category: 'Adult Driver & Ticket Reduction',
    duration: '6 Hours',
    price: '$45.00',
    description: 'Reduce auto insurance premiums by up to 10% or dismiss points on your driving record with state-accredited defensive driving course.',
    features: ['Auto Insurance Discount', 'Point Reduction Eligible', 'Instant Download Certificate']
  },
  {
    id: 'c4',
    title: 'Senior Driver Safety & Refresher',
    category: 'Senior Refresher (55+)',
    duration: '4 Hours',
    price: '$35.00',
    description: 'Tailored for mature drivers looking to review new traffic laws, safety technologies, and keep their driving skills sharp and confident.',
    features: ['Mature Driver Discount', 'Zero Exam Stress', 'Accident Avoidance Tech']
  }
];

export function CourseCatalog({ onSelectCourseAlert }) {
  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <section className="hero-section" style={{ paddingBottom: '2rem' }}>
        <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
          <BookOpen size={13} /> Driver Education Offerings
        </span>
        <h1 className="hero-title">
          Explore Available <span className="gradient-text">Driver Ed Courses</span>
        </h1>
        <p className="hero-subtitle">
          Browse upcoming courses and subscribe to be notified immediately when new class schedules or driving lesson seats open up.
        </p>
      </section>

      <div className="grid-2">
        {CATALOG_COURSES.map((course) => (
          <div key={course.id} className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-info">{course.category}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#34d399' }}>{course.price}</span>
              </div>

              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{course.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                {course.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={15} /> {course.duration}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Award size={15} color="#f59e0b" /> DMV Approved
                </span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                {course.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    <CheckCircle size={15} color="#10b981" /> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => onSelectCourseAlert(course.title)}
            >
              <Bell size={16} /> Get Alert When Openings Drop
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
