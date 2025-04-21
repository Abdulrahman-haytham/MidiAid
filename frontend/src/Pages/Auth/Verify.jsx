import React, { useState } from "react";
import { useVerifyCodeMutation } from "../../redux/feature/api/authApi";
import { Col, Row, Spinner, Alert, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Fade } from "react-awesome-reveal";

const Verify = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" }); // تحسين إدارة الرسائل

  const [verifyCode, { isLoading }] = useVerifyCodeMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });   // مسح الرسائل السابقة

    try {
      //batoolbargooth@gmail.com ' 912341
      const response = await verifyCode({ email, verificationCode }).unwrap()// استخدام unwrap()
      console.log(response);

      // عند نجاح التحقق
      setMessage({ text: "تم التحقق بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول.", type: "success" });

      // تصفية المدخلات بعد النجاح
      setEmail("");
      setVerificationCode("");

      // إعادة توجيه بعد نجاح التحقق
      setTimeout(() => navigate("/login"), 2000);
      
    } catch (error) {
      // إدارة الأخطاء القادمة من الـ API
      setMessage({
        text: error?.data?.message || "فشل التحقق من الكود، يرجى المحاولة مرة أخرى.",
        type: "danger",
      });
    }
  };

  return (
    <Container>
      <Fade
      
          style={{ margin: "auto" }}
          delay={300}
          direction="up"
          triggerOnce={true}
          cascade
          >
       <Row className="d-flex justify-content-center align-items-center mx-1"  style={{ minHeight: "80vh" }}>
      <Col sm="6" lg="6" className="logn my-4 d-flex flex-column align-items-center">
        <label className="mx-auto title-login">Verify Your Email</label>
        
        <form onSubmit={handleSubmit} className="w-100">
          <input
            type="email"
            placeholder=" email..."
            value={email}
            className="user-input my-2 pe-2 w-100"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder=" verify code..."
            value={verificationCode}
            className="user-input my-2 pe-2 w-100"
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <button type="submit" className="btn-submit mx-auto mt-3 w-100" disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : "تحقق"}
          </button>
        </form>

        {/* عرض رسالة الحالة بناءً على النوع */}
        {message.text && <Alert variant={message.type} className="mt-3">{message.text}</Alert>}
      </Col>
    </Row>

       </Fade>
    </Container>
   
  );
};

export default Verify;
