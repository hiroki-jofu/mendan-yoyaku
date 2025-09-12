import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Tab, Nav } from 'react-bootstrap';
import { Interviewer } from '../types';

interface ProfileSettingsModalProps {
  show: boolean;
  onHide: () => void;
  interviewers: Interviewer[];
  updateInterviewer: (interviewer: Interviewer) => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ show, onHide, interviewers, updateInterviewer }) => {
  const [localInterviewers, setLocalInterviewers] = useState<Interviewer[]>([]);

  useEffect(() => {
    setLocalInterviewers(interviewers);
  }, [interviewers]);

  const handleFieldChange = (id: string, field: keyof Interviewer, value: string) => {
    const updatedInterviewers = localInterviewers.map(interviewer =>
      interviewer.id === id ? { ...interviewer, [field]: value } : interviewer
    );
    setLocalInterviewers(updatedInterviewers);
  };

  const handleSave = () => {
    localInterviewers.forEach(interviewer => {
      updateInterviewer(interviewer);
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>プロフィール設定</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container defaultActiveKey={interviewers[0]?.id}>
          <Nav variant="tabs">
            {localInterviewers.map(interviewer => (
              <Nav.Item key={interviewer.id}>
                <Nav.Link eventKey={interviewer.id}>{interviewer.name}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            {localInterviewers.map(interviewer => (
              <Tab.Pane key={interviewer.id} eventKey={interviewer.id}>
                <Form className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Label>名前</Form.Label>
                    <Form.Control
                      type="text"
                      value={interviewer.name}
                      onChange={(e) => handleFieldChange(interviewer.id, 'name', e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>役職</Form.Label>
                    <Form.Control
                      type="text"
                      value={interviewer.title}
                      onChange={(e) => handleFieldChange(interviewer.id, 'title', e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>メールアドレス</Form.Label>
                    <Form.Control
                      type="email"
                      value={interviewer.email}
                      onChange={(e) => handleFieldChange(interviewer.id, 'email', e.target.value)}
                    />
                  </Form.Group>
                </Form>
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>キャンセル</Button>
        <Button variant="primary" onClick={handleSave}>保存</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfileSettingsModal;
