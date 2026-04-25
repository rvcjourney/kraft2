import { useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FiArrowRight, FiBriefcase, FiTrendingUp, FiUsers, FiAward, FiPlayCircle, FiChevronDown } from 'react-icons/fi';
import './HomePage.css';

/**
 * HomePage Component
 * Interactive landing page showcasing CareerCraft project
 */
export default function HomePage({ onGetStarted }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      id: 1,
      icon: <FiAward size={32} />,
      title: 'Interactive Learning',
      description: 'Engage with AI-powered lessons tailored to BFSI professionals',
    },
    {
      id: 2,
      icon: <FiBriefcase size={32} />,
      title: 'Career Growth',
      description: 'Develop practical skills that matter in banking & finance',
    },
    {
      id: 3,
      icon: <FiTrendingUp size={32} />,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics',
    },
    {
      id: 4,
      icon: <FiUsers size={32} />,
      title: 'Expert Guidance',
      description: 'Learn from industry experts and mentors like Ria',
    },
  ];

  const modules = [
    { number: 1, title: 'Module 1: Loans', topics: '10 Topics' },
    { number: 2, title: 'Module 2: Insurance', topics: 'Coming Soon' },
    { number: 3, title: 'Module 3: Investments', topics: 'Coming Soon' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <Container className="hero-content" fluid>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="hero-text">
              <div className="hero-badge">Welcome to CareerKraft</div>
              <h1 className="hero-title">
                Master Banking & Finance Skills
              </h1>
              <p className="hero-subtitle">
                An AI-driven learning platform designed for BFSI professionals. Learn from expert instructors, build real-world skills, and accelerate your career in financial services.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <h4>10+</h4>
                  <p>Topics</p>
                </div>
                <div className="stat-item">
                  <h4>100%</h4>
                  <p>Interactive</p>
                </div>
                <div className="stat-item">
                  <h4>∞</h4>
                  <p>Scalable</p>
                </div>
              </div>
              <Button
                size="lg"
                className="get-started-btn-secondary"
                onClick={onGetStarted}
              >
                Get Started <FiArrowRight className="ms-2" />
              </Button>
            </Col>
            <Col lg={6} className="hero-visual">
              <div className="floating-card card-1">
                <div className="card-icon">
                  <FiPlayCircle size={24} />
                </div>
                <p>Interactive Lessons</p>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">
                  <FiAward size={24} />
                </div>
                <p>Knowledge Tests</p>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">
                  <FiTrendingUp size={24} />
                </div>
                <p>Progress Tracking</p>
              </div>
              <div className="hero-illustration">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Scroll Indicator - Positioned inside hero */}
        <div className="scroll-indicator">
          <FiChevronDown size={24} className="animate-bounce" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <div className="section-header">
            <h2>Why Choose CareerKraft?</h2>
            <p>Designed for success in BFSI careers</p>
          </div>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={6} md={12} key={feature.id}>
                <Card
                  className={`feature-card feature-card-${(index % 2) + 1}`}
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <Card.Body className="p-4">
                    <div className="feature-icon">
                      {feature.icon}
                    </div>
                    <h5 className="feature-title">{feature.title}</h5>
                    <p className="feature-description">{feature.description}</p>
                    <div className="feature-link">
                      Learn more <FiArrowRight size={16} className="ms-2" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Modules Section */}
      <section className="modules-section">
        <Container>
          <div className="section-header">
            <h2>Our Curriculum</h2>
            <p>Comprehensive modules covering BFSI expertise</p>
          </div>

          <Row className="g-4">
            {modules.map((module) => (
              <Col lg={4} md={6} key={module.number}>
                <div className="module-card">
                  <div className="module-number">
                    {module.number}
                  </div>
                  <h4>{module.title}</h4>
                  <p className="module-topics">{module.topics}</p>
                  <div className="module-arrow">
                    <FiArrowRight size={20} />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h2>Ready to Transform Your Career?</h2>
              <p>
                Join thousands of BFSI professionals who are mastering new skills and advancing their careers with CareerKraft.
              </p>
            </Col>
            <Col lg={4} className="text-center text-lg-end">
              <Button
                size="lg"
                className="get-started-btn-secondary"
                onClick={onGetStarted}
              >
                Get Started Now <FiArrowRight className="ms-2" />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}
