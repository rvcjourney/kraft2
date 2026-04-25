import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card, Alert, Badge, ProgressBar } from 'react-bootstrap';
import {FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import { MdChevronRight } from 'react-icons/md';
import { loansModule } from '../../content/loansModule';
import { lessonActivityAPI } from '../../services/supabaseAPI';
import { useLessonStore } from '../../store/userStore';
import { stopAudio } from '../../services/ttsService';
import { generateOpenAITTS } from '../../services/openaiTTSService';
import RiaSpeakingView from './RiaSpeakingView';
import './LoanLesson.css';

/**
 * LoanLesson Component
 * Interactive learning interface for Module 1 - Loans with Ria instructor
 * Features: Instructor narration, card-based learning, knowledge tests, progress tracking
 */
export default function LoanLesson({ onBack, startTopicIndex }) {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(startTopicIndex ?? 0);
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(null);
  const [viewedCards, setViewedCards] = useState(new Set());
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null); // Tracks which narration is playing
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState(''); // Current speech subtitle
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState(false); // Is Ria currently speaking
  const playbackSeqRef = useRef(0);

  // Track which eligibility pillars have been completed
  const eligibilityPillars = [
    { id: 'income_stability', name: 'Income Stability', topicId: 'income_stability' },
    { id: 'credit_behaviour', name: 'Credit Behaviour', topicId: 'credit_behaviour' },
    { id: 'profile_background', name: 'Profile & Background', topicId: 'profile_background' },
    { id: 'documentation', name: 'Documentation', topicId: 'documentation' },
  ];

  const recordScore = useLessonStore((state) => state.recordScore);
  const recordSubmission = useLessonStore((state) => state.recordSubmission);

  const currentTopic = loansModule.topics[currentTopicIndex];
  const audioRef = useRef(null); // Reference to current playing audio

  /**
   * Play text using OpenAI TTS (lessons only - RolePlay uses ElevenLabs)
   */
  const playOpenAITTS = async (text) => {
    try {
      console.log(`🎙️  [OpenAI TTS] Playing TTS for: "${text.substring(0, 50)}..."`);

      const audioUrl = await generateOpenAITTS(text);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.play().catch(resolve);
      });
    } catch (err) {
      console.error('❌ OpenAI TTS error:', err);
      throw err;
    }
  };

  const resetAudioState = () => {
    playbackSeqRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopAudio();
    setPlayingAudio(null);
    setCurrentSubtitle('');
    setIsCurrentlySpeaking(false);
    setAudioLoading(false);
  };

  useEffect(() => {
    return () => {
      resetAudioState();
    };
  }, []);

  useEffect(() => {
    if (currentTopic?.type === 'knowledge_test') {
      resetAudioState();
    }
  }, [currentTopic?.id, currentTopic?.type]);

  // Check if all cards have been viewed
  const allCardsViewed = currentTopic.type === 'cards' &&
    currentTopic.cards &&
    viewedCards.size === currentTopic.cards.length;

  // Reset card state when moving to next topic
  const handleNext = () => {
    if (currentTopicIndex < loansModule.topics.length - 1) {
      resetAudioState();
      // Mark current topic as completed
      setCompletedTopics((prev) => new Set([...prev, currentTopic.id]));

      setCurrentTopicIndex(currentTopicIndex + 1);
      setTestAnswers({});
      setTestSubmitted(false);
      setTestScore(null);
      setViewedCards(new Set());
      setSelectedCard(null);
      setShowSummary(false);
    }
  };

  const handlePrevious = () => {
    if (currentTopicIndex > 0) {
      resetAudioState();
      setCurrentTopicIndex(currentTopicIndex - 1);
      setTestAnswers({});
      setTestSubmitted(false);
      setTestScore(null);
      setViewedCards(new Set());
      setSelectedCard(null);
      setShowSummary(false);
    }
  };

  // Handle card click - mark as viewed and select
  const handleCardClick = (cardId) => {
    setSelectedCard(cardId);
    setViewedCards((prev) => new Set([...prev, cardId]));
  };

  // Handle test answer selection
  const handleAnswerSelect = (questionId, answer) => {
    if (!testSubmitted) {
      setTestAnswers({
        ...testAnswers,
        [questionId]: answer,
      });
    }
  };

  const stripMarkdown = (text = '') => text.replace(/[*_`#>-]/g, '').trim();

  // Break long narration into readable subtitle/audio chunks.
  const chunkNarrationText = (text, maxChars = 140) => {
    const normalized = stripMarkdown(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    const sentences = normalized.match(/[^.!?]+[.!?]?/g) || [normalized];
    const chunks = [];
    let current = '';

    const pushChunk = () => {
      if (current.trim()) chunks.push(current.trim());
      current = '';
    };

    sentences.forEach((sentenceRaw) => {
      const sentence = sentenceRaw.trim();
      if (!sentence) return;

      if ((current ? `${current} ${sentence}` : sentence).length <= maxChars) {
        current = current ? `${current} ${sentence}` : sentence;
        return;
      }

      pushChunk();

      // If a single sentence is too long, split by words.
      if (sentence.length > maxChars) {
        const words = sentence.split(' ');
        let wordChunk = '';
        words.forEach((word) => {
          if (!word) return;
          const candidate = wordChunk ? `${wordChunk} ${word}` : word;
          if (candidate.length <= maxChars) {
            wordChunk = candidate;
          } else {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          }
        });
        if (wordChunk.trim()) chunks.push(wordChunk.trim());
      } else {
        current = sentence;
      }
    });

    pushChunk();
    return chunks;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Type subtitle progressively word-by-word.
  const animateSubtitleWordByWord = async (text, seq, wordDelayMs = 90) => {
    const words = (text || '').trim().split(/\s+/).filter(Boolean);
    let built = '';

    for (const word of words) {
      if (playbackSeqRef.current !== seq) return;
      built = built ? `${built} ${word}` : word;
      setCurrentSubtitle(built);
      await sleep(wordDelayMs);
    }
  };

  // Submit knowledge test
  const handleSubmitTest = async () => {
    if (Object.keys(testAnswers).length < currentTopic.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Calculate score
      let correctCount = 0;
      currentTopic.questions.forEach((q) => {
        if (testAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / currentTopic.questions.length) * 100);
      setTestScore({
        correct: correctCount,
        total: currentTopic.questions.length,
        percentage: score,
      });
      setTestSubmitted(true);

      // Record to store
      recordScore(currentTopic.id, score);
      recordSubmission(currentTopic.id, {
        timestamp: new Date().toISOString(),
        isCorrect: score >= 70,
        pointsEarned: score,
      });

      // Try to save to Supabase (non-blocking)
      try {
        const userId = localStorage.getItem('user_id');
        if (userId) {
          await lessonActivityAPI.submit({
            lessonId: 'loans_module_1',
            moduleId: currentTopic.id,
            activityId: currentTopic.id,
            type: 'knowledge_test',
            response: testAnswers,
          });
        }
      } catch (dbError) {
        console.warn('Could not save to database:', dbError?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get selected card details
  const getSelectedCard = () => {
    if (!selectedCard || !currentTopic.cards) return null;
    return currentTopic.cards.find((c) => c.id === selectedCard);
  };

  // Check if eligibility pillar is completed
  const isPillarCompleted = (topicId) => {
    return completedTopics.has(topicId);
  };

  // Get instructor message based on topic
  const getInstructorMessage = () => {
    const messages = {
      'what_is_loan': 'Hello! I am Ria, your AI Career Coach. Let\'s explore what a loan really means and why it\'s important for your future in banking.',
      'types_of_loans': 'Now that you understand loans, let\'s meet the different types. Each one solves a unique problem for customers just like you and me.',
      'knowledge_test_1': 'Great! Time to test your understanding. Remember, each loan type matches a specific customer need. Let\'s see how well you\'ve learned!',
      'types_home_loan': 'Home loans are the largest loans most people take. Let\'s dive into the 6 different types and when each one is used.',
      'knowledge_test_2': 'Excellent progress! Now let\'s see how well you understand the different home loan products.',
      'eligibility': 'Now comes the most important part—understanding who qualifies for loans. There are 4 key pillars we\'ll explore together.',
      'income_stability': 'Pillar 1: Income Stability. Can the customer afford the monthly EMI? Let\'s dive deep into how bankers assess this.',
      'credit_behaviour': 'Pillar 2: Credit Behaviour. How has the customer handled credit in the past? This tells us their repayment track record.',
      'profile_background': 'Pillar 3: Profile & Background. Is this customer stable and reliable? Let\'s see what makes a good profile.',
      'documentation': 'Pillar 4: Documentation. Even perfect borrowers need to prove everything. Let\'s explore what documents matter most.',
      'knowledge_test_3': 'Final test! You\'ve learned all 4 pillars. Show me what you\'ve mastered about loan eligibility!',
    };
    return messages[currentTopic.id] || loansModule.instructorMessage;
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    return Math.round(((currentTopicIndex + 1) / loansModule.topics.length) * 100);
  };

  const getTopicNarrationSegments = (topic) => {
    if (!topic || topic.type === 'knowledge_test') return [];

    const segments = [];
    const greeting = stripMarkdown(getInstructorMessage());
    if (greeting) segments.push(greeting);

    if (topic.type === 'lesson' || topic.type === 'lesson_with_progress') {
      const main = stripMarkdown(topic.content || '');
      if (main) segments.push(main);
    }

    if (topic.type === 'cards') {
      const intro = stripMarkdown(topic.content || '');
      if (intro) segments.push(intro);
      (topic.cards || []).forEach((card) => {
        const cardText = stripMarkdown(`${card.title}. ${card.description}`);
        if (cardText) segments.push(cardText);
      });
    }

    return segments;
  };

  const playNarrationSequence = async (narrationId, segments) => {
    if (playingAudio === narrationId) {
      resetAudioState();
      return;
    }

    resetAudioState();
    const seq = ++playbackSeqRef.current;
    setAudioLoading(true);
    setIsCurrentlySpeaking(true);
    setPlayingAudio(narrationId);

    for (const segment of segments) {
      if (playbackSeqRef.current !== seq) break;
      const subtitleChunks = chunkNarrationText(segment);

      for (const chunk of subtitleChunks) {
        if (playbackSeqRef.current !== seq) break;
        if (!chunk) continue;
        const subtitleAnimation = animateSubtitleWordByWord(chunk, seq);
        try {
          await playOpenAITTS(chunk);
        } catch (err) {
          console.error('Error during narration sequence:', err);
        }
        await subtitleAnimation;

        if (playbackSeqRef.current !== seq) break;
        await sleep(120);
      }
    }

    if (playbackSeqRef.current === seq) {
      setPlayingAudio(null);
      setCurrentSubtitle('');
      setIsCurrentlySpeaking(false);
      setAudioLoading(false);
    }
  };

  const handlePlayTopicNarration = () => {
    const segments = getTopicNarrationSegments(currentTopic);
    if (segments.length === 0) {
      resetAudioState();
      return;
    }
    playNarrationSequence(`topic-${currentTopic.id}`, segments);
  };

  // Stop any currently playing audio
  const handleStopAudio = () => {
    resetAudioState();
  };

  return (
    <Container fluid className="loan-lesson py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            {/* Left: Topic Title */}
            <h2 className="mb-0 fw-bold">
              < MdChevronRight className="text-warning" />
              {currentTopic.title}
            </h2>
            {/* Right: Completion Percentage */}
            <span className="fw-semibold text-primary">
              {getProgressPercentage()}% Completed
            </span>
          </div>
        </Col>
      </Row>

      {/* Topic Content */}
      <Row className="mb-4">
        <Col lg={12}>
          <div className="topic-content">
            {/* LESSON TYPE - What is a Loan intro */}
            {currentTopic.type === 'lesson' && (
              <div className="lesson-content hidden-text">
                {/* Animated Ria Speaking View with zoom circle */}
                <RiaSpeakingView
                  isPlaying={isCurrentlySpeaking && playingAudio === `topic-${currentTopic.id}`}
                  text={currentSubtitle}
                  onPlayPause={handlePlayTopicNarration}
                  onStop={handleStopAudio}
                  isLoading={audioLoading}
                  playingId={playingAudio}
                  narrationId={`topic-${currentTopic.id}`}
                />
                {currentTopic.nextTopicId && (
                  <div className="mt-4 text-center">
                    <Button variant="primary" onClick={handleNext} size="lg">
                      {currentTopic.cta} <FiChevronRight />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* CARDS TYPE - Types of Loans with interactive cards */}
            {currentTopic.type === 'cards' && !showSummary && (
              <div className="cards-content hidden-text">
                <div className="mb-4">
                  <RiaSpeakingView
                    isPlaying={isCurrentlySpeaking && playingAudio === `topic-${currentTopic.id}`}
                    text={currentSubtitle}
                    onPlayPause={handlePlayTopicNarration}
                    onStop={handleStopAudio}
                    isLoading={audioLoading}
                    playingId={playingAudio}
                    narrationId={`topic-${currentTopic.id}`}
                  />
                </div>

                {/* Show selected card details */}
                {selectedCard && getSelectedCard() && (
                  <Card className="mb-4 bg-light border-primary border-2 shadow-lg">
                    <Card.Body>
                      <p className="mb-0">{getSelectedCard().description}</p>
                      <div className="mt-3 pt-3 border-top">
                        <small className="text-success fw-bold">
                          <FiCheck size={16} className="me-2" style={{ display: 'inline' }} />
                          Learned: {getSelectedCard().title}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Cards grid - 3 columns with clean layout */}
                <div className="mb-4">
                  <small className="text-muted d-block mb-3 fw-bold text-uppercase">📢 Click each card to hear Ria explain the details</small>
                  <Row className="g-3">
                    {currentTopic.cards.map((card) => (
                      <Col md={4} key={card.id}>
                        <Card
                          className={`loan-card cursor-pointer h-100 transition-all ${viewedCards.has(card.id) ? 'border-success border-2 bg-success bg-opacity-10' : 'border-1'
                            }`}
                          onClick={() => handleCardClick(card.id)}
                          style={{
                            cursor: 'pointer',
                            boxShadow: selectedCard === card.id ? '0 8px 24px rgba(13, 110, 253, 0.3)' : undefined,
                            borderColor: selectedCard === card.id ? '#0d6efd' : undefined,
                            borderWidth: selectedCard === card.id ? '2px' : '1px'
                          }}
                        >
                          <Card.Body className="text-center">
                            <div className="mb-3" style={{ fontSize: '2rem' }}>
                              {card.id === 'home_loan' && '🏠'}
                              {card.id === 'lap' && '🏢'}
                              {card.id === 'gold_loan' && '💰'}
                              {card.id === 'car_loan' && '🚗'}
                              {card.id === 'two_wheeler_loan' && '🏍️'}
                              {card.id === 'personal_loan' && '💳'}
                            </div>
                            <h6 className="mb-2 fw-bold text-dark">{card.title}</h6>
                            <p className="text-muted small mb-0">
                              {viewedCards.has(card.id) ? (
                                <>
                                  <FiCheck size={14} className="me-1" style={{ display: 'inline' }} />
                                  <strong>Viewed</strong>
                                </>
                              ) : (
                                'Click to learn'
                              )}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Show summary button when all cards viewed */}
                {allCardsViewed && (
                  <div className="mt-5 text-center">
                    <Alert variant="success" className="mb-4">
                      ✓ You've learned all 6 loan types! Let's review the summary.
                    </Alert>
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => setShowSummary(true)}
                      className="d-flex align-items-center justify-content-center gap-2 mx-auto"
                    >
                      View Summary & Next Lesson <FiChevronRight />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* CARDS SUMMARY - Types of Loans summary */}
            {currentTopic.type === 'cards' && showSummary && (
              <div className="cards-summary-content">
                {/* Ria's Summary */}
                <Card className="mb-5 bg-primary bg-opacity-10 border-primary">
                  <Card.Body className="p-4">
                    <div className="d-flex gap-3 align-items-start justify-content-between">
                      <div className="d-flex gap-3 align-items-start flex-grow-1">
                        <div className="instructor-avatar" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                          <div className="avatar-placeholder">Ria</div>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="text-primary mb-3">Ria's Summary</h5>
                          <p className="lead mb-0">
                            So today, you've seen the world of loans through the eyes of everyday people:
                            <br /><br />
                            🏠 A family buying a home
                            <br />🏢 A business owner expanding
                            <br />📚 A student chasing opportunity
                            <br />🏍️ A young professional buying a bike or car
                            <br />🆘 A family handling emergencies
                            <br />💰 A household using gold to meet short-term needs
                            <br /><br />
                            <strong>Each loan solves a different problem. Each loan changes someone's life.</strong> And as future bankers and NBFC professionals, you will be the ones guiding customers through these decisions. This isn't just a job—it's a chance to help people move forward.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Show all cards as completed - Clean grid */}
                <div className="mb-5">
                  <h6 className="text-muted mb-4 fw-bold text-uppercase">All Loan Types Mastered:</h6>
                  <Row className="g-3 mb-4">
                    {currentTopic.cards.map((card) => (
                      <Col md={4} key={card.id}>
                        <Card className="border-success border-2 bg-success bg-opacity-5 h-100 position-relative">
                          <Card.Body className="text-center pb-4">
                            <div className="mb-3" style={{ fontSize: '2.5rem' }}>
                              {card.id === 'home_loan' && '🏠'}
                              {card.id === 'lap' && '🏢'}
                              {card.id === 'gold_loan' && '💰'}
                              {card.id === 'car_loan' && '🚗'}
                              {card.id === 'two_wheeler_loan' && '🏍️'}
                              {card.id === 'personal_loan' && '💳'}
                            </div>
                            <h6 className="mb-2 text-dark fw-bold">{card.title}</h6>
                            <div className="text-success mb-3">
                              <FiCheck size={24} className="mb-2" style={{ display: 'block' }} />
                              <small className="fw-bold">Mastered</small>
                            </div>
                            <small className="text-muted">{card.description}</small>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Next Action */}
                {currentTopic.nextTopicId && (
                  <div className="mt-5 text-center">
                    <Alert variant="info" className="mb-4">
                      You're ready to test your knowledge! Complete the quiz to earn points.
                    </Alert>
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      size="lg"
                      className="d-flex align-items-center justify-content-center gap-2 mx-auto"
                    >
                      Take {currentTopic.cta} <FiChevronRight />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* KNOWLEDGE TEST TYPE */}
            {currentTopic.type === 'knowledge_test' && (
              <div className="test-content">
                {!testSubmitted ? (
                  <>
                    {/* Instructor Greeting for Knowledge Test */}
                    <div className="mb-5 p-4 bg-light rounded border">
                      <div className="d-flex gap-3 align-items-start mb-3">
                        <div className="instructor-avatar" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                          <div className="avatar-placeholder">Ria</div>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="mb-2">Ready for Knowledge Test?</h5>
                          <p className="mb-2">{getInstructorMessage()}</p>
                          <small className="text-muted">Audio is disabled during knowledge tests.</small>
                        </div>
                      </div>
                    </div>

                    <Alert variant="info">
                      Answer all {currentTopic.questions.length} questions. Each correct answer earns points.
                    </Alert>
                    {currentTopic.questions.map((question, idx) => (
                      <div key={question.id} className="question-block mb-4 p-3 border rounded">
                        <div className="d-flex align-items-start gap-2 mb-3">
                          <div className="flex-grow-1">
                            <h6 className="mb-0">
                              <Badge bg="secondary" className="me-2">
                                Q{idx + 1}
                              </Badge>
                              {question.question}
                            </h6>
                          </div>
                        </div>
                        <div className="options">
                          {question.options.map((option) => (
                            <div key={option.value} className="form-check mb-2 d-flex align-items-center gap-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={question.id}
                                id={`${question.id}_${option.value}`}
                                value={option.value}
                                checked={testAnswers[question.id] === option.value}
                                onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                                disabled={testSubmitted}
                              />
                              <label
                                className="form-check-label mb-0 flex-grow-1 cursor-pointer"
                                htmlFor={`${question.id}_${option.value}`}
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 text-center">
                      <Button
                        variant="success"
                        size="lg"
                        onClick={handleSubmitTest}
                        disabled={loading || Object.keys(testAnswers).length < currentTopic.questions.length}
                      >
                        {loading ? 'Submitting...' : 'Submit Test'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Check if this is the final knowledge test */}
                    {currentTopicIndex === loansModule.topics.length - 1 ? (
                      // MODULE COMPLETION SCREEN
                      <div className="module-completion-content">
                        <Alert variant="success" className="text-center py-5">
                          <h3 className="mb-3">🎉 Congratulations!</h3>
                          <p className="lead mb-3">You've completed Module 1 – Loans</p>
                          <p className="mb-2">
                            <strong>Final Test Score: {testScore.percentage}%</strong>
                          </p>
                          <p className="mb-4">
                            You now understand:
                            <br />✓ What loans are and why they matter
                            <br />✓ The 6 different types of loans
                            <br />✓ Home loan varieties
                            <br />✓ The 4 pillars of eligibility (Income, Credit, Profile, Documents)
                            <br /><br />
                            <strong>You're ready to guide customers through their loan journey with confidence!</strong>
                          </p>
                          <Button variant="primary" size="lg" onClick={onBack}>
                            Back to Practice <FiChevronLeft />
                          </Button>
                        </Alert>
                      </div>
                    ) : (
                      // REGULAR TEST RESULTS
                      <>
                        <Alert
                          variant={testScore.percentage >= 70 ? 'success' : 'warning'}
                          className="text-center py-4"
                        >
                          <h5 className="mb-2">Test Complete! 🎉</h5>
                          <h4 className="mb-3">{testScore.percentage}%</h4>
                          <p className="mb-0">
                            You got {testScore.correct} out of {testScore.total} correct
                          </p>
                        </Alert>

                        {/* Show explanations */}
                        {currentTopic.questions.map((question, idx) => (
                          <div
                            key={question.id}
                            className={`explanation-block p-3 mb-3 border rounded ${testAnswers[question.id] === question.correctAnswer
                                ? 'border-success bg-light-success'
                                : 'border-danger bg-light-danger'
                              }`}
                          >
                            <div className="d-flex align-items-start gap-2 mb-2">
                              <div className="flex-grow-1">
                                <h6 className="mb-0">
                                  {testAnswers[question.id] === question.correctAnswer ? (
                                    <FiCheck className="text-success me-2" />
                                  ) : (
                                    <span className="text-danger me-2">✗</span>
                                  )}
                                  Q{idx + 1}
                                </h6>
                              </div>
                            </div>
                            <p className="small mb-2">
                              <strong>Your answer:</strong> {question.options.find((o) => o.value === testAnswers[question.id])?.label}
                            </p>
                            {testAnswers[question.id] !== question.correctAnswer && (
                              <p className="small mb-2 text-danger">
                                <strong>Correct answer:</strong>{' '}
                                {question.options.find((o) => o.value === question.correctAnswer)?.label}
                              </p>
                            )}
                            <p className="small text-muted mb-0">
                              <strong>Why:</strong> {question.explanation}
                            </p>
                          </div>
                        ))}

                        <div className="mt-4 text-center gap-2 d-flex justify-content-center">
                          <Button variant="outline-primary" onClick={() => {
                            setTestAnswers({});
                            setTestSubmitted(false);
                            setTestScore(null);
                          }}>
                            Retake Test
                          </Button>
                          {currentTopic.nextTopicId && (
                            <Button variant="primary" onClick={handleNext}>
                              Continue <FiChevronRight />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ELIGIBILITY WITH PILLARS */}
            {currentTopic.type === 'lesson_with_progress' && (
              <div className="eligibility-content hidden-text">
                {/* Animated Ria Speaking View with zoom circle */}
                <RiaSpeakingView
                  isPlaying={isCurrentlySpeaking && playingAudio === `topic-${currentTopic.id}`}
                  text={currentSubtitle}
                  onPlayPause={handlePlayTopicNarration}
                  onStop={handleStopAudio}
                  isLoading={audioLoading}
                  playingId={playingAudio}
                  narrationId={`topic-${currentTopic.id}`}
                />

                {/* Progress boxes for all 4 eligibility pillars */}
                <div className="pillars-section mt-4 mb-4">
                  <h6 className="mb-3">Eligibility Pillars Progress:</h6>
                  <Row className="g-3">
                    {eligibilityPillars.map((pillar) => {
                      const isCompleted = isPillarCompleted(pillar.topicId);
                      const isCurrent = currentTopic.id === pillar.topicId;
                      return (
                        <Col md={6} key={pillar.id}>
                          <Card
                            className={`pillar-card h-100 ${isCompleted ? 'completed' : isCurrent ? 'current' : ''
                              }`}
                          >
                            <Card.Body className="text-center">
                              {isCompleted ? (
                                <FiCheck className="text-success mb-2" size={28} />
                              ) : isCurrent ? (
                                <div className="current-circle mb-2">
                                  <div className="pulse" />
                                </div>
                              ) : (
                                <div className="empty-circle mb-2" />
                              )}
                              <h6 className="mb-2">{pillar.name}</h6>
                              <small className={isCurrent ? 'text-primary fw-bold' : 'text-muted'}>
                                {isCurrent ? '📌 In Progress' : isCompleted ? '✓ Completed' : 'Not Started'}
                              </small>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>

                <Button variant="primary" onClick={() => handleNext()} className="mt-4" size="lg">
                  Continue <FiChevronRight />
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Navigation */}
      <Row className="mt-4">
        <Col className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={handlePrevious}
            disabled={currentTopicIndex === 0}
          >
            <FiChevronLeft /> Previous
          </Button>
          <div className="text-muted small">
            Topic {currentTopicIndex + 1} of {loansModule.topics.length}
          </div>
          <Button
            variant="outline-secondary"
            onClick={handleNext}
            disabled={currentTopicIndex === loansModule.topics.length - 1}
          >
            Next <FiChevronRight />
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
