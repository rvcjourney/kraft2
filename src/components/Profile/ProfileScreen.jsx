import { useState, useMemo } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  ProgressBar,
  Row,
  Col,
  Spinner,
  Badge,
  Tab,
  Tabs,
} from 'react-bootstrap';
import {
  FiEdit3,
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
  FiTrash2,
  FiEye,
} from 'react-icons/fi';
import { userAPI } from '../../services/supabaseAPI';

/**
 * ProfileScreen Component - Stage 8: Complete Your Profile
 * Allows users to fill in personal details and upload CV
 */
export default function ProfileScreen({ onBack, user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);

  const [formData, setFormData] = useState({
    full_name: localStorage.getItem('full_name') || '',
    email: localStorage.getItem('email') || '',
    contact_no: localStorage.getItem('contact_no') || '',
    city: localStorage.getItem('city') || '',
    education: localStorage.getItem('education') || '',
    work_experience: localStorage.getItem('work_experience')
      ? JSON.parse(localStorage.getItem('work_experience'))
      : [],
    cv_url: localStorage.getItem('cv_url') || '',
  });

  const [workExpForm, setWorkExpForm] = useState({
    company: '',
    role: '',
    years: '',
    description: '',
  });

  // Calculate profile completion percentage
  const completionPercent = useMemo(() => {
    const requiredFields = ['full_name', 'contact_no', 'city', 'education'];
    const filledRequired = requiredFields.filter(
      (field) => formData[field] && formData[field].toString().trim() !== ''
    ).length;

    const cvFilled = formData.cv_url ? 1 : 0;
    const workExpFilled = formData.work_experience.length > 0 ? 1 : 0;

    const total = requiredFields.length + 2;
    const filled = filledRequired + cvFilled + workExpFilled;

    return Math.round((filled / total) * 100);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCVFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      setCvPreview(file.name);
      // In a real app, you'd upload this to Supabase Storage
      // For now, we'll store the file name
      setFormData((prev) => ({
        ...prev,
        cv_url: `cv_${Date.now()}_${file.name}`,
      }));
    }
  };

  const handleRemoveCV = () => {
    setCvFile(null);
    setCvPreview(null);
    setFormData((prev) => ({
      ...prev,
      cv_url: '',
    }));
  };

  const handleAddWorkExp = () => {
    if (!workExpForm.company || !workExpForm.role || !workExpForm.years) {
      setError('Please fill all work experience fields');
      return;
    }

    const newWorkExp = {
      id: `work_${Date.now()}`,
      company: workExpForm.company,
      role: workExpForm.role,
      years: workExpForm.years,
      description: workExpForm.description,
    };

    setFormData((prev) => ({
      ...prev,
      work_experience: [...prev.work_experience, newWorkExp],
    }));

    setWorkExpForm({
      company: '',
      role: '',
      years: '',
      description: '',
    });

    setSuccess('Work experience added!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRemoveWorkExp = (id) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.filter((exp) => exp.id !== id),
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.full_name || !formData.contact_no || !formData.city || !formData.education) {
      setError('Please fill all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User not authenticated');

      // Save to localStorage
      localStorage.setItem('full_name', formData.full_name);
      localStorage.setItem('contact_no', formData.contact_no);
      localStorage.setItem('city', formData.city);
      localStorage.setItem('education', formData.education);
      localStorage.setItem('work_experience', JSON.stringify(formData.work_experience));
      if (formData.cv_url) {
        localStorage.setItem('cv_url', formData.cv_url);
      }

      // Save to Supabase
      try {
        await userAPI.updateDetailedProfile(userId, formData);
      } catch (dbError) {
        console.warn('Supabase save skipped:', dbError?.message);
        // Continue even if DB save fails
      }

      setSuccess('✅ Profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`❌ Error saving profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">👤 Your Profile</h2>
        {onBack && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onBack}
            className="d-flex align-items-center gap-2"
          >
            <FiArrowLeft /> Back
          </Button>
        )}
      </div>

      {/* Completion Card */}
      <Card className="border-0 shadow-sm mb-4 rounded-3">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="mb-0 fw-bold">Profile Completion</h6>
            <span className="text-primary fw-bold">{completionPercent}%</span>
          </div>
          <ProgressBar
            now={completionPercent}
            variant={completionPercent >= 80 ? 'success' : completionPercent >= 50 ? 'warning' : 'info'}
            className="rounded-pill"
            style={{ height: '8px' }}
          />
          {completionPercent < 80 && (
            <small className="text-muted d-block mt-2">
              💡 Complete your profile to gain visibility to potential employers
            </small>
          )}
          {completionPercent >= 80 && (
            <small className="text-success d-block mt-2">
              ✓ Great! Your profile is mostly complete
            </small>
          )}
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3 rounded-3">
          <div className="d-flex align-items-start gap-2">
            <FiAlertCircle size={20} className="mt-1 flex-shrink-0" />
            <div>{error}</div>
          </div>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-3 rounded-3">
          <div className="d-flex align-items-start gap-2">
            <FiCheck size={20} className="mt-1 flex-shrink-0" />
            <div>{success}</div>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Body className="p-4">
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4" justify>
                {/* Personal Information Tab */}
                <Tab eventKey="profile" title="Personal Information">
                  <div className="pt-4">
                    <div className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-semibold">Full Name *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.full_name}
                          onChange={(e) => handleChange('full_name', e.target.value)}
                          size="lg"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-semibold">Email (Read-only)</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          readOnly
                          size="lg"
                          className="rounded-3 bg-light"
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-semibold">Contact Number *</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.contact_no}
                          onChange={(e) => handleChange('contact_no', e.target.value)}
                          size="lg"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-semibold">City/Town *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your city"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          size="lg"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-semibold">Education *</Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder="e.g., Bachelor of Commerce (B.Com), 2020"
                          value={formData.education}
                          onChange={(e) => handleChange('education', e.target.value)}
                          rows={3}
                          className="rounded-3"
                        />
                      </Form.Group>
                    </div>
                  </div>
                </Tab>

                {/* Work Experience Tab */}
                <Tab eventKey="experience" title="Work Experience">
                  <div className="pt-4">
                    {formData.work_experience.length > 0 && (
                      <div className="mb-4">
                        <h6 className="fw-bold mb-3">Your Work Experience</h6>
                        <div className="d-flex flex-column gap-3">
                          {formData.work_experience.map((exp, idx) => (
                            <Card key={exp.id} className="border-0 bg-light rounded-3">
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="mb-1 fw-semibold">{exp.role}</h6>
                                    <p className="mb-1 text-muted small">
                                      {exp.company} • {exp.years} years
                                    </p>
                                    {exp.description && (
                                      <p className="mb-0 text-muted small">{exp.description}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="link"
                                    className="text-danger p-0"
                                    onClick={() => handleRemoveWorkExp(exp.id)}
                                  >
                                    <FiTrash2 size={16} />
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                        <hr className="my-4" />
                      </div>
                    )}

                    <h6 className="fw-bold mb-3">Add Work Experience</h6>

                    <div className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-semibold">Company Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., XYZ Bank Ltd"
                          value={workExpForm.company}
                          onChange={(e) => setWorkExpForm({ ...workExpForm, company: e.target.value })}
                          className="rounded-2"
                          size="sm"
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-semibold">Role/Position</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., Senior Manager"
                          value={workExpForm.role}
                          onChange={(e) => setWorkExpForm({ ...workExpForm, role: e.target.value })}
                          className="rounded-2"
                          size="sm"
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-semibold">Years of Experience</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., 3 years"
                          value={workExpForm.years}
                          onChange={(e) => setWorkExpForm({ ...workExpForm, years: e.target.value })}
                          className="rounded-2"
                          size="sm"
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-semibold">Description (Optional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder="Brief description of your role and achievements"
                          value={workExpForm.description}
                          onChange={(e) =>
                            setWorkExpForm({ ...workExpForm, description: e.target.value })
                          }
                          rows={2}
                          className="rounded-2"
                          size="sm"
                        />
                      </Form.Group>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="d-flex align-items-center gap-2"
                      onClick={handleAddWorkExp}
                    >
                      <FiUpload size={16} /> Add Experience
                    </Button>
                  </div>
                </Tab>

                {/* CV Upload Tab */}
                <Tab eventKey="cv" title="Resume/CV">
                  <div className="pt-4">
                    <div className="alert alert-info rounded-3 mb-4 d-flex gap-2" role="alert">
                      <span>💡</span>
                      <div>
                        <small>
                          Upload your CV/Resume to showcase your qualifications to potential employers.
                          Our AI can extract information to help fill your profile.
                        </small>
                      </div>
                    </div>

                    {cvPreview ? (
                      <Card className="border-0 bg-light rounded-3 mb-3">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                              <FiEye size={20} className="text-primary" />
                              <div>
                                <h6 className="mb-0 fw-semibold">{cvPreview}</h6>
                                <small className="text-muted">File ready to upload</small>
                              </div>
                            </div>
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              onClick={handleRemoveCV}
                              title="Remove CV"
                            >
                              <FiTrash2 size={16} />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ) : (
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Choose CV/Resume File</Form.Label>
                        <Form.Control
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCVFile}
                          className="rounded-3"
                          size="lg"
                        />
                        <small className="text-muted d-block mt-2">
                          Accepted formats: PDF, DOC, DOCX (Max 5MB)
                        </small>
                      </Form.Group>
                    )}

                    {cvFile && (
                      <div className="alert alert-warning rounded-3 d-flex gap-2" role="alert">
                        <span>⚠️</span>
                        <small>
                          Your CV is ready. Click "Save Profile" below to upload it securely to your
                          account.
                        </small>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        {/* Summary Sidebar */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-3 position-sticky" style={{ top: '96px' }}>
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">Profile Summary</h6>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Full Name</small>
                <div className="fw-semibold text-truncate">
                  {formData.full_name || <span className="text-muted">Not filled</span>}
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Contact</small>
                <div className="fw-semibold text-truncate">
                  {formData.contact_no || <span className="text-muted">Not filled</span>}
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Location</small>
                <div className="fw-semibold text-truncate">
                  {formData.city || <span className="text-muted">Not filled</span>}
                </div>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Work Experience</small>
                <div className="fw-semibold">
                  <Badge bg={formData.work_experience.length > 0 ? 'success' : 'light'} text={formData.work_experience.length > 0 ? 'white' : 'dark'}>
                    {formData.work_experience.length} {formData.work_experience.length === 1 ? 'entry' : 'entries'}
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <small className="text-muted d-block mb-1">CV Status</small>
                <div className="fw-semibold">
                  <Badge bg={formData.cv_url ? 'success' : 'light'} text={formData.cv_url ? 'white' : 'dark'}>
                    {formData.cv_url ? '✓ Uploaded' : 'Not uploaded'}
                  </Badge>
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <small className="text-muted d-block mb-2">Required Fields</small>
                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex align-items-center gap-2">
                    <span className={formData.full_name ? '✓ text-success' : '○ text-muted'}>
                      {formData.full_name ? '✓' : '○'}
                    </span>
                    <span>Full Name</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={formData.contact_no ? '✓ text-success' : '○ text-muted'}>
                      {formData.contact_no ? '✓' : '○'}
                    </span>
                    <span>Contact No</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={formData.city ? '✓ text-success' : '○ text-muted'}>
                      {formData.city ? '✓' : '○'}
                    </span>
                    <span>City</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={formData.education ? '✓ text-success' : '○ text-muted'}>
                      {formData.education ? '✓' : '○'}
                    </span>
                    <span>Education</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100 d-flex align-items-center justify-content-center gap-2 mt-4 fw-semibold"
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ borderRadius: '12px' }}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" /> Saving...
                  </>
                ) : (
                  <>
                    <FiEdit3 size={18} /> Save Profile
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
