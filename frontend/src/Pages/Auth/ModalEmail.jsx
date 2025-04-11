import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useVerifyCodeMutation } from '../../redux/feature/api/authApi';

function ModalEmail() {
  const [show, setShow] = useState(true);
  const [email, setEmail] = useState(true);
  const [verificationCode, setVerificationCode] = useState(true);
  const [verifyCode]=useVerifyCodeMutation()
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleEmail= async ()=> {
      const res= verifyCode({email,verificationCode})
      console.log(res);
      
  }

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}
     <div style={{width:'80vh'}}>
      <Modal show={show}  onHide={handleShow}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label> Email address </Form.Label>
              <Form.Control
                type="email"
                placeholder="email..."
                autoFocus
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label> Verify Code </Form.Label>
              <Form.Control
                type="text"
                placeholder="code..."
                value={verificationCode}
                onChange={(e)=>setVerificationCode(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEmail}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
      l</div>
      
    </>
  );
}

export default ModalEmail;